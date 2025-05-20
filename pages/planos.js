// pages/planos.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Planos() {
  const [plans, setPlans]           = useState([])
  const [profile, setProfile]       = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [amount, setAmount]         = useState('')
  const [error, setError]           = useState('')

  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'

      const { data: plansList } = await supabase.from('plans').select('id, name, frequency')
      setPlans(plansList)

      let { data: prof } = await supabase
        .from('user_profiles')
        .select('plan_id, invest_amount')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!prof) {
        const code = 'Fx'+Math.random().toString(36).slice(2,8).toUpperCase()
        const { data: newProf } = await supabase
          .from('user_profiles')
          .insert({ user_id: session.user.id, referral_code: code })
          .single()
        prof = newProf
      }

      setProfile(prof)
      setSelectedPlan(prof.plan_id)
      setAmount(prof.invest_amount?.toString() || '')
    })()
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const { data:{ session } } = await supabase.auth.getSession()
    if (!session) return
    const { error: upErr } = await supabase
      .from('user_profiles')
      .update({ plan_id: selectedPlan, invest_amount: parseFloat(amount) })
      .eq('user_id', session.user.id)
    if (upErr) setError(upErr.message)
    else alert('Plano e valor atualizados com sucesso!')
  }

  if (!profile) return <p className="container">Carregando...</p>

  return (
    <div className="container">
      <Nav />
      <h1>Escolha seu Plano</h1>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="plans-grid">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan===plan.id?'selected':''}`}
              onClick={()=>setSelectedPlan(plan.id)}
            >
              <h2>{plan.name}</h2>
              <p>{plan.frequency}</p>
              {selectedPlan===plan.id && <small>Selecionado</small>}
            </div>
          ))}
        </div>
        <label>
          Valor a investir (USD):
          <input
            type="number"
            value={amount}
            required
            onChange={e=>setAmount(e.target.value)}
          />
        </label>
        <button className="btn" type="submit">Salvar</button>
      </form>
    </div>
  )
}
