import React, { useState, useEffect } from 'react';
import { Image, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageBankService, packingService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.lista)) return res.lista;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const PAGE_SIZE = 10;

const ImageBank = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [packings, setPackings] = useState([]);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('barcode');
  const [form, setForm] = useState({
    barcode: '',
    productName: '',
    productAccent: '',
    brand: '',
    packing: '',
    packingAmount: '',
    keywords: '',
    description: '',
    category: '',
    imageUrl: '',
    status: true,
  });

  const load = (pg = page, query = search, type = searchType) => {
    setLoading(true);
    const pgSize = PAGE_SIZE;
    const searchVal = query.trim() || 'null';
    let promise;
    if (type === 'barcode') {
      promise = imageBankService.listByBarcode(searchVal, pg, pgSize);
    } else if (type === 'nome') {
      promise = imageBankService.listByNome(searchVal, pg, pgSize);
    } else {
      promise = imageBankService.listByCategory(searchVal, pg, pgSize);
    }
    return promise
      .then((res) => {
        setItems(extractList(res));
        setTotal(Number(res?.numeroItens) || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    packingService.getPackings({ pageIn: 0, pageOut: 200 })
      .then((r) => setPackings(extractList(r)))
      .catch(() => {});
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        barcode: form.barcode,
        productName: form.productName,
        productAccent: form.productAccent,
        brand: form.brand,
        packing: form.packing || undefined,
        packingAmount: Number(form.packingAmount) || 0,
        keywords: form.keywords ? form.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
        description: form.description ? form.description.split(',').map((s) => s.trim()).filter(Boolean) : [],
        category: form.category ? form.category.split(',').map((s) => s.trim()).filter(Boolean) : [],
        images: form.imageUrl ? [form.imageUrl.trim()] : [],
        file: form.imageUrl ? { url: form.imageUrl.trim() } : undefined,
      };
      if (selected) {
        await imageBankService.update(selected._id, payload);
      } else {
        await imageBankService.create(payload);
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
    if (!window.confirm(`Excluir imagem "${it.productName}"?`)) return;
    try {
      await imageBankService.remove(it._id);
      await load(page);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
  };

  const openNew = () => {
    setSelected(null);
    setForm({
      barcode: '',
      productName: '',
      productAccent: '',
      brand: '',
      packing: '',
      packingAmount: '',
      keywords: '',
      description: '',
      category: '',
      imageUrl: '',
      status: true,
    });
    setOpen(true);
  };

  const openEdit = (it) => {
    setSelected(it);
    setForm({
      barcode: it.barcode || '',
      productName: it.productName || '',
      productAccent: it.productAccent || '',
      brand: it.brand || '',
      packing: it.packing?._id || it.packing || '',
      packingAmount: it.packingAmount ?? '',
      keywords: Array.isArray(it.keywords) ? it.keywords.join(', ') : '',
      description: Array.isArray(it.description) ? it.description.join(', ') : '',
      category: Array.isArray(it.category) ? it.category.join(', ') : '',
      imageUrl: Array.isArray(it.images) ? it.images[0] || '' : it.images || '',
      status: true,
    });
    setOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols = [
    {
      key: 'images',
      title: 'Imagem',
      render: (v) => {
        const url = Array.isArray(v) ? v[0] : v;
        return url ? (
          <img src={url} alt="img" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
        ) : (
          <span style={{ color: '#9ca3af' }}>-</span>
        );
      },
    },
    { key: 'barcode', title: 'Barcode' },
    { key: 'productName', title: 'Produto', render: (v) => <b>{v}</b> },
    { key: 'productAccent', title: 'Accent' },
    { key: 'brand', title: 'Marca' },
    { key: 'category', title: 'Categoria', render: (v) => (Array.isArray(v) ? v.join(', ') : v || '-') },
    { key: 'packing', title: 'Embalagem', render: (v) => (v && v.name) || '-' },
    { key: 'packingAmount', title: 'Qtd' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3><Image size={20} style={{ marginRight: '0.5rem' }} />Image Bank</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="barcode">Barcode</option>
            <option value="nome">Nome</option>
            <option value="category">Categoria</option>
          </select>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); load(0, search, searchType); } }}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          <button className="btn btn-secondary" onClick={() => { setPage(0); load(0, search, searchType); }}>
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />Buscar
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo
          </button>
        </div>
      </div>

      <DataTable
        data={items}
        columns={cols}
        onEdit={openEdit}
        onDelete={remove}
        loading={loading}
        emptyMessage="Nenhuma imagem encontrada"
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Total: {total}</span>
        <button className="btn btn-secondary" disabled={page === 0 || loading} onClick={() => { const np = page - 1; setPage(np); load(np); }}>
          <ChevronLeft size={16} />Prev
        </button>
        <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{page + 1} / {totalPages}</span>
        <button className="btn btn-secondary" disabled={page + 1 >= totalPages || loading} onClick={() => { const np = page + 1; setPage(np); load(np); }}>
          Próximo<ChevronRight size={16} />
        </button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Imagem' : 'Nova Imagem'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Barcode *</label>
                <input type="text" name="barcode" value={form.barcode} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Nome do Produto *</label>
                <input type="text" name="productName" value={form.productName} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Accent *</label>
                <input type="text" name="productAccent" value={form.productAccent} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Marca *</label>
                <input type="text" name="brand" value={form.brand} onChange={change} required />
              </div>
              <div className="form-group">
                <label>Embalagem</label>
                <select name="packing" value={form.packing} onChange={change}>
                  <option value="">Selecione...</option>
                  {packings.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Qtd Embalagem *</label>
                <input type="number" name="packingAmount" value={form.packingAmount} onChange={change} required min="0" />
              </div>
              <div className="form-group">
                <label>Categorias (separar por vírgula)</label>
                <input type="text" name="category" value={form.category} onChange={change} placeholder="ex: bebida, alcoolico" />
              </div>
              <div className="form-group">
                <label>Palavras-chave (separar por vírgula)</label>
                <input type="text" name="keywords" value={form.keywords} onChange={change} />
              </div>
              <div className="form-group">
                <label>Descrição (separar por vírgula)</label>
                <input type="text" name="description" value={form.description} onChange={change} />
              </div>
              <div className="form-group">
                <label>URL da Imagem</label>
                <input type="text" name="imageUrl" value={form.imageUrl} onChange={change} />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.5rem', display: 'block' }}
                  />
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBank;
