// File: ./pages/admin/transactions/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminTransactionsPage() {
  const [transacoes, setTransacoes] = useState([])
  const [signedUrls, setSignedUrls] = useState({}) // para guardar URL temporária de cada ID
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  // 1) Busca todas as transações (incluindo proof_url, mas que agora será apenas o "path")
  const fetchTransactions = async () => {
    setError('')
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('transactions')
        .select('id, user_id, type, amount, status, data, proof_url')
        .order('data', { ascending: false })

      if (fetchErr) throw fetchErr
      setTransacoes(data || [])
      // Assim que buscar, vamos gerar signed URLs para cada uma que tiver proof_url
      generateAllSignedUrls(data || [])
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar transações.')
    } finally {
      setLoading(false)
    }
  }

  // 2) Gera signed URLs (válidos 60s) para cada transação que tiver proof_url
  const generateAllSignedUrls = async (lista) => {
    const urls = {}
    await Promise.all(
      lista.map(async (t) => {
        if (t.proof_url) {
          // t.proof_url aqui deve ser apenas o "path" dentro do bucket proofs,
          // ex: "ce8d37fe-…_arquivo.pdf"
          const { data: signedData, error: signedErr } = await supabase.storage
            .from('proofs')   // nome exato do bucket
            .createSignedUrl(t.proof_url, 60) // URL válida por 60 segundos
          if (!signedErr && signedData?.signedUrl) {
            urls[t.id] = signedData.signedUrl
          } else {
            console.error('Erro ao gerar signed URL:', signedErr)
            urls[t.id] = null
          }
        }
      })
    )
    setSignedUrls(urls)
  }

  // 3) Aprovar transação
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

  // 4) Rejeitar transação
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
              const signedURL = signedUrls[t.id] || null

              return (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.user_id}</td>
                  <td style={tdStyle}>{t.type}</td>
                  <td style={tdStyle}>{Number(t.amount).toFixed(2)}</td>
                  <td style={tdStyle}>{t.status}</td>
                  <td style={tdStyle}>{new Date(t.data).toLocaleString('pt-BR')}</td>
                  <td style={tdStyle}>
                    {signedURL ? (
                      <a href={signedURL} target="_blank" rel="noopener noreferrer">
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
