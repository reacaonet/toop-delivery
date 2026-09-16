import React, { useState, useEffect } from 'react';
import { Plus, Car, X, Save, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { vehicleCategoryRuleService } from '../services/api';
import DataTable from '../components/DataTable';

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
  const [allRules, setAllRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [testForm, setTestForm] = useState({ brand: '', model: '', year: '' });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await vehicleCategoryRuleService.getRules();
      setAllRules(Array.isArray(data?.rules) ? data.rules : []);
    } catch (e) { console.error('Erro ao carregar regras:', e);
    } finally { setLoading(false); }
  };

  const sorted = [...allRules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const filtered = filterCat === 'all' ? sorted : sorted.filter((r) => r.category === filterCat);

  const handleCreate = () => {
    setSelected(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setForm({
      brand: item.brand || '',
      model: item.model || '',
      yearMin: item.yearMin ?? '',
      yearMax: item.yearMax ?? '',
      category: item.category || 'car_basic',
      active: item.active !== false,
    });
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir regra para ${item.brand || 'qualquer marca'} ${item.model || ''}?`)) return;
    try { await vehicleCategoryRuleService.remove(item._id); loadData(); }
    catch (e) { alert('Erro: ' + (e.response?.data?.error || e.message)); }
  };

  const handleToggleActive = async (item) => {
    try { await vehicleCategoryRuleService.update(item._id, { ...item, active: !item.active }); loadData(); }
    catch (e) { console.error('Falha ao alternar regra:', e); }
  };

  const handleMove = async (item, dir) => {
    const idx = sorted.findIndex((r) => r._id === item._id);
    const target = dir === 'up' ? sorted[idx - 1] : sorted[idx + 1];
    if (!target) return;
    try {
      const aOrder = item.order ?? idx;
      const bOrder = target.order ?? idx;
      await vehicleCategoryRuleService.update(item._id, { ...item, order: bOrder });
      await vehicleCategoryRuleService.update(target._id, { ...target, order: aOrder });
      loadData();
    } catch (e) { console.error('Falha ao reordenar:', e); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return;
    setSaving(true);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        yearMin: form.yearMin === '' ? null : Number(form.yearMin),
        yearMax: form.yearMax === '' ? null : Number(form.yearMax),
        category: form.category,
        active: form.active,
      };
      if (selected) await vehicleCategoryRuleService.update(selected._id, payload);
      else await vehicleCategoryRuleService.create(payload);
      loadData();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally { setSaving(false); }
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

  const columns = [
    { key: 'brand', title: 'Marca', render: (val) => <strong>{val || 'Qualquer'}</strong> },
    { key: 'model', title: 'Modelo', render: (val) => val || 'Qualquer' },
    { key: 'year', title: 'Anos', render: (_val, item) => `${item.yearMin ?? '—'} a ${item.yearMax ?? '—'}` },
    { key: 'category', title: 'Categoria', render: (val) => {
      const meta = CATEGORY_STYLE[val] || {};
      return <span className={`status-badge ${val === 'car_basic' ? 'status-active' : val === 'car_black' ? 'status-inactive' : 'status-info'}`}>{meta.label || val}</span>;
    }},
    { key: 'order', title: 'Ordem', render: (val, item) => {
      const idx = filtered.findIndex((r) => r._id === item._id);
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <button className="btn btn-secondary" title="Mover para cima" onClick={() => handleMove(item, 'up')} disabled={idx <= 0} style={{ padding: '0.25rem', display: 'flex' }}>
            <ChevronUp size={14} />
          </button>
          <span style={{ minWidth: '1.2rem', textAlign: 'center' }}>{item.order ?? idx}</span>
          <button className="btn btn-secondary" title="Mover para baixo" onClick={() => handleMove(item, 'down')} disabled={idx === filtered.length - 1} style={{ padding: '0.25rem', display: 'flex' }}>
            <ChevronDown size={14} />
          </button>
        </span>
      );
    }},
    { key: 'active', title: 'Status', render: (val, item) => (
      <button className="btn btn-secondary" title={item.active === false ? 'Ativar regra' : 'Desativar regra'} onClick={() => handleToggleActive(item)} style={{ padding: '0.5rem' }}>
        {item.active === false ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Regras de Classificação de Veículo</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}>
                <option value="all">Todas categorias</option>
                {Object.entries(CATEGORY_STYLE).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Regra
            </button>
          </div>
        </div>
        <DataTable data={filtered} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma regra encontrada" />
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Total de regras: <strong>{allRules.length}</strong> ({allRules.filter((r) => r.active !== false).length} ativas) — ordem de avaliação: primeira que bater define a categoria.
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Regra' : 'Nova Regra'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="ex: chevrolet (vazio = qualquer)" />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="ex: onix (vazio = qualquer)" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Ano Mínimo</label>
                  <input type="number" name="yearMin" value={form.yearMin} onChange={handleChange} placeholder="ex: 2023" />
                </div>
                <div className="form-group">
                  <label>Ano Máximo</label>
                  <input type="number" name="yearMax" value={form.yearMax} onChange={handleChange} placeholder="ex: 2026" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Categoria *</label>
                  <select name="category" value={form.category} onChange={handleChange} required>
                    {Object.entries(CATEGORY_STYLE).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> {' '}Ativa</label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Save size={16} style={{ marginRight: '0.5rem' }} />Salvar</>}
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
                {testResult.label || testResult.code}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCategoryRules;