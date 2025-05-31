// pages/dashboard.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

// Função utilitária para formatar valores em USD
const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [totais, setTotais] = useState({ depositos: 0, saques: 0, rendimentos: 0 })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserAndDados = async () => {
      try {
        // 1) Verifica a sessão do usuário
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          // Se não estiver logado, redireciona para /login
          router.replace('/login')
          return
        }

        const userId = session.user.id

        // 2) Busca perfil completo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          setError('Falha ao carregar perfil.')
          setLoading(false)
          return
        } else {
          const enrichedUser = { ...session.user, ...profile }
          setUser(enrichedUser)
        }

        // 3) Busca totais de transações aprovadas (deposit e withdraw)
        const { data: transacoes, error: txError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', userId)
          .eq('status', 'approved')

        let depositos = 0
        let saques = 0

        if (txError) {
          console.error('Erro ao buscar transações:', txError)
          setError('Falha ao carregar transações.')
        } else if (transacoes) {
          transacoes.forEach((t) => {
            const valorNum = parseFloat(t.amount) || 0
            if (t.type === 'deposit') {
              depositos += valorNum
            }
            if (t.type === 'withdraw') {
              saques += valorNum
            }
            // Se seu banco ainda usar 'depósito' e 'saque' em português, ajuste para:
            // if (t.type === 'depósito') depositos += valorNum
            // if (t.type === 'saque')    saques += valorNum
          })
        }

        // 4) Busca rendimentos aplicados
        const { data: rendimentos, error: rendError } = await supabase
          .from('rendimentos_aplicados')
          .select('valor')
          .eq('user_id', userId)

        let totalRendimentos = 0
        if (rendError) {
          console.error('Erro ao buscar rendimentos:', rendError)
          setError((prev) => prev + ' Falha ao carregar rendimentos.')
        } else if (rendimentos) {
          totalRendimentos = rendimentos.reduce(
            (acc, r) => acc + parseFloat(r.valor || 0),
            0
          )
        }

        // 5) Atualiza state com os totais apurados
        setTotais({
          depositos,
          saques,
          rendimentos: totalRendimentos
        })
      } catch (err) {
        console.error('Erro inesperado no dashboard:', err)
        setError('Erro inesperado ao carregar dados.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndDados()
  }, [router])

  const handleCopy = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  if (!user) {
    // Caso não haja usuário, nada a exibir (redirecionamento já tratado)
    return null
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Olá, {user.email}</h1>

        <div className="card-grid">
          <section className="card">
            <h2>Indicações</h2>
            <p>
              Seu código:{' '}
              <strong>{user.referral_code || 'N/A'}</strong>
            </p>
            <p>
              Você indicou{' '}
              <strong>{user.referrals_count || 0}</strong> usuários.
            </p>
            <button onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar meu código'}
            </button>
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

          <section className="card">
            <h2>Links Rápidos</h2>
            <Link href="/transacoes" className="link">
              Ver Transações
            </Link>
            <br />
            <Link href="/rendimentos" className="link">
              Ver Rendimentos
            </Link>
          </section>
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
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        button,
        .link {
          margin-top: 1rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: bold;
          background-color: #0070f3;
          color: white;
          border: none;
          text-decoration: none;
          display: inline-block;
        }

        button:hover,
        .link:hover {
          background-color: #005bb5;
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
