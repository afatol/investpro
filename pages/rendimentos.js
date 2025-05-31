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
  CartesianGrid,
  Legend
} from 'recharts'

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function RendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user.id
      const { data, error } = await supabase
        .from('rendimentos_aplicados')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: true })

      if (error) {
        console.error(error)
        setError('Erro ao buscar rendimentos')
      } else {
        setRendimentos(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // Processa para gráfico e total
  const grouped = {}
  let total = 0

  rendimentos.forEach(r => {
    const dia = new Date(r.data).toLocaleDateString('pt-BR')
    if (!grouped[dia]) grouped[dia] = { name: dia, rendimento: 0, indicacao: 0 }

    if (r.tipo === 'indicacao') {
      grouped[dia].indicacao += parseFloat(r.valor)
    } else {
      grouped[dia].rendimento += parseFloat(r.valor)
    }

    total += parseFloat(r.valor)
  })

  const chartData = Object.values(grouped)

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Meus Rendimentos</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="saldo-atual">
              <h2>Saldo Acumulado: <span>{formatUSD(total)}</span></h2>
            </div>

            <div className="grafico">
              <h2>Gráfico Diário de Rendimentos</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
                    <YAxis tickFormatter={(v) => formatUSD(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatUSD(value)} />
                    <Legend />
                    <Bar dataKey="rendimento" name="Rendimento" fill="#4CAF50" />
                    <Bar dataKey="indicacao" name="Indicação" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhum rendimento lançado ainda.</p>
              )}
            </div>

            <div className="historico">
              <h2>Histórico de Rendimentos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rendimentos.map((r, i) => (
                    <tr key={i}>
                      <td>{new Date(r.data).toLocaleDateString('pt-BR')}</td>
                      <td>{r.tipo}</td>
                      <td>{formatUSD(r.valor)}</td>
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

          .saldo-atual {
            text-align: center;
            margin-bottom: 2rem;
          }

          .saldo-atual span {
            color: #0070f3;
            font-size: 1.6rem;
            font-weight: bold;
          }

          .grafico {
            margin-bottom: 3rem;
          }

          .historico {
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
