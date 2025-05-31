// pages/register.js
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
    <div className="container">
      <Nav />
      <h1>Cadastro</h1>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
        <button className="btn" type="submit">Cadastrar</button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/login">Já tem conta? Faça login</Link>
      </p>
    </div>
  )
}
