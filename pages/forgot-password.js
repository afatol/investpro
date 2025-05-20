// pages/forgot-password.js
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')

  const handle = async e => {
    e.preventDefault()
    setError(''); setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`
    })
    if (error) setError(error.message)
    else setMessage('Enviamos o link para seu email.')
  }

  return (
    <div className="container">
      <Nav />
      <h1>Esqueci minha senha</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <form onSubmit={handle}>
        <input
          type="email"
          placeholder="Seu email"
          required
          onChange={e=>setEmail(e.target.value)}
        />
        <button className="btn" type="submit">Enviar link</button>
      </form>
      <p style={{marginTop:'1rem', textAlign:'center'}}>
        <Link href="/login">Voltar ao Login</Link>
      </p>
    </div>
  )
}
