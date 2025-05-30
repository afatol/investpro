// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import Link from 'next/link'


export default function DashboardPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, ...data })
    }

    fetchUser()
  }, [])

  if (!user) return <p>Carregando...</p>

  const referralLink = `/profile#${user.referral_code || 'carregando'}`

  return (
    <Layout>
      <div className="dashboard">
        <h1>Olá, {user.email}</h1>

        <section className="referrals">
          <h2>Indicações</h2>
          <p>Você indicou <strong>{user.referrals_count || 0}</strong> usuários.</p>
          <button onClick={() => navigator.clipboard.writeText(user.referral_code)}>
            Copiar meu código de indicação
          </button>
        </section>

        <section className="earnings">
          <h2>Rendimentos</h2>
          <p>Acesse sua nova página de rendimentos pra ver gráficos e histórico de transações</p>
          <Link href="/rendimentos">Ir para Rendimentos</Link>
        </section>
      </div>
    </Layout>
  )
}
