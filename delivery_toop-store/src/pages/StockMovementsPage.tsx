import { useState, useEffect } from 'react'
import api, { branchService, stockItemService, stockMovementService } from '../api'

export default function StockMovementsPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const companyId = user?.company?._id || user?.company

  const [branches, setBranches] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<'entry' | 'exit' | null>(null)
  const [form, setForm] = useState({
    stockItem: '', branch: '', quantity: 0, unitCost: 0,
    batchNumber: '', supplier: '', expiryDate: '', reason: '', notes: '',
  })

  useEffect(() => {
    if (!companyId) return
    loadData()
  }, [companyId])

  useEffect(() => {
    if (selectedBranch) loadMovements()
  }, [selectedBranch, filterType])

  async function loadData() {
    try {
      setLoading(true)
      const [bRes, iRes] = await Promise.all([
        branchService.list(companyId),
        stockItemService.list(companyId),
      ])
      setBranches(bRes.data || [])
      setItems(iRes.data || [])
      if (bRes.data?.length > 0) setSelectedBranch(bRes.data[0]._id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMovements() {
    try {
      const params: any = {}
      if (filterType) params.type = filterType
      const res = await stockMovementService.listByBranch(selectedBranch, params)
      setMovements(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function openEntry() {
    setForm({ stockItem: items[0]?._id || '', branch: selectedBranch, quantity: 0, unitCost: 0, batchNumber: '', supplier: '', expiryDate: '', reason: '', notes: '' })
    setShowModal('entry')
  }

  function openExit() {
    setForm({ stockItem: items[0]?._id || '', branch: selectedBranch, quantity: 0, unitCost: 0, batchNumber: '', supplier: '', expiryDate: '', reason: '', notes: '' })
    setShowModal('exit')
  }

  async function handleEntry() {
    try {
      await stockMovementService.entry({
        stockItem: form.stockItem,
        branch: selectedBranch,
        quantity: form.quantity,
        unitCost: form.unitCost,
        batchNumber: form.batchNumber,
        supplier: form.supplier,
        expiryDate: form.expiryDate || undefined,
        user: user._id,
        reason: form.reason,
        notes: form.notes,
      })
      setShowModal(null)
      loadMovements()
    } catch (err) {
      alert('Erro ao registrar entrada')
    }
  }

  async function handleExit() {
    try {
      await stockMovementService.exit({
        stockItem: form.stockItem,
        branch: selectedBranch,
        quantity: form.quantity,
        user: user._id,
        reason: form.reason,
        notes: form.notes,
      })
      setShowModal(null)
      loadMovements()
    } catch (err) {
      alert('Erro ao registrar saída')
    }
  }

  const typeLabels: Record<string, string> = { entry: 'Entrada', exit: 'Saída', transfer: 'Transferência', adjustment: 'Ajuste' }

  return (
    <div className="movements-page">
      <div className="page-header">
        <div>
          <h1>Movimentações</h1>
          <p className="page-subtitle">Histórico de entradas e saídas</p>
        </div>
        <div className="header-actions">
          <select className="form-input" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            {branches.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <select className="form-input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="entry">Entradas</option>
            <option value="exit">Saídas</option>
            <option value="transfer">Transferências</option>
            <option value="adjustment">Ajustes</option>
          </select>
          <button className="btn btn-success" onClick={openEntry}>+ Entrada</button>
          <button className="btn btn-danger" onClick={openExit}>+ Saída</button>
        </div>
      </div>

      {loading ? <div className="loading">Carregando...</div> : (
        <div className="card">
          <div className="card-body">
            {movements.length === 0 ? (
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
                    <th>Custo Total</th>
                    <th>Motivo</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m: any) => (
                    <tr key={m._id}>
                      <td>{new Date(m.movementDate).toLocaleDateString('pt-BR')} {new Date(m.movementDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className={`badge badge-${m.type === 'entry' ? 'success' : m.type === 'exit' ? 'danger' : 'info'}`}>{typeLabels[m.type] || m.type}</span></td>
                      <td>{m.stockItem?.name || '-'}</td>
                      <td>{m.quantity} {m.stockItem?.unit}</td>
                      <td>{m.unitCost ? `R$ ${m.unitCost.toFixed(2)}` : '-'}</td>
                      <td>{m.totalCost ? `R$ ${m.totalCost.toFixed(2)}` : '-'}</td>
                      <td>{m.reason || '-'}</td>
                      <td>{m.user?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{showModal === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}</h2>
            <div className="form-group">
              <label>Item *</label>
              <select className="form-input" value={form.stockItem} onChange={(e) => setForm({ ...form, stockItem: e.target.value })}>
                <option value="">Selecione...</option>
                {items.map((i: any) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantidade *</label>
              <input className="form-input" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            {showModal === 'entry' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Custo Unitário (R$)</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>Nº Lote</label>
                    <input className="form-input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fornecedor</label>
                    <input className="form-input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Validade</label>
                    <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                  </div>
                </div>
              </>
            )}
            <div className="form-group">
              <label>Motivo</label>
              <input className="form-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={showModal === 'entry' ? 'Compra de fornecedor' : 'Uso em produção'} />
            </div>
            <div className="form-group">
              <label>Observações</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
              <button className={`btn ${showModal === 'entry' ? 'btn-success' : 'btn-danger'}`} onClick={showModal === 'entry' ? handleEntry : handleExit} disabled={!form.stockItem || form.quantity <= 0}>
                {showModal === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .movements-page { padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-header h1 { margin: 0; font-size: 24px; color: #333; }
        .page-subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
        .header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-body { padding: 16px 20px; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .btn-primary { background: #ea1d2c; color: white; }
        .btn-success { background: #2e7d32; color: white; }
        .btn-danger { background: #c62828; color: white; }
        .btn-secondary { background: #f5f5f5; color: #333; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #999; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
        .table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-success { background: #e8f5e9; color: #2e7d32; }
        .badge-danger { background: #ffebee; color: #c62828; }
        .badge-info { background: #e3f2fd; color: #1565c0; }
        .empty-text { color: #999; text-align: center; padding: 40px; }
        .loading { text-align: center; padding: 40px; color: #999; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal h2 { margin: 0 0 20px; font-size: 18px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .form-input { width: 100%; box-sizing: border-box; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
      `}</style>
    </div>
  )
}
