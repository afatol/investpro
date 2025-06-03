// File: ./pages/rendimentos.js

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

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function RendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])              // lista bruta de lançamentos
  const [filtered, setFiltered] = useState([])                    // apenas os 5 dias filtrados
  const [chartData, setChartData] = useState([])                  // dados formatados para o gráfico
  const [dateFilter, setDateFilter] = useState('')                // YYYY-MM-DD do dia selecionado (default: hoje)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1) Ao montar componente, inicializa dateFilter para hoje (YYYY-MM-DD)
  useEffect(() => {
    const hoje = new Date()
    const yyyy = hoje.getFullYear().toString()
    const mm = String(hoje.getMonth() + 1).padStart(2, '0')
    const dd = String(hoje.getDate()).padStart(2, '0')
    const hojeStr = `${yyyy}-${mm}-${dd}`
    setDateFilter(hojeStr)
  }, [])

  // 2) Sempre que dateFilter muda, traz do Supabase todos os rendimentos_aplicados
  //    cujo campo `data::date` esteja entre (dateFilter - 4 dias) e dateFilter.
  useEffect(() => {
    if (!dateFilter) return

    const fetchData = async () => {
      setError(null)
      setLoading(true)

      // calcula início do período: dateFilter - 4 dias
      const base = new Date(dateFilter)
      const inicio = new Date(base)
      inicio.setDate(base.getDate() - 4)

      // formata para ISO (YYYY-MM-DD) para usar no filtro .gte / .lte
      const yyyyI = inicio.getFullYear().toString()
      const mmI = String(inicio.getMonth() + 1).padStart(2, '0')
      const ddI = String(inicio.getDate()).padStart(2, '0')
      const startDate = `${yyyyI}-${mmI}-${ddI}`

      const endDate = dateFilter // YYYY-MM-DD

      try {
        // Supabase: busca id, user_id, valor, origem, data para o usuário atual
        const {
          data: sessionData,
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          window.location.href = '/login'
          return
        }
        const userId = sessionData.session.user.id

        // Query: filtrar por data >= startDate e <= endDate
        const { data, error: fetchErr } = await supabase
          .from('rendimentos_aplicados')
          .select('id, user_id, valor, origem, data')
          .eq('user_id', userId)
          .gte('data', `${startDate}T00:00:00`)
          .lte('data', `${endDate}T23:59:59`)
          .order('data', { ascending: true })

        if (fetchErr) throw fetchErr

        setRendimentos(data || [])
      } catch (err) {
        console.error('Erro ao buscar rendimentos:', err)
        setError('Erro ao carregar rendimentos.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateFilter])

  // 3) Quando `rendimentos` for atualizado, monta `chartData` e `filtered`:
  useEffect(() => {
    if (!dateFilter) return

    // Reconstrói array de 5 dias (hoje e 4 dias anteriores)
    const base = new Date(dateFilter)
    const diasArray = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date(base)
      d.setDate(base.getDate() - i)
      const label = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) // “DD/MM/YYYY”
      diasArray.push({
        key: label,           // usado internamente
        dateObj: d,           // objeto Date original
        name: label,          // texto para eixo X
        daily: 0,             // total de “daily”
        indicacao: 0          // total de “origem ≠ 'daily'”
      })
    }

    // Agrupa lançamentos em seus dias
    rendimentos.forEach((r) => {
      const d = new Date(r.data)
      const diaLabel = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      // encontra índice no array
      const idx = diasArray.findIndex((item) => item.name === diaLabel)
      if (idx !== -1) {
        const valorNum = parseFloat(r.valor || 0)
        if (r.origem === 'daily') {
          diasArray[idx].daily += valorNum
        } else {
          diasArray[idx].indicacao += valorNum
        }
      }
    })

    // `chartData` precisa ser array de objetos puros { name, daily, indicacao }
    const cd = diasArray.map((item) => ({
      name: item.name,
      daily: Number(item.daily.toFixed(2)),
      indicacao: Number(item.indicacao.toFixed(2))
    }))

    setChartData(cd)
    setFiltered(rendimentos) // histórica completa (já filtrada por data)  
  }, [rendimentos, dateFilter])

  // 4) Renderização
  return (
    <Layout>
      <div className="rendimentos-page">
        <h1>Meus Rendimentos</h1>

        {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}
        {error && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* ----------------------
                4.1) Filtro por data
            ---------------------- */}
            <div className="filtro-data">
              <label htmlFor="dataFilter">Selecionar Dia:</label>
              <input
                id="dataFilter"
                type="date"
                value={dateFilter}
                max={dateFilter}  // não permite futuro
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <small style={{ marginLeft: '0.5rem', color: '#555' }}>
                (serão exibidos os últimos 5 dias a partir dessa data)
              </small>
            </div>

            {/* ---------------------------------------
                4.2) Saldo acumulado até o final do período
            --------------------------------------- */}
            <div className="saldo-atual">
              <h2>
                Saldo Acumulado: {' '}
                <span>
                  {formatBRL(
                    chartData.reduce(
                      (acc, dia) => acc + dia.daily + dia.indicacao,
                      0
                    )
                  )}
                </span>
              </h2>
            </div>

            {/* ----------------------
                4.3) Gráfico dos últimos 5 dias
            ---------------------- */}
            <div className="grafico">
              <h2>Gráfico dos Últimos 5 Dias</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis tickFormatter={(v) => formatBRL(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatBRL(value)} />
                    <Legend />
                    <Bar
                      dataKey="daily"
                      name="Rendimento Diário"
                      fill="#4CAF50"
                    />
                    <Bar
                      dataKey="indicacao"
                      name="Indicação"
                      fill="#2196F3"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhum dado para exibir.</p>
              )}
            </div>

            {/* ----------------------
                4.4) Histórico detalhado (lista de lançamentos)
            ---------------------- */}
            <div className="historico">
              <h2>Histórico Detalhado</h2>
              {filtered.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Origem</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {new Date(r.data).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td>
                          {r.origem === 'daily'
                            ? 'Rendimento Diário'
                            : `Indicação (${r.origem})`}
                        </td>
                        <td>{formatBRL(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center' }}>
                  Nenhum lançamento encontrado para este período.
                </p>
              )}
            </div>
          </>
        )}

        {/* =========================
            Estilos em JSX
        ========================= */}
        <style jsx>{`
          .rendimentos-page {
            max-width: 900px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1,
          h2 {
            text-align: center;
            margin-bottom: 1rem;
          }

          .error {
            color: red;
          }

          .filtro-data {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          .filtro-data label {
            margin-right: 0.5rem;
            font-weight: 500;
          }
          .filtro-data input[type='date'] {
            padding: 0.4rem 0.6rem;
            border-radius: 6px;
            border: 1px solid #ccc;
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

          th,
          td {
            padding: 0.8rem;
            text-align: center;
            border-bottom: 1px solid #ddd;
          }

          th {
            background-color: #f5f5f5;
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
