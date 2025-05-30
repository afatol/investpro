import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function ResetPassword() {
  const router = useRouter()
  const { access_token } = router.query
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!access_token) router.replace('/login')
  }, [access_token])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const { error } = await supabase.auth.updateUser({
      accessToken: access_token,
      password
    })
    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="reset-container">
      <Nav />
      <div className="form-card">
        <h1>Redefinir Senha</h1>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">Senha redefinida! Redirecionando…</p>}

        {access_token && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nova senha"
              required
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">Redefinir</button>
          </form>
        )}

        <p className="back-link">
          <Link href="/login">Voltar ao Login</Link>
        </p>
      </div>

      <style jsx>{`
        .reset-container {
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
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }

        button:hover {
          background-color: #45a049;
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 1rem;
        }

        .success {
          color: green;
          text-align: center;
          margin-bottom: 1rem;
        }

        .back-link {
          text-align: center;
          margin-top: 1rem;
        }

        .back-link a {
          color: #1a73e8;
          text-decoration: none;
        }

        .back-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
