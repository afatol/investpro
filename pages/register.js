// pages/register.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RegisterPage() {
  const router = useRouter()

  // Estados de formulário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCodeInput, setReferralCodeInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Gera código de indicação aleatório (ex: “FX7G4J2”)
  function generateReferralCode() {
    return 'FX' + Math.random().toString(36).slice(2, 8).toUpperCase()
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // 1) Validações de front-end
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Senha e confirmação não coincidem.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      // 2) Cria usuário no Auth do Supabase
      const {
        data: { user: newUser },
        error: signUpError,
      } = await supabase.auth.signUp(
        {
          email: email.trim(),
          password,
        },
        {
          // Não precisamos enviar metadata para plan_id, pois isso virá depois
          // Você pode incluir um campo metadata se tiver trigger no banco puxando de user_metadata
          // Exemplo: user_metadata: { referral_code: referralCodeInput.trim() || null }
        }
      )

      if (signUpError || !newUser) {
        throw signUpError || new Error('Não foi possível criar usuário no Auth.')
      }

      const userId = newUser.id
      const generatedReferralCode = generateReferralCode()

      // 3) Se o usuário informou um código de indicação, buscamos o profile do referer
      let referrer_id = null
      if (referralCodeInput.trim() !== '') {
        const { data: referrerRow, error: referrerErr } = await supabase
          .from('profiles')
          .select('id, referrals_count')
          .eq('referral_code', referralCodeInput.trim())
          .maybeSingle()

        if (referrerErr) {
          console.error('Erro ao buscar referer:', referrerErr.message)
        } else if (referrerRow) {
          referrer_id = referrerRow.id
          // Incrementa o contador de referrals de quem indicou
          await supabase
            .from('profiles')
            .update({ referrals_count: (referrerRow.referrals_count || 0) + 1 })
            .eq('id', referrerRow.id)
        }
      }

      // 4) Insere na tabela "profiles" (RLS permite INSERT se auth.uid() = id)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        name: null,
        email: email.trim(),
        referral_code: generatedReferralCode,
        referrals_count: 0,
        referrer_id,
        is_admin: false,
        plan_id: null,       // inicialmente sem plano escolhido
        saldo: 0,
        data: new Date().toISOString(), // timestamp de criação
      })

      if (profileError) {
        console.error('Erro ao salvar perfil:', profileError.message)
        // **NÃO** tentamos apagar o usuário Auth aqui, pois o client não tem service-role key.
        throw new Error('Houve um problema ao salvar o perfil no banco.')
      }

      // 5) Tudo certo: redireciona para login
      router.push('/login')
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      const msg = error.message || String(error)
      if (msg.toLowerCase().includes('already registered')) {
        setErrorMsg('Este e-mail já está cadastrado. Faça login ou recupere a senha.')
      } else {
        setErrorMsg(
          'Houve um problema no servidor ao salvar o usuário. ' +
            'Verifique as configurações do banco de dados ou tente novamente mais tarde.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div
        style={{
          maxWidth: '400px',
          margin: '2rem auto',
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
          Cadastro de Usuário
        </h2>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#ffe5e5',
              color: '#a00',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Email<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />

          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Senha<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />

          <label
            htmlFor="confirmPassword"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Confirmar Senha<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="digite novamente a senha"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />

          <label
            htmlFor="referralCode"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Código de Indicação (opcional):
          </label>
          <input
            id="referralCode"
            type="text"
            value={referralCodeInput}
            onChange={(e) => setReferralCodeInput(e.target.value)}
            placeholder="se tiver um código, informe aqui"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0069d9',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Enviando...' : 'Cadastrar'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Já possui conta?{' '}
          <a
            href="/login"
            style={{ color: '#0069d9', textDecoration: 'underline' }}
          >
            Fazer login
          </a>
        </p>
      </div>
    </Layout>
  )
}
