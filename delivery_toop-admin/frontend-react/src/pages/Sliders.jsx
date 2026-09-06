import React, { useState, useEffect } from 'react';
import { ImageIcon, Plus, X } from 'lucide-react';
import { sliderService, companyService } from '../services/api';
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

const Sliders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', type: 'slider', category: 'delivery', priorities: '1', status: true, companyClick: false, images: '' });
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);

  const load = () => sliderService.paginator({ pageIn: 0, pageOut: 100 }).then((res) => setItems(extractList(res.list ? res : res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  useEffect(() => { companyService.getCompanies().then((r) => setCompanies(extractList(r))).catch(() => {}); }, []);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const images = form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const base = { name: form.name, company: form.company || undefined, type: form.type, category: form.category, priorities: form.priorities, status: form.status, companyClick: form.companyClick };
      if (selected) {
        const file = images.length === 1 ? { url: images[0] } : images.length > 1 ? images.map((u) => ({ url: u })) : undefined;
        await sliderService.update(selected._id, { ...base, ...(file ? { file } : {}) });
      } else {
        if (!images.length) { alert('Informe ao menos uma imagem (URL)'); setSaving(false); return; }
        const file = images.length === 1 ? { url: images[0] } : images.map((u) => ({ url: u }));
        await sliderService.create({ ...base, file });
      }
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir slider "${it.name}"?`)) return;
    try { await sliderService.remove(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'company', title: 'Empresa', render: (v) => (v && v.name) || '-' },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    { key: 'category', title: 'Categoria', render: (v) => v || '-' },
    { key: 'priorities', title: 'Prioridade', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'companyClick', title: 'Cliq. Empresa', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Sim' : 'Não'}</span> },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><ImageIcon size={20} style={{ marginRight: '0.5rem' }} />Sliders</h3>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', company: '', type: 'slider', category: 'delivery', priorities: '1', status: true, companyClick: false, images: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name || '', company: it.company?._id || it.company || '', type: it.type || 'slider', category: it.category || 'delivery', priorities: it.priorities || '1', status: it.status !== false, companyClick: !!it.companyClick, images: (it.images || []).join(', ') }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum slider" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Slider' : 'Novo Slider'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label>Empresa *</label><select name="company" value={form.company} onChange={change} required><option value="">Selecione...</option>{companies.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}</select></div>
              <div className="form-row">
                <div className="form-group"><label>Tipo *</label><select name="type" value={form.type} onChange={change} required><option value="slider">Slider</option><option value="banner">Banner</option><option value="driver">Driver</option></select></div>
                <div className="form-group"><label>Categoria *</label><select name="category" value={form.category} onChange={change} required><option value="delivery">Delivery</option><option value="service">Service</option></select></div>
              </div>
              <div className="form-group"><label>Prioridade *</label><input type="text" name="priorities" value={form.priorities} onChange={change} required /></div>
              <div className="form-group"><label>Imagens (URLs separadas por vírgula) *</label><input type="text" name="images" value={form.images} onChange={change} /></div>
              <div className="form-row">
                <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
                <div className="form-group"><label><input type="checkbox" name="companyClick" checked={form.companyClick} onChange={change} /> Clique na empresa</label></div>
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

export default Sliders;
