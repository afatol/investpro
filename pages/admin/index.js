// File: ./pages/admin/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [totais, setTotais] = useState({
    users: 0,
    transactions: 0,
    pendingTransactions: 0,
    rendimentos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTotals = async () => {
      setError('')
      try {
        // 1) Contar usuários
        const { count: usersCount, error: usersErr } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
        if (usersErr) throw usersErr

        // 2) Contar transações (todas)
        const { count: txCount, error: txErr } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
        if (txErr) throw txErr

        // 3) Contar transações pendentes
        const { count: pendingCount, error: penErr } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (penErr) throw penErr

        // 4) Contar rendimentos aplicados
        const { count: rendCount, error: rendErr } = await supabase
          .from('rendimentos_aplicados')
          .select('id', { count: 'exact', head: true })
        if (rendErr) throw rendErr

        setTotais({
          users: usersCount,
          transactions: txCount,
          pendingTransactions: pendingCount,
          rendimentos: rendCount,
        })
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar dados gerais.')
      } finally {
        setLoading(false)
      }
    }
    fetchTotals()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando painel...</p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="cards">
          <div className="card">
            <h2>Usuários</h2>
            <p>{totais.users}</p>
            <Link href="/admin/users">Gerenciar</Link>
          </div>
          <div className="card">
            <h2>Transações</h2>
            <p>{totais.transactions}</p>
            <p>Pendentes: {totais.pendingTransactions}</p>
            <Link href="/admin/transactions">Gerenciar</Link>
          </div>
          <div className="card">
            <h2>Rendimentos</h2>
            <p>{totais.rendimentos}</p>
            <Link href="/admin/rendimentos_aplicados">Gerenciar</Link>
          </div>
          <div className="card">
            <h2>Planos</h2>
            <Link href="/admin/plans">Gerenciar</Link>
          </div>
          <div className="card">
            <h2>Configurações</h2>
            <Link href="/admin/configs">Gerenciar</Link>
          </div>
          <div className="card">
            <h2>Páginas Estáticas</h2>
            <Link href="/admin/page_contents">Gerenciar</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1000px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }
        .cards {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
        }
        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          width: 220px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }
        .card h2 {
          margin-bottom: 0.5rem;
        }
        .card p {
          font-size: 1.5rem;
          margin: 0.5rem 0;
        }
        .card a {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: #fff;
          border-radius: 6px;
          text-decoration: none;
        }
        .card a:hover {
          background: #005bb5;
        }
      `}</style>
    </Layout>
  )
}
