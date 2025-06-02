// File: ./pages/admin/page_contents/new.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
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
    <Layout>
      <div className="admin-page-new">
        <h1>Criar Nova Página</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="form-page">
          <label htmlFor="slug">Slug (único, ex: “sobre”):</label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <label htmlFor="title">Título:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="body">Conteúdo (HTML ou Markdown):</label>
          <textarea
            id="body"
            rows="6"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Criar Página'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-page-new {
          max-width: 700px;
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
        .form-page {
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

