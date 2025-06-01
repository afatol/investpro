// pages/forgot-password.js

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`
    })

    if (error) setError(error.message)
    else setMessage('Enviamos o link para seu email.')
  }

  return (
    <Layout>
      <div className="forgot-container">
        <h1>Esqueci minha senha</h1>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <form onSubmit={handle} className="form-forgot">
          <label htmlFor="email">Seu e-mail:</label>
          <input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn">Enviar link</button>
        </form>

        <p className="back-link">
          <Link href="/login">Voltar ao Login</Link>
        </p>
      </div>

      <style jsx>{`
        .forgot-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #1976D2;
        }

        .form-forgot {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 600;
        }

        input[type="email"] {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        .btn {
          background-color: #1976D2;
          color: white;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: bold;
        }

        .btn:hover {
          background-color: #125ca1;
        }

        .error {
          color: #c00;
          text-align: center;
          font-weight: bold;
        }

        .success {
          color: green;
          text-align: center;
          font-weight: bold;
        }

        .back-link {
          text-align: center;
          margin-top: 1rem;
        }

        .back-link a {
          color: #1976D2;
          text-decoration: none;
        }

        .back-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .forgot-container {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}
