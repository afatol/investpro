import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !name || !referralCode || !phoneNumber) {
      setError('Todos os campos são obrigatórios.')
      return
    }

    setLoading(true)

    try {
      // 1. Cria usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      const user = signUpData.user

      if (!user) {
        setError('Erro ao criar usuário.')
        return
      }

      // 2. Salva no perfil (tabela "profiles")
      const { error: insertError } = await supabase.from('profiles').insert([{
        id: user.id,
        name,
        email,
        referral_code: referralCode,
        phone_number: phoneNumber
      }])

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err)
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="register-container">
        <h1>Cadastro</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Celular (ex: 11 99999-9999)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Código de Indicação"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <style jsx>{`
          .register-container {
            max-width: 400px;
            margin: auto;
            padding: 2rem;
          }

          form {
            display: flex;
            flex-direction: column;
          }

          input {
            padding: 0.8rem;
            margin-bottom: 1rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 1rem;
          }

          .error {
            color: red;
            text-align: center;
            margin-bottom: 1rem;
          }

          button {
            padding: 0.8rem;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          }

          button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </Layout>
  )
}
