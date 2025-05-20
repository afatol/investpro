// pages/reset-password.js
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

  useEffect(() => {
    if (!access_token) router.replace('/login')
  }, [access_token])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.updateUser({
      accessToken: access_token,
      password
    })
    if (error) setError(error.message)
    else router.push('/login')
  }

  return (
    <div className="container">
      <Nav />
      <h1>Redefinir Senha</h1>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          required
          onChange={e=>setPassword(e.target.value)}
        />
        <button className="btn" type="submit">Redefinir</button>
      </form>
      <p style={{marginTop:'1rem', textAlign:'center'}}>
        <Link href="/login">Voltar ao Login</Link>
      </p>
    </div>
  )
}
