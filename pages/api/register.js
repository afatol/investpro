// pages/api/register.js
import { supabase } from '../../lib/supabaseClient'

/**
 * Gera um código único começando com "IP" seguido de 8 dígitos
 */
function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}` // Ex: IP12345678
}

export default async function handler(req, res) {
  const { email, password, referral_code } = req.body

  // Registrar usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Adiciona o código de indicação ao cadastro
        referral_code: referral_code || null
      }
    }
  })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  const userId = data.user.id
  const generatedReferralCode = generateReferralCode()

  // Salvar dados no perfil do usuário
  let updateData = {
    id: userId,
    referral_code: generatedReferralCode // Código único gerado automaticamente
  }

  // Se houver código de afiliado, vincule ao referrer
  if (referral_code) {
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id, referrals_count')
      .eq('referral_code', referral_code)
      .single()

    if (referrer) {
      updateData.referrer_id = referrer.id

      // Atualiza contagem de indicações do afiliado
      await supabase
        .from('profiles')
        .update({ referrals_count: referrer.referrals_count + 1 })
        .eq('id', referrer.id)
    }
  }

  // Insere novo usuário na tabela profiles
  await supabase.from('profiles').insert(updateData)

  // Resposta final
  res.status(200).json({
    success: true,
    referralCode: generatedReferralCode
  })
}