import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Manual() {
  const [content, setContent] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('page_contents')
        .select('title, body')
        .eq('slug', 'manual')
        .single()
      if (data) setContent(data)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <p>Carregando...</p>
        </div>
        <style jsx>{`
          .loading {
            text-align: center;
            padding: 2rem;
            font-size: 1.2rem;
          }
        `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="manual-container">
        <h1>{content.title}</h1>
        <div
          className="manual-body"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>

      <style jsx>{`
        .manual-container {
          max-width: 800px;
          margin: auto;
          padding: 2rem 1rem;
        }

        .manual-body {
          margin-top: 1.5rem;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .manual-container {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
