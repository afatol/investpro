// pages/dashboard.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance]           = useState(0)
  const [user, setUser]                 = useState(null)

  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return window.location.href = '/login'

      setUser(session.user)
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      setTransactions(txs || [])

      const bal = txs
        .filter(t => t.status==='approved')
        .reduce((sum, t) => {
          if (t.type==='deposit' || t.type==='rendimento') return sum + parseFloat(t.amount)
          if (t.type==='withdraw') return sum - parseFloat(t.amount)
          return sum
        }, 0)
      setBalance(bal)
    })()
  }, [])

  if (!user) return <p className="container">Carregando…</p>

  return (
    <div className="container">
      <Nav />
      <h1>Olá, {user.email}</h1>
      <h2>Saldo Atual: ${balance.toFixed(2)}</h2>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{tx.type}</td>
                <td>${parseFloat(tx.amount||0).toFixed(2)}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
