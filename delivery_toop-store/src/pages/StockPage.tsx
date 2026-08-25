import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { branchService, stockItemService, stockBatchService, stockMovementService } from '../api'

export default function StockPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const companyId = user?.company?._id || user?.company

  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [summary, setSummary] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [recentMovements, setRecentMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    loadData()
  }, [companyId, selectedBranch])

  async function loadData() {
    try {
      setLoading(true)
      const [branchesRes, alertsRes] = await Promise.all([
        branchService.list(companyId),
        stockBatchService.getAlerts(companyId),
      ])
      setBranches(branchesRes.data || [])
      setAlerts(alertsRes.data || [])

      if (branchesRes.data?.length > 0) {
        const branchId = selectedBranch || branchesRes.data[0]._id
        if (!selectedBranch) setSelectedBranch(branchId)

        const [summaryRes, movementsRes] = await Promise.all([
          stockMovementService.summary(branchId),
          stockMovementService.listByBranch(branchId),
        ])
        setSummary(summaryRes.data || [])
        setRecentMovements(movementsRes.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalStockValue = summary.reduce((sum: number, s: any) => sum + (s.totalValue || 0), 0)
  const totalItems = summary.length
  const lowStockCount = summary.filter((s: any) => s.belowMinimum).length

  return (
    <div className="stock-page">
      <div className="page-header">
        <div>
          <h1>Estoque</h1>
          <p className="page-subtitle">Controle de estoque e movimentações</p>
        </div>
        <div className="header-actions">
          <select
            className="form-input"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branches.map((b: any) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e3f2fd' }}>📦</div>
              <div>
                <div className="stat-value">{totalItems}</div>
                <div className="stat-label">Itens cadastrados</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5e9' }}>💰</div>
              <div>
                <div className="stat-value">R$ {totalStockValue.toFixed(2)}</div>
                <div className="stat-label">Valor em estoque</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: lowStockCount > 0 ? '#ffebee' : '#e8f5e9' }}>⚠️</div>
              <div>
                <div className="stat-value" style={{ color: lowStockCount > 0 ? '#ea1d2c' : undefined }}>{lowStockCount}</div>
                <div className="stat-label">Estoque baixo</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff3e0' }}>📋</div>
              <div>
                <div className="stat-value">{recentMovements.length}</div>
                <div className="stat-label">Movimentações</div>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="card">
              <div className="card-header">
                <h2>Estoque por Item</h2>
                <button className="btn btn-sm" onClick={() => navigate('/stock/items')}>Ver todos</button>
              </div>
              <div className="card-body">
                {summary.length === 0 ? (
                  <p className="empty-text">Nenhum item cadastrado</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Unidade</th>
                        <th>Quantidade</th>
                        <th>Mínimo</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((s: any) => (
                        <tr key={s.stockItem._id}>
                          <td>{s.stockItem.name}</td>
                          <td>{s.stockItem.unit}</td>
                          <td>{s.totalQuantity}</td>
                          <td>{s.stockItem.minimumStock}</td>
                          <td>R$ {s.totalValue.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${s.belowMinimum ? 'badge-danger' : 'badge-success'}`}>
                              {s.belowMinimum ? 'Baixo' : 'OK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Alertas</h2>
              </div>
              <div className="card-body">
                {alerts.length === 0 ? (
                  <p className="empty-text">Nenhum alerta no momento</p>
                ) : (
                  <div className="alerts-list">
                    {alerts.map((a: any, i: number) => (
                      <div key={i} className="alert-item alert-warning">
                        <strong>{a.stockItem.name}</strong> — {a.branch.name}
                        <br />
                        <small>Atual: {a.currentQuantity} {a.stockItem.unit} | Mínimo: {a.minimumStock} {a.stockItem.unit}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Últimas Movimentações</h2>
              <button className="btn btn-sm" onClick={() => navigate('/stock/movements')}>Ver todas</button>
            </div>
            <div className="card-body">
              {recentMovements.length === 0 ? (
                <p className="empty-text">Nenhuma movimentação registrada</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Custo Unit.</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovements.slice(0, 10).map((m: any) => (
                      <tr key={m._id}>
                        <td>{new Date(m.movementDate).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`badge ${m.type === 'entry' ? 'badge-success' : m.type === 'exit' ? 'badge-danger' : 'badge-info'}`}>
                            {m.type === 'entry' ? 'Entrada' : m.type === 'exit' ? 'Saída' : m.type === 'transfer' ? 'Transferência' : 'Ajuste'}
                          </span>
                        </td>
                        <td>{m.stockItem?.name}</td>
                        <td>{m.quantity} {m.stockItem?.unit}</td>
                        <td>{m.unitCost ? `R$ ${m.unitCost.toFixed(2)}` : '-'}</td>
                        <td>{m.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .stock-page { padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 24px; color: #333; }
        .page-subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
        .header-actions { display: flex; gap: 12px; align-items: center; }
        .form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-value { font-size: 24px; font-weight: 700; color: #333; }
        .stat-label { font-size: 13px; color: #666; margin-top: 2px; }
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
        .card-header h2 { margin: 0; font-size: 16px; color: #333; }
        .card-body { padding: 16px 20px; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .btn-sm { background: #f5f5f5; color: #333; }
        .btn-sm:hover { background: #e0e0e0; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #999; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
        .table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-success { background: #e8f5e9; color: #2e7d32; }
        .badge-danger { background: #ffebee; color: #c62828; }
        .badge-info { background: #e3f2fd; color: #1565c0; }
        .empty-text { color: #999; text-align: center; padding: 24px; }
        .alerts-list { display: flex; flex-direction: column; gap: 8px; }
        .alert-item { padding: 12px; border-radius: 8px; font-size: 14px; }
        .alert-warning { background: #fff3e0; border-left: 3px solid #ff9800; }
        .loading { text-align: center; padding: 40px; color: #999; }
      `}</style>
    </div>
  )
}
