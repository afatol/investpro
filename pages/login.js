// pages/login.js
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
  }

  return (
    <div className="container">
      <Nav />
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          onChange={e => setSenha(e.target.value)}
        />
        <button className="btn" type="submit">Entrar</button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/forgot-password">Esqueci senha</Link> |{' '}
        <Link href="/register">Cadastre-se</Link> |{' '}
        <Link href="/">Voltar</Link>
      </p>
    </div>
  )
}
