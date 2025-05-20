// pages/manual.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Manual() {
  const [content, setContent] = useState({ title:'', body:'' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('page_contents')
        .select('title, body')
        .eq('slug','manual')
        .single()
      if (data) setContent(data)
      setLoading(false)
    })()
  }, [])

  if (loading) return <p className="container">Carregando...</p>

  return (
    <div className="container">
      <Nav />
      <h1>{content.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.body }} />
    </div>
  )
}
