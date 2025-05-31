// pages/rendimentos.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function RendimentosPage() {
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) return window.location.href = '/login'

      const userId = session.user.id

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .order('data', { ascending: true })

      if (error) {
        setError('Erro ao buscar dados')
      } else {
        setTransacoes(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const calcularSaldoAcumulado = () => {
    let saldo = 0
    return transacoes.map(t => {
      saldo += t.tipo === 'deposit' ? parseFloat(t.valor) : -parseFloat(t.valor)
      return {
        data: new Date(t.data).toLocaleDateString('pt-BR'),
        saldo: parseFloat(saldo.toFixed(2))
      }
    })
  }

  return (
    <Layout>
      <div className="rendimentos">
        <h1>Minha Evolução Financeira</h1>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div className="grafico">
              {transacoes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calcularSaldoAcumulado()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="saldo" stroke="#4CAF50" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center' }}>Nenhuma transação aprovada ainda.</p>
              )}
            </div>

            <div className="transacoes">
              <h2>Histórico de Transações</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor (USD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((item, i) => (
                    <tr key={i}>
                      <td>{new Date(item.data).toLocaleDateString()}</td>
                      <td>{item.tipo === 'deposit' ? 'Depósito' : 'Saque'}</td>
                      <td>{parseFloat(item.valor).toFixed(2)}</td>
                      <td className={`status ${item.status}`}>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
          table {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </Layout>
  )
}
