// File: ./pages/transacoes.js

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
  const [filteredTransacoes, setFilteredTransacoes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }

        const userId = session.user.id

        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select('id, amount, type, status, data')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (fetchError) throw fetchError
        setTransacoes(data || [])
        setFilteredTransacoes(data || [])
      } catch (err) {
        console.error('Erro ao buscar transações:', err)
        setError('Erro ao buscar transações.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reaplica filtro sempre que “filtro” ou “transacoes” mudarem
  useEffect(() => {
    if (!filtro.trim()) {
      setFilteredTransacoes(transacoes)
    } else {
      const term = filtro.toLowerCase()
      const filtrados = transacoes.filter((t) => {
        const tipo = t.type?.toLowerCase() || ''
        const status = t.status?.toLowerCase() || ''
        const dataStr = new Date(t.data).toLocaleDateString('pt-BR').toLowerCase()
        const amountStr = Number(t.amount).toFixed(2)
        return (
          tipo.includes(term) ||
          status.includes(term) ||
          dataStr.includes(term) ||
          amountStr.includes(term)
        )
      })
      setFilteredTransacoes(filtrados)
    }
  }, [filtro, transacoes])

  // Agrupa apenas as transações aprovadas (status === 'approved'), vindas do array filtrado
  const agrupado = {}
  filteredTransacoes
    .filter((t) => t.status === 'approved')
    .forEach((t) => {
      const dia = new Date(t.data).toLocaleDateString('pt-BR')
      if (!agrupado[dia]) agrupado[dia] = { name: dia, deposito: 0, saque: 0 }

      const valor = parseFloat(t.amount) || 0
      if (t.type === 'deposit') agrupado[dia].deposito += valor
      if (t.type === 'withdraw') agrupado[dia].saque += valor
    })

  const chartData = Object.values(agrupado)

  const formatUSD = (v) => `US$ ${Number(v || 0).toFixed(2)}`

  return (
    <Layout>
      <div className="container">
        <h1>Transações</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Campo de filtro */}
            <div className="filtro-container">
              <input
                type="text"
                placeholder="Filtrar por Tipo, Status, Data ou Valor..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="input-filtro"
              />
            </div>

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
                  {filteredTransacoes.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                      <td>{t.type === 'deposit' ? 'Depósito' : t.type === 'withdraw' ? 'Saque' : t.type}</td>
                      <td>{formatUSD(t.amount)}</td>
                      <td className={`status ${t.status}`}>{t.status}</td>
                    </tr>
                  ))}
                  {filteredTransacoes.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}
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

          h1, h2 {
            text-align: center;
            margin-bottom: 1rem;
          }

          .filtro-container {
            margin-bottom: 1.5rem;
            text-align: right;
          }

          .input-filtro {
            padding: 0.5rem 0.75rem;
            width: 100%;
            max-width: 350px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
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
            border-radius: 4px;
            padding: 0.3rem 0.6rem;
          }

          .status.pending {
            background-color: #fff3cd;
            color: #856404;
            font-weight: bold;
            border-radius: 4px;
            padding: 0.3rem 0.6rem;
          }

          .status.rejected {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: bold;
            border-radius: 4px;
            padding: 0.3rem 0.6rem;
          }

          .error {
            color: red;
            text-align: center;
            margin-top: 1rem;
          }

          @media (max-width: 600px) {
            .grafico {
              margin-bottom: 1.5rem;
            }
            th, td {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  )
}
