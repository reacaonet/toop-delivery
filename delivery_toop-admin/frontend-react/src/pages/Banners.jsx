import React, { useState, useEffect } from 'react';
import { Plus, Image } from 'lucide-react';
import { bannerService } from '../services/api';
import DataTable from '../components/DataTable';
import BannerModal from '../components/BannerModal';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await bannerService.getBanners();
      setBanners(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) { console.error('Erro ao carregar banners:', e);
    } finally { setLoading(false); }
  };

  const handleCreate = () => { setSelected(null); setModalOpen(true); };
  const handleEdit = (item) => { setSelected(item); setModalOpen(true); };
  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir banner "${item.title}"?`)) return;
    try { await bannerService.deleteBanner(item._id); loadData(); }
    catch (e) { alert('Erro ao excluir: ' + (e.response?.data?.error || e.message)); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  const columns = [
    { key: 'title', title: 'Título', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Image size={16} color="#667eea" /> {val}
      </div>
    )},
    { key: 'subtitle', title: 'Subtítulo', render: (val) => val || '-' },
    { key: 'order', title: 'Ordem', render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span> },
    { key: 'image', title: 'Imagem', render: (val) => val ? (
      <img src={val} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
    ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Sem imagem</span> },
    { key: 'startDate', title: 'Início', render: (val) => formatDate(val) },
    { key: 'endDate', title: 'Fim', render: (val) => formatDate(val) },
    { key: 'active', title: 'Status', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>{val ? 'Ativo' : 'Inativo'}</span>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Image size={20} style={{ marginRight: '0.5rem' }} />Banners / Promoções</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Banner
          </button>
        </div>
        <DataTable data={banners} columns={columns} onEdit={handleEdit} onDelete={handleDelete} loading={loading} emptyMessage="Nenhum banner encontrado" />
      </div>
      <BannerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} banner={selected} onSave={loadData} />
    </div>
  );
};

export default Banners;
