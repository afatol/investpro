// pages/api/apply-yield.js

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { user_id } = req.body
  if (!user_id) {
    return res.status(400).json({ error: 'Parâmetros insuficientes: user_id é obrigatório' })
  }

  // Cria um cliente Supabase usando a Service Role Key (tem acesso total, independente de RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // 1) Verificar se o user_id realmente pertence a um admin
    const { data: perfil, error: perfilErr } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user_id)
      .single()

    if (perfilErr) throw perfilErr
    if (!perfil.is_admin) {
      return res.status(403).json({ error: 'Acesso negado: usuário não é administrador' })
    }

    // 2) Executar a função RPC no banco
    const { error: rpcErr } = await supabaseAdmin.rpc('apply_daily_yield')
    if (rpcErr) throw rpcErr

    return res
      .status(200)
      .json({ success: true, message: 'Rendimentos aplicados com sucesso.' })
  } catch (error) {
    console.error('Erro em /api/apply-yield:', error)
    return res.status(500).json({ error: error.message })
  }
}
