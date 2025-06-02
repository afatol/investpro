// File: ./pages/admin/plans/[id].js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansEditPage() {
  const router = useRouter()
  const { id } = router.query

  // -------------- Estados --------------
  const [name, setName] = useState('')             // nome do plano
  const [dailyRate, setDailyRate] = useState('')   // daily_rate (string para facilitar o binding)
  const [loading, setLoading] = useState(true)     // enquanto busca os dados
  const [saving, setSaving] = useState(false)      // enquanto salva as alterações
  const [error, setError] = useState('')           // mensagem de erro, se houver

  // -------------- Busca o plano ao carregar --------------
  useEffect(() => {
    if (!id) return

    async function fetchPlan() {
      setError('')
      setLoading(true)
      try {
        // Seleciona name e daily_rate (não mais taxa_rendimento)
        const { data, error: fetchErr } = await supabase
          .from('plans')
          .select('name, daily_rate')
          .eq('id', id)
          .maybeSingle()

        if (fetchErr) throw fetchErr
        if (!data) {
          setError('Plano não encontrado.')
          setLoading(false)
          return
        }

        setName(data.name || '')
        // Converte numeric → string para preencher o input
        setDailyRate(
          data.daily_rate != null
            ? data.daily_rate.toString()
            : ''
        )
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar o plano.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [id])

  // -------------- Salva alterações --------------
  const handleSave = async (e) => {
    e.preventDefault()
    setError('')

    // Validações mínimas
    if (!name.trim()) {
      setError('O nome do plano não pode ficar em branco.')
      return
    }

    const rateNum = parseFloat(dailyRate)
    if (isNaN(rateNum)) {
      setError('Informe um valor válido para “Daily Rate” (ex: 1.25).')
      return
    }

    setSaving(true)
    try {
      // Atualiza name e daily_rate (não usa mais taxa_rendimento)
      const { error: updateErr } = await supabase
        .from('plans')
        .update({
          name: name.trim(),
          daily_rate: rateNum,
        })
        .eq('id', id)

      if (updateErr) throw updateErr
      // Redireciona de volta para a lista
      router.push('/admin/plans')
    } catch (err) {
      console.error(err)
      setError('Não foi possível atualizar o plano.')
      setSaving(false)
    }
  }

  // -------------- Renderização condicional --------------
  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Carregando dados do plano...
        </p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Editar Plano
        </h1>

        {error && (
          <p
            style={{
              color: '#c00',
              textAlign: 'center',
              marginBottom: '1rem',
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSave}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <label htmlFor="name" style={{ fontWeight: 600 }}>
            Nome do Plano:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          />

          <label htmlFor="dailyRate" style={{ fontWeight: 600 }}>
            Daily Rate (%):
          </label>
          <input
            id="dailyRate"
            type="number"
            step="0.01"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#1976d2',
              color: '#fff',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
