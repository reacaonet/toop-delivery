import React, { useState, useEffect } from 'react';
import { Ticket, Plus, X } from 'lucide-react';
import { voucherService, franchiseService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Vouchers = () => {
  const [items, setItems] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [franchise, setFranchise] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', value: '', limit: 1, dateInit: '', dateFinish: '', franchise: '', status: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    franchiseService.getFranchises().then((res) => {
      const list = extractList(res);
      setFranchises(list);
      if (list.length > 0) setFranchise(list[0]._id);
    }).catch(console.error);
  }, []);

  const load = async (f = franchise) => {
    setLoading(true);
    try {
      if (!f) { setItems(extractList({})); setLoading(false); return; }
      const res = await voucherService.paginator({ pageIn: 0, pageOut: 100, franchise: f });
      setItems(extractList(res));
    } catch (e) { console.error(e); setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { if (franchise) load(franchise); }, [franchise]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        name: form.name, code: form.code,
        value: Number(form.value), limit: Number(form.limit),
        dateInit: form.dateInit, dateFinish: form.dateFinish,
        franchise: form.franchise, status: form.status,
      };
      if (selected) await voucherService.update(selected._id, payload);
      else await voucherService.create(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => { if (!window.confirm('Excluir voucher?')) return; try { await voucherService.remove(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };

  const cols = [
    { key: 'code', title: 'Código', render: (v) => <b>{v || '-'}</b> },
    { key: 'name', title: 'Nome', render: (v) => v || '-' },
    { key: 'value', title: 'Valor', render: (v) => v != null ? `R$ ${Number(v).toFixed(2)}` : '-' },
    { key: 'limit', title: 'Limite', render: (v) => v ?? '-' },
    { key: 'dateInit', title: 'Início', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-' },
    { key: 'dateFinish', title: 'Fim', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Ticket size={20} style={{ marginRight: '0.5rem' }} />Vouchers</h3>
          <select value={franchise} onChange={(e) => setFranchise(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
            <option value="">Selecione a Franquia</option>
            {franchises.map((f) => <option key={f._id} value={f._id}>{f.name || f.socialName || f._id}</option>)}
          </select>
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
            <h4>Vouchers de crédito</h4>
            <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', code: '', value: '', limit: 1, dateInit: '', dateFinish: '', franchise, status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Voucher</button>
          </div>
          <DataTable data={items} columns={cols} onEdit={(it) => { setSelected(it); setForm({ name: it.name || '', code: it.code || '', value: it.value ?? '', limit: it.limit ?? 1, dateInit: it.dateInit ? String(it.dateInit).slice(0, 10) : '', dateFinish: it.dateFinish ? String(it.dateFinish).slice(0, 10) : '', franchise: franchise, status: it.status !== false }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage={franchise ? 'Nenhum voucher nesta franquia' : 'Selecione uma franquia'} />
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Voucher' : 'Novo Voucher'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome</label><input type="text" name="name" value={form.name} onChange={change} /></div>
              <div className="form-group"><label>Código *</label><input type="text" name="code" value={form.code} onChange={change} required /></div>
              <div className="form-group"><label>Valor (R$) *</label><input type="number" name="value" value={form.value} onChange={change} step="any" required /></div>
              <div className="form-group"><label>Limite de uso *</label><input type="number" name="limit" value={form.limit} onChange={change} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Vigência início *</label><input type="date" name="dateInit" value={form.dateInit} onChange={change} required /></div>
                <div className="form-group"><label>Vigência fim *</label><input type="date" name="dateFinish" value={form.dateFinish} onChange={change} required /></div>
              </div>
              <div className="form-group"><label>Franquia *</label>
                <select name="franchise" value={form.franchise} onChange={change} required>
                  <option value="">Selecione</option>
                  {franchises.map((f) => <option key={f._id} value={f._id}>{f.name || f.socialName || f._id}</option>)}
                </select>
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

export default Vouchers;
