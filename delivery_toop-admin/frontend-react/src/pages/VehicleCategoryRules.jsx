import React, { useState, useEffect } from 'react';
import { Car, Search, Plus, Pencil, Trash2, X, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { vehicleCategoryRuleService } from '../services/api';

const CATEGORY_STYLE = {
  car_basic: { color: '#6b7280', label: 'Básico' },
  car_comfort: { color: '#667eea', label: 'Confort' },
  car_black: { color: '#111827', label: 'Black' },
  moto_basic: { color: '#059669', label: 'Moto Básica' },
  moto_comfort: { color: '#d97706', label: 'Moto Confort' },
  moto_black: { color: '#111827', label: 'Moto Black' },
  taxi: { color: '#dc2626', label: 'Táxi' },
};

const EMPTY_FORM = { brand: '', model: '', yearMin: '', yearMax: '', category: 'car_basic', active: true };

const VehicleCategoryRules = () => {
  const [rules, setRules] = useState([]);
  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [testForm, setTestForm] = useState({ brand: '', model: '', year: '' });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await vehicleCategoryRuleService.getRules();
      setRules(Array.isArray(data?.rules) ? data.rules : []);
      setLabels(data?.labels || {});
    } catch (e) { console.error('Erro ao carregar regras:', e);
    } finally { setLoading(false); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = rules.filter((r) => {
    if (filterCat !== 'all' && r.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.brand || ''} ${r.model || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      brand: item.brand || '',
      model: item.model || '',
      yearMin: item.yearMin ?? '',
      yearMax: item.yearMax ?? '',
      category: item.category || 'car_basic',
      active: item.active !== false,
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
  };

  const setField = (key) => (e) => {
    const v = e.target.value;
    setForm({ ...form, [key]: v === '' ? '' : v });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Selecione uma categoria.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        yearMin: form.yearMin === '' ? null : Number(form.yearMin),
        yearMax: form.yearMax === '' ? null : Number(form.yearMax),
        category: form.category,
        active: form.active,
      };
      if (editingId) await vehicleCategoryRuleService.update(editingId, payload);
      else await vehicleCategoryRuleService.create(payload);
      closeModal();
      showToast(editingId ? 'Regra atualizada!' : 'Regra criada!');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao salvar regra.');
    } finally { setSaving(false); }
  };

  const toggleActive = async (item) => {
    try {
      await vehicleCategoryRuleService.update(item._id, { ...item, active: !item.active });
      showToast(item.active ? 'Regra desativada' : 'Regra ativada');
      await loadData();
    } catch (err) { console.error('Falha ao alternar regra:', err); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Excluir regra para ${item.brand || 'qualquer marca'} ${item.model || ''}?`)) return;
    try {
      await vehicleCategoryRuleService.remove(item._id);
      showToast('Regra excluída');
      await loadData();
    } catch (err) { console.error('Falha ao excluir regra:', err); }
  };

  const move = async (item, dir) => {
    const sorted = [...rules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((r) => r._id === item._id);
    const target = dir === 'up' ? sorted[idx - 1] : sorted[idx + 1];
    if (!target) return;
    try {
      const aOrder = item.order ?? idx;
      const bOrder = target.order ?? idx;
      await vehicleCategoryRuleService.update(item._id, { ...item, order: bOrder });
      await vehicleCategoryRuleService.update(target._id, { ...target, order: aOrder });
      showToast('Ordem atualizada');
      await loadData();
    } catch (err) { console.error('Falha ao reordenar:', err); }
  };

  const runTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const result = await vehicleCategoryRuleService.classify({
        vehicleType: 'car',
        vehicleBrand: testForm.brand,
        vehicleModel: testForm.model,
        vehicleYear: testForm.year || undefined,
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({ error: err.response?.data?.error || err.message });
    } finally { setTesting(false); }
  };

  const catSelect = (
    <select value={form.category} onChange={setField('category')} required>
      {Object.entries(CATEGORY_STYLE).map(([key, meta]) => (
        <option key={key} value={key}>{meta.label}</option>
      ))}
    </select>
  );

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#16a34a', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}><Car size={20} style={{ marginRight: '0.5rem' }} />Regras de Categoria de Veículo (Classificação)</h3>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Nova Regra
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Filtrar:</label>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">Todas</option>
              {Object.entries(CATEGORY_STYLE).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Buscar marca/modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Marca</th><th>Modelo</th><th>Ano Min</th><th>Ano Max</th><th>Categoria</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /></td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Nenhuma regra encontrada</td></tr>}
              {filtered.map((item, idx) => (
                <tr key={item._id || `${item.brand}-${item.model}`} style={{ opacity: item.active === false ? 0.5 : 1 }}>
                  <td style={{ color: '#9ca3af' }}>{idx + 1}</td>
                  <td><strong>{item.brand || '—'}</strong></td>
                  <td>{item.model || '—'}</td>
                  <td>{item.yearMin ?? '—'}</td>
                  <td>{item.yearMax ?? '—'}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: `${(CATEGORY_STYLE[item.category] || {}).color || '#6b7280'}22`, color: (CATEGORY_STYLE[item.category] || {}).color || '#6b7280', fontWeight: 700 }}>
                      {item.category === 'taxi' ? 'Táxi' : (CATEGORY_STYLE[item.category] || {}).label || item.category}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      title={item.active === false ? 'Regra inativa (ativar)' : 'Regra ativa (desativar)'}
                      onClick={() => toggleActive(item)}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      {item.active === false ? <EyeOff size={15} /> : <Eye size={15} style={{ color: '#16a34a' }} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button className="btn" title="Mover para cima" onClick={() => move(item, 'up')} disabled={idx === 0} style={{ padding: '0.15rem 0.4rem', lineHeight: 1 }}>
                          <ChevronUp size={13} />
                        </button>
                        <button className="btn" title="Mover para baixo" onClick={() => move(item, 'down')} disabled={idx === filtered.length - 1} style={{ padding: '0.15rem 0.4rem', lineHeight: 1 }}>
                          <ChevronDown size={13} />
                        </button>
                      </div>
                      <button className="btn" title="Editar" onClick={() => openEdit(item)} style={{ padding: '0.3rem 0.5rem' }}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn" title="Excluir" onClick={() => remove(item)} style={{ padding: '0.3rem 0.5rem', color: '#dc2626' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Total de regras: <strong>{rules.length}</strong> ({rules.filter((r) => r.active !== false).length} ativas) — ordem de avaliação = da linha 1 até a última; a primeira que bater define a categoria. Regras inativas não valem na classificação.
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{editingId ? 'Editar Regra' : 'Nova Regra'}</h3>
              <button className="btn" onClick={closeModal} style={{ padding: '0.3rem 0.5rem' }}><X size={16} /></button>
            </div>
            <form onSubmit={submit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Marca</label>
                <input type="text" placeholder="ex: chevrolet (ou 'any' p/ qualquer)" value={form.brand} onChange={setField('brand')} />
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input type="text" placeholder="ex: onix (opcional)" value={form.model} onChange={setField('model')} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ano Mínimo</label>
                  <input type="number" placeholder="ex: 2023" value={form.yearMin} onChange={setField('yearMin')} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ano Máximo</label>
                  <input type="number" placeholder="ex: 2026" value={form.yearMax} onChange={setField('yearMax')} />
                </div>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                {catSelect}
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} id="rule-active" />
                <label htmlFor="rule-active" style={{ margin: 0 }}>Regra ativa</label>
              </div>
              {error && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : editingId ? 'Salvar Alterações' : 'Criar Regra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h3>Testar Classificação</h3></div>
        <form onSubmit={runTest} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Marca</label>
            <input type="text" placeholder="ex: chevrolet" value={testForm.brand} onChange={(e) => setTestForm({ ...testForm, brand: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Modelo</label>
            <input type="text" placeholder="ex: onix" value={testForm.model} onChange={(e) => setTestForm({ ...testForm, model: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Ano</label>
            <input type="number" placeholder="ex: 2020" value={testForm.year} onChange={(e) => setTestForm({ ...testForm, year: e.target.value })} style={{ width: '110px' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={testing}>
            {testing ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Classificar'}
          </button>
        </form>
        {testResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', background: testResult.error ? '#fef2f2' : '#f0fdf4', border: `1px solid ${testResult.error ? '#fecaca' : '#bbf7d0'}` }}>
            {testResult.error ? (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Erro: {testResult.error}</span>
            ) : (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>
                {labels[testResult.code] || testResult.label || testResult.code}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCategoryRules;