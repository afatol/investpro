import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Sobre() {
  const [content, setContent] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('page_contents')
        .select('title, body')
        .eq('slug', 'sobre')
        .single()

      if (error) {
        console.error(error.message)
        setError('Não foi possível carregar as informações.')
      } else {
        setContent(data)
      }

      setLoading(false)
    })()
  }, [])

  return (
    <Layout>
      <div className="container">
        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <h1>{content.title}</h1>
            <div
              className="conteudo-html"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: auto;
          padding: 2rem;
        }

        .conteudo-html p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .conteudo-html h2 {
          margin-top: 2rem;
          font-size: 1.4rem;
        }

        .conteudo-html ul, .conteudo-html ol {
          margin-left: 1.5rem;
        }

        .conteudo-html a {
          color: #1a73e8;
          text-decoration: none;
        }

        .conteudo-html a:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  )
}
