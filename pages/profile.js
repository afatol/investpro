// pages/profile.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Profile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data:{ user } }) => {
      if (!user) return window.location.href = '/login'
      setUser(user)
    })
  }, [])

  if (!user) return <p className="container">Carregando…</p>

  return (
    <div className="container">
      <Nav />
      <h1>Perfil</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
    </div>
  )
}
