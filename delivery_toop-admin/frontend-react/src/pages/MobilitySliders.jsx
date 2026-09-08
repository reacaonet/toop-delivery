// /mobility/sliders
import React, { useState, useEffect } from 'react';
import { Image, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilitySliderService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.lista)) return res.lista;
  return [];
};

const PAGE_SIZE = 10;

const mobilitySliders = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ franchise: '', name: '', impressions: '', destinationurl: '', target: 'passenger', image: '', status: true });
  const [franchises, setFranchises] = useState([]);

  const load = (pg = page) => {
    setLoading(true);
    return mobilitySliderService.paginator({ pageIn: pg, pageOut: PAGE_SIZE })
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.total) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    franchiseService.getFranchises().then((r) => setFranchises(extractList(r))).catch(() => {});
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = form.image ? form.image.trim() : '';
      if (!url) { alert('Informe a URL da imagem'); setSaving(false); return; }
      const file = [{ url }];
      const base = {
        franchise: form.franchise,
        name: form.name,
        impressions: form.impressions,
        destinationurl: form.destinationurl,
        target: form.target,
        status: form.status,
      };
      if (selected) {
        await mobilitySliderService.update(selected._id, { ...base, file });
      } else {
        await mobilitySliderService.create({ ...base, file });
      }
      await load(page);
      setOpen(false);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir mobility slider "${it.name}"?`)) return;
    try { await mobilitySliderService.remove(it._id); await load(page); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const openNew = () => {
    setSelected(null);
    setForm({ franchise: '', name: '', impressions: '', destinationurl: '', target: 'passenger', image: '', status: true });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      franchise: it.franchise?._id || it.franchise || '',
      name: it.name || '',
      impressions: it.impressions || '',
      destinationurl: it.destinationurl || '',
      target: it.target || 'passenger',
      image: Array.isArray(it.image) ? it.image[0] || '' : it.image || '',
      status: it.status !== false,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    { key: 'image', title: 'Imagem', render: (v) => (v && v[0]) ? <img src={v[0]} alt="slider" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} /> : '-' },
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'franchise', title: 'Franquia', render: (v) => (v && v.name) || '-' },
    { key: 'impressions', title: 'Impressões', render: (v) => v || '-' },
    { key: 'destinationurl', title: 'URL Destino', render: (v) => v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : '-' },
    { key: 'target', title: 'Target', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><Image size={20} style={{ marginRight: '0.5rem' }} />Mobility Sliders</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => load(page)}><RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Atualizar</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhum mobility slider" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}><ChevronLeft size={16} />Prev</button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>Próximo<ChevronRight size={16} /></button>
      </div>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Mobility Slider' : 'Novo Mobility Slider'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Franquia *</label><select name="franchise" value={form.franchise} onChange={change} required><option value="">Selecione...</option>{franchises.map((f) => (<option key={f._id} value={f._id}>{f.name}</option>))}</select></div>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label>Impressões *</label><input type="text" name="impressions" value={form.impressions} onChange={change} required /></div>
              <div className="form-group"><label>URL Destino *</label><input type="text" name="destinationurl" value={form.destinationurl} onChange={change} required /></div>
              <div className="form-group"><label>Target *</label><select name="target" value={form.target} onChange={change} required><option value="passenger">Passenger</option><option value="driver">Driver</option></select></div>
              <div className="form-group"><label>Imagem (URL) *</label><input type="text" name="image" value={form.image} onChange={change} />
                {form.image && <img src={form.image} alt="preview" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem', display: 'block' }} />}
              </div>
              <div className="form-group"><label><input type="checkbox" name="status" checked={form.status} onChange={change} /> Ativo</label></div>
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

export default mobilitySliders;
