// pages/planos.js

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Planos() {
  const [plans, setPlans] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      // 1) Verifica sessão
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session) {
        window.location.href = '/login'
        return
      }

      // 2) Busca a lista de planos disponíveis
      //    <-- Não existe mais a coluna “frequency”, apenas “id” e “name”
      const { data: plansList, error: plansErr } = await supabase
        .from('plans')
        .select('id, name')
        .order('name', { ascending: true }) // opcional
      if (plansErr) {
        setError('Não foi possível carregar os planos.')
        console.error(plansErr)
        return
      }
      setPlans(plansList)

      // 3) Busca o perfil do usuário (em “profiles”) para ler plan_id
      const userId = session.user.id
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('plan_id')
        .eq('id', userId)
        .single()

      if (profErr) {
        setError('Erro ao buscar perfil do usuário.')
        console.error(profErr)
        return
      }

      setProfile(prof)                     // prof.plan_id pode ser null ou “PLANO_DIARIO” etc.
      setSelectedPlan(prof.plan_id || '')  // define inicialmente para o que estiver no banco
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 4) Atualiza somente o plan_id em “profiles”
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    const userId = session.user.id
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ plan_id: selectedPlan })
      .eq('id', userId)

    if (upErr) {
      setError('Falha ao atualizar o plano: ' + upErr.message)
      console.error(upErr)
    } else {
      alert('Plano atualizado com sucesso!')
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
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <h2>{plan.name}</h2>
                {selectedPlan === plan.id && <small>Selecionado</small>}
              </div>
            ))}
          </div>

          <button className="btn" type="submit">
            Salvar Plano
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
