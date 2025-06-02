// File: ./pages/admin/transactions/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminTransactionsPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  // 1) Busca todas as transações pendentes e/ou já processadas
  const fetchTransactions = async () => {
    setError('')
    setLoading(true)
    try {
      // Se você tiver FK fk_transactions_profiles → profiles.id, pode descomentar o join abaixo
      // const { data, error: fetchErr } = await supabase
      //   .from('transactions')
      //   .select(`
      //     id,
      //     user_id,
      //     type,
      //     amount,
      //     status,
      //     data,
      //     proof_url,
      //     profiles!fk_transactions_profiles ( name, email, phone )
      //   `)
      //   .order('data', { ascending: false })

      // Caso não tenha o join configurado, apenas trazemos os campos simples:
      const { data, error: fetchErr } = await supabase
        .from('transactions')
        .select('id, user_id, type, amount, status, data, proof_url')
        .order('data', { ascending: false })

      if (fetchErr) throw fetchErr
      setTransacoes(data || [])
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar transações.')
    } finally {
      setLoading(false)
    }
  }

  // 2) Aprova a transação (status = "approved")
  const handleApprove = async (transactionId) => {
    try {
      const { error: updateErr } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', transactionId)

      if (updateErr) throw updateErr
      fetchTransactions()
    } catch (err) {
      console.error(err)
      alert('Não foi possível aprovar a transação.')
    }
  }

  // 3) Rejeita a transação (status = "rejected")
  const handleReject = async (transactionId) => {
    try {
      const { error: updateErr } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', transactionId)

      if (updateErr) throw updateErr
      fetchTransactions()
    } catch (err) {
      console.error(err)
      alert('Não foi possível rejeitar a transação.')
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
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Transações</h1>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Usuário (ID)</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Comprovante</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => {
              // Gera a URL pública para o arquivo de comprovante (ajuste 'comprovantes' se seu bucket tiver outro nome)
              let publicURL = null
              if (t.proof_url) {
                const { publicURL: url } = supabase.storage
                  .from('comprovantes')
                  .getPublicUrl(t.proof_url)
                publicURL = url
              }

              return (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.user_id}</td>
                  <td style={tdStyle}>{t.type}</td>
                  <td style={tdStyle}>{Number(t.amount).toFixed(2)}</td>
                  <td style={tdStyle}>{t.status}</td>
                  <td style={tdStyle}>{new Date(t.data).toLocaleString('pt-BR')}</td>
                  <td style={tdStyle}>
                    {publicURL ? (
                      <a href={publicURL} target="_blank" rel="noopener noreferrer">
                        Ver Comprovante
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={tdStyle}>
                    {/* Botões “Aceitar” e “Rejeitar” */}
                    {t.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(t.id)}
                          style={{ ...btnActionStyle, background: '#43a047' }}
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleReject(t.id)}
                          style={{ ...btnActionStyle, background: '#e53935' }}
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    {t.status === 'approved' && (
                      <span style={{ color: '#43a047', fontWeight: 'bold' }}>Aprovado</span>
                    )}
                    {t.status === 'rejected' && (
                      <span style={{ color: '#e53935', fontWeight: 'bold' }}>Rejeitado</span>
                    )}
                  </td>
                </tr>
              )
            })}

            {transacoes.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Nenhuma transação encontrada.</td>
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

const btnActionStyle = {
  color: '#fff',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  marginRight: '0.5rem',
}
