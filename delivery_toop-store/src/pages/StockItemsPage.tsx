import { useState, useEffect } from 'react'
import api, { stockItemService } from '../api'

export default function StockItemsPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const companyId = user?.company?._id || user?.company

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', category: '', unit: 'un', minimumStock: 0, description: '' })

  useEffect(() => { loadItems() }, [companyId])

  async function loadItems() {
    try {
      setLoading(true)
      const res = await stockItemService.list(companyId)
      setItems(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', category: '', unit: 'un', minimumStock: 0, description: '' })
    setShowModal(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    setForm({ name: item.name, category: item.category || '', unit: item.unit, minimumStock: item.minimumStock, description: item.description || '' })
    setShowModal(true)
  }

  async function handleSave() {
    try {
      const data = { ...form, company: companyId }
      if (editing) {
        await stockItemService.update(editing._id, data)
      } else {
        await stockItemService.create(data)
      }
      setShowModal(false)
      loadItems()
    } catch (err) {
      alert('Erro ao salvar item')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir este item?')) return
    try {
      await stockItemService.delete(id)
      loadItems()
    } catch (err) {
      alert('Erro ao excluir')
    }
  }

  const unitLabels: Record<string, string> = { kg: 'Quilograma', g: 'Grama', un: 'Unidade', L: 'Litro', ml: 'Mililitro', cx: 'Caixa', pct: 'Pacote' }

  return (
    <div className="stock-items-page">
      <div className="page-header">
        <div>
          <h1>Itens de Estoque</h1>
          <p className="page-subtitle">Matéria-prima e insumos</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Item</button>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            {items.length === 0 ? (
              <p className="empty-text">Nenhum item cadastrado. Clique em "+ Novo Item" para começar.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Unidade</th>
                    <th>Estoque Mínimo</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category || '-'}</td>
                      <td>{item.unit} ({unitLabels[item.unit] || item.unit})</td>
                      <td>{item.minimumStock}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => openEdit(item)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Excluir</button>
                      </td>
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
            <h2>{editing ? 'Editar Item' : 'Novo Item de Estoque'}</h2>
            <div className="form-group">
              <label>Nome *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Carne Moída" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Carnes" />
              </div>
              <div className="form-group">
                <label>Unidade *</label>
                <select className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="un">Unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="g">Grama (g)</option>
                  <option value="L">Litro (L)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="cx">Caixa</option>
                  <option value="pct">Pacote</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Estoque Mínimo</label>
              <input className="form-input" type="number" min="0" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name}>{editing ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stock-items-page { padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 24px; color: #333; }
        .page-subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-body { padding: 16px 20px; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .btn-primary { background: #ea1d2c; color: white; }
        .btn-primary:hover { background: #c41824; }
        .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .btn-secondary { background: #f5f5f5; color: #333; }
        .btn-sm { background: #f5f5f5; color: #333; margin-right: 6px; }
        .btn-sm.btn-danger { background: #ffebee; color: #c62828; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #999; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
        .table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
        .empty-text { color: #999; text-align: center; padding: 40px; }
        .loading { text-align: center; padding: 40px; color: #999; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; }
        .modal h2 { margin: 0 0 20px; font-size: 18px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #333; }
        .form-input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
      `}</style>
    </div>
  )
}
