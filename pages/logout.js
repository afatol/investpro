import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Logout() {
  useEffect(() => {
    supabase.auth.signOut().then(() => window.location.href = '/login')
  }, [])

  return (
    <Layout>
      <div className="logout-container">
        <p>Saindo da sua conta...</p>

        <style jsx>{`
          .logout-container {
            text-align: center;
            padding: 3rem 1rem;
            font-size: 1.2rem;
            color: #444;
          }
        `}</style>
      </div>
    </Layout>
  )
}
