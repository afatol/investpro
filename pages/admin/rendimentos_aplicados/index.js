// File: ./pages/admin/rendimentos_aplicados/index.js

import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminRendimentosPage() {
  const [rendimentos, setRendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRendimentos = async () => {
      setError('')
      try {
        // Puxa id, user_id, valor, origem, data
        const { data, error: fetchErr } = await supabase
          .from('rendimentos_aplicados')
          .select('id, user_id, valor, origem, data')
          .order('data', { ascending: false })

        if (fetchErr) throw fetchErr
        setRendimentos(data || [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar rendimentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchRendimentos()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando rendimentos...</p>
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
      <div className="admin-rendimentos">
        <h1>Gerenciar Rendimentos Aplicados</h1>

        <table>
          <thead>
            <tr>
              <th>Usuário (ID)</th>
              <th>Valor</th>
              <th>Origem</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {rendimentos.map((r) => (
              <tr key={r.id}>
                <td>{r.user_id}</td>
                <td>{Number(r.valor).toFixed(2)}</td>
                <td>{r.origem}</td>
                <td>{new Date(r.data).toLocaleString()}</td>
              </tr>
            ))}

            {rendimentos.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  Nenhum rendimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-rendimentos {
          max-width: 1000px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
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
      `}</style>
    </Layout>
  )
}
