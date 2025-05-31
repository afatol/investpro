import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function RendimentosPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('Sessão inválida. Redirecionando...')
        window.location.href = '/login'
        return
      }

      const userId = session.user?.id
      if (!userId) {
        setError('Usuário não autenticado.')
        return
      }

      const { data: rendimentos, error: fetchError } = await supabase
        .from('rendimentos')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (fetchError) {
        console.error(fetchError)
        setError('Erro ao buscar dados.')
      } else {
        setData(rendimentos || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Dados para gráfico
  const chartData = data
    .filter(item => item.valor !== null)
    .map(item => ({
      name: new Date(item.data).toLocaleDateString(),
      valor: Number(item.valor)
    }))
    .reverse()

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Rendimentos</h1>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="grafico">
              <h2>Gráfico de Rendimentos</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="valor" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Sem dados para exibir no gráfico.</p>
              )}
            </div>

            <div className="transacoes">
              <h2>Histórico de Transações</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor (USD)</th>
                    <th>Tipo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i}>
                      <td>{new Date(item.data).toLocaleDateString()}</td>
                      <td>{item.valor?.toFixed(2) || '-'}</td>
                      <td>{item.tipo || 'rendimento'}</td>
                      <td className={`status ${item.status || ''}`}>{item.status || 'pendente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

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

        .status {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-weight: bold;
          text-transform: capitalize;
        }

        .status.approved {
          background-color: #d4edda;
          color: #155724;
        }

        .status.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        @media (max-width: 600px) {
          table {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  )
}
