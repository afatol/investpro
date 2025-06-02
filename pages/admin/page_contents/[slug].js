// File: ./pages/admin/page_contents/[slug].js

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
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
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-page-edit">
        <h1>Editar Página: {slug}</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSave} className="form-page">
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
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .admin-page-edit {
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
