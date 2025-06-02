import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPageContents() {
  const [list, setList] = useState([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingSlug, setEditingSlug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const fetchContents = async () => {
      setError('')
      try {
        const { data, error: err } = await supabase
          .from('page_contents')
          .select('slug, title, body')
          .order('slug', { ascending: true })
        if (err) throw err
        setList(data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar conteúdos de página.')
      } finally {
        setLoading(false)
      }
    }
    fetchContents()
  }, [refresh])

  const saveContent = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingSlug) {
        const { error: err } = await supabase
          .from('page_contents')
          .update({ title: title || null, body: body || null })
          .eq('slug', editingSlug)
        if (err) throw err
      } else {
        // insere novo
        const { error: err } = await supabase
          .from('page_contents')
          .insert([{ slug: slug.trim(), title: title, body: body }])
        if (err) throw err
      }
      setSlug('')
      setTitle('')
      setBody('')
      setEditingSlug(null)
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      setError('Falha ao salvar conteúdo.')
    }
  }

  const startEdit = (item) => {
    setEditingSlug(item.slug)
    setSlug(item.slug)
    setTitle(item.title || '')
    setBody(item.body || '')
  }

  const deleteContent = async (slugToDelete) => {
    if (!confirm('Excluir este conteúdo?')) return
    try {
      const { error: err } = await supabase
        .from('page_contents')
        .delete()
        .eq('slug', slugToDelete)
      if (err) throw err
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      alert('Falha ao excluir.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando conteúdos...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-page-contents">
        <h1>Gerenciar Conteúdos de Página</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={saveContent} className="pc-form">
          {!editingSlug && (
            <input
              type="text"
              placeholder="Slug (ex: about, manual)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          )}
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            rows="5"
            placeholder="Corpo do texto"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button type="submit">{editingSlug ? 'Atualizar' : 'Criar'}</button>
          {editingSlug && (
            <button
              type="button"
              onClick={() => {
                setEditingSlug(null)
                setSlug('')
                setTitle('')
                setBody('')
              }}
              style={{ marginLeft: '0.5rem', background: '#aaa' }}
            >
              Cancelar
            </button>
          )}
        </form>

        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Título</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((pc) => (
              <tr key={pc.slug}>
                <td>{pc.slug}</td>
                <td>{pc.title || '—'}</td>
                <td>
                  <button onClick={() => startEdit(pc)}>Editar</button>
                  <button
                    onClick={() => deleteContent(pc.slug)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-page-contents {
          max-width: 800px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .pc-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        input,
        textarea {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
        }
        button {
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          width: fit-content;
        }
        button:hover {
          background: #005bb5;
        }
        .error {
          color: red;
          text-align: center;
          margin-bottom: 1rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.7rem 0.5rem;
          border: 1px solid #ddd;
          text-align: center;
        }
        th {
          background: #f5f5f5;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
      `}</style>
    </Layout>
  )
}
