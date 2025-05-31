import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function AdminPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const { data, error } = await supabase
        .from('transactions')
        .select('*, profiles(nome)')
        .order('data', { ascending: false })

      if (error) {
        console.error(error)
        setError('Erro ao buscar transações')
      } else {
        setTransacoes(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const formatUSD = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value)

  const alterarStatus = async (id, novoStatus) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: novoStatus })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar status')
    } else {
      setTransacoes(prev => prev.map(t => t.id === id ? { ...t, status: novoStatus } : t))
    }
  }

  return (
    <Layout>
      <div className="admin-page">
        <h1>Painel Administrativo</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Usuário</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                  <td>{t.profiles?.nome || '---'}</td>
                  <td>{t.type}</td>
                  <td>{formatUSD(t.amount)}</td>
                  <td>{t.status}</td>
                  <td>
                    {t.status === 'pending' && (
                      <>
                        <button onClick={() => alterarStatus(t.id, 'approved')}>Aprovar</button>
                        <button onClick={() => alterarStatus(t.id, 'rejected')}>Rejeitar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <style jsx>{`
          .admin-page {
            max-width: 1000px;
            margin: 2rem auto;
            padding: 1rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5rem;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: center;
          }

          th {
            background-color: #f5f5f5;
          }

          button {
            margin: 0 0.25rem;
            padding: 0.4rem 0.6rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          button:hover {
            opacity: 0.9;
          }

          button:first-of-type {
            background-color: #4CAF50;
            color: white;
          }

          button:last-of-type {
            background-color: #f44336;
            color: white;
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
