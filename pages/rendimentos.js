// pages/rendimentos.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

export default function RendimentosPage() {
  const [transactions, setTransactions] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['deposit', 'withdraw'])
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro ao carregar transações:', error.message)
        return
      }

      setTransactions(data)
      setFilteredData(data)
      generateChartData(data)
    }

    fetchTransactions()
  }, [])

  const applyFilter = () => {
    let filtered = [...transactions]

    if (month) {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at)
        return date.getMonth() + 1 === parseInt(month)
      })
    }

    if (year) {
      filtered = filtered.filter(t => {
        const date = new Date(t.created_at)
        return date.getFullYear() === parseInt(year)
      })
    }

    setFilteredData(filtered)
    generateChartData(filtered)
  }

  const generateChartData = (data) => {
    if (!data.length) {
      setChartData([])
      return
    }

    const amounts = data.map(t => t.type === 'deposit' ? t.amount : -t.amount)
    let balance = 0

    const dataset = data.map((t, i) => {
      balance += amounts[i]
      return {
        date: new Date(t.created_at).toLocaleDateString('pt-BR'),
        rendimento: balance
      }
    })

    setChartData(dataset)
  }

  const months = [
    { value: '', label: 'Todos os meses' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Meus Rendimentos</h1>

        <section className="filtros">
          <div className="filtro-group">
            <label htmlFor="mes">Mês:</label>
            <select id="mes" value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="ano">Ano:</label>
            <select id="ano" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Todos os anos</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button onClick={applyFilter}>Aplicar Filtro</button>
        </section>

        <section className="grafico">
          <h2>Evolução Financeira</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rendimento" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>Nenhuma transação encontrada.</p>
          )}
        </section>

        <section className="transacoes">
          <h2>Histórico de Transações</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t) => (
                <tr key={t.id}>
                  <td>{t.type === 'deposit' ? 'Depósito' : 'Saque'}</td>
                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td><span className={`status ${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  )
}
