import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      setError('')
      try {
        const { data, error: err } = await supabase
          .from('plans')
          .select('id, name')
          .order('name', { ascending: true })
        if (err) throw err
        setPlans(data)
      } catch (err) {
        console.error(err)
        setError('Falha ao buscar planos.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [refresh])

  const addPlan = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const { error: err } = await supabase
        .from('plans')
        .insert([{ name: newName.trim() }])
      if (err) throw err
      setNewName('')
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      alert('Erro ao adicionar plano.')
    }
  }

  const deletePlan = async (id) => {
    if (!confirm('Excluir este plano?')) return
    try {
      const { error: err } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)
      if (err) throw err
      setRefresh((v) => !v)
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando planos...</p>
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
      <div className="admin-plans">
        <h1>Gerenciar Planos</h1>
        <form onSubmit={addPlan} className="add-plan-form">
          <input
            type="text"
            placeholder="Nome do plano"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit">Adicionar Plano</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <button onClick={() => deletePlan(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-plans {
          max-width: 700px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .add-plan-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }
        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          flex: 1;
          max-width: 300px;
        }
        button {
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #005bb5;
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
        }
        th {
          background: #f5f5f5;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
      `}</style>
    </Layout>
  )
}
