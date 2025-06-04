// File: ./pages/planos.js

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Planos() {
  const [plans, setPlans] = useState([])
  const [profile, setProfile] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [currentPlanId, setCurrentPlanId] = useState('') // id do plano que já está no perfil
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

      // 2) Busca lista de planos
      const { data: plansList, error: plansErr } = await supabase
        .from('plans')
        .select('id, name')
        .order('name', { ascending: true })
      if (plansErr) {
        setError('Não foi possível carregar os planos.')
        console.error(plansErr)
        return
      }
      setPlans(plansList)

      // 3) Busca perfil do usuário para obter plan_id
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

      setProfile(prof)
      setCurrentPlanId(prof.plan_id || '')
      setSelectedPlan(prof.plan_id || '')
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedPlan === currentPlanId) {
      // Nada mudou, não precisa salvar
      return
    }
    setError('')
    setSaving(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setError('Sessão expirada. Faça login novamente.')
      setSaving(false)
      return
    }

    const userId = session.user.id
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ plan_id: selectedPlan })
      .eq('id', userId)

    if (upErr) {
      setError('Falha ao atualizar o plano: ' + upErr.message)
      console.error(upErr)
    } else {
      setCurrentPlanId(selectedPlan)
      alert('Plano atualizado com sucesso!')
    }

    setSaving(false)
  }

  // Enquanto o perfil não for carregado, mostra “Carregando”
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

        {/* Se houver um plano ativo, exibimos aqui */}
        {currentPlanId && (
          <div className="current-banner">
            <strong>Seu Plano Atual:</strong>{' '}
            {plans.find((p) => p.id === currentPlanId)?.name || '—'}
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="plans-grid">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id
              const isCurrent = currentPlanId === plan.id
              return (
                <div
                  key={plan.id}
                  className={`plan-card 
                    ${isSelected ? 'selected' : ''} 
                    ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    // Permitir sempre selecionar. Se já é o plano ativo, ao clicar continua marcado,
                    // mas não altera nada até salvar.
                    setSelectedPlan(plan.id)
                  }}
                >
                  <h2>{plan.name}</h2>
                  {isCurrent && !isSelected && (
                    <span className="badge">Plano Atual</span>
                  )}
                  {isSelected && (
                    <span className="badge selected-badge">
                      {isCurrent ? 'Ativo' : 'Selecionado'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            className="btn"
            type="submit"
            disabled={saving || selectedPlan === currentPlanId}
          >
            {saving
              ? 'Salvando...'
              : selectedPlan === currentPlanId
              ? 'Plano Atual'
              : 'Salvar Plano'}
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
          margin-bottom: 1rem;
        }

        .current-banner {
          background-color: #e8f5e9;
          border: 1px solid #c8e6c9;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          text-align: center;
          font-size: 1.05rem;
          margin-bottom: 2rem;
          color: #2e7d32;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .plan-card {
          position: relative;
          padding: 1rem;
          border: 2px solid #ccc;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #fff;
        }

        /* Efeito quando mero hover sobre qualquer card */
        .plan-card:hover {
          border-color: #999;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        /* Card selecionado pelo clique (antes de salvar) */
        .plan-card.selected {
          border-color: #1976d2;
          background-color: #e3f2fd;
        }

        /* Card que já é o plano ativo no banco */
        .plan-card.current {
          border-color: #4caf50;
          background-color: #f0fff0;
        }

        /* Se o plano estiver ativo e selecionado simultaneamente */
        .plan-card.current.selected {
          border-color: #2e7d32;
          background-color: #e8f5e9;
        }

        /* Badge para exibir “Plano Atual” ou “Selecionado” */
        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: #4caf50;
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        /* Se for exatamente o cartão que está selecionado (mas NÃO ativo), cor diferente */
        .badge.selected-badge {
          background-color: #1976d2;
        }

        .btn {
          margin-top: 1.5rem;
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn:hover {
          background-color: #1565c0;
        }

        /* Se o botão estiver desabilitado, muda o cursor e cor */
        .btn:disabled {
          background-color: #aaa;
          cursor: not-allowed;
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
