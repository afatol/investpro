// File: ./pages/admin/rendimentos_aplicados/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminRendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])
  const [filteredRendimentos, setFilteredRendimentos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRendimentos()
  }, [])

  // Reaplica filtro sempre que 'filtro' ou 'rendimentos' mudarem
  useEffect(() => {
    if (!filtro.trim()) {
      setFilteredRendimentos(rendimentos)
    } else {
      const term = filtro.toLowerCase()
      const filtrados = rendimentos.filter((r) => {
        const userName = r.profiles?.name?.toLowerCase() || ''
        const userEmail = r.profiles?.email?.toLowerCase() || ''
        const amountMatch = Number(r.valor)
          .toFixed(2)
          .toString()
          .includes(term)
        const dateMatch = new Date(r.data)
          .toLocaleString('pt-BR')
          .toLowerCase()
          .includes(term)
        const origemMatch = r.origem?.toLowerCase().includes(term)
        return (
          userName.includes(term) ||
          userEmail.includes(term) ||
          amountMatch ||
          dateMatch ||
          origemMatch
        )
      })
      setFilteredRendimentos(filtrados)
    }
  }, [filtro, rendimentos])

  // 1) Buscar rendimentos junto ao relacionamento profiles (name, email, phone)
  const fetchRendimentos = async () => {
    setError('')
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('rendimentos_aplicados')
        .select(`
          id,
          user_id,
          valor,
          origem,
          data,
          profiles ( name, email, phone )
        `)
        .order('data', { ascending: false })

      if (fetchErr) {
        console.error('Erro na consulta de rendimentos:', fetchErr.message)
        throw fetchErr
      }
      setRendimentos(data || [])
      setFilteredRendimentos(data || [])
    } catch (err) {
      setError('Falha ao carregar rendimentos: ' + (err.message || err))
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

        {/* Campo de filtro */}
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <input
            type="text"
            placeholder="Filtrar por Usuário, Email, Origem ou Data..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              width: '100%',
              maxWidth: '350px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Usuário</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Origem</th>
              <th style={thStyle}>Data</th>
            </tr>
          </thead>
          <tbody>
            {filteredRendimentos.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.profiles?.name || '—'}</td>
                <td style={tdStyle}>{r.profiles?.email || '—'}</td>
                <td style={tdStyle}>{r.profiles?.phone || '—'}</td>
                <td style={tdStyle}>{Number(r.valor).toFixed(2)}</td>
                <td style={tdStyle}>{r.origem}</td>
                <td style={tdStyle}>{new Date(r.data).toLocaleString('pt-BR')}</td>
              </tr>
            ))}

            {filteredRendimentos.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
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
  background: '#f5f5f5'
}

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee'
}
