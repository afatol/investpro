// File: ./pages/admin/plans/[id].js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansEditPage() {
  const router = useRouter()
  const { id } = router.query

  const [name, setName] = useState('')
  const [taxa, setTaxa] = useState('')          // estado para a taxa de rendimento
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchPlan = async () => {
      setError('')
      try {
        // Agora selecionamos também a coluna taxa_rendimento
        const { data, error: fetchErr } = await supabase
          .from('plans')
          .select('name, taxa_rendimento')
          .eq('id', id)
          .maybeSingle()

        if (fetchErr) throw fetchErr
        if (!data) {
          setError('Plano não encontrado.')
          setLoading(false)
          return
        }

        setName(data.name)
        // Converte para string para aparecer no input
        setTaxa(data.taxa_rendimento !== null ? data.taxa_rendimento.toString() : '')
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar o plano.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlan()
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('O nome não pode ficar em branco.')
      return
    }
    setSaving(true)

    try {
      const { error: updateErr } = await supabase
        .from('plans')
        .update({
          name: name.trim(),
          taxa_rendimento: parseFloat(taxa) || 0,  // atualiza também a taxa
        })
        .eq('id', id)

      if (updateErr) throw updateErr

      router.push('/admin/plans')
    } catch (err) {
      console.error(err)
      setError('Não foi possível atualizar o plano.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados do plano...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Editar Plano</h1>
        {error && <p style={{ color: '#c00', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="name" style={{ fontWeight: 600 }}>Nome do Plano:</label>
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

          <label htmlFor="taxa" style={{ fontWeight: 600 }}>Taxa de Rendimento (% ao dia):</label>
          <input
            id="taxa"
            type="number"
            step="0.01"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
            placeholder="Ex: 0.10 para 0,1%"
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
