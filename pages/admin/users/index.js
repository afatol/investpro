// File: ./pages/admin/users/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setError('')
      try {
        // Puxa id, name, email, is_admin, referral_code, plan_id e data de criação
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('id, name, email, is_admin, referral_code, plan_id, data')
          .order('data', { ascending: false })

        if (fetchErr) throw fetchErr
        setUsers(data || [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar lista de usuários.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

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
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
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
              <th>Admin?</th>
              <th>Código</th>
              <th>Plano</th>
              <th>Criado Em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name || '—'}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? 'Sim' : 'Não'}</td>
                <td>{u.referral_code || '—'}</td>
                <td>{u.plan_id || '—'}</td>
                <td>{new Date(u.data).toLocaleString()}</td>
                <td>
                  {/* Exemplo de link para edição futura (você pode criar pages/admin/users/[id].js) */}
                  <Link href={`/admin/users/${u.id}`}>
                    <a className="btn-edit">Editar</a>
                  </Link>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
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
          padding: 0.75rem;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background: #f5f5f5;
        }
        .btn-edit {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #1976d2;
          color: #fff;
          border-radius: 4px;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .btn-edit:hover {
          background: #125ca1;
        }
      `}</style>
    </Layout>
  )
}
