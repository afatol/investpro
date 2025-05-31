// pages/api/register.js
import { supabase } from '../../lib/supabaseClient'

/**
 * Gera um código único com prefixo "IP" seguido de 8 dígitos
 */
function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password, referral_code } = req.body

  // Criação do usuário no Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signUpError) {
    return res.status(400).json({ error: signUpError.message })
  }

  const userId = signUpData?.user?.id
  const generatedReferralCode = generateReferralCode()

  let updateData = {
    id: userId,
    referral_code: generatedReferralCode,
    referrals_count: 0
  }

  // Se o usuário foi indicado, vincula o referrer
  if (referral_code) {
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id, referrals_count')
      .eq('referral_code', referral_code)
      .single()

    if (referrer) {
      updateData.referrer_id = referrer.id

      // Atualiza contador de indicações
      await supabase
        .from('profiles')
        .update({ referrals_count: (referrer.referrals_count || 0) + 1 })
        .eq('id', referrer.id)
    }
  }

  // Insere o perfil do novo usuário
  const { error: profileError } = await supabase
    .from('profiles')
    .insert(updateData)

  if (profileError) {
    return res.status(500).json({ error: 'Erro ao salvar perfil: ' + profileError.message })
  }

  res.status(200).json({
    success: true,
    referralCode: generatedReferralCode
  })
}
