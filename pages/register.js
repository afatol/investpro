// File: ./pages/register.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referral_code: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { name, email, password, confirmPassword, phone, referral_code } = formData

    // 1) Validação de senhas
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }
    // 2) referral_code não pode ficar vazio
    if (!referral_code.trim()) {
      setError('O código de indicação é obrigatório')
      setLoading(false)
      return
    }

    try {
      // 3) Busca quem indicou (pela coluna referral_code)
      const { data: refererProfile, error: refererError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referral_code.trim())
        .maybeSingle()

      if (refererError) throw refererError
      if (!refererProfile) {
        throw new Error('Código de indicação inválido')
      }
      const referrerId = refererProfile.id

      // 4) Cria o usuário no Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Podemos enviar name e phone aqui,
            // mas de qualquer forma depois faremos UPDATE na linha de profiles.
            name,
            phone
          }
        }
      })
      if (signUpError) throw signUpError

      // O Supabase já criou a linha em "profiles" com id = signUpData.user.id
      const newUserId = signUpData.user.id

      // 5) Atualiza essa linha de "profiles" para setar referrer_id, caso queira sobrepor campos:
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          // Se tiver trigger gerando referral_code, não passar referral_code aqui.
          referrer_id: referrerId,
          name: name.trim(),
          phone: phone.trim()
        })
        .eq('id', newUserId)

      if (updateProfileError) throw updateProfileError

      // 6) Redireciona para login
      router.push('/login')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Não foi possível cadastrar.')
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <Layout>
      <div className="login-container">
        <div className="form-card">
          <h1>Registrar</h1>
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Nome"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Telefone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="referral_code"
              placeholder="Código de Indicação"
              value={formData.referral_code}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>

          <div className="links">
            <Link href="/login">Já tem conta? Entrar</Link>
            <span> | </span>
            <Link href="/">Voltar</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
        }
        .form-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #1976d2;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }
        button:hover {
          background-color: #125ca1;
        }
        button:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }
        .error {
          color: red;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: bold;
        }
        .links {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.95rem;
        }
        .links a {
          color: #1976d2;
          text-decoration: none;
        }
        .links a:hover {
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .form-card {
            padding: 1.5rem;
          }
          h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}
