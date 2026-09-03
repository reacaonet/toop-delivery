import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Smartphone } from 'lucide-react';
import { marketingService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Marketing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', disseminationVehicle: 'app', initialDate: '', finalDate: '', downloadAndroid: 0, downloadIos: 0, note: '', image: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const res = await marketingService.listCampaigns({ page: 1, limit: 100 }); setItems(extractList(res)); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openCreate = () => { setSelected(null); setForm({ name: '', disseminationVehicle: 'app', initialDate: '', finalDate: '', downloadAndroid: 0, downloadIos: 0, note: '', image: '' }); setOpen(true); };
  const openEdit = (it) => { setSelected(it); setForm({ name: it.name || '', disseminationVehicle: it.disseminationVehicle || 'app', initialDate: it.initialDate ? String(it.initialDate).slice(0, 10) : '', finalDate: it.finalDate ? String(it.finalDate).slice(0, 10) : '', downloadAndroid: it.downloadAndroid ?? 0, downloadIos: it.downloadIos ?? 0, note: it.note || '', image: (it.image && it.image.length ? it.image[0] : '') }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        name: form.name, disseminationVehicle: form.disseminationVehicle,
        initialDate: form.initialDate ? new Date(form.initialDate).toISOString() : undefined,
        finalDate: form.finalDate ? new Date(form.finalDate).toISOString() : undefined,
        downloadAndroid: Number(form.downloadAndroid) || 0,
        downloadIos: Number(form.downloadIos) || 0,
        note: form.note,
        image: form.image ? [form.image] : [],
      };
      if (selected) await marketingService.updateCampaign(selected._id, payload);
      else await marketingService.createCampaign(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
  };

  const remove = async (it) => { if (!window.confirm(`Excluir campanha "${it.name}"?`)) return; try { await marketingService.deleteCampaign(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'disseminationVehicle', title: 'Veículo', render: (v) => v || '-' },
    { key: 'initialDate', title: 'Início', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-' },
    { key: 'finalDate', title: 'Fim', render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-' },
    { key: 'downloadAndroid', title: 'Downloads Android', render: (v) => v ?? 0 },
    { key: 'downloadIos', title: 'Downloads iOS', render: (v) => v ?? 0 },
    { key: 'note', title: 'Observação', render: (v) => (v && String(v).length > 40 ? String(v).slice(0, 40) + '…' : v) || '-' },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Megaphone size={20} style={{ marginRight: '0.5rem' }} />Marketing</h3>
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
            <h4>Campanhas</h4>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Campanha</button>
          </div>
          <DataTable data={items} columns={cols} onEdit={openEdit} onDelete={remove} loading={loading} emptyMessage="Nenhuma campanha" />
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Campanha' : 'Nova Campanha'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Veículo de divulgação *</label>
                  <select name="disseminationVehicle" value={form.disseminationVehicle} onChange={change}>
                    <option value="app"><Smartphone size={12} /> App</option>
                    <option value="sms">SMS</option>
                    <option value="email">E-mail</option>
                    <option value="social">Redes Sociais</option>
                  </select>
                </div>
                <div className="form-group"><label>Data início *</label><input type="date" name="initialDate" value={form.initialDate} onChange={change} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Data fim *</label><input type="date" name="finalDate" value={form.finalDate} onChange={change} required /></div>
                <div className="form-group"><label>Nota *</label><input type="text" name="note" value={form.note} onChange={change} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Downloads Android *</label><input type="number" name="downloadAndroid" value={form.downloadAndroid} onChange={change} /></div>
                <div className="form-group"><label>Downloads iOS *</label><input type="number" name="downloadIos" value={form.downloadIos} onChange={change} /></div>
              </div>
              <div className="form-group"><label>Imagem (URL)</label><input type="text" name="image" value={form.image} onChange={change} /></div>
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

export default Marketing;
