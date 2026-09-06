import React, { useState, useEffect } from 'react';
import { BadgePercent, Plus, X } from 'lucide-react';
import { offerService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.response)) return res.response;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const Offers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', groupCompany: false, cost: '', status: true, description: '', images: '' });
  const [saving, setSaving] = useState(false);

  const load = () => offerService.listOffers().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const images = form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const cost = form.cost === '' || isNaN(Number(String(form.cost).replace(',', '.'))) ? undefined : Number(String(form.cost).replace(',', '.'));
      if (cost === undefined) { alert('Informe um custo válido.'); setSaving(false); return; }
      const base = { name: form.name, groupCompany: form.groupCompany, cost, status: form.status, description: form.description };
      if (selected) {
        const file = images.length === 1 ? { url: images[0] } : images.map((u) => ({ url: u }));
        await offerService.updateOffer(selected._id, { ...base, file });
      } else {
        await offerService.createOffer({ ...base, images });
      }
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir oferta "${it.name}"?`)) return;
    try { await offerService.deleteOffer(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'cost', title: 'Custo', render: (v) => 'R$ ' + Number(v).toFixed(2) },
    { key: 'description', title: 'Descrição', render: (v) => (v && String(v).length > 50 ? String(v).slice(0, 50) + '…' : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'groupCompany', title: 'Grupo', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
    { key: '_id', title: '', render: (_, it) => <button className="btn btn-danger btn-sm" onClick={() => remove(it)}>Excluir</button> },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><BadgePercent size={20} style={{ marginRight: '0.5rem' }} />Ofertas</h3>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', groupCompany: false, cost: '', status: true, description: '', images: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name || '', groupCompany: !!it.groupCompany, cost: it.cost != null ? String(it.cost) : '', status: it.status !== false, description: it.description || '', images: (it.images || []).join(', ') }); setOpen(true); }} loading={loading} emptyMessage="Nenhuma oferta" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Oferta' : 'Nova Oferta'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Custo *</label><input type="text" name="cost" value={form.cost} onChange={change} placeholder="10.00" required /></div>
              </div>
              <div className="form-group"><label>Descrição *</label><input type="text" name="description" value={form.description} onChange={change} required /></div>
              <div className="form-group"><label>Imagens (URLs separadas por vírgula)</label><input type="text" name="images" value={form.images} onChange={change} /></div>
              <div className="form-row">
                <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
                <div className="form-group"><label><input type="checkbox" name="groupCompany" checked={form.groupCompany} onChange={change} /> Grupo de empresa</label></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;