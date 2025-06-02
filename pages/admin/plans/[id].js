// File: ./pages/admin/plans/[id].js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansEditPage() {
  const router = useRouter()
  const { id } = router.query

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchPlan = async () => {
      setError('')
      try {
        const { data, error: fetchErr } = await supabase
          .from('plans')
          .select('name')
          .eq('id', id)
          .maybeSingle()

        if (fetchErr) throw fetchErr
        if (!data) {
          setError('Plano não encontrado.')
          setLoading(false)
          return
        }
        setName(data.name)
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
    const { error: updateErr } = await supabase
      .from('plans')
      .update({ name: name.trim() })
      .eq('id', id)

    if (updateErr) {
      console.error(updateErr)
      setError('Não foi possível atualizar o plano.')
      setSaving(false)
    } else {
      router.push('/admin/plans')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados do plano...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-plans-edit">
        <h1>Editar Plano</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSave} className="form-plan">
          <label htmlFor="name">Nome do Plano:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-plans-edit {
          max-width: 500px;
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
        .form-plan {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        label {
          font-weight: 600;
        }
        input {
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
