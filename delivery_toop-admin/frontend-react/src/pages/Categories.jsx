import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import CategoryModal from '../components/CategoryModal';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/categories');
      const data = res.data?.data ?? res.data;
      setCategories(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) { console.error('Erro ao carregar categorias:', e);
    } finally { setLoading(false); }
  };

  const handleCreate = () => { setSelected(null); setModalOpen(true); };
  const handleEdit = (item) => { setSelected(item); setModalOpen(true); };
  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir categoria "${item.name}"?`)) return;
    try { await api.delete(`/categories/${item._id}`); loadData(); }
    catch (e) { alert('Erro ao excluir: ' + (e.response?.data?.error || e.message)); }
  };

  const columns = [
    { key: 'name', title: 'Nome', render: (name) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Tag size={16} color="#667eea" /> {name}
      </div>
    )},
    { key: 'description', title: 'Descrição', render: (val) => val || '-' },
    { key: 'order', title: 'Ordem', render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span> },
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
          <h3><Tag size={20} style={{ marginRight: '0.5rem' }} />Categorias</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Nova Categoria
          </button>
        </div>
        <DataTable data={categories} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhuma categoria encontrada" />
      </div>
      <CategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} category={selected} onSave={loadData} />
    </div>
  );
};

export default Categories;
