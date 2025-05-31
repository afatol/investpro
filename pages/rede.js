import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RedePage() {
  const [indicados, setIndicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user.id
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, created_at')
        .eq('indicador', userId)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Erro ao carregar indicados.')
        console.error(error)
      } else {
        setIndicados(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <div className="rede-container">
        <h1>Minha Rede de Indicações</h1>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {indicados.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {indicados.map((user, i) => (
                    <tr key={i}>
                      <td>{user.nome || 'Sem nome'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum indicado encontrado.</p>
            )}
          </>
        )}

        <style jsx>{`
          .rede-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1 {
            text-align: center;
            margin-bottom: 2rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 0.75rem;
            text-align: center;
            border-bottom: 1px solid #ccc;
          }

          th {
            background-color: #f5f5f5;
          }

          .error {
            color: red;
            text-align: center;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    </Layout>
  )
}
