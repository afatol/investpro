// pages/planos.js

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Planos() {
  const [plans, setPlans] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }

      // 1) Buscar lista de planos (apenas id e name, sem “frequency”)
      const { data: plansList, error: plansErr } = await supabase
        .from('plans')
        .select('id, name')
      if (plansErr) {
        console.error(plansErr)
      } else {
        setPlans(plansList)
      }

      // 2) Tentar ler a linha em “user_profiles” para este usuário
      let { data: prof, error: profErr } = await supabase
        .from('user_profiles')
        .select('plan_id, invest_amount')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (profErr) {
        console.error(profErr)
      }

      // 3) Se não existir, cria a linha vazia (com referral_code gerado)
      if (!prof) {
        const code = 'FX' + Math.random().toString(36).slice(2, 8).toUpperCase()
        const { data: newProf, error: insertErr } = await supabase
          .from('user_profiles')
          .insert({
            user_id: session.user.id,
            referral_code: code,
            invest_amount: null,
            plan_id: null,
          })
          .single()

        if (insertErr) {
          console.error(insertErr)
          setError('Falha ao criar perfil de investimento.')
        } else {
          prof = newProf
        }
      }

      setProfile(prof)
      setSelectedPlan(prof.plan_id)
      setAmount(prof.invest_amount?.toString() || '')
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }

    const { error: upErr } = await supabase
      .from('user_profiles')
      .update({
        plan_id: selectedPlan,
        invest_amount: parseFloat(amount),
      })
      .eq('user_id', session.user.id)

    if (upErr) {
      setError(upErr.message)
    } else {
      alert('Plano e valor atualizados com sucesso!')
    }
  }

  if (!profile) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="planos-container">
        <h1>Escolha seu Plano</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${
                  selectedPlan === plan.id ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <h2>{plan.name}</h2>
                {selectedPlan === plan.id && <small>Selecionado</small>}
              </div>
            ))}
          </div>

          <label>
            Valor a investir (USD):
            <input
              type="number"
              value={amount}
              required
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <button className="btn" type="submit">
            Salvar
          </button>
        </form>
      </div>

      <style jsx>{`
        .planos-container {
          max-width: 800px;
          margin: auto;
          padding: 2rem 1rem;
        }

        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .plan-card {
          padding: 1rem;
          border: 2px solid #ccc;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .plan-card.selected {
          border-color: #4caf50;
          background-color: #f0fff0;
        }

        label {
          display: block;
          margin: 1rem 0 0.5rem;
          font-weight: bold;
        }

        input[type='number'] {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .btn {
          margin-top: 1.5rem;
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn:hover {
          background-color: #45a049;
        }

        .error {
          color: red;
          text-align: center;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        @media (max-width: 500px) {
          .plan-card {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  )
}
