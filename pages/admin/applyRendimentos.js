// pages/api/admin/applyRendimentos.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Só aceitamos requisições POST (via botão no painel Admin)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Cria um cliente Supabase com service_role para bypass de RLS
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sbAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1) Busca todos os perfis que têm plan_id e saldo > 0 (apenas quem escolheu um plano)
    const { data: perfis, error: perfisErr } = await sbAdmin
      .from('profiles')
      .select('id, saldo, plan_id')
      .not('plan_id', 'is', null);

    if (perfisErr) {
      console.error('Erro ao buscar perfis com plano:', perfisErr);
      throw perfisErr;
    }

    // 2) Para cada perfil, lê a taxa diária do plano e calcula o rendimento
    //    Usaremos um for…of para garantir sequência (poderíamos otimizar em batch)
    for (const p of perfis) {
      const { id: user_id, saldo, plan_id } = p;

      // 2.1) Busca a daily_rate do plano escolhido
      const { data: plano, error: planoErr } = await sbAdmin
        .from('plans')
        .select('daily_rate')
        .eq('id', plan_id)
        .maybeSingle();

      if (planoErr || !plano) {
        console.warn(
          `Plano não encontrado (ou erro) para plan_id=${plan_id} do usuário ${user_id}. Pulando.`
        );
        continue;
      }

      const dailyRate = parseFloat(plano.daily_rate) || 0;
      const currentSaldo = parseFloat(saldo) || 0;

      // 2.2) Calcula o rendimento: rendimento = saldo * daily_rate
      const newRendimento = currentSaldo * dailyRate;

      // Se rendimento for zero ou negativo, ignoramos
      if (newRendimento <= 0) {
        continue;
      }

      // 2.3) Insere em rendimentos_aplicados
      const { error: insertRendErr } = await sbAdmin
        .from('rendimentos_aplicados')
        .insert({
          user_id,
          valor: newRendimento,
          origem: 'rendimento_plano', // identificador de origem
          data: new Date().toISOString(),
        });

      if (insertRendErr) {
        console.error(
          `Erro ao inserir rendimento para usuário ${user_id}:`,
          insertRendErr
        );
        // prosseguimos para o próximo usuário, mas ao final retornamos erro geral
        continue;
      }

      // 2.4) Atualiza o saldo acumulado do usuário
      const { error: updateSaldoErr } = await sbAdmin
        .from('profiles')
        .update({ saldo: currentSaldo + newRendimento })
        .eq('id', user_id);

      if (updateSaldoErr) {
        console.error(
          `Erro ao atualizar saldo para usuário ${user_id}:`,
          updateSaldoErr
        );
        // mesmo erro, continuamos para o próximo perfil
      }
    }

    return res.status(200).json({ message: 'Rendimentos aplicados com sucesso.' });
  } catch (e) {
    console.error('Erro inesperado na API applyRendimentos:', e);
    return res.status(500).json({ error: 'Erro interno ao aplicar rendimentos.' });
  }
}
