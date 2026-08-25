import { useState, useEffect } from 'react'
import api, { branchService, stockItemService, stockBatchService } from '../api'

export default function StockBatchesPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const companyId = user?.company?._id || user?.company

  const [branches, setBranches] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    stockItem: '', branch: '', quantity: 0, unitCost: 0,
    batchNumber: '', supplier: '', expiryDate: '',
  })

  useEffect(() => {
    if (!companyId) return
    loadData()
  }, [companyId])

  useEffect(() => {
    if (selectedBranch) loadBatches()
  }, [selectedBranch])

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

  async function loadBatches() {
    try {
      const res = await stockBatchService.listByBranch(selectedBranch)
      setBatches(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function openNew() {
    setForm({ stockItem: items[0]?._id || '', branch: selectedBranch, quantity: 0, unitCost: 0, batchNumber: '', supplier: '', expiryDate: '' })
    setShowModal(true)
  }

  async function handleSave() {
    try {
      await stockBatchService.create({
        ...form,
        initialQuantity: form.quantity,
        entryDate: new Date(),
        status: 'active',
      })
      setShowModal(false)
      loadBatches()
    } catch (err) {
      alert('Erro ao salvar lote')
    }
  }

  const expiringSoon = (date: string) => {
    if (!date) return false
    const diff = new Date(date).getTime() - Date.now()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
  }

  return (
    <div className="batches-page">
      <div className="page-header">
        <div>
          <h1>Lotes</h1>
          <p className="page-subtitle">Gerenciar lotes por filial</p>
        </div>
        <div className="header-actions">
          <select className="form-input" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            {branches.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openNew}>+ Novo Lote</button>
        </div>
      </div>

      {loading ? <div className="loading">Carregando...</div> : (
        <div className="card">
          <div className="card-body">
            {batches.length === 0 ? (
              <p className="empty-text">Nenhum lote registrado nesta filial</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Lote</th>
                    <th>Qtd</th>
                    <th>Qtd Inicial</th>
                    <th>Custo Unit.</th>
                    <th>Fornecedor</th>
                    <th>Validade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b: any) => (
                    <tr key={b._id} className={expiringSoon(b.expiryDate) ? 'row-warning' : ''}>
                      <td>{b.stockItem?.name || '-'}</td>
                      <td>{b.batchNumber}</td>
                      <td>{b.quantity}</td>
                      <td>{b.initialQuantity}</td>
                      <td>R$ {b.unitCost?.toFixed(2)}</td>
                      <td>{b.supplier || '-'}</td>
                      <td>
                        {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('pt-BR') : '-'}
                        {expiringSoon(b.expiryDate) && <span className="badge badge-warning" style={{ marginLeft: 6 }}>Vence em breve</span>}
                      </td>
                      <td><span className={`badge badge-${b.status === 'active' ? 'success' : b.status === 'expired' ? 'danger' : 'info'}`}>{b.status === 'active' ? 'Ativo' : b.status === 'expired' ? 'Vencido' : 'Consumido'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Lote</h2>
            <div className="form-group">
              <label>Item *</label>
              <select className="form-input" value={form.stockItem} onChange={(e) => setForm({ ...form, stockItem: e.target.value })}>
                <option value="">Selecione...</option>
                {items.map((i: any) => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantidade *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Custo Unitário (R$) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nº Lote *</label>
                <input className="form-input" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="Ex: L001" />
              </div>
              <div className="form-group">
                <label>Fornecedor</label>
                <input className="form-input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Data de Validade</label>
              <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.stockItem || !form.batchNumber || form.quantity <= 0}>Criar Lote</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .batches-page { padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 24px; color: #333; }
        .page-subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
        .header-actions { display: flex; gap: 12px; align-items: center; }
        .form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-body { padding: 16px 20px; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .btn-primary { background: #ea1d2c; color: white; }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-secondary { background: #f5f5f5; color: #333; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #999; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
        .table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
        .row-warning { background: #fff8e1; }
        .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-success { background: #e8f5e9; color: #2e7d32; }
        .badge-danger { background: #ffebee; color: #c62828; }
        .badge-info { background: #e3f2fd; color: #1565c0; }
        .badge-warning { background: #fff3e0; color: #e65100; }
        .empty-text { color: #999; text-align: center; padding: 40px; }
        .loading { text-align: center; padding: 40px; color: #999; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; }
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
