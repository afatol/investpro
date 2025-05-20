// pages/logout.js
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Logout() {
  useEffect(() => {
    supabase.auth.signOut().then(() => window.location.href = '/login')
  }, [])

  return <p style={{ textAlign:'center', marginTop:'2rem' }}>Saindo…</p>
}
