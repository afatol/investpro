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

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

// Utility to strip accents and convert to lowercase
const normalizeText = (str = '') =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([])
  const [filtered, setFiltered] = useState([])
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
        setFiltered(data || [])
      } catch (err) {
        console.error('Erro ao buscar transações:', err)
        setError('Erro ao buscar transações.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reaplica filtro sempre que 'filtro' ou 'transacoes' mudarem
  useEffect(() => {
    const term = normalizeText(filtro.trim())
    if (!term) {
      setFiltered(transacoes)
      return
    }

    const filtrados = transacoes.filter((t) => {
      // 1) Data (pt-BR)
      const dia = new Date(t.data)
        .toLocaleDateString('pt-BR')
        .toLowerCase()
      // 2) Status
      const status = normalizeText(t.status)
      // 3) Valor
      const valor = Number(t.amount).toFixed(2)
      // 4) Tipo: map English type to Portuguese label
      let tipoLabel = ''
      if (t.type === 'deposit') tipoLabel = 'depósito'
      else if (t.type === 'withdraw') tipoLabel = 'saque'
      else tipoLabel = t.type
      const tipoNormalized = normalizeText(tipoLabel)

      return (
        dia.includes(term) ||
        status.includes(term) ||
        valor.toString().includes(term) ||
        tipoNormalized.includes(term)
      )
    })

    setFiltered(filtrados)
  }, [filtro, transacoes])

  // Agrupa apenas as transações aprovadas (filtered)
  const aprovadas = filtered.filter((t) => t.status === 'approved')
  const agrupado = {}
  aprovadas.forEach((t) => {
    const dia = new Date(t.data).toLocaleDateString('pt-BR')
    if (!agrupado[dia]) agrupado[dia] = { name: dia, deposito: 0, saque: 0 }

    const valor = parseFloat(t.amount) || 0
    if (t.type === 'deposit') agrupado[dia].deposito += valor
    if (t.type === 'withdraw') agrupado[dia].saque += valor
  })
  const chartData = Object.values(agrupado)

  return (
    <Layout>
      <div className="container">
        <h1>Transações</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Campo de filtro */}
            <div style={{ textAlign: 'right', margin: '1rem 0' }}>
              <input
                type="text"
                placeholder="Filtrar por Data, Tipo (Depósito/Saque), Status ou Valor..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  width: '100%',
                  maxWidth: '350px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Gráfico de Depósitos e Saques */}
            <div className="grafico">
              <h2>Gráfico de Depósitos e Saques</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => formatUSD(v)} />
                    <Tooltip formatter={(value) => formatUSD(value)} />
                    <Legend />
                    <Bar dataKey="deposito" name="Depósitos" fill="#4caf50" />
                    <Bar dataKey="saque" name="Saques" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhuma transação aprovada encontrada.</p>
              )}
            </div>

            {/* Tabela de Transações */}
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
                  {filtered.map((t, i) => {
                    const tipoLabel =
                      t.type === 'deposit' ? 'Depósito' :
                      t.type === 'withdraw' ? 'Saque' :
                      t.type

                    return (
                      <tr key={i}>
                        <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                        <td>{tipoLabel}</td>
                        <td>{formatUSD(t.amount)}</td>
                        <td className={`status ${t.status}`}>{t.status}</td>
                      </tr>
                    )
                  })}
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
        `}</style>
      </div>
    </Layout>
  )
}
