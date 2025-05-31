// pages/rede.js

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RedePage() {
  const [nivel1, setNivel1] = useState([])    // array de indicados diretos
  const [nivel2, setNivel2] = useState([])    // array de indicados dos indicados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRede = async () => {
      // 1) Verifica sessão
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        window.location.href = '/login'
        return
      }
      const userId = session.user.id

      try {
        // 2) Chama a função RPC criada no banco:
        //    get_referrals_hierarchy(u uuid) => retorna linhas com (id, name, email, nivel)
        const { data: rows, error: rpcError } = await supabase
          .rpc('get_referrals_hierarchy', { u: userId })

        if (rpcError) {
          throw rpcError
        }

        // 3) Separe os resultados por nível
        const lvl1 = []
        const lvl2 = []
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            if (r.nivel === 1) {
              lvl1.push({ id: r.id, name: r.name, email: r.email })
            } else if (r.nivel === 2) {
              lvl2.push({ id: r.id, name: r.name, email: r.email })
            }
          })
        }

        setNivel1(lvl1)
        setNivel2(lvl2)
      } catch (err) {
        console.error('Erro ao buscar rede (RPC):', err)
        setError('Falha ao carregar sua rede de indicações.')
      } finally {
        setLoading(false)
      }
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
            {/* Exibe Nível 1 (Indicados Diretos) */}
            <h2>Indicados Diretos (Nível 1) ({nivel1.length})</h2>
            {nivel1.length > 0 ? (
              <ul>
                {nivel1.map((user) => (
                  <li key={user.id}>
                    {user.name || user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center' }}>
                Você ainda não possui indicados diretos.
              </p>
            )}

            {/* Exibe Nível 2 (Indicados dos Indicados) */}
            <h2>Indicados Indiretos (Nível 2) ({nivel2.length})</h2>
            {nivel2.length > 0 ? (
              <ul>
                {nivel2.map((user) => (
                  <li key={user.id}>
                    {user.name || user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center' }}>
                Você ainda não possui indicados indiretos.
              </p>
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
