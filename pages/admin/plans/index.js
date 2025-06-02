// File: ./pages/admin/plans/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '../../../components/Layout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlans = async () => {
      setError('')
      try {
        const { data, error: fetchErr } = await supabase
          .from('plans')
          .select('id, name')
          .order('name', { ascending: true })

        if (fetchErr) throw fetchErr
        setPlans(data || [])
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar planos.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

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
        <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          {error}
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-plans">
        <h1>Gerenciar Planos</h1>

        <div className="btn-new">
          <Link href="/admin/plans/new">
            <a className="btn">+ Novo Plano</a>
          </Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nome do Plano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <Link href={`/admin/plans/${p.id}`}>
                    <a className="btn-edit">Editar</a>
                  </Link>
                </td>
              </tr>
            ))}

            {plans.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }}>
                  Nenhum plano cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-plans {
          max-width: 600px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .btn-new {
          text-align: right;
          margin-bottom: 1rem;
        }
        .btn {
          background: #1976d2;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
        }
        .btn:hover {
          background: #125ca1;
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
