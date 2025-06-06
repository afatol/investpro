// File: ./pages/admin/transactions/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminTransactionsPage() {
  const [transacoes, setTransacoes] = useState([])
  const [filteredTransacoes, setFilteredTransacoes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Reaplica filtro sempre que ‘filtro’ ou ‘transacoes’ mudarem
  useEffect(() => {
    if (!filtro.trim()) {
      setFilteredTransacoes(transacoes)
    } else {
      const term = filtro.toLowerCase()
      const filtrados = transacoes.filter((t) => {
        const userName = t.profiles?.name?.toLowerCase() || ''
        const userEmail = t.profiles?.email?.toLowerCase() || ''
        const userPhone = t.profiles?.phone?.toLowerCase() || ''
        const typeMatch = t.type?.toLowerCase().includes(term)
        const statusMatch = t.status?.toLowerCase().includes(term)
        const dateMatch = new Date(t.data)
          .toLocaleString('pt-BR')
          .toLowerCase()
          .includes(term)
        const amountMatch = Number(t.amount)
          .toFixed(2)
          .toString()
          .includes(term)
        return (
          userName.includes(term) ||
          userEmail.includes(term) ||
          userPhone.includes(term) ||
          typeMatch ||
          statusMatch ||
          dateMatch ||
          amountMatch
        )
      })
      setFilteredTransacoes(filtrados)
    }
  }, [filtro, transacoes])

  // 1) Busca transações, usando explicitamente a FK "transactions_user_id_fkey" para embutir "profiles"
  const fetchTransactions = async () => {
    setError('')
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          type,
          amount,
          status,
          data,
          proof_url,
          profiles!transactions_user_id_fkey ( name, email, phone )
        `)
        .order('data', { ascending: false })

      if (fetchErr) {
        console.error('Erro na consulta de transações:', fetchErr.message)
        throw fetchErr
      }
      setTransacoes(data || [])
      setFilteredTransacoes(data || [])
    } catch (err) {
      setError('Falha ao carregar transações: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  // 2) Aprovar transação
  const handleApprove = async (transactionId) => {
    try {
      const { error: updateErr } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', transactionId)

      if (updateErr) {
        console.error('Erro ao aprovar transação:', updateErr.message)
        throw updateErr
      }
      fetchTransactions()
    } catch (err) {
      alert('Não foi possível aprovar a transação: ' + (err.message || err))
    }
  }

  // 3) Rejeitar transação
  const handleReject = async (transactionId) => {
    try {
      const { error: updateErr } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', transactionId)

      if (updateErr) {
        console.error('Erro ao rejeitar transação:', updateErr.message)
        throw updateErr
      }
      fetchTransactions()
    } catch (err) {
      alert('Não foi possível rejeitar a transação: ' + (err.message || err))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando transações...</p>
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
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Transações</h1>

        {/* Campo de filtro */}
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <input
            type="text"
            placeholder="Filtrar por Usuário, Email, Telefone, Tipo, Status ou Data..."
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
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome do Usuário</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Comprovante</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransacoes.map((t) => {
              // Gera URL para o comprovante (caso precise de signed URL ou getPublicUrl):
              let publicURL = null
              if (t.proof_url) {
                if (
                  t.proof_url.startsWith('http://') ||
                  t.proof_url.startsWith('https://')
                ) {
                  publicURL = t.proof_url
                } else {
                  try {
                    const {
                      data: { publicUrl },
                      error: urlError
                    } = supabase.storage.from('proofs').getPublicUrl(t.proof_url)

                    if (urlError) {
                      console.error('Erro ao obter publicUrl:', urlError.message)
                    } else {
                      publicURL = publicUrl
                    }
                  } catch (err) {
                    console.error('Exceção em getPublicUrl:', err.message)
                  }
                }
              }

              return (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.profiles?.name || '—'}</td>
                  <td style={tdStyle}>{t.profiles?.email || '—'}</td>
                  <td style={tdStyle}>{t.profiles?.phone || '—'}</td>
                  <td style={tdStyle}>{t.type}</td>
                  <td style={tdStyle}>{Number(t.amount).toFixed(2)}</td>
                  <td style={tdStyle}>{t.status}</td>
                  <td style={tdStyle}>{new Date(t.data).toLocaleString('pt-BR')}</td>
                  <td style={tdStyle}>
                    {publicURL ? (
                      <a
                        href={publicURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Comprovante
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={tdStyle}>
                    {t.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(t.id)}
                          style={{
                            ...btnActionStyle,
                            background: '#43a047'
                          }}
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleReject(t.id)}
                          style={{
                            ...btnActionStyle,
                            background: '#e53935'
                          }}
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    {t.status === 'approved' && (
                      <span
                        style={{
                          color: '#43a047',
                          fontWeight: 'bold'
                        }}
                      >
                        Aprovado
                      </span>
                    )}
                    {t.status === 'rejected' && (
                      <span
                        style={{
                          color: '#e53935',
                          fontWeight: 'bold'
                        }}
                      >
                        Rejeitado
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredTransacoes.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  style={{ textAlign: 'center' }}
                >
                  Nenhuma transação encontrada.
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

const btnActionStyle = {
  color: '#fff',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  marginRight: '0.5rem'
}
