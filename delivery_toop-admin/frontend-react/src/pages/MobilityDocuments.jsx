import React, { useState, useEffect, useCallback } from 'react';
import { Car, FileText, CreditCard, MapPin, Plus, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { mobilityDocumentService, driverService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  if (Array.isArray(res.data?.list)) return res.data.list;
  return [];
};

const formatDate = (v) => {
  if (!v) return '-';
  try { return new Date(v).toLocaleString('pt-BR'); } catch { return v; }
};

const fmtField = (v) => (v === null || v === undefined || v === '' ? '-' : v);

const MobilityDocuments = () => {
  const [tab, setTab] = useState('vehicle');

  const tabs = [
    { key: 'vehicle', label: 'Documentos de Veículo', icon: Car },
    { key: 'payment', label: 'Formas de Pagamento', icon: CreditCard },
    { key: 'travel', label: 'Viagem (Travel Info)', icon: MapPin },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><FileText size={20} style={{ marginRight: '0.5rem' }} />Documentos de Mobilidade</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => {
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
          {tab === 'vehicle' && <VehicleDocumentsTab />}
          {tab === 'payment' && <PaymentTypesTab />}
          {tab === 'travel' && <TravelInfoTab />}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ page, total, size, onChange }) => {
  const totalPages = Math.ceil(total / size);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
      <button className="btn btn-secondary" disabled={page <= 0} onClick={() => onChange(page - 1)} style={{ padding: '0.3rem 0.5rem' }}>
        <ChevronLeft size={16} />
      </button>
      <span>{page + 1} / {totalPages} ({total} registros)</span>
      <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={{ padding: '0.3rem 0.5rem' }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const VehicleDocumentsTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const size = 20;
  const [searchDriver, setSearchDriver] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { driver: '', vehicleManufacturer: '', vehicleModel: '', vehicleNameplate: '', vehicleYear: '', vehicleColor: '' };
  const [form, setForm] = useState(emptyForm);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    driverService.getDrivers().then((res) => setDrivers(extractList(res))).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = { pageIn: page, pageOut: size, searchDriver };
    mobilityDocumentService.paginator(params)
      .then((res) => { setItems(extractList(res)); setTotal(Number(res?.total) ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, searchDriver]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [searchDriver]);

  const submitSearch = () => { setSearchDriver(searchInput); };

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openNew = () => { setSelected(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (it) => {
    setSelected(it);
    setForm({
      driver: typeof it.driver === 'object' && it.driver ? (it.driver._id || it.driver) : (it.driver || ''),
      vehicleManufacturer: it.vehicleManufacturer || '',
      vehicleModel: it.vehicleModel || '',
      vehicleNameplate: it.vehicleNameplate || '',
      vehicleYear: it.vehicleYear || '',
      vehicleColor: it.vehicleColor || '',
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        driver: form.driver,
        vehicleManufacturer: form.vehicleManufacturer,
        vehicleModel: form.vehicleModel,
        vehicleNameplate: form.vehicleNameplate,
        vehicleYear: Number(form.vehicleYear),
        vehicleColor: form.vehicleColor,
      };
      if (selected) await mobilityDocumentService.update(selected._id, payload);
      else await mobilityDocumentService.create(payload);
      load(); setOpen(false);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
    finally { setSaving(false); }
  };

  const toggleField = async (it, field, value) => {
    setToggling(it._id);
    try {
      await mobilityDocumentService.update(it._id, { [field]: value });
      load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
    finally { setToggling(null); }
  };

  const cols = [
    {
      key: 'driver', title: 'Motorista',
      render: (v) => {
        if (!v) return '-';
        const name = typeof v === 'object' ? (v.name || v._id) : v;
        const phone = typeof v === 'object' ? v.phone : null;
        const franchise = typeof v === 'object' ? v.franchise : null;
        return (
          <div>
            <b>{name}</b>
            {phone && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{phone}</div>}
            {franchise && typeof franchise === 'object' && franchise?.name && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Franquia: {franchise.name}</div>
            )}
          </div>
        );
      },
    },
    { key: 'vehicleManufacturer', title: 'Fabricante', render: (v) => fmtField(v) },
    { key: 'vehicleModel', title: 'Modelo', render: (v) => fmtField(v) },
    { key: 'vehicleNameplate', title: 'Placa', render: (v) => <b>{fmtField(v)}</b> },
    { key: 'vehicleYear', title: 'Ano', render: (v) => fmtField(v) },
    { key: 'vehicleColor', title: 'Cor', render: (v) => fmtField(v) },
    {
      key: 'approved', title: 'Aprovado',
      render: (v, it) => (
        <input
          type="checkbox"
          checked={!!v}
          disabled={toggling === it._id}
          onChange={(e) => toggleField(it, 'approved', e.target.checked)}
        />
      ),
    },
    {
      key: 'status', title: 'Status',
      render: (v, it) => (
        <input
          type="checkbox"
          checked={!!v}
          disabled={toggling === it._id}
          onChange={(e) => toggleField(it, 'status', e.target.checked)}
        />
      ),
    },
    { key: 'createdAt', title: 'Criado em', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4>Documentos de Veículo</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
              placeholder="Buscar motorista"
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}
            />
            <button className="btn btn-secondary" onClick={submitSearch} style={{ padding: '0.4rem 0.6rem' }}><Search size={14} /></button>
          </div>
          <button className="btn btn-primary" onClick={openNew}><Plus size={16} style={{ marginRight: '0.5rem' }} />Novo Documento</button>
        </div>
      </div>
      <DataTable data={items} columns={cols} onEdit={openEdit} loading={loading} emptyMessage="Nenhum documento de veículo" />
      <Pagination page={page} total={total} size={size} onChange={setPage} />

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar Documento' : 'Novo Documento'}</h3>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Motorista *</label>
                <select name="driver" value={form.driver} onChange={change} required disabled={!!selected}>
                  <option value="">Selecione...</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name || d._id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Fabricante *</label><input type="text" name="vehicleManufacturer" value={form.vehicleManufacturer} onChange={change} required /></div>
              <div className="form-group"><label>Modelo *</label><input type="text" name="vehicleModel" value={form.vehicleModel} onChange={change} required /></div>
              <div className="form-group"><label>Placa *</label><input type="text" name="vehicleNameplate" value={form.vehicleNameplate} onChange={change} required /></div>
              <div className="form-group"><label>Ano *</label><input type="number" name="vehicleYear" value={form.vehicleYear} onChange={change} required /></div>
              <div className="form-group"><label>Cor *</label><input type="text" name="vehicleColor" value={form.vehicleColor} onChange={change} required /></div>
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

const PaymentTypesTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobilityDocumentService.listTypePayments()
      .then((res) => setItems(extractList(res)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    { key: 'name', title: 'Nome', render: (v) => <b>{fmtField(v)}</b> },
    { key: 'type', title: 'Tipo', render: (v) => fmtField(v) },
    { key: 'genre', title: 'Gênero', render: (v) => fmtField(v) },
    { key: 'status', title: 'Status', render: (v) => <span style={{ fontWeight: 700, color: v ? '#10b981' : '#6b7280' }}>{v ? 'Ativo' : 'Inativo'}</span> },
    { key: 'createdAt', title: 'Criado em', render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4>Formas de Pagamento</h4>
      </div>
      <DataTable data={items} columns={cols} loading={loading} emptyMessage="Nenhuma forma de pagamento ativa" />
    </div>
  );
};

const TravelInfoTab = () => {
  const [bookingId, setBookingId] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!bookingId.trim()) { alert('Informe o ID do booking'); return; }
    setLoading(true);
    setInfo(null);
    try {
      const res = await mobilityDocumentService.travelInfo(bookingId.trim());
      setInfo(res?.data ?? res);
    } catch (err) {
      if (err.response?.status === 404) {
        alert('Informações de viagem não encontradas para este booking (precisa estar concluído).');
      } else {
        alert('Erro: ' + (err.response?.data?.error || err.message));
      }
      setInfo(null);
    } finally { setLoading(false); }
  };

  const InfoCard = ({ label, value }) => (
    <div className="stat-card" style={{ padding: '0.75rem' }}>
      <div className="stat-info">
        <h4 style={{ fontSize: '0.95rem' }}>{fmtField(value)}</h4>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{label}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4>Informações de Viagem (Travel Info)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <form onSubmit={search} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="ID do booking"
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}
            />
            <button className="btn btn-primary" disabled={loading}>{loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Buscar'}</button>
          </form>
        </div>
      </div>

      {info ? (
        <div>
          <div className="stats-grid" style={{ marginBottom: '1rem' }}>
            <InfoCard label="Tempo Previsto" value={info.predictedTime} />
            <InfoCard label="Tempo Percorrido" value={info.travelledTime} />
            <InfoCard label="Distância Prevista" value={info.predictedDistance} />
            <InfoCard label="Distância Percorrida" value={info.travelledDistance} />
            <InfoCard label="Preço Previsto" value={info.predictedPrice} />
            <InfoCard label="Preço Percorrido" value={info.travelledPrice} />
          </div>
          <div className="stats-grid">
            <InfoCard label="Status" value={info.status} />
            <InfoCard label="Booking" value={info.booking} />
            <InfoCard label="Passageiro" value={info.passenger} />
            <InfoCard label="Motorista" value={info.driver} />
            <InfoCard label="Operadora" value={info.service} />
            <InfoCard label="Criado em" value={formatDate(info.createdAt)} />
          </div>
          {info.imageStart && <a href={info.imageStart} target="_blank" rel="noreferrer">Imagem início</a>}
          {info.imageEnd && <span> | <a href={info.imageEnd} target="_blank" rel="noreferrer">Imagem fim</a></span>}
        </div>
      ) : (
        !loading && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Digite o ID de um booking para consultar suas informações de viagem concluídas.</p>
      )}
    </div>
  );
};

export default MobilityDocuments;
