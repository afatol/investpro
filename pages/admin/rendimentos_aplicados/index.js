// File: ./pages/admin/rendimentos_aplicados/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminRendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRendimentos = async () => {
      setError('')
      try {
        // Puxa id, user_id, valor, origem, data e faz join com profiles para pegar name, email, phone
        const { data, error: fetchErr } = await supabase
          .from('rendimentos_aplicados')
          .select(`
            id,
            user_id,
            valor,
            origem,
            data,
            profiles (
              name,
              email,
              phone
            )
          `)
          .order('data', { ascending: false })

        if (fetchErr) throw fetchErr
        setRendimentos(data || [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar rendimentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchRendimentos()
  }, [])

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
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
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
                <td style={tdStyle}>{r.profiles?.name || '—'}</td>
                <td style={tdStyle}>{r.profiles?.email || '—'}</td>
                <td style={tdStyle}>{r.profiles?.phone || '—'}</td>
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
