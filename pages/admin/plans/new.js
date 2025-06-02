// File: ./pages/admin/plans/new.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansNewPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [taxa, setTaxa] = useState('')       // estado para a taxa de rendimento
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Informe o nome do plano.')
      return
    }
    // Validar taxa: se estiver vazia, assume 0
    const valorTaxa = parseFloat(taxa)
    if (taxa.trim() !== '' && (isNaN(valorTaxa) || valorTaxa < 0)) {
      setError('Insira uma taxa válida (número ≥ 0).')
      return
    }

    setLoading(true)

    const { error: insertErr } = await supabase
      .from('plans')
      .insert([{ 
        name: name.trim(),
        taxa_rendimento: isNaN(valorTaxa) ? 0 : valorTaxa 
      }])

    if (insertErr) {
      console.error(insertErr)
      setError('Não foi possível criar o plano.')
      setLoading(false)
    } else {
      router.push('/admin/plans')
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Criar Novo Plano</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          {error && (
            <p style={{ color: '#c00', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1976d2',
              color: '#fff',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Criando...' : 'Criar Plano'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
