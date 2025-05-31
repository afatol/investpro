// pages/rede.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RedePage() {
  const [diretos, setDiretos] = useState([])
  const [indiretos, setIndiretos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRede = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user.id

      // 1) Buscar indicados diretos: referrer_id = userId
      const { data: nivel1, error: erro1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('referrer_id', userId)       // aqui mudou de "indicador" para "referrer_id"
        .order('created_at', { ascending: false })

      if (erro1) {
        setError('Erro ao buscar indicados diretos.')
        setLoading(false)
        return
      }
      setDiretos(nivel1 || [])

      // 2) Buscar indicados dos indicados (nível 2)
      const idsNivel1 = nivel1.map((u) => u.id)
      let nivel2 = []

      if (idsNivel1.length > 0) {
        const { data: resultadoNivel2, error: erro2 } = await supabase
          .from('profiles')
          .select('*')
          .in('referrer_id', idsNivel1)   // também usa "referrer_id" para filtrar
          .order('created_at', { ascending: false })

        if (erro2) {
          setError('Erro ao buscar indicados indiretos.')
          setLoading(false)
          return
        }
        nivel2 = resultadoNivel2
      }

      setIndiretos(nivel2)
      setLoading(false)
    }

    fetchRede()
  }, [])

  return (
    <Layout>
      <div className="rede-container">
        <h1>Minha Rede de Indicações</h1>

        {loading && <p>Carregando rede...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <h2>Indicados Diretos ({diretos.length})</h2>
            {diretos.length > 0 ? (
              <ul>
                {diretos.map((user) => (
                  <li key={user.id}>{user.name || user.email}</li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center' }}>Você ainda não possui indicados diretos.</p>
            )}

            <h2>Indicados Indiretos ({indiretos.length})</h2>
            {indiretos.length > 0 ? (
              <ul>
                {indiretos.map((user) => (
                  <li key={user.id}>{user.name || user.email}</li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center' }}>Você ainda não possui indicados indiretos.</p>
            )}
          </>
        )}

        <style jsx>{`
          .rede-container {
            max-width: 800px;
            margin: auto;
            padding: 2rem 1rem;
          }

          h1, h2 {
            text-align: center;
            margin-bottom: 1rem;
          }

          ul {
            list-style: none;
            padding-left: 0;
            margin-bottom: 2rem;
          }

          li {
            background: #f9f9f9;
            margin: 0.5rem 0;
            padding: 0.75rem;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }

          .error {
            color: red;
            text-align: center;
          }
        `}</style>
      </div>
    </Layout>
  )
}
