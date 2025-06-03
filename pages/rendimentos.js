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
  const [rendimentos, setRendimentos] = useState([])              // lançamentos brutos
  const [origemProfilesMap, setOrigemProfilesMap] = useState({})  // map UUID => { name, email }
  const [chartData, setChartData] = useState([])                  // últimos 5 dias para gráfico
  const [dateFilter, setDateFilter] = useState('')                // YYYY-MM-DD selecionado (inicial: hoje)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1) Inicializa dateFilter com a data de hoje (YYYY-MM-DD)
  useEffect(() => {
    const hoje = new Date()
    const yyyy = hoje.getFullYear().toString()
    const mm = String(hoje.getMonth() + 1).padStart(2, '0')
    const dd = String(hoje.getDate()).padStart(2, '0')
    setDateFilter(`${yyyy}-${mm}-${dd}`)
  }, [])

  // 2) Toda vez que dateFilter muda, busca rendimentos no intervalo [dateFilter - 4 dias, dateFilter]
  useEffect(() => {
    if (!dateFilter) return

    const fetchData = async () => {
      setError(null)
      setLoading(true)

      // calcula início do período (dateFilter - 4 dias)
      const base = new Date(dateFilter)
      const inicio = new Date(base)
      inicio.setDate(base.getDate() - 4)

      const yyyyI = inicio.getFullYear().toString()
      const mmI = String(inicio.getMonth() + 1).padStart(2, '0')
      const ddI = String(inicio.getDate()).padStart(2, '0')
      const startDate = `${yyyyI}-${mmI}-${ddI}`

      const endDate = dateFilter

      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()
        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }
        const userId = session.user.id

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

  // 3) Quando rendimentos muda, busca perfis apenas dos “origens” que são UUIDs (não “daily” nem “com_nivelX”)
  useEffect(() => {
    const fetchOrigemProfiles = async () => {
      // extrai todos os valores de origem que não sejam 'daily', 'com_nivel1' ou 'com_nivel2'
      const origemIds = Array.from(
        new Set(
          rendimentos
            .map((r) => {
              if (r.origem !== 'daily' && r.origem !== 'com_nivel1' && r.origem !== 'com_nivel2')
                return r.origem
              return null
            })
            .filter((o) => o !== null)
        )
      )

      if (origemIds.length === 0) {
        setOrigemProfilesMap({})
        return
      }

      try {
        const { data: perfis, error: perfErr } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', origemIds)

        if (perfErr) throw perfErr

        const mapa = {}
        perfis.forEach((p) => {
          mapa[p.id] = { name: p.name, email: p.email }
        })
        setOrigemProfilesMap(mapa)
      } catch (err) {
        console.error('Erro ao buscar perfis de origem:', err)
        setOrigemProfilesMap({})
      }
    }

    if (rendimentos.length > 0) {
      fetchOrigemProfiles()
    } else {
      setOrigemProfilesMap({})
    }
  }, [rendimentos])

  // 4) Quando rendimentos muda, monta dados para o gráfico dos últimos 5 dias
  useEffect(() => {
    if (!dateFilter) return

    // preenche array dos 5 dias: [dateFilter-4d, …, dateFilter]
    const base = new Date(dateFilter)
    const diasArray = []
    for (let i = 4; i >= 0; i--) {
      const d = new Date(base)
      d.setDate(base.getDate() - i)
      const label = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      diasArray.push({ name: label, dateObj: d, daily: 0, indicacao: 0 })
    }

    rendimentos.forEach((r) => {
      const d = new Date(r.data)
      const diaLabel = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
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

    const cd = diasArray.map((item) => ({
      name: item.name,
      daily: Number(item.daily.toFixed(2)),
      indicacao: Number(item.indicacao.toFixed(2))
    }))
    setChartData(cd)
  }, [rendimentos, dateFilter])

  return (
    <Layout>
      <div className="rendimentos-page">
        <h1>Meus Rendimentos</h1>

        {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}
        {error && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}

        {!loading && !error && (
          <>
            {/* ===============================
                Filtro de Data (últimos 5 dias)
            =============================== */}
            <div className="filtro-data">
              <label htmlFor="dataFilter">Selecionar Dia:</label>
              <input
                id="dataFilter"
                type="date"
                value={dateFilter}
                max={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <small style={{ marginLeft: '0.5rem', color: '#555' }}>
                (mostrando lançamentos dos últimos 5 dias)
              </small>
            </div>

            {/* ========================
                Saldo Acumulado
            ======================== */}
            <div className="saldo-atual">
              <h2>
                Saldo Acumulado:{' '}
                <span>
                  {formatBRL(
                    chartData.reduce((acc, dia) => acc + dia.daily + dia.indicacao, 0)
                  )}
                </span>
              </h2>
            </div>

            {/* ========================
                Gráfico (5 Dias)
            ======================== */}
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
                    <Bar dataKey="daily" name="Rendimento Diário" fill="#4CAF50" />
                    <Bar dataKey="indicacao" name="Indicação" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhum dado para exibir.</p>
              )}
            </div>

            {/* ====================================
                Histórico Detalhado (com Nome/Email)
            ==================================== */}
            <div className="historico">
              <h2>Histórico Detalhado</h2>
              {rendimentos.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Data e Hora</th>
                      <th>Origem</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimentos.map((r) => {
                      // 1) Formata data/hora no timezone local
                      const dtStr = new Date(r.data).toLocaleString('pt-BR')

                      // 2) Define texto de origem
                      let origemTexto = 'Rendimento Diário'
                      if (r.origem === 'com_nivel1') {
                        origemTexto = 'Comissão Nível 1'
                      } else if (r.origem === 'com_nivel2') {
                        origemTexto = 'Comissão Nível 2'
                      } else if (r.origem !== 'daily') {
                        // supomos que seja UUID do perfil indicante
                        const perfil = origemProfilesMap[r.origem]
                        if (perfil) {
                          origemTexto = `Indicação (${perfil.name || perfil.email})`
                        } else {
                          origemTexto = `Indicação (ID desconhecido)`
                        }
                      }

                      return (
                        <tr key={r.id}>
                          <td>{dtStr}</td>
                          <td>{origemTexto}</td>
                          <td>{formatBRL(r.valor)}</td>
                        </tr>
                      )
                    })}
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
