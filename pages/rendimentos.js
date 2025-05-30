import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RendimentosPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'

      const { data, error } = await supabase
        .from('rendimentos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data', { ascending: false })

      if (!error) setData(data)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Rendimentos</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="transacoes">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor (USD)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i}>
                    <td>{new Date(item.data).toLocaleDateString()}</td>
                    <td>{item.valor?.toFixed(2)}</td>
                    <td className={`status ${item.status}`}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .rendimentos {
          max-width: 900px;
          margin: 2rem auto;
          padding: 1rem;
        }

        h1, h2 {
          text-align: center;
          margin-bottom: 1rem;
        }

        .filtros {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .filtro-group {
          display: flex;
          flex-direction: column;
        }

        select {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          min-width: 150px;
        }

        button {
          padding: 0.6rem 1.2rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: auto;
        }

        button:hover {
          background-color: #45a049;
        }

        .grafico {
          margin-bottom: 3rem;
        }

        .transacoes {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        th, td {
          padding: 0.8rem;
          text-align: center;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f5f5f5;
        }

        .status {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-weight: bold;
          text-transform: capitalize;
        }

        .status.approved {
          background-color: #d4edda;
          color: #155724;
        }

        .status.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        @media (max-width: 600px) {
          .filtros {
            flex-direction: column;
            align-items: stretch;
          }

          select, button {
            width: 100%;
          }

          table {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  )
}
