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
        setUser(user)
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

  if (!user) return <p style={{ textAlign: 'center' }}>Carregando...</p>

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Olá, {user.email}</h1>

        <div className="card-grid">
          <section className="card">
            <h2>Indicações</h2>
            <p>Você indicou <strong>{user.referrals_count || 0}</strong> usuários.</p>
            <button onClick={handleCopy} aria-label="Copiar código de indicação">
              {copied ? 'Copiado!' : 'Copiar meu código de indicação'}
            </button>
          </section>

          <section className="card">
            <h2>Rendimentos</h2>
            <p>Acesse sua nova página de rendimentos para ver gráficos e histórico.</p>
            <Link href="/rendimentos" className="link">Ir para Rendimentos</Link>
          </section>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1.5rem;
          max-width: 900px;
          margin: auto;
        }

        h1 {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 2rem;
        }

        .card-grid {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        button, .link {
          margin-top: 1rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        button {
