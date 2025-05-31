import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import Link from 'next/link'

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [totais, setTotais] = useState({ depositos: 0, saques: 0, rendimentos: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchUserAndDados = async () => {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      if (sessionError || !user) return

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      const enrichedUser = profile ? { ...user, ...profile } : user
      setUser(enrichedUser)

      // Buscar totais de depósitos e saques aprovados
      const { data: transacoes } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('status', 'approved')

      let depositos = 0
      let saques = 0
      if (transacoes) {
        transacoes.forEach(t => {
          const valor = parseFloat(t.amount)
          if (t.type === 'depósito') depositos += valor
          if (t.type === 'saque') saques += valor
        })
      }

      // Buscar rendimentos aplicados (tabela nova)
      const { data: rendimentos } = await supabase
        .from('rendimentos_aplicados')
        .select('valor')
        .eq('user_id', user.id)

      const totalRendimentos = rendimentos
        ? rendimentos.reduce((acc, r) => acc + parseFloat(r.valor), 0)
        : 0

      setTotais({
        depositos,
        saques,
        rendimentos: totalRendimentos
      })
    }

    fetchUserAndDados()
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
            <p>Seu código: <strong>{user.referral_code || 'N/A'}</strong></p>
            <p>Você indicou <strong>{user.referrals_count || 0}</strong> usuários.</p>
            <button onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar meu código'}
            </button>
          </section>

          <section className="card">
            <h2>Total Investido</h2>
            <p>{formatUSD(totais.depositos)}</p>
          </section>

          <section className="card">
            <h2>Total Sacado</h2>
            <p>{formatUSD(totais.saques)}</p>
          </section>

          <section className="card">
            <h2>Rendimentos Acumulados</h2>
            <p>{formatUSD(totais.rendimentos)}</p>
          </section>

          <section className="card">
            <h2>Navegação</h2>
            <Link href="/transacoes" className="link">Ver Transações</Link><br />
            <Link href="/rendimentos" className="link">Ver Rendimentos</Link>
          </section>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1.5rem;
          max-width: 960px;
          margin: auto;
        }

        h1 {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 2rem;
        }

        .card-grid {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          text-align: center;
        }

        button, .link {
          margin-top: 1rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: bold;
          transition: background-color 0.3s;
          display: inline-block;
          text-decoration: none;
          background-color: #0070f3;
          color: white;
          border: none;
        }

        button:hover, .link:hover {
          background-color: #005bb5;
        }

        @media (max-width: 640px) {
          .card {
            max-width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}
