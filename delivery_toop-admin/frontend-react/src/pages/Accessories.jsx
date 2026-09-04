import React, { useState, useEffect } from 'react';
import { Package, Tags, Plus, X, Store, ChevronDown } from 'lucide-react';
import { accessoriesService, companyService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.products)) return res.products;
  if (Array.isArray(res.categories)) return res.categories;
  return [];
};

const Accessories = () => {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('');
  const [tab, setTab] = useState('categorias');

  useEffect(() => {
    companyService.getCompanies().then((res) => {
      const list = extractList(res); setCompanies(list);
      if (list.length && !company) setCompany(list[0]?._id || '');
    }).catch(console.error);
  }, []);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Store size={20} style={{ marginRight: '0.5rem' }} />Acessórios (Loja não-food)</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Empresa</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '220px' }}>
              {!company && <option value="">Selecione...</option>}
              {companies.map((c) => <option key={c._id} value={c._id}>{c.legalName || c.socialName || c.name || c._id}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {[{ key: 'categorias', label: 'Categorias', icon: Tags }, { key: 'produtos', label: 'Produtos', icon: Package }].map((t) => {
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
          {!company ? <p style={{ color: '#6b7280' }}>Selecione uma empresa para carregar os acessórios.</p> : (
            <>
              {tab === 'categorias' && <CategoriesTab company={company} />}
              {tab === 'produtos' && <ProductsTab company={company} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CategoriesTab = ({ company }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', isPaused: false, position: 1 });

  const load = () => accessoriesService.categoryByCompany(company).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [company]);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, company, isPaused: form.isPaused, position: Number(form.position || 1) };
      if (selected) await accessoriesService.updateCategory({ ...payload, _id: selected._id });
      else await accessoriesService.createCategory(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const remove = async (it) => {
    if (!window.confirm(`Excluir categoria "${it.name}"?`)) return;
    try { await accessoriesService.deleteCategory(it._id); load(); } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'position', title: 'Posição', render: (v) => v ?? '1' },
    { key: 'isPaused', title: 'Pausado', render: (v) => <span style={{ fontWeight: 700, color: v ? '#ef4444' : '#10b981' }}>{v ? 'Sim' : 'Não'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Categorias</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', isPaused: false, position: 1 }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Nova</button>
      </div>
      <DataTable data={items} columns={cols} loading={loading}
        onEdit={(it) => { setSelected(it); setForm({ name: it.name, isPaused: it.isPaused, position: it.position }); setOpen(true); }}
        emptyMessage="Nenhuma categoria" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Categoria' : 'Nova Categoria'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-group"><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label>Posição</label><input type="number" name="position" value={form.position} onChange={change} /></div>
              <div className="form-group"><label><input type="checkbox" name="isPaused" checked={form.isPaused} onChange={change} /> Pausado</label></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductsTab = ({ company }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', shortDescription: '', price: '', pricePromotion: '', percentualDiscount: '', codPdv: '', isPaused: false, position: 1, amountPeople: 'ONE', images: '' });
  const [compOpen, setCompOpen] = useState(false);
  const [compItem, setCompItem] = useState(null);

  useEffect(() => { accessoriesService.categoryByCompany(company).then((res) => setCategories(extractList(res))).catch(console.error); }, [company]);

  const load = () => accessoriesService.listProducts({ company }).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [company]);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const catName = (id) => { const c = categories.find((x) => x._id === id); return c ? c.name : id; };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name, category: form.category || undefined, company,
        description: form.description, shortDescription: form.shortDescription,
        price: Number(form.price), pricePromotion: form.pricePromotion ? Number(form.pricePromotion) : undefined,
        percentualDiscount: form.percentualDiscount ? Number(form.percentualDiscount) : undefined,
        codPdv: form.codPdv, isPaused: form.isPaused, position: Number(form.position || 1), amountPeople: form.amountPeople,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (selected) await accessoriesService.updateProduct(selected._id, payload);
      else await accessoriesService.createProduct(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'category', title: 'Categoria', render: (v) => catName(v) },
    { key: 'price', title: 'Preço', render: (v) => v != null ? `R$ ${Number(v).toFixed(2)}` : '-' },
    { key: 'pricePromotion', title: 'Promoção', render: (v) => (v != null ? `R$ ${Number(v).toFixed(2)}` : '-') },
    { key: 'amountPeople', title: 'Pessoas', render: (v) => v || 'ONE' },
    { key: 'isPaused', title: 'Pausado', render: (v) => <span style={{ fontWeight: 700, color: v ? '#ef4444' : '#10b981' }}>{v ? 'Sim' : 'Não'}</span> },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Produtos</h4>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setForm({ name: '', category: '', description: '', shortDescription: '', price: '', pricePromotion: '', percentualDiscount: '', codPdv: '', isPaused: false, position: 1, amountPeople: 'ONE', images: '' }); setOpen(true); }}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo</button>
      </div>
      <DataTable data={items} columns={cols} loading={loading}
        onEdit={(it) => { setSelected(it); setForm({ name: it.name, category: it.category?._id || it.category || '', description: it.description || '', shortDescription: it.shortDescription || '', price: it.price, pricePromotion: it.pricePromotion || '', percentualDiscount: it.percentualDiscount || '', codPdv: it.codPdv || '', isPaused: it.isPaused, position: it.position, amountPeople: it.amountPeople || 'ONE', images: (it.images || []).join(', ') }); setOpen(true); }}
        onView={(it) => { setCompItem(it); setCompOpen(true); }}
        emptyMessage="Nenhum produto" />
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selected ? 'Editar Produto' : 'Novo Produto'}</h3><button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button></div>
            <form onSubmit={save}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}><label>Nome *</label><input type="text" name="name" value={form.name} onChange={change} required /></div>
                <div className="form-group"><label>Categoria *</label>
                  <select name="category" value={form.category} onChange={change} required>
                    <option value="">Selecione...</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Pessoas *</label>
                  <select name="amountPeople" value={form.amountPeople} onChange={change}>
                    {['ONE', 'TWO', 'THREE', 'FOUR'].map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Preço *</label><input type="number" step="0.01" name="price" value={form.price} onChange={change} required /></div>
                <div className="form-group"><label>Preço promoção</label><input type="number" step="0.01" name="pricePromotion" value={form.pricePromotion} onChange={change} /></div>
                <div className="form-group"><label>% Desconto</label><input type="number" step="0.01" name="percentualDiscount" value={form.percentualDiscount} onChange={change} /></div>
                <div className="form-group"><label>Cód. PDV</label><input type="text" name="codPdv" value={form.codPdv} onChange={change} /></div>
              </div>
              <div className="form-group"><label>Descrição</label><input type="text" name="description" value={form.description} onChange={change} /></div>
              <div className="form-group"><label>Descrição curta</label><input type="text" name="shortDescription" value={form.shortDescription} onChange={change} /></div>
              <div className="form-group"><label>Imagens (URLs vírgula)</label><input type="text" name="images" value={form.images} onChange={change} /></div>
              <div className="form-row">
                <div className="form-group"><label>Posição</label><input type="number" name="position" value={form.position} onChange={change} /></div>
                <div className="form-group"><label><input type="checkbox" name="isPaused" checked={form.isPaused} onChange={change} /> Pausado</label></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {compOpen && compItem && <ComplementsModal product={compItem} company={company} onClose={() => setCompOpen(false)} />}
    </div>
  );
};

const ComplementsModal = ({ product, company, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => accessoriesService.complementsByProduct(product._id).then((res) => setItems(extractList(res))).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [product]);

  const create = async () => {
    const name = window.prompt('Nome do complemento:'); if (!name) return;
    const amountMax = Number(window.prompt('Quantidade máx:')); if (isNaN(amountMax)) return;
    const amountMin = Number(window.prompt('Quantidade mín:')); if (isNaN(amountMin)) return;
    const isRequired = window.confirm('É obrigatório?');
    try {
      await accessoriesService.complementCreate && accessoriesService.complementCreate({ name, amountMax, amountMin, isRequired, product: product._id, company });
      load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{v}</b> },
    { key: 'amountMin', title: 'Mín', render: (v) => v },
    { key: 'amountMax', title: 'Máx', render: (v) => v },
    { key: 'isRequired', title: 'Obrigatório', render: (v) => v ? 'Sim' : 'Não' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Complementos — {product.name}</h3><button className="close-btn" onClick={onClose}><X size={24} /></button></div>
        <div style={{ padding: '0 0 1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={create}><Plus size={14} style={{ marginRight: '0.3rem' }} />Novo complemento</button>
        </div>
        <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhum complemento" />
      </div>
    </div>
  );
};

export default Accessories;