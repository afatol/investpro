// pages/admin.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

const TABS = [
  { key: 'transactions', label: 'Transações' },
  { key: 'plans',        label: 'Planos' },
  { key: 'referrals',    label: 'Referrals' },
  { key: 'contents',     label: 'Conteúdos' },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('transactions')
  const [txs, setTxs]               = useState([])
  const [plans, setPlans]           = useState([])
  const [refConfigs, setRefConfigs] = useState([])
  const [contents, setContents]     = useState([])

  const [newPlan, setNewPlan]         = useState({ name:'', frequency:'' })
  const [refPerc, setRefPerc]         = useState({1:'',2:''})
  const [editContent, setEditContent] = useState({})
  const [error, setError]             = useState('')

  useEffect(() => {
    ;(async () => {
      // 1) Sessão
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }

      // 2) Verifica role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        alert('Acesso negado: apenas administradores.')
        window.location.href = '/dashboard'
        return
      }

      // 3) Carrega dados
      fetchAll()
    })()
  }, [])

  async function fetchAll() {
    setError('')

    // Transações
    const { data:txData, error:txErr } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at',{ ascending:false })
    if (txErr) setError(txErr.message)
    setTxs(txData || [])

    // Planos
    const { data:plData, error:plErr } = await supabase
      .from('plans')
      .select('*')
    if (plErr) setError(plErr.message)
    setPlans(plData || [])

    // Referral configs
    const { data:rfData, error:rfErr } = await supabase
      .from('referral_configs')
      .select('*')
    if (rfErr) setError(rfErr.message)
    setRefConfigs(rfData || [])

    // Preencher inputs iniciais de referral (usando reduce)
    const perc = (rfData || []).reduce((acc, r) => {
      acc[r.level] = r.percentage.toString()
      return acc
    }, {})
    setRefPerc(perc)

    // Conteúdos (Sobre e Manual)
    const { data:ctData, error:ctErr } = await supabase
      .from('page_contents')
      .select('*')
    if (ctErr) setError(ctErr.message)
    setContents(ctData || [])

    // Preencher editContent (usando reduce)
    const ec = (ctData || []).reduce((acc, c) => {
      acc[c.slug] = { title: c.title, body: c.body }
      return acc
    }, {})
    setEditContent(ec)
  }

  // Handlers Transações
  const handleApprove = async tx => {
    await supabase.from('transactions')
      .update({ status:'approved' })
      .eq('id', tx.id)
    fetchAll()
  }
  const handleReject = async tx => {
    await supabase.from('transactions')
      .update({ status:'rejected' })
      .eq('id', tx.id)
    fetchAll()
  }

  // Handlers Planos
  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.frequency) {
      setError('Preencha nome e frequência do plano.')
      return
    }
    await supabase.from('plans').insert([newPlan])
    setNewPlan({ name:'', frequency:'' })
    fetchAll()
  }
  const handleUpdatePlan = async plan => {
    await supabase.from('plans')
      .update({ name: plan.name, frequency: plan.frequency })
      .eq('id', plan.id)
    fetchAll()
  }
  const handleDeletePlan = async plan => {
    if (!confirm(`Excluir plano "${plan.name}"?`)) return
    await supabase.from('plans')
      .delete()
      .eq('id', plan.id)
    fetchAll()
  }

  // Handlers Referral
  const handleRefChange = (level, val) => {
    setRefPerc(prev => ({ ...prev, [level]: val }))
  }
  const handleSaveRef = async level => {
    await supabase.from('referral_configs')
      .update({ percentage: parseFloat(refPerc[level]) })
      .eq('level', level)
    fetchAll()
  }

  // Handlers Conteúdos
  const handleContentChange = (slug, field, val) => {
    setEditContent(prev => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: val }
    }))
  }
  const handleSaveContent = async slug => {
    const { title, body } = editContent[slug]
    await supabase.from('page_contents')
      .update({ title, body })
      .eq('slug', slug)
    fetchAll()
  }

  return (
    <div className="container">
      <Nav />
      <h1>Painel Admin</h1>
      {error && <p className="error">{error}</p>}

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => { setError(''); setActiveTab(tab.key) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'transactions' && (
          <>
            <h2>Transações</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Usuário</th><th>Tipo</th>
                  <th>Valor</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.user_id}</td>
                    <td>{tx.type}</td>
                    <td>${parseFloat(tx.amount||0).toFixed(2)}</td>
                    <td>{tx.status}</td>
                    <td>
                      {tx.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(tx)}>✔️</button>
                          <button onClick={() => handleReject(tx)}>✖️</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'plans' && (
          <>
            <h2>Planos</h2>
            <div className="plans-admin">
              <div className="plan-form">
                <h3>Novo Plano</h3>
                <input
                  type="text"
                  placeholder="Nome"
                  value={newPlan.name}
                  onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Frequência"
                  value={newPlan.frequency}
                  onChange={e => setNewPlan(p => ({ ...p, frequency: e.target.value }))}
                />
                <button onClick={handleAddPlan}>Adicionar</button>
              </div>
              <table className="table">
                <thead><tr><th>ID</th><th>Nome</th><th>Freq</th><th>Ações</th></tr></thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id}>
                      <td>{plan.id}</td>
                      <td>
                        <input
                          value={plan.name}
                          onChange={e => plan.name = e.target.value}
                        />
                      </td>
                      <td>
                        <input
                          value={plan.frequency}
                          onChange={e => plan.frequency = e.target.value}
                        />
                      </td>
                      <td>
                        <button onClick={() => handleUpdatePlan(plan)}>Salvar</button>
                        <button onClick={() => handleDeletePlan(plan)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'referrals' && (
          <>
            <h2>Referral Config</h2>
            <table className="table">
              <thead><tr><th>Nível</th><th>%</th><th>Ações</th></tr></thead>
              <tbody>
                {refConfigs.map(r => (
                  <tr key={r.level}>
                    <td>{r.level}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={refPerc[r.level]}
                        onChange={e => handleRefChange(r.level, e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleSaveRef(r.level)}>Salvar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'contents' && (
          <>
            <h2>Conteúdos</h2>
            {contents.map(c => (
              <div key={c.slug} className="content-admin">
                <h3>{c.slug === 'sobre' ? 'Sobre o InvestPro' : 'Manual de Uso'}</h3>
                <label>
                  Título:
                  <input
                    type="text"
                    value={editContent[c.slug]?.title || ''}
                    onChange={e => handleContentChange(c.slug, 'title', e.target.value)}
                  />
                </label>
                <label>
                  Corpo (HTML):
                  <textarea
                    rows={6}
                    value={editContent[c.slug]?.body || ''}
                    onChange={e => handleContentChange(c.slug, 'body', e.target.value)}
                  />
                </label>
                <button onClick={() => handleSaveContent(c.slug)}>Salvar</button>
              </div>
            ))}
          </>
        )}
      </div>

      <style jsx>{`
        .tabs { display:flex; gap:0.5rem; margin-bottom:1rem; }
        .tabs button { padding:0.5rem 1rem; }
        .tabs button.active { font-weight:bold; text-decoration:underline; }
        .table { width:100%; border-collapse: collapse; margin-bottom:1rem; }
        .table th, .table td { border:1px solid #ddd; padding:0.5rem; text-align:left; }
        .plans-admin { display:flex; gap:2rem; }
        .plan-form { flex:0 0 200px; display:flex; flex-direction:column; gap:0.5rem; }
        .content-admin { border:1px solid #ccc; padding:1rem; margin-bottom:1rem; }
        label { display:block; margin:0.5rem 0; }
        input, textarea { width:100%; padding:0.3rem; }
        button { margin-right:0.5rem; }
        .error { color:red; }
      `}</style>
    </div>
  )
}
