// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*', { head: false })
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        setUser(user) // Ainda exibe info básica
      } else {
        setUser({ ...user, ...data })
      }
    }

    fetchUser()
  }, [])

  const handleCopy = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user) return <p>Carregando...</p>

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Olá, {user.email}</h1>

        <section className="card">
          <h2>Indicações</h2>
          <p>Você indicou <strong>{user.referrals_count || 0}</strong> usuários.</p>
          <button onClick={handleCopy}>
            {copied ? 'Copiado!' : 'Copiar meu código de indicação'}
          </button>
        </section>

        <section className="card">
          <h2>Rendimentos</h2>
          <p>Acesse sua nova página de rendimentos para ver gráficos e histórico.</p>
          <Link href="/rendimentos" className="link">Ir para Rendimentos</Link>
        </section>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card {
          background: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:hover {
          background-color: #45a049;
        }

        .link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #1976D2;
          color: white;
          text-decoration: none;
          border-radius: 8px;
        }

        .link:hover {
          background-color: #125ca1;
        }

        @media (max-width: 600px) {
          .card {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
