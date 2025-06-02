// File: ./pages/admin/page_contents/new.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPageContentsNew() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!slug.trim()) {
      setError('O slug não pode ficar vazio.')
      return
    }
    setSaving(true)

    const { error: insertErr } = await supabase
      .from('page_contents')
      .insert([{ slug: slug.trim(), title, body }])

    if (insertErr) {
      console.error(insertErr)
      setError('Não foi possível criar a página.')
      setSaving(false)
    } else {
      router.push('/admin/page_contents')
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Criar Nova Página</h1>
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="slug" style={{ fontWeight: 600 }}>
            Slug (único, ex: “sobre”):
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />

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
            {saving ? 'Salvando...' : 'Criar Página'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
