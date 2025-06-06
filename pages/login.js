// File: ./pages/login.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1) Autentica no Supabase e obtém o objeto 'user'
    const {
      data: { user },
      error: signInError
    } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // 2) Se conseguiu logar, busca o campo is_admin no perfil desse usuário
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      // 3) Redireciona de acordo com is_admin
      if (profile.is_admin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error(err)
      setError('Não foi possível determinar o tipo de usuário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="login-container">
        <div className="form-card">
          <h1>Login</h1>
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="links">
            <Link href="/forgot-password">Esqueci a senha</Link>
            <span> | </span>
            <Link href="/register">Cadastre-se</Link>
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
