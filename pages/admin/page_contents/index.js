// File: ./pages/admin/page_contents/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPageContentsList() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPages = async () => {
      setError('')
      try {
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
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando páginas...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Páginas Estáticas</h1>
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
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <Link href="/admin/page_contents/new">
            <a
              style={{
                background: '#0070f3',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              + Nova Página
            </a>
          </Link>
        </div>
        {pages.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Nenhuma página cadastrada.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1rem',
            }}
          >
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'left',
                  }}
                >
                  Slug
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'left',
                  }}
                >
                  Título
                </th>
                <th
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.slug}>
                  <td
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {page.slug}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    {page.title || '—'}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #eee',
                      textAlign: 'center',
                    }}
                  >
                    <Link href={`/admin/page_contents/${encodeURIComponent(page.slug)}`}>
                      <a
                        style={{
                          marginRight: '0.5rem',
                          color: '#0070f3',
                          textDecoration: 'none',
                        }}
                      >
                        Editar
                      </a>
                    </Link>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Tem certeza que deseja excluir a página "${page.slug}"?`
                          )
                        ) {
                          const { error: deleteErr } = await supabase
                            .from('page_contents')
                            .delete()
                            .eq('slug', page.slug)
                          if (deleteErr) {
                            alert('Erro ao excluir: ' + deleteErr.message)
                          } else {
                            setPages((prev) =>
                              prev.filter((p) => p.slug !== page.slug)
                            )
                          }
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#c00',
                        cursor: 'pointer',
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
