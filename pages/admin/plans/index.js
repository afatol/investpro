// File: ./pages/admin/plans/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

  // 1) Busca todos os planos, agora incluindo "daily_rate"
  const fetchPlans = async () => {
    setError('')
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('plans')
        .select('id, name, daily_rate')
        .order('name', { ascending: true })

      if (fetchErr) throw fetchErr
      setPlans(data || [])
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar planos.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando planos...</p>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Planos</h1>

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link href="/admin/plans/new">
            <a
              style={{
                background: '#1976d2',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              + Novo Plano
            </a>
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nome do Plano</th>
              <th style={thStyle}>Daily Rate (%)</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{Number(p.daily_rate).toFixed(2)}</td>
                <td style={tdStyle}>
                  <Link href={`/admin/plans/${p.id}`}>
                    <a style={btnEditStyle}>Editar</a>
                  </Link>
                </td>
              </tr>
            ))}

            {plans.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  Nenhum plano cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

// Estilos em linha para cabeçalho e células da tabela
const thStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  background: '#f5f5f5',
}

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
}

const btnEditStyle = {
  display: 'inline-block',
  padding: '0.25rem 0.5rem',
  background: '#1976d2',
  color: '#fff',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '0.9rem',
}
