// pages/api/register.js
import { supabase } from '../../lib/supabaseClient'

function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}`
}

export default async function handler(req, res) {
  const { email, password, referral_code } = req.body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        referral_code: referral_code || null
      }
    }
  })

  if (error) return res.status(400).json({ error: error.message })

  const userId = data.user.id
  const generatedReferralCode = generateReferralCode()

  // Construção do updateData
  const updateData = {
    referral_code: generatedReferralCode,
    referrals_count: 0,
  }

  if (referral_code) {
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id, referrals_count')
      .eq('referral_code', referral_code)
      .single()

    if (referrer) {
      updateData.referrer_id = referrer.id

      await supabase
        .from('profiles')
        .update({ referrals_count: referrer.referrals_count + 1 })
        .eq('id', referrer.id)
    }
  }

  // Agora usamos UPDATE, pois a trigger já criou o perfil
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (updateError) {
    console.error('Erro ao atualizar perfil:', updateError)
    return res.status(500).json({ error: 'Erro ao salvar perfil no banco de dados' })
  }

  res.status(200).json({
    success: true,
    referralCode: generatedReferralCode
  })
}
