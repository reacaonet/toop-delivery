import { useState, useEffect } from 'react'
import api, { branchService } from '../api'

export default function BranchesPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const companyId = user?.company?._id || user?.company

  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', phone: '',
    address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' },
  })

  useEffect(() => { loadBranches() }, [companyId])

  async function loadBranches() {
    try {
      setLoading(true)
      const res = await branchService.list(companyId)
      setBranches(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', phone: '', address: { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' } })
    setShowModal(true)
  }

  function openEdit(branch: any) {
    setEditing(branch)
    setForm({
      name: branch.name,
      phone: branch.phone || '',
      address: {
        street: branch.address?.street || '',
        number: branch.address?.number || '',
        complement: branch.address?.complement || '',
        neighborhood: branch.address?.neighborhood || '',
        city: branch.address?.city || '',
        state: branch.address?.state || '',
        zipCode: branch.address?.zipCode || '',
      },
    })
    setShowModal(true)
  }

  async function handleSave() {
    try {
      const data = { ...form, company: companyId }
      if (editing) {
        await branchService.update(editing._id, data)
      } else {
        await branchService.create(data)
      }
      setShowModal(false)
      loadBranches()
    } catch (err) {
      alert('Erro ao salvar filial')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir esta filial?')) return
    try {
      await branchService.delete(id)
      loadBranches()
    } catch (err) {
      alert('Erro ao excluir')
    }
  }

  return (
    <div className="branches-page">
      <div className="page-header">
        <div>
          <h1>Filiais / Unidades</h1>
          <p className="page-subtitle">Gerenciar unidades da loja</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nova Filial</button>
      </div>

      {loading ? <div className="loading">Carregando...</div> : (
        <div className="card">
          <div className="card-body">
            {branches.length === 0 ? (
              <p className="empty-text">Nenhuma filial cadastrada</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Cidade</th>
                    <th>Telefone</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b: any) => (
                    <tr key={b._id}>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.address?.street} {b.address?.number ? `, ${b.address.number}` : ''}</td>
                      <td>{b.address?.city || '-'}{b.address?.state ? `/${b.address.state}` : ''}</td>
                      <td>{b.phone || '-'}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => openEdit(b)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b._id)}>Excluir</button>
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
            <h2>{editing ? 'Editar Filial' : 'Nova Filial'}</h2>
            <div className="form-group">
              <label>Nome *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Filial Centro" />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <h3 style={{ fontSize: 14, marginTop: 16, marginBottom: 12 }}>Endereço</h3>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Rua</label>
                <input className="form-input" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Número</label>
                <input className="form-input" value={form.address.number} onChange={(e) => setForm({ ...form, address: { ...form.address, number: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input className="form-input" value={form.address.complement} onChange={(e) => setForm({ ...form, address: { ...form.address, complement: e.target.value } })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <input className="form-input" value={form.address.neighborhood} onChange={(e) => setForm({ ...form, address: { ...form.address, neighborhood: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input className="form-input" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Estado</label>
                <input className="form-input" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} maxLength={2} />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input className="form-input" value={form.address.zipCode} onChange={(e) => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.name}>{editing ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .branches-page { padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header h1 { margin: 0; font-size: 24px; color: #333; }
        .page-subtitle { margin: 4px 0 0; color: #666; font-size: 14px; }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-body { padding: 16px 20px; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .btn-primary { background: #ea1d2c; color: white; }
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
        .modal { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
        .modal h2 { margin: 0 0 20px; font-size: 18px; }
        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .form-input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
      `}</style>
    </div>
  )
}
