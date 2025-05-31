// pages/api/register.js
import { supabase } from '../../lib/supabaseClient'

/**
 * Gera um código único de indicação, iniciando com "IP" e 8 dígitos aleatórios.
 */
function generateReferralCode() {
  const random = Math.floor(10000000 + Math.random() * 90000000)
  return `IP${random}` // Ex: IP12345678
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' }) // apenas POST permitido
  }

  const { email, password, referral_code } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
  }

  try {
    // 1. Cadastra no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          referral_code: referral_code || null
        }
      }
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    const userId = authData.user.id
    const generatedReferralCode = generateReferralCode()

    // 2. Prepara dados para salvar no perfil
    const profileData = {
      id: userId,
      referral_code: generatedReferralCode
    }

    // 3. Se o usuário foi indicado, vincula ao referrer
    if (referral_code) {
      const { data: referrer, error: refError } = await supabase
        .from('profiles')
        .select('id, referrals_count')
        .eq('referral_code', referral_code)
        .maybeSingle()

      if (refError) {
        return res.status(500).json({ error: 'Erro ao buscar afiliado: ' + refError.message })
      }

      if (referrer) {
        profileData.referrer_id = referrer.id

        // Atualiza contador de indicações
        await supabase
          .from('profiles')
          .update({ referrals_count: (referrer.referrals_count || 0) + 1 })
          .eq('id', referrer.id)
      }
    }

    // 4. Insere perfil no banco
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (insertError) {
      return res.status(500).json({ error: 'Erro ao salvar perfil: ' + insertError.message })
    }

    // 5. Retorna sucesso
    return res.status(200).json({
      success: true,
      referralCode: generatedReferralCode
    })
  } catch (err) {
    console.error('Erro inesperado:', err)
    return res.status(500).json({ error: 'Erro inesperado no servidor.' })
  }
}
