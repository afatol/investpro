// File: ./pages/admin/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminHomePage() {
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
        // total de usuários
        const { count: usersCount, error: usersErr } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
        if (usersErr) throw usersErr

        // total de transações (qualquer status)
        const { count: txCount, error: txErr } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
        if (txErr) throw txErr

        // total de transações pendentes
        const { count: pendingCount, error: penErr } = await supabase
          .from('transactions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (penErr) throw penErr

        // total de rendimentos aplicados
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
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando painel...</p>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Dashboard</h1>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Usuários</h2>
            <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{totais.users}</p>
            <Link href="/admin/users">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Transações</h2>
            <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{totais.transactions}</p>
            <p>Pendentes: {totais.pendingTransactions}</p>
            <Link href="/admin/transactions">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Rendimentos</h2>
            <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{totais.rendimentos}</p>
            <Link href="/admin/rendimentos_aplicados">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Planos</h2>
            <Link href="/admin/plans">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Configurações</h2>
            <Link href="/admin/configs">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            width: '220px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
          }}>
            <h2>Páginas</h2>
            <Link href="/admin/page_contents">
              <a style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#0070f3',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none'
              }}>
                Gerenciar
              </a>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
