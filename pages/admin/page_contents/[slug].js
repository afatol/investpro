// File: ./pages/admin/page_contents/[slug].js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPageContentsEdit() {
  const router = useRouter()
  const { slug } = router.query

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return

    const fetchPage = async () => {
      setError('')
      try {
        const { data, error: fetchErr } = await supabase
          .from('page_contents')
          .select('title, body')
          .eq('slug', slug)
          .maybeSingle()

        if (fetchErr) throw fetchErr
        if (!data) {
          setError('Conteúdo não encontrado.')
          setLoading(false)
          return
        }
        setTitle(data.title || '')
        setBody(data.body || '')
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar conteúdo.')
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { error: updErr } = await supabase
        .from('page_contents')
        .update({ title, body })
        .eq('slug', slug)

      if (updErr) throw updErr
      router.push('/admin/page_contents')
    } catch (err) {
      console.error(err)
      setError('Não foi possível salvar alterações.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Editar Página: {slug}
        </h1>
        {error && (
          <p style={{
            color: '#c00',
            textAlign: 'center',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="title" style={{ fontWeight: 600 }}>Título:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />

          <label htmlFor="body" style={{ fontWeight: 600 }}>
            Conteúdo (HTML ou Markdown):
          </label>
          <textarea
            id="body"
            rows="6"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem'
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
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
