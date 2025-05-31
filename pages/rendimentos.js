import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function RendimentosPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user.id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
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

  const chartData = transacoes
    .filter(t => t.status === 'approved')
    .map(t => ({
      name: new Date(t.data).toLocaleDateString('pt-BR'),
      valor: parseFloat(t.amount || 0)
    }))
    .reverse()

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Minhas Transações</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grafico">
              <h2>Gráfico de Rendimentos Aprovados</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatUSD(value)}
                    />
                    <Tooltip formatter={(value) => formatUSD(value)} />
                    <Bar dataKey="valor" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhuma transação aprovada ainda.</p>
              )}
            </div>

            <div className="transacoes">
              <h2>Histórico Completo</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor (USD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                      <td>{t.type}</td>
                      <td>{formatUSD(parseFloat(t.amount))}</td>
                      <td className={`status ${t.status}`}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <style jsx>{`
          .rendimentos {
            max-width: 900px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1, h2 {
            text-align: center;
            margin-bottom: 1rem;
          }

          .grafico {
            margin-bottom: 3rem;
          }

          .transacoes {
            overflow-x: auto;
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
            background-color: #f5f5f5;
          }

          .status.approved {
            background-color: #d4edda;
            color: #155724;
            font-weight: bold;
            border-radius: 6px;
            padding: 0.3rem 0.6rem;
          }

          .status.pending {
            background-color: #fff3cd;
            color: #856404;
            font-weight: bold;
            border-radius: 6px;
            padding: 0.3rem 0.6rem;
          }

          .status.rejected {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: bold;
            border-radius: 6px;
            padding: 0.3rem 0.6rem;
          }

          .error {
            color: red;
            text-align: center;
            margin-top: 1rem;
          }

          @media (max-width: 600px) {
            table {
              font-size: 0.9rem;
            }

            .grafico {
              margin-bottom: 2rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  )
}
