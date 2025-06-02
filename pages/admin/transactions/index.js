// File: ./pages/admin/transactions/index.js

import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminTransactionsPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTransactions = async () => {
      setError('')
      try {
        // Puxa id, user_id, type, amount, status, data, proof_url
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
    fetchTransactions()
  }, [])

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
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
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
              <th>Usuário (ID)</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id}>
                <td>{t.user_id}</td>
                <td>{t.type}</td>
                <td>{Number(t.amount).toFixed(2)}</td>
                <td>{t.status}</td>
                <td>{new Date(t.data).toLocaleString()}</td>
                <td>
                  {t.proof_url ? (
                    <a href={t.proof_url} target="_blank" rel="noopener noreferrer">
                      Ver Comprovante
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}

            {transacoes.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
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
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background: #f5f5f5;
        }
        a {
          color: #1976d2;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  )
}

