import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshFlag, setRefreshFlag] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setError('')
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, name, email, phone_number, referral_code, referrals_count, referrer_id, is_admin, plan_id, data')
          .order('data', { ascending: false })
        if (err) throw err
        setUsers(data)
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar usuários.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [refreshFlag])

  const toggleAdmin = async (userId, currentIsAdmin) => {
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', userId)
      if (err) throw err
      setRefreshFlag((prev) => !prev)
    } catch (err) {
      console.error(err)
      alert('Falha ao alterar permissão de admin.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando usuários...</p>
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
      <div className="admin-users">
        <h1>Gerenciar Usuários</h1>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Referral Code</th>
              <th>Indicações</th>
              <th>É Admin?</th>
              <th>Plano</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name || '—'}</td>
                <td>{u.email || '—'}</td>
                <td>{u.phone_number || '—'}</td>
                <td>{u.referral_code || '—'}</td>
                <td>{u.referrals_count ?? 0}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={u.is_admin}
                    onChange={() => toggleAdmin(u.id, u.is_admin)}
                  />
                </td>
                <td>{u.plan_id || '—'}</td>
                <td>{new Date(u.data).toLocaleString()}</td>
                <td>
                  {/* Você pode adicionar botões de excluir, editar, etc. */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-users {
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
        input[type='checkbox'] {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </Layout>
  )
}
