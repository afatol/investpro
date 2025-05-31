// pages/register.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'   // <-- alterado aqui

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    if (!email || !password) {
      setError('Email e senha são obrigatórios.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const { user, error: signUpError } = await supabase.auth.signUp(
        { email, password },
        { data: { name } }
      )
      if (signUpError) {
        throw signUpError
      }
      const userId = user?.id
      if (!userId) {
        throw new Error('Não foi possível obter o ID do usuário.')
      }

      const generatedReferralCode = 'IP' + Math.floor(Math.random() * 10000000)

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            name,
            referral_code: generatedReferralCode,
            referrals_count: 0,
            referrer_id: referralCode || null
          }
        ])
      if (profileError) {
        await supabase.auth.api.deleteUser(userId, {
          shouldReauthenticate: false
        })
        throw profileError
      }

      if (referralCode) {
        const { data: refProfile, error: findRefError } = await supabase
          .from('profiles')
          .select('id, referrals_count')
          .eq('referral_code', referralCode)
          .single()

        if (!findRefError && refProfile) {
          await supabase
            .from('profiles')
            .update({ referrals_count: refProfile.referrals_count + 1 })
            .eq('id', refProfile.id)
        }
      }

      setSuccessMessage(
        'Cadastro realizado com sucesso! Redirecionando para o dashboard…'
      )
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro inesperado ao registrar usuário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="register-container">
        <h1>Cadastre-se no InvestPro</h1>

        {error && <p className="message error">{error}</p>}
        {successMessage && <p className="message success">{successMessage}</p>}

        <form onSubmit={handleRegister} className="register-form">
          <label htmlFor="name">Nome (opcional):</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <label htmlFor="password">
            Senha (mínimo 6 caracteres):
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            minLength={6}
            required
          />

          <label htmlFor="referral">Código de Indicação (opcional):</label>
          <input
            id="referral"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Digite o código de quem indicou"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .register-container {
          max-width: 400px;
          margin: auto;
          background: white;
          padding: 2rem 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }
        .message.error {
          background-color: #fde2e2;
          color: #b00020;
        }
        .message.success {
          background-color: #e2f7e2;
          color: #155724;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 600;
        }

        input {
          padding: 0.6rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          margin-top: 1rem;
          padding: 0.8rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        button:hover {
          background-color: #005bb5;
        }

        button:disabled {
          background-color: #999;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
