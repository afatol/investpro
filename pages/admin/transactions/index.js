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

  // Função que busca as transações já incluindo dados do perfil
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
          profiles (
            name,
            email,
            phone
          )
        `)
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

  // Aprova a transação, alterando status para 'approved'
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
              <th style={thStyle}>Usuário (ID)</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>E-mail</th>
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
            {transacoes.map((t) => {
              // Se proof_url for um caminho no bucket "comprovantes", geramos a URL pública
              let publicURL = null
              if (t.proof_url) {
                const { publicURL: url } = supabase
                  .storage
                  .from('comprovantes')
                  .getPublicUrl(t.proof_url)
                publicURL = url
              }

              return (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.user_id}</td>
                  <td style={tdStyle}>{t.profiles?.name || '—'}</td>
                  <td style={tdStyle}>{t.profiles?.email || '—'}</td>
                  <td style={tdStyle}>{t.profiles?.phone || '—'}</td>
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
                    {t.status === 'pending' ? (
                      <button
                        onClick={() => handleApprove(t.id)}
                        style={btnApproveStyle}
                      >
                        Aprovar
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}

            {transacoes.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>
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
  background: '#f5f5f5',
}

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
}

const btnApproveStyle = {
  background: '#43a047',      // verde para aprovar
  color: '#fff',
  border: 'none',
  padding: '0.5rem 0.75rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.9rem',
}
