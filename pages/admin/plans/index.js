// File: ./pages/admin/plans/index.js

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansPage() {
  // estados para a lista de planos
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [errorPlans, setErrorPlans] = useState('')

  // estados para as configurações gerais
  const [textoAviso, setTextoAviso] = useState('')
  const [comissaoN1, setComissaoN1] = useState('')
  const [comissaoN2, setComissaoN2] = useState('')
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [savingConfigs, setSavingConfigs] = useState(false)
  const [errorConfigs, setErrorConfigs] = useState('')

  useEffect(() => {
    fetchPlans()
    fetchConfigs()
  }, [])

  // 1) Busca todos os planos, incluindo "daily_rate"
  const fetchPlans = async () => {
    setErrorPlans('')
    setLoadingPlans(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('plans')
        .select('id, name, daily_rate')
        .order('name', { ascending: true })

      if (fetchErr) throw fetchErr
      setPlans(data || [])
    } catch (err) {
      console.error(err)
      setErrorPlans('Falha ao carregar planos.')
    } finally {
      setLoadingPlans(false)
    }
  }

  // 2) Busca configurações gerais (textoAviso, comissaoN1, comissaoN2)
  const fetchConfigs = async () => {
    setErrorConfigs('')
    setLoadingConfigs(true)
    try {
      const { data, error } = await supabase
        .from('admin_configs')
        .select('texto_aviso, comissao_nivel1, comissao_nivel2')
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setTextoAviso(data.texto_aviso ?? '')
        setComissaoN1((data.comissao_nivel1 ?? 0).toString())
        setComissaoN2((data.comissao_nivel2 ?? 0).toString())
      }
    } catch (err) {
      console.error(err)
      setErrorConfigs('Falha ao carregar configurações.')
    } finally {
      setLoadingConfigs(false)
    }
  }

  // 3) Salva (ou insere) configurações gerais
  const handleSaveConfigs = async (e) => {
    e.preventDefault()
    setErrorConfigs('')
    setSavingConfigs(true)

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('admin_configs')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      const payload = {
        texto_aviso: textoAviso,
        comissao_nivel1: parseFloat(comissaoN1) || 0,
        comissao_nivel2: parseFloat(comissaoN2) || 0,
      }

      if (existing) {
        const { error: updErr } = await supabase
          .from('admin_configs')
          .update(payload)
          .eq('id', existing.id)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('admin_configs')
          .insert([payload])
        if (insErr) throw insErr
      }

      alert('Configurações salvas com sucesso!')
    } catch (err) {
      console.error(err)
      setErrorConfigs('Não foi possível salvar configurações.')
    } finally {
      setSavingConfigs(false)
    }
  }

  // 4) Exclui um plano após confirmação
  const handleDeletePlan = async (planId, planName) => {
    const confirmacao = window.confirm(
      `Tem certeza de que deseja remover o plano "${planName}"? Esta ação não pode ser desfeita.`
    )
    if (!confirmacao) return

    try {
      // Se existirem perfis que referenciam este plan, considere limpar plan_id primeiro:
      // await supabase.from('profiles').update({ plan_id: null }).eq('plan_id', planId);

      const { error: deleteErr } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (deleteErr) {
        console.error('Erro ao excluir plano:', deleteErr)
        alert('Não foi possível remover o plano. Verifique se não há usuários vinculados.')
      } else {
        alert(`Plano "${planName}" removido com sucesso!`)
        fetchPlans()
      }
    } catch (err) {
      console.error(err)
      alert('Ocorreu um erro ao tentar remover o plano.')
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Gerenciar Planos</h1>

        {/* Seção de configurações gerais embutida */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f9f9f9',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Configurações Gerais</h2>

          {loadingConfigs ? (
            <p style={{ textAlign: 'center' }}>Carregando configurações...</p>
          ) : (
            <>
              {errorConfigs && (
                <p
                  style={{
                    color: 'red',
                    marginBottom: '1rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {errorConfigs}
                </p>
              )}

              <form
                onSubmit={handleSaveConfigs}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <label htmlFor="textoAviso" style={{ fontWeight: 600 }}>
                  Texto de Aviso (HTML/TEXTO):
                </label>
                <textarea
                  id="textoAviso"
                  rows="3"
                  value={textoAviso}
                  onChange={(e) => setTextoAviso(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />

                <label htmlFor="comissaoN1" style={{ fontWeight: 600 }}>
                  Comissão Nível 1 (%):
                </label>
                <input
                  id="comissaoN1"
                  type="number"
                  step="0.01"
                  value={comissaoN1}
                  onChange={(e) => setComissaoN1(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                  required
                />

                <label htmlFor="comissaoN2" style={{ fontWeight: 600 }}>
                  Comissão Nível 2 (%):
                </label>
                <input
                  id="comissaoN2"
                  type="number"
                  step="0.01"
                  value={comissaoN2}
                  onChange={(e) => setComissaoN2(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={savingConfigs}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: savingConfigs ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {savingConfigs ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Botão para criar novo plano */}
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link href="/admin/plans/new">
            <a
              style={{
                background: '#1976d2',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              + Novo Plano
            </a>
          </Link>
        </div>

        {/* Tabela de planos */}
        {loadingPlans ? (
          <p style={{ textAlign: 'center' }}>Carregando planos...</p>
        ) : errorPlans ? (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorPlans}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nome do Plano</th>
                <th style={thStyle}>Daily Rate (%)</th>
                <th style={thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{Number(p.daily_rate).toFixed(2)}</td>
                  <td style={tdStyle}>
                    <Link href={`/admin/plans/${p.id}`}>
                      <a style={btnEditStyle}>Editar</a>
                    </Link>
                    <button
                      onClick={() => handleDeletePlan(p.id, p.name)}
                      style={{
                        ...btnRemoveStyle,
                        marginLeft: '0.5rem',
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}

              {plans.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    Nenhum plano cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

// Estilos em linha para cabeçalho e células da tabela
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
  cursor: 'pointer',
  border: 'none',
}

const btnRemoveStyle = {
  display: 'inline-block',
  padding: '0.25rem 0.5rem',
  background: '#e53935',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  border: 'none',
} 
