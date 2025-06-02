// File: ./pages/admin/configs/index.js

import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
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
        // Puxa a primeira (única) linha de admin_configs
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
      // Vamos assumir que há zero ou 1 registro. Se existe, fazemos update; se não, insert.
      const { data: existing, error: fetchErr } = await supabase
        .from('admin_configs')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      if (existing) {
        // Já existe, faz update
        const { error: updErr } = await supabase
          .from('admin_configs')
          .update({
            rendimento_diario: parseFloat(rendimentoDiario) || 0,
            texto_aviso: textoAviso,
          })
          .eq('id', existing.id)

        if (updErr) throw updErr
      } else {
        // Não existe, faz insert
        const { error: insErr } = await supabase
          .from('admin_configs')
          .insert([
            { rendimento_diario: parseFloat(rendimentoDiario) || 0, texto_aviso: textoAviso },
          ])

        if (insErr) throw insErr
      }

      // Ao salvar, exibimos apenas mensagem breve ou você pode redirecionar
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
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando configurações...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-configs">
        <h1>Configurações Gerais</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSave} className="form-configs">
          <label htmlFor="rendimentoDiario">Rendimento Diário (%):</label>
          <input
            id="rendimentoDiario"
            type="number"
            step="0.01"
            value={rendimentoDiario}
            onChange={(e) => setRendimentoDiario(e.target.value)}
            required
          />

          <label htmlFor="textoAviso">Texto de Aviso (HTML/TEXTO):</label>
          <textarea
            id="textoAviso"
            rows="4"
            value={textoAviso}
            onChange={(e) => setTextoAviso(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-configs {
          max-width: 600px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .error {
          color: #c00;
          text-align: center;
          margin-bottom: 1rem;
        }
        .form-configs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        label {
          font-weight: 600;
        }
        input,
        textarea {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }
        button {
          background: #1976d2;
          color: #fff;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }
        button:hover {
          background: #125ca1;
        }
        button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
      `}</style>
    </Layout>
  )
}
