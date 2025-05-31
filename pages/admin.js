// pages/admin.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function AdminPage() {
  const [transactions, setTransactions] = useState([])
  const [profilesMap, setProfilesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // 1) Verifica sessão
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }

        // 2) Carrega todas as transações
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('id, user_id, type, amount, status, data')
          .order('data', { ascending: false })

        if (txError) throw txError
        const allTx = txData || []
        setTransactions(allTx)

        // 3) Extrai user IDs únicos
        const uniqueUserIds = Array.from(
          new Set(allTx.map((t) => t.user_id).filter((uid) => uid))
        )

        if (uniqueUserIds.length > 0) {
          // 4) Busca perfis correspondentes
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nome, email')
            .in('id', uniqueUserIds)

          if (profilesError) throw profilesError

          // 5) Monta mapa user_id → nome
          const map = {}
          profilesData.forEach((p) => {
            map[p.id] = { nome: p.nome || p.email || '—', email: p.email }
          })
          setProfilesMap(map)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Erro inesperado ao carregar dados do Admin.')
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  // Formata valor em USD
  const formatUSD = (v) => {
    const num = parseFloat(v) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  // Atualiza status de uma transação (approved ou rejected)
  const updateStatus = async (id, novoStatus) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: novoStatus })
        .eq('id', id)

      if (error) {
        alert('Falha ao atualizar status: ' + error.message)
      } else {
        // Atualiza localmente sem recarregar tudo
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: novoStatus } : t
          )
        )
      }
    } catch (err) {
      console.error(err)
      alert('Erro inesperado ao atualizar status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtra transações de acordo com o status selecionado
  const filteredTx = transactions.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  )

  // Contadores rápidos por status
  const countAll = transactions.length
  const countPending = transactions.filter((t) => t.status === 'pending').length
  const countApproved = transactions.filter((t) => t.status === 'approved').length
  const countRejected = transactions.filter((t) => t.status === 'rejected').length

  return (
    <Layout>
      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        {loading && <p>Carregando dados do Admin...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {/* Seletor de filtro por status */}
            <div className="filtros">
              <button
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                Todas ({countAll})
              </button>
              <button
                className={filterStatus === 'pending' ? 'active' : ''}
                onClick={() => setFilterStatus('pending')}
              >
                Pendentes ({countPending})
              </button>
              <button
                className={filterStatus === 'approved' ? 'active' : ''}
                onClick={() => setFilterStatus('approved')}
              >
                Aprovadas ({countApproved})
              </button>
              <button
                className={filterStatus === 'rejected' ? 'active' : ''}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejeitadas ({countRejected})
              </button>
            </div>

            {/* Tabela de transações */}
            {filteredTx.length === 0 ? (
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Não há transações para exibir.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t) => {
                    const perfil = profilesMap[t.user_id]
                    const nomeUsuario = perfil ? perfil.nome : 'N/A'
                    const dataFormatada = t.data
                      ? new Date(t.data).toLocaleDateString('pt-BR')
                      : '—'
                    return (
                      <tr key={t.id}>
                        <td>{nomeUsuario}</td>
                        <td>{dataFormatada}</td>
                        <td>{t.type}</td>
                        <td>{formatUSD(t.amount)}</td>
                        <td>
                          <span className={`status ${t.status}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {t.status === 'pending' ? (
                            <>
                              <button
                                disabled={updatingId === t.id}
                                onClick={() => updateStatus(t.id, 'approved')}
                              >
                                {updatingId === t.id && (
                                  <span className="loader" />
                                )}
                                Aprovar
                              </button>
                              <button
                                disabled={updatingId === t.id}
                                onClick={() => updateStatus(t.id, 'rejected')}
                              >
                                {updatingId === t.id && (
                                  <span className="loader" />
                                )}
                                Rejeitar
                              </button>
                            </>
                          ) : (
                            <em>N/A</em>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        <style jsx>{`
          .admin-container {
            max-width: 1000px;
            margin: 2rem auto;
            padding: 1rem;
          }

          h1 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 1.6rem;
          }

          /* Seletor de filtros */
          .filtros {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
          }

          .filtros button {
            padding: 0.5rem 1rem;
            border: 1px solid #0070f3;
            background: white;
            color: #0070f3;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.3s;
          }

          .filtros button:hover {
            background-color: #e6f0ff;
          }

          .filtros button.active {
            background-color: #0070f3;
            color: white;
          }

          /* Tabela */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }

          th,
          td {
            border: 1px solid #ddd;
            padding: 0.75rem;
            text-align: center;
          }

          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }

          /* Status colorido */
          .status {
            text-transform: capitalize;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
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

          /* Botões de ação */
          td button {
            margin: 0 0.25rem;
            padding: 0.4rem 0.6rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
          }

          td button:first-of-type {
            background-color: #4caf50;
            color: white;
          }
          td button:last-of-type {
            background-color: #f44336;
            color: white;
          }

          td button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Loader simples dentro do botão */
          .loader {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #fff;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .error {
            color: red;
            text-align: center;
            margin-top: 1rem;
          }

          /* Responsividade para mobile */
          @media (max-width: 768px) {
            .admin-container {
              padding: 1rem;
            }

            table,
            thead,
            tbody,
            th,
            td,
            tr {
              display: block;
            }

            thead tr {
              position: absolute;
              top: -9999px;
              left: -9999px;
            }

            tr {
              margin-bottom: 1rem;
            }

            td {
              border: none;
              position: relative;
              padding-left: 50%;
              text-align: left;
            }

            td:before {
              position: absolute;
              top: 0;
              left: 0;
              width: 45%;
              padding-right: 0.5rem;
              white-space: nowrap;
              font-weight: 600;
            }

            td:nth-of-type(1):before {
              content: 'Usuário';
            }
            td:nth-of-type(2):before {
              content: 'Data';
            }
            td:nth-of-type(3):before {
              content: 'Tipo';
            }
            td:nth-of-type(4):before {
              content: 'Valor';
            }
            td:nth-of-type(5):before {
              content: 'Status';
            }
            td:nth-of-type(6):before {
              content: 'Ações';
            }
          }
        `}</style>
      </div>
    </Layout>
  )
}
