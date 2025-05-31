import { supabase } from '../../lib/supabaseClient'

/**
 * Gera um código único começando com "IP" seguido de 8 dígitos
 */
function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}` // Ex: IP12345678
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password, referral_code } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  // 1. Cria o usuário no Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signUpError || !signUpData?.user?.id) {
    console.error('Erro no signup:', signUpError)
    return res.status(400).json({ error: signUpError?.message || 'Erro ao registrar usuário' })
  }

  const userId = signUpData.user.id
  const generatedReferralCode = generateReferralCode()

  // 2. Dados básicos para salvar no perfil
  const updateData = {
    id: userId,
    referral_code: generatedReferralCode,
    referrals_count: 0
  }

  // 3. Se tiver código de afiliado, relaciona o referrer
  if (referral_code) {
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrals_count')
      .eq('referral_code', referral_code)
      .maybeSingle()

    if (referrerError) {
      console.error('Erro ao buscar afiliado:', referrerError)
    }

    if (referrer) {
      updateData.referrer_id = referrer.id

      await supabase
        .from('profiles')
        .update({ referrals_count: (referrer.referrals_count || 0) + 1 })
        .eq('id', referrer.id)
    }
  }

  // 4. Insere o novo perfil
  const { error: insertError } = await supabase.from('profiles').insert(updateData)

  if (insertError) {
    console.error('Erro ao salvar perfil:', insertError)
    return res.status(500).json({ error: 'Erro ao salvar perfil no banco de dados' })
  }

  // 5. Sucesso
  return res.status(200).json({
    success: true,
    referralCode: generatedReferralCode
  })
}
