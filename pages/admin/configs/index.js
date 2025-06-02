// File: ./pages/admin/configs/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminConfigsPage() {
  const [rendimentoDiario, setRendimentoDiario] = useState('')
  const [textoAviso, setTextoAviso] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchConfigs = async () => {
      setError('')
      try {
        const { data, error: fetchErr } = await supabase
          .from('admin_configs')
          .select('id, rendimento_diario, texto_aviso')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (fetchErr) throw fetchErr
        if (data) {
          setRendimentoDiario(data.rendimento_diario ?? '')
          setTextoAviso(data.texto_aviso ?? '')
        }
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar configurações.')
      } finally {
        setLoading(false)
      }
    }
    fetchConfigs()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('admin_configs')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      if (existing) {
        const { error: updErr } = await supabase
          .from('admin_configs')
          .update({
            rendimento_diario: parseFloat(rendimentoDiario) || 0,
            texto_aviso: textoAviso,
          })
          .eq('id', existing.id)

        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('admin_configs')
          .insert([
            { rendimento_diario: parseFloat(rendimentoDiario) || 0, texto_aviso: textoAviso },
          ])

        if (insErr) throw insErr
      }

      alert('Configurações salvas com sucesso!')
    } catch (err) {
      console.error(err)
      setError('Não foi possível salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando configurações...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Configurações Gerais</h1>
        {error && (
          <p
            style={{
              color: '#c00',
              textAlign: 'center',
              marginBottom: '1rem',
              fontWeight: 'bold',
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <label htmlFor="rendimentoDiario" style={{ fontWeight: 600 }}>
            Rendimento Diário (%):
          </label>
          <input
            id="rendimentoDiario"
            type="number"
            step="0.01"
            value={rendimentoDiario}
            onChange={(e) => setRendimentoDiario(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          />

          <label htmlFor="textoAviso" style={{ fontWeight: 600 }}>
            Texto de Aviso (HTML/TEXTO):
          </label>
          <textarea
            id="textoAviso"
            rows="4"
            value={textoAviso}
            onChange={(e) => setTextoAviso(e.target.value)}
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
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
