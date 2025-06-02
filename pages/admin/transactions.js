import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminTransactions() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      setError('')
      try {
        const { data, error: err } = await supabase
          .from('transactions')
          .select(`
            id,
            user_id,
            type,
            amount,
            status,
            data,
            proof_url,
            profiles ( email )
          `)
          .order('data', { ascending: false })
        if (err) throw err
        setList(data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar transações.')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [refresh])

  const updateStatus = async (txId, newStatus) => {
    try {
      const { error: err } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', txId)
      if (err) throw err
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      alert('Falha ao atualizar status.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando transações...</p>
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
      <div className="admin-transactions">
        <h1>Gerenciar Transações</h1>
        <table>
          <thead>
            <tr>
              <th>Usuário (email)</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Comprovante</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.profiles?.email || '—'}</td>
                <td>{tx.type}</td>
                <td>{Number(tx.amount).toFixed(2)}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.data).toLocaleString()}</td>
                <td>
                  {tx.proof_url ? (
                    <a href={tx.proof_url} target="_blank" rel="noopener noreferrer">
                      Ver
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {tx.status !== 'approved' && (
                    <button onClick={() => updateStatus(tx.id, 'approved')}>
                      Aprovar
                    </button>
                  )}
                  {tx.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(tx.id, 'rejected')}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Rejeitar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-transactions {
          max-width: 1000px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.75rem 0.5rem;
          border: 1px solid #ddd;
          text-align: center;
          font-size: 0.9rem;
        }
        th {
          background: #f5f5f5;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        button {
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        button:hover {
          background: #005bb5;
        }
      `}</style>
    </Layout>
  )
}
