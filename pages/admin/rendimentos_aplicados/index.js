// File: ./pages/admin/rendimentos_aplicados/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminRendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRendimentos()
  }, [])

  const fetchRendimentos = async () => {
    setError('')
    setLoading(true)
    try {
      const { data: rdData, error: rdErr } = await supabase
        .from('rendimentos_aplicados')
        .select('id, user_id, valor, origem, data')
        .order('data', { ascending: false })

      if (rdErr) throw rdErr

      if (!rdData || rdData.length === 0) {
        setRendimentos([])
        setLoading(false)
        return
      }

      const userIds = Array.from(new Set(rdData.map((r) => r.user_id))).filter(
        (id) => id !== null
      )

      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', userIds)

      if (profilesErr) throw profilesErr

      const perfilMap = {}
      profilesData.forEach((p) => {
        perfilMap[p.id] = {
          name: p.name,
          email: p.email,
          phone: p.phone,
        }
      })

      const merged = rdData.map((r) => ({
        ...r,
        perfil: perfilMap[r.user_id] || { name: null, email: null, phone: null },
      }))

      setRendimentos(merged)
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar rendimentos.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando rendimentos...</p>
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
      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Rendimentos Aplicados</h1>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Usuário (ID)</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Origem</th>
              <th style={thStyle}>Data</th>
            </tr>
          </thead>
          <tbody>
            {rendimentos.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.user_id}</td>
                <td style={tdStyle}>{r.perfil.name || '—'}</td>
                <td style={tdStyle}>{r.perfil.email || '—'}</td>
                <td style={tdStyle}>{r.perfil.phone || '—'}</td>
                <td style={tdStyle}>{Number(r.valor).toFixed(2)}</td>
                <td style={tdStyle}>{r.origem}</td>
                <td style={tdStyle}>{new Date(r.data).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
            {rendimentos.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  Nenhum rendimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

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
