// File: ./pages/dashboard.js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [totais, setTotais] = useState({ depositos: 0, saques: 0, rendimentos: 0, indicados: 0 })
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserAndDados = async () => {
      try {
        // 1) Verifica sessão
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        const session = sessionData?.session

        if (sessionError || !session) {
          router.replace('/login')
          return
        }

        const userId = session.user.id

        // 2) Busca perfil completo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email, referral_code')
          .eq('id', userId)
          .maybeSingle()

        if (profileError || !profile) {
          setError('Erro ao carregar perfil do usuário.')
          setLoading(false)
          return
        }
        setUser(profile)

        // 3) Conta quantos indicados diretos
        const { count: countIndicados, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('referrer_id', userId)

        // 4) Busca transações aprovadas
        const { data: transacoes, error: txError } = await supabase
          .from('transactions')
          .select('amount, type, data')
          .eq('user_id', userId)
          .eq('status', 'approved')

        // 5) Busca rendimentos aplicados
        const { data: rendimentos, error: rendError } = await supabase
          .from('rendimentos_aplicados')
          .select('valor, data')
          .eq('user_id', userId)

        // 6) Calcula totais simples
        let depositos = 0
        let saques = 0
        let totalRendimentos = 0

        if (!txError && transacoes) {
          transacoes.forEach((t) => {
            const v = parseFloat(t.amount) || 0
            if (t.type === 'deposit') depositos += v
            if (t.type === 'withdraw') saques += v
          })
        }

        if (!rendError && rendimentos) {
          rendimentos.forEach((r) => {
            totalRendimentos += parseFloat(r.valor || 0)
          })
        }

        setTotais({
          depositos,
          saques,
          rendimentos: totalRendimentos,
          indicados: countIndicados || 0
        })

        // 7) Monta histórico de evolução diária
        // Agrupa transacoes e rendimentos por data (yyyy-mm-dd)
        const mapByDate = {}
        if (transacoes) {
          transacoes.forEach((t) => {
            const dia = new Date(t.data).toISOString().slice(0, 10)
            if (!mapByDate[dia]) {
              mapByDate[dia] = { date: dia, depositos: 0, saques: 0, rendimentos: 0 }
            }
            const v = parseFloat(t.amount) || 0
            if (t.type === 'deposit') mapByDate[dia].depositos += v
            if (t.type === 'withdraw') mapByDate[dia].saques += v
          })
        }
        if (rendimentos) {
          rendimentos.forEach((r) => {
            const dia = new Date(r.data).toISOString().slice(0, 10)
            if (!mapByDate[dia]) {
              mapByDate[dia] = { date: dia, depositos: 0, saques: 0, rendimentos: 0 }
            }
            mapByDate[dia].rendimentos += parseFloat(r.valor || 0)
          })
        }
        // Transforma em array e ordena por data asc
        const dias = Object.values(mapByDate).sort((a, b) => (a.date < b.date ? -1 : 1))

        // Calcula acumulados
        let acumInvestido = 0
        let acumSaldo = 0
        const historicoData = dias.map((d) => {
          acumInvestido += d.depositos - d.saques
          acumSaldo += d.depositos - d.saques + d.rendimentos
          return {
            date: new Date(d.date).toLocaleDateString('pt-BR'),
            investido: Number(acumInvestido.toFixed(2)),
            saldo: Number(acumSaldo.toFixed(2))
          }
        })
        setHistorico(historicoData)
      } catch (err) {
        console.error('Erro inesperado no dashboard:', err)
        setError('Erro inesperado ao carregar dados do painel.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndDados()
  }, [router])

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando...</p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>
          {error}
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Olá, {user.name || user.email}</h1>

        <div className="card-grid">
          <section className="card">
            <h2>Indicações</h2>
            <p>
              Seu código: <strong>{user.referral_code || 'N/A'}</strong>
            </p>
            <p>
              Você indicou <strong>{totais.indicados}</strong> usuários.
            </p>
          </section>

          <section className="card">
            <h2>Total Investido</h2>
            <p>{formatUSD(totais.depositos)}</p>
          </section>

          <section className="card">
            <h2>Total Sacado</h2>
            <p>{formatUSD(totais.saques)}</p>
          </section>

          <section className="card">
            <h2>Rendimentos Acumulados</h2>
            <p>{formatUSD(totais.rendimentos)}</p>
          </section>
        </div>

        {/* Gráfico de evolução do saldo e total investido */}
        <div className="grafico">
          <h2>Evolução de Saldo e Investido</h2>
          {historico.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historico} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
                <YAxis tickFormatter={(v) => formatUSD(v)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatUSD(value)} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="investido"
                  name="Total Investido"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center' }}>Nenhum histórico disponível.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1.5rem;
          max-width: 1024px;
          margin: auto;
        }

        h1 {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 2rem;
        }

        .card-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          width: 100%;
          max-width: 300px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .grafico {
          margin-top: 2rem;
        }

        h2 {
          text-align: center;
          margin-bottom: 1rem;
        }

        @media (max-width: 640px) {
          .card {
            max-width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}
