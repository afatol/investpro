// File: ./pages/admin/users/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setError('')
      try {
        // Puxa id, name, email, phone, referral_code, plan_id e data de criação
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('id, name, email, phone, referral_code, plan_id, data')
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
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando usuários...</p>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Usuários</h1>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>      {/* Nova coluna */}
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Plano</th>
              <th style={thStyle}>Criado Em</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.name || '—'}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.phone || '—'}</td>  {/* Exibe phone ou “—” */}
                <td style={tdStyle}>{u.referral_code || '—'}</td>
                <td style={tdStyle}>{u.plan_id || '—'}</td>
                <td style={tdStyle}>{new Date(u.data).toLocaleString('pt-BR')}</td>
                <td style={tdStyle}>
                  <Link href={`/admin/users/${u.id}`}>
                    <a style={btnEditStyle}>Editar</a>
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
    </AdminLayout>
  )
}

const thStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  background: '#f5f5f5',
}

const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
}

const btnEditStyle = {
  display: 'inline-block',
  padding: '0.25rem 0.5rem',
  background: '#1976d2',
  color: '#fff',
  borderRadius: '4px',
  textDecoration: 'none',
  fontSize: '0.9rem',
}
