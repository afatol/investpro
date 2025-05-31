// pages/api/register.js
import { supabase } from '../../lib/supabaseClient'

function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password, referral_code } = req.body

  // Criação do usuário no Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signUpError || !signUpData.user) {
    return res.status(400).json({ error: signUpError?.message || 'Erro no cadastro' })
  }

  const userId = signUpData.user.id
  const generatedReferralCode = generateReferralCode()

  // Busca pelo afiliado, se existir
  let referrer_id = null
  if (referral_code) {
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, referrals_count')
      .eq('referral_code', referral_code)
      .maybeSingle()

    if (referrer) {
      referrer_id = referrer.id

      await supabase
        .from('profiles')
        .update({ referrals_count: (referrer.referrals_count || 0) + 1 })
        .eq('id', referrer.id)
    }
  }

  // Inserção do perfil
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    referral_code: generatedReferralCode,
    referrals_count: 0,
    referrer_id
  })

  if (profileError) {
    console.error('Erro ao salvar perfil:', profileError)
    return res.status(500).json({ error: 'Erro ao salvar perfil no banco de dados' })
  }

  return res.status(200).json({ success: true, referralCode: generatedReferralCode })
}
