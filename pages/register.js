import { useState } from 'react'
import Link from 'next/link'
import Nav from '../components/Nav'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, referral_code: referralCode })
    })

    const result = await res.json()

    if (res.ok) {
      setMessage(`Conta criada com sucesso! Seu código: ${result.referralCode}`)
      setEmail('')
      setPassword('')
      setReferralCode('')
    } else {
      setError(result.error || 'Erro ao registrar.')
    }
  }

  return (
    <>
      <Nav />
      <div className="form-container">
        <h1>Cadastro</h1>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Seu email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Código de indicação (opcional)"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value)}
          />
          <button type="submit">Cadastrar</button>
        </form>

        <p className="login-link">
          <Link href="/login">Já tem conta? Faça login</Link>
        </p>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 400px;
          margin: 3rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        input {
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
        }

        button {
          padding: 0.75rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #005bb5;
        }

        .success {
          color: green;
          text-align: center;
          margin-bottom: 1rem;
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 1rem;
        }

        .login-link {
          text-align: center;
          margin-top: 1.5rem;
        }

        @media (max-width: 480px) {
          .form-container {
            margin: 1.5rem 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}
