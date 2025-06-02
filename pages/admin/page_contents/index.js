// File: ./pages/admin/page_contents/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPageContents() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPages = async () => {
      setError('')
      try {
        // Consulta todas as páginas estáticas (slug, title)
        const { data, error: fetchErr } = await supabase
          .from('page_contents')
          .select('slug, title')
          .order('slug', { ascending: true })

        if (fetchErr) throw fetchErr
        setPages(data || [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar páginas estáticas.')
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando páginas estáticas...</p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-page_contents">
        <h1>Gerenciar Conteúdo de Páginas</h1>
        <div className="btn-new">
          <Link href="/admin/page_contents/new">
            <a className="btn">+ Nova Página</a>
          </Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Título</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}>
                <td>{p.slug}</td>
                <td>{p.title}</td>
                <td>
                  <Link href={`/admin/page_contents/${encodeURIComponent(p.slug)}`}>
                    <a className="btn-edit">Editar</a>
                  </Link>
                </td>
              </tr>
            ))}

            {pages.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  Nenhuma página encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-page_contents {
          max-width: 800px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .btn-new {
          text-align: right;
          margin-bottom: 1rem;
        }
        .btn {
          background: #1976d2;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
        }
        .btn:hover {
          background: #125ca1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background: #f5f5f5;
        }
        .btn-edit {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #1976d2;
          color: #fff;
          border-radius: 4px;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .btn-edit:hover {
          background: #125ca1;
        }
      `}</style>
    </Layout>
  )
}
