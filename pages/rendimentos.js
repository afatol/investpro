import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function RendimentosPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user?.id
      if (!userId) return setError('Usuário não autenticado.')

      const { data: rendimentos, error: fetchError } = await supabase
        .from('rendimentos')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (fetchError) {
        console.error('Erro ao buscar dados de rendimentos:', fetchError)
        setError('Erro ao buscar dados de rendimentos.')
      } else {
        setData(rendimentos || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const chartData = data.map(item => ({
    name: new Date(item.data).toLocaleDateString(),
    valor: item.valor
  })).reverse()

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
                    <Tooltip />
                    <Bar dataKey="valor" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Sem dados para exibir no gráfico.</p>
              )}
            </div>

            <div className="transacoes">
              <h2>Histórico</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor (USD)</th>
                    <th>Status</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={i}>
                      <td>{new Date(item.data).toLocaleDateString()}</td>
                      <td>{item.valor?.toFixed(2)}</td>
                      <td className={`status ${item.status || ''}`}>{item.status || 'N/A'}</td>
                      <td>{item.tipo || 'N/A'}</td>
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
