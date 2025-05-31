import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Verifica sessão do usuário
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()
        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }

        const userId = session.user.id

        // 2) Busca na tabela "transactions" apenas colunas que existem:
        //    id, amount, type, status, data
        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select('id, amount, type, status, data')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (fetchError) throw fetchError
        setTransacoes(data || [])
      } catch (err) {
        console.error(err)
        setError('Erro ao buscar transações.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtra apenas as transações aprovadas
  const aprovadas = transacoes.filter((t) => t.status === 'approved')

  // Agrupa aprovações por data (coluna "data")
  const agrupado = {}
  aprovadas.forEach((t) => {
    const dia = new Date(t.data).toLocaleDateString('pt-BR')
    if (!agrupado[dia]) agrupado[dia] = { name: dia, deposito: 0, saque: 0 }

    const valor = parseFloat(t.amount) || 0
    if (t.type?.toLowerCase().includes('dep')) agrupado[dia].deposito += valor
    if (t.type?.toLowerCase().includes('saq')) agrupado[dia].saque += valor
  })
  const chartData = Object.values(agrupado)

  // Função para formatar em USD
  const formatUSD = (v) => `US$ ${Number(v).toFixed(2)}`

  return (
    <Layout>
      <div className="container">
        <h1>Transações</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grafico">
              <h2>Gráfico de Depósitos e Saques</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatUSD} />
                    <Tooltip formatter={(value) => formatUSD(value)} />
                    <Legend />
                    <Bar dataKey="deposito" name="Depósitos" fill="#4caf50" />
                    <Bar dataKey="saque" name="Saques" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>
                  Nenhuma transação aprovada encontrada.
                </p>
              )}
            </div>

            <div className="tabela">
              <h2>Histórico de Transações</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                      <td>{t.type}</td>
                      <td>{formatUSD(t.amount)}</td>
                      <td className={`status ${t.status}`}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <style jsx>{`
          .container {
            max-width: 900px;
            margin: auto;
            padding: 2rem 1rem;
          }

          h1,
          h2 {
            text-align: center;
            margin-bottom: 1rem;
          }

          .grafico {
            margin-bottom: 2rem;
          }

          .tabela {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
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
            border-radius: 4px;
            padding: 0.3rem 0.6rem;
          }

          .status.pending {
            background-color: #fff3cd;
            color: #856404;
          }

          .status.rejected {
            background-color: #f8d7da;
            color: #721c24;
          }

          .error {
            color: red;
            text-align: center;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    </Layout>
  )
}
