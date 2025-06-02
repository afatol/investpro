import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminRendimentos() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const fetchRend = async () => {
      setError('')
      try {
        const { data, error: err } = await supabase
          .from('rendimentos_aplicados')
          .select(`
            id,
            user_id,
            origem,
            valor,
            data,
            profiles ( email )
          `)
          .order('data', { ascending: false })
        if (err) throw err
        setList(data)
      } catch (err) {
        console.error(err)
        setError('Erro ao carregar rendimentos.')
      } finally {
        setLoading(false)
      }
    }
    fetchRend()
  }, [refresh])

  const deleteRend = async (id) => {
    if (!confirm('Deseja realmente excluir este registro de rendimento?')) return
    try {
      const { error: err } = await supabase
        .from('rendimentos_aplicados')
        .delete()
        .eq('id', id)
      if (err) throw err
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      alert('Falha ao excluir.')
    }
  }

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
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>
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
              <th>Usuário (email)</th>
              <th>Origem</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.profiles?.email || '—'}</td>
                <td>{r.origem}</td>
                <td>{Number(r.valor).toFixed(2)}</td>
                <td>{new Date(r.data).toLocaleString()}</td>
                <td>
                  <button onClick={() => deleteRend(r.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-rendimentos {
          max-width: 900px;
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
          padding: 0.75rem 0.5rem;
          border: 1px solid #ddd;
          text-align: center;
          font-size: 0.9rem;
        }
        th {
          background: #f5f5f5;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        button {
          background: #c00;
          color: #fff;
          border: none;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        button:hover {
          background: #a00;
        }
      `}</style>
    </Layout>
  )
}
