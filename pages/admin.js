// pages/admin.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function AdminPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data,
        error: fetchError
      } = await supabase
        .from('transactions')
        .select('*, profiles(nome)')
        .order('data', { ascending: false })

      if (fetchError) {
        setError('Erro ao carregar transações')
        console.error(fetchError)
      } else {
        setTransactions(data || [])
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [])

  return (
    <Layout>
      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        {loading && <p>Carregando transações...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td>{t.profiles?.nome || 'N/A'}</td>
                  <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                  <td>{t.type}</td>
                  <td>${parseFloat(t.amount).toFixed(2)}</td>
                  <td className={`status ${t.status}`}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <style jsx>{`
          .admin-container {
            max-width: 1000px;
            margin: auto;
            padding: 2rem 1rem;
          }

          h1 {
            text-align: center;
            margin-bottom: 2rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }

          th, td {
            padding: 0.8rem;
            text-align: center;
            border-bottom: 1px solid #ddd;
          }

          th {
            background-color: #f0f0f0;
          }

          .status.approved {
            background: #d4edda;
            color: #155724;
            font-weight: bold;
          }

          .status.pending {
            background: #fff3cd;
            color: #856404;
            font-weight: bold;
          }

          .status.rejected {
            background: #f8d7da;
            color: #721c24;
            font-weight: bold;
          }

          .error {
            color: red;
            text-align: center;
          }
        `}</style>
      </div>
    </Layout>
  )
}
