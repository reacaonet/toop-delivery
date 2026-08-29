import React, { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import { productService } from '../services/api';
import DataTable from '../components/DataTable';
import ProductModal from '../components/ProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) { console.error('Erro ao carregar produtos:', e);
    } finally { setLoading(false); }
  };

  const handleCreate = () => { setSelected(null); setModalOpen(true); };
  const handleEdit = (item) => { setSelected(item); setModalOpen(true); };
  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir produto "${item.name}"?`)) return;
    try { await productService.deleteProduct(item._id); loadData(); }
    catch (e) { alert('Erro ao excluir: ' + (e.response?.data?.error || e.message)); }
  };

  const formatPrice = (v) => v != null ? `R$ ${Number(v).toFixed(2)}` : '-';

  const columns = [
    { key: 'name', title: 'Nome', render: (name) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Package size={16} color="#667eea" /> {name}
      </div>
    )},
    { key: 'category', title: 'Categoria', render: (cat) => cat?.name || '-' },
    { key: 'price', title: 'Preço', render: (val) => (
      <span style={{ fontWeight: 600, color: '#10b981' }}>{formatPrice(val)}</span>
    )},
    { key: 'promoPrice', title: 'Promo', render: (val) => val ? (
      <span style={{ fontWeight: 600, color: '#ef4444', textDecoration: 'line-through' }}>{formatPrice(val)}</span>
    ) : '-' },
    { key: 'image', title: 'Imagem', render: (val) => val ? (
      <img src={val} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
    ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Sem imagem</span> },
    { key: 'active', title: 'Status', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>{val ? 'Ativo' : 'Inativo'}</span>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Package size={20} style={{ marginRight: '0.5rem' }} />Produtos</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Produto
          </button>
        </div>
        <DataTable data={products} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhum produto encontrado" />
      </div>
      <ProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} product={selected} onSave={loadData} />
    </div>
  );
};

export default Products;
