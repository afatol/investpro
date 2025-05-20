// pages/rede.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Rede() {
  const [cfg, setCfg] = useState({1:0,2:0})
  const [niv1, setNiv1] = useState({users:[], total:0})
  const [niv2, setNiv2] = useState({users:[], total:0})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'
      const userId = session.user.id

      const { data: config } = await supabase
        .from('referral_configs')
        .select('*')
      const mapCfg = {}
      config.forEach(c => mapCfg[c.level] = parseFloat(c.percentage))
      setCfg(mapCfg)

      const { data: indicados1 } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('referred_by', userId)
      let total1 = 0
      const detal1 = await Promise.all(
        indicados1.map(async ({ user_id }) => {
          const { data: txs } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user_id)
            .eq('status', 'approved')
          const sum = txs.reduce((s,t) =>
            s + ((t.type==='deposit'||t.type==='rendimento')?parseFloat(t.amount):0)
          ,0)
          const comm = sum * (mapCfg[1]/100)
          total1 += comm
          return { user_id, movimentado: sum, comissao: comm }
        })
      )
      setNiv1({ users: detal1, total: total1 })

      let total2 = 0
      const detal2 = []
      for (const { user_id: p1 } of indicados1) {
        const { data: indicados2 } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('referred_by', p1)
        for (const { user_id: p2 } of indicados2) {
          const { data: txs2 } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', p2)
            .eq('status', 'approved')
          const sum2 = txs2.reduce((s,t) =>
            s + ((t.type==='deposit'||t.type==='rendimento')?parseFloat(t.amount):0)
          ,0)
          const comm2 = sum2 * (mapCfg[2]/100)
          total2 += comm2
          detal2.push({ user_id: p2, movimentado: sum2, comissao: comm2 })
        }
      }
      setNiv2({ users: detal2, total: total2 })
      setLoading(false)
    })()
  }, [])

  if (loading) return <p className="container">Carregando minha rede…</p>

  return (
    <div className="container">
      <Nav />
      <h1>Minha Rede</h1>
      <section>
        <h2>Nível 1 ({cfg[1]}%)</h2>
        {niv1.users.length>0 ? (
          <>
            <ul>
              {niv1.users.map(u => (
                <li key={u.user_id}>
                  Usuário <strong>{u.user_id}</strong> – Mov.: ${u.movimentado.toFixed(2)} – Comissão: ${u.comissao.toFixed(2)}
                </li>
              ))}
            </ul>
            <p><strong>Total Nível 1:</strong> ${niv1.total.toFixed(2)}</p>
          </>
        ) : <p>Você não indicou ninguém ainda.</p>}
      </section>
      <section style={{marginTop:'2rem'}}>
        <h2>Nível 2 ({cfg[2]}%)</h2>
        {niv2.users.length>0 ? (
          <>
            <ul>
              {niv2.users.map(u => (
                <li key={u.user_id}>
                  Usuário <strong>{u.user_id}</strong> – Mov.: ${u.movimentado.toFixed(2)} – Comissão: ${u.comissao.toFixed(2)}
                </li>
              ))}
            </ul>
            <p><strong>Total Nível 2:</strong> ${niv2.total.toFixed(2)}</p>
          </>
        ) : <p>Sem usuários no segundo nível.</p>}
      </section>
    </div>
  )
}
