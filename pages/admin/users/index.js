// File: ./pages/admin/users/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  // Sempre que mudar o filtro ou a lista original, recalcula o filteredUsers
  useEffect(() => {
    if (!filtro.trim()) {
      setFilteredUsers(users)
    } else {
      const term = filtro.toLowerCase()
      const filtrados = users.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(term)
        const emailMatch = u.email?.toLowerCase().includes(term)
        const codeMatch = u.referral_code?.toLowerCase().includes(term)
        const planMatch = u.plan_id?.toLowerCase().includes(term)
        const phoneMatch = u.phone?.toLowerCase().includes(term)
        return nameMatch || emailMatch || codeMatch || planMatch || phoneMatch
      })
      setFilteredUsers(filtrados)
    }
  }, [filtro, users])

  // 1) Busca id, name, email, phone, is_admin, referral_code, plan_id e data de criação
  const fetchUsers = async () => {
    setError('')
    setLoading(true)
    try {
      // Observe que agora adicionamos 'phone' no select
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, name, email, phone, is_admin, referral_code, plan_id, data')
        .order('data', { ascending: false })

      if (fetchErr) throw fetchErr
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar lista de usuários.')
    } finally {
      setLoading(false)
    }
  }

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

        {/* Campo de filtro */}
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <input
            type="text"
            placeholder="Filtrar por Nome, Email, Telefone, Código ou Plano..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              width: '100%',
              maxWidth: '350px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Telefone</th>
              <th style={thStyle}>Admin?</th>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Plano</th>
              <th style={thStyle}>Criado Em</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>{u.name || '—'}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.phone || '—'}</td>
                <td style={tdStyle}>{u.is_admin ? 'Sim' : 'Não'}</td>
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

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>Nenhum usuário encontrado.</td>
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
