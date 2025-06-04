// File: ./pages/admin/index.js

import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function AdminHomePage() {
  // 1) Estados de contagem
  const [totaisContagem, setTotaisContagem] = useState({
    users: 0,
    transactions: 0,
    pendingTransactions: 0,
  })

  // 2) Estados para filtros de data e resumo financeiro
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [totaisFinanceiro, setTotaisFinanceiro] = useState({
    totalDepositos: 0,
    totalSaques: 0,
    totalRendimentos: 0,
    saldoCaixa: 0,
  })

  const [loading, setLoading] = useState(true)
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Ao montar: busca apenas as contagens de usuários/transações
    fetchContagens()
    // Carrega resumo financeiro sem filtro (todas as datas)
    fetchFinanceiro()
  }, [])

  // -------------- Função para buscar contagens --------------
  async function fetchContagens() {
    setError('')
    try {
      // 1) Contagem de usuários
      const { count: usersCount, error: usersErr } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      if (usersErr) throw usersErr

      // 2) Contagem de transações (todas)
      const { count: txCount, error: txErr } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
      if (txErr) throw txErr

      // 3) Contagem de transações pendentes
      const { count: pendingCount, error: penErr } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (penErr) throw penErr

      setTotaisContagem({
        users: usersCount,
        transactions: txCount,
        pendingTransactions: pendingCount,
      })
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar contagens básicas.')
    }
  }

  // -------------- Função para buscar resumo financeiro --------------
  // Se dataInicial/dataFinal estiverem vazias, retorna todas as datas
  async function fetchFinanceiro() {
    setLoadingFinanceiro(true)
    setError('')
    try {
      // Converter as datas para formato ISO (YYYY-MM-DD)
      const inicio = dataInicial ? new Date(dataInicial).toISOString() : null
      // Para fim, adicionamos 23:59:59 ao dia especificado
      const fim = dataFinal
        ? new Date(new Date(dataFinal).setHours(23, 59, 59, 999)).toISOString()
        : null

      // --- 1) Total Depósitos Aprovados ---
      let queryDep = supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'approved')
        .eq('type', 'deposit')

      if (inicio) {
        queryDep = queryDep.gte('data', inicio)
      }
      if (fim) {
        queryDep = queryDep.lte('data', fim)
      }

      const { data: depositosData, error: depErr } = await queryDep
      if (depErr) throw depErr

      const totalDepositos = (depositosData || []).reduce(
        (sum, row) => sum + parseFloat(row.amount || 0),
        0
      )

      // --- 2) Total Saques Aprovados ---
      let querySaq = supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'approved')
        .eq('type', 'withdraw')

      if (inicio) {
        querySaq = querySaq.gte('data', inicio)
      }
      if (fim) {
        querySaq = querySaq.lte('data', fim)
      }

      const { data: saquesData, error: saqErr } = await querySaq
      if (saqErr) throw saqErr

      const totalSaques = (saquesData || []).reduce(
        (sum, row) => sum + parseFloat(row.amount || 0),
        0
      )

      // --- 3) Total Rendimentos Aplicados ---
      let queryRend = supabase
        .from('rendimentos_aplicados')
        .select('valor')

      if (inicio) {
        queryRend = queryRend.gte('data', inicio)
      }
      if (fim) {
        queryRend = queryRend.lte('data', fim)
      }

      const { data: rendimentosData, error: rendErr } = await queryRend
      if (rendErr) throw rendErr

      const totalRendimentos = (rendimentosData || []).reduce(
        (sum, row) => sum + parseFloat(row.valor || 0),
        0
      )

      // 4) Calcular saldo de caixa
      const saldoCaixa = totalDepositos - totalSaques - totalRendimentos

      setTotaisFinanceiro({
        totalDepositos,
        totalSaques,
        totalRendimentos,
        saldoCaixa,
      })
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar resumo financeiro.')
    } finally {
      setLoadingFinanceiro(false)
      setLoading(false)
    }
  }

  // Chamado quando usuário altera dataInicial ou dataFinal
  const handleFiltroData = () => {
    fetchFinanceiro()
  }

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando painel...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Dashboard</h1>

        {/* ─── Cards principais ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
          }}
        >
          {/* Card: Usuários */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              width: '220px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h2>Usuários</h2>
            <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {totaisContagem.users}
            </p>
            <Link href="/admin/users">
              <a
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Gerenciar
              </a>
            </Link>
          </div>

          {/* Card: Transações */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              width: '220px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h2>Transações</h2>
            <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
              {totaisContagem.transactions}
            </p>
            <p>Pendentes: {totaisContagem.pendingTransactions}</p>
            <Link href="/admin/transactions">
              <a
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Gerenciar
              </a>
            </Link>
          </div>

          {/* Card: Planos */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              width: '220px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h2>Planos</h2>
            <Link href="/admin/plans">
              <a
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Gerenciar
              </a>
            </Link>
          </div>

          {/* Card: Páginas Estáticas */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              width: '220px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h2>Páginas</h2>
            <Link href="/admin/page_contents">
              <a
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: '#fff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Gerenciar
              </a>
            </Link>
          </div>
        </div>

        {/* ─── Seção: Resumo Financeiro ─────────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Resumo Financeiro
          </h2>

          {/* Filtros de Data */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="dataInicial">Data Inicial:</label>
              <input
                id="dataInicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="dataFinal">Data Final:</label>
              <input
                id="dataFinal"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            <button
              onClick={handleFiltroData}
              disabled={loadingFinanceiro}
              style={{
                alignSelf: 'flex-end',
                padding: '0.6rem 1.2rem',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loadingFinanceiro ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                height: '2.6rem',
              }}
            >
              {loadingFinanceiro ? 'Filtrando...' : 'Aplicar Filtro'}
            </button>
          </div>

          {/* Painel abaixo dos filtros */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Total Depósitos */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
              }}
            >
              <h3>Total Depósitos</h3>
              <p style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>
                ${totaisFinanceiro.totalDepositos.toFixed(2)}
              </p>
            </div>

            {/* Total Saques */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
              }}
            >
              <h3>Total Saques</h3>
              <p style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>
                ${totaisFinanceiro.totalSaques.toFixed(2)}
              </p>
            </div>

            {/* Total Rendimentos Aplicados */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
              }}
            >
              <h3>Total Rendimentos</h3>
              <p style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>
                ${totaisFinanceiro.totalRendimentos.toFixed(2)}
              </p>
            </div>

            {/* Saldo de Caixa */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
              }}
            >
              <h3>Saldo de Caixa</h3>
              <p style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>
                ${totaisFinanceiro.saldoCaixa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </div>
    </AdminLayout>
  )
}
