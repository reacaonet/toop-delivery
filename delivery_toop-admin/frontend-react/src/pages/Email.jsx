import React, { useState, useEffect } from 'react';
import { Mail, Plus, X, Tags, FileText, Braces } from 'lucide-react';
import { emailService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const Email = () => {
  const [tab, setTab] = useState('types');
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Mail size={20} style={{ marginRight: '0.5rem' }} />E-mails</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {[{ key: 'types', label: 'Tipos', icon: Tags }, { key: 'templates', label: 'Templates', icon: FileText }, { key: 'variables', label: 'Variáveis', icon: Braces }].map((t) => {
            const Icon = t.icon; const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', cursor: 'pointer',
                borderRadius: '8px', border: active ? '1px solid #10b981' : '1px solid transparent',
                background: active ? '#ecfdf5' : 'transparent', color: active ? '#047857' : '#4b5563',
                fontWeight: active ? 700 : 500, fontSize: '0.85rem',
              }}><Icon size={16} />{t.label}</button>
            );
          })}
        </div>
        <div style={{ padding: '1rem' }}>
          {tab === 'types' && <TypesTab {...{ setEdit, setForm, setOpen }} />}
          {tab === 'templates' && <TemplatesTab {...{ setEdit, setForm, setOpen }} />}
          {tab === 'variables' && <VariablesTab />}
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{tab === 'types' ? (edit ? 'Editar Tipo' : 'Novo Tipo') : (edit ? 'Editar Template' : 'Novo Template')}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault(); setSaving(true);
              try {
                if (tab === 'types') { if (edit) await emailService.updateType(edit._id, { key: form.key, name: form.name, status: form.status }); else await emailService.createType({ key: form.key, name: form.name, status: form.status }); }
                else { const payload = { subject: form.subject, body: form.body, type: form.type, status: form.status }; if (edit) await emailService.updateTemplate(edit._id, payload); else await emailService.createTemplate(payload); }
                setOpen(false); setEdit(null);
              } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setSaving(false); }
            }}>
              {tab === 'types' ? (
                <>
                  <div className="form-group"><label>Chave (key) *</label><input type="text" name="key" value={form.key || ''} onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))} required placeholder="ex: welcome, order_confirmation" /></div>
                  <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
                </>
              ) : (
                <>
                  <div className="form-group"><label>Assunto *</label><input type="text" name="subject" value={form.subject || ''} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required /></div>
                  <div className="form-group"><label>Conteúdo (HTML) *</label><textarea name="body" value={form.body || ''} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={8} required /></div>
                  <div className="form-group"><label>Tipo *</label><input type="text" name="type" value={form.type || ''} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} placeholder="ID do tipo de e-mail" required /></div>
                </>
              )}
              <div className="form-group"><label><input type="checkbox" checked={form.status !== false} onChange={(e) => setForm((p) => ({ ...p, status: e.target.checked }))} /> Ativo</label></div>
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

const TypesTab = ({ setEdit, setForm, setOpen }) => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => emailService.listTypes({ page: 1, limit: 100 }).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (it) => { if (!window.confirm(`Excluir tipo "${it.name}"?`)) return; try { await emailService.deleteType(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };
  const cols = [
    { key: 'key', title: 'Chave', render: (v) => <b>{v}</b> },
    { key: 'name', title: 'Nome', render: (v) => v || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Tipos de E-mail</h4>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ key: '', name: '', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setEdit(it); setForm({ key: it.key, name: it.name, status: it.status !== false }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum tipo" />
    </div>
  );
};

const TemplatesTab = ({ setEdit, setForm, setOpen }) => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const load = () => emailService.listTemplates({ page: 1, limit: 100 }).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (it) => { if (!window.confirm('Excluir template?')) return; try { await emailService.deleteTemplate(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } };
  const cols = [
    { key: 'subject', title: 'Assunto', render: (v) => <b>{v}</b> },
    { key: 'type', title: 'Tipo', render: (v) => (v && typeof v === 'object' ? (v.name || v.key || v._id) : v) || '-' },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Templates de E-mail</h4>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ subject: '', body: '', type: '', status: true }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} onEdit={(it) => { setEdit(it); setForm({ subject: it.subject || '', body: it.body || '', type: it.type?._id || it.type || '', status: it.status !== false }); setOpen(true); }} onDelete={remove} loading={loading} emptyMessage="Nenhum template" />
    </div>
  );
};

const VariablesTab = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { emailService.listVariables().then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false)); }, []);
  const cols = [
    { key: 'name', title: 'Name', render: (v) => <b>{v}</b> },
    { key: 'title', title: 'Título', render: (v) => v || '-' },
  ];
  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}><h4>Variáveis disponíveis</h4></div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma variável" />
    </div>
  );
};

export default Email;
