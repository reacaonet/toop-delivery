import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Mail, Car, UserRound, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { mobilityMessageService, driverService, passengerService } from '../services/api';
import DataTable from '../components/DataTable';

const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const fmtDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString('pt-BR');
};

const personName = (it) => {
  if (!it) return '-';
  if (typeof it === 'string') return it;
  const p = it.person;
  if (Array.isArray(p)) return p[0]?.name || it._id;
  return p?.name || it.name || it._id;
};

const MobilityMessages = () => {
  const [tab, setTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const tabs = [
    { key: 'conversations', label: 'Conversas', icon: MessageCircle },
    { key: 'messages', label: 'Mensagens', icon: Mail },
  ];

  const openConversation = (conv) => {
    setSelectedConversation(conv);
    setTab('messages');
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><MessageCircle size={20} style={{ marginRight: '0.5rem' }} />Mensagens de Mobilidade</h3>
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
          {tab === 'conversations' && <ConversationsTab onOpen={openConversation} />}
          {tab === 'messages' && <MessagesTab conversation={selectedConversation} onSelectConversation={openConversation} />}
        </div>
      </div>
    </div>
  );
};

const ConversationsTab = ({ onOpen }) => {
  const [drivers, setDrivers] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [filterType, setFilterType] = useState('passenger');
  const [filterId, setFilterId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    driverService.getDrivers().then((res) => setDrivers(extractList(res))).catch(() => {});
    passengerService.paginator({ pageIn: 0, pageOut: 200 }).then((res) => setPassengers(extractList(res))).catch(() => {});
  }, []);

  const load = useCallback(() => {
    if (!filterId) { setItems([]); return; }
    setLoading(true);
    const params = filterType === 'driver' ? { driver: filterId } : { passenger: filterId };
    mobilityMessageService.conversations(params)
      .then((res) => setItems(extractList(res)))
      .catch((err) => { console.error(err); alert('Erro: ' + (err.response?.data?.error || err.message)); })
      .finally(() => setLoading(false));
  }, [filterType, filterId]);

  useEffect(() => { load(); }, [load]);

  const cols = [
    { key: 'booking', title: 'Booking', render: (v) => v || '-' },
  ];

  if (filterType === 'driver') {
    cols.push({ key: 'passenger', title: 'Passageiro', render: (v) => personName(v) });
  } else {
    cols.push({ key: 'driver', title: 'Motorista', render: (v) => personName(v) });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div className="form-group" style={{ minWidth: '160px' }}>
          <label>Filtrar por</label>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterId(''); setItems([]); }}>
            <option value="passenger">Passageiro</option>
            <option value="driver">Motorista</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '220px' }}>
          <label>{filterType === 'driver' ? 'Motorista' : 'Passageiro'}</label>
          <select value={filterId} onChange={(e) => setFilterId(e.target.value)}>
            <option value="">Selecione...</option>
            {filterType === 'driver'
              ? drivers.map((d) => <option key={d._id} value={d._id}>{personName(d)}</option>)
              : passengers.map((p) => <option key={p._id} value={p._id}>{personName(p)}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />Atualizar
        </button>
      </div>
      <DataTable data={items} columns={cols} loading={loading}
        onView={(it) => onOpen(it)}
        emptyMessage="Selecione um passageiro/motorista para ver as conversas" />
    </div>
  );
};

const MessagesTab = ({ conversation, onSelectConversation }) => {
  const [bookingId, setBookingId] = useState(conversation?.booking || '');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ message: '', receive: 'passenger' });
  const [sending, setSending] = useState(false);

  const currentBooking = conversation?.booking || bookingId;

  useEffect(() => {
    setBookingId(conversation?.booking || '');
  }, [conversation]);

  const load = useCallback(() => {
    if (!currentBooking) { setMessages([]); return; }
    setLoading(true);
    mobilityMessageService.list(currentBooking)
      .then((res) => setMessages(extractList(res)))
      .catch((err) => { console.error(err); alert('Erro: ' + (err.response?.data?.error || err.message)); })
      .finally(() => setLoading(false));
  }, [currentBooking]);

  useEffect(() => { load(); }, [load]);

  const toId = (v) => (v && typeof v === 'object' ? v._id : v);

  const fields = useCallback((bookingIdToUse) => {
    const base = { booking: bookingIdToUse, driver: toId(conversation?.driver), passenger: toId(conversation?.passenger) };
    const f = { ...base, message: form.message };
    if (form.receive === 'passenger') { f.receive = 'passenger'; f.sent = 'driver'; }
    else { f.receive = 'driver'; f.sent = 'passenger'; }
    return f;
  }, [conversation, form.message, form.receive]);

  const send = async (e) => {
    e.preventDefault();
    if (!currentBooking) { alert('Informe o booking para enviar.'); return; }
    setSending(true);
    try {
      await mobilityMessageService.create(fields(currentBooking));
      setForm((p) => ({ ...p, message: '' }));
      load();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally { setSending(false); }
  };

  const cols = [
    { key: 'message', title: 'Mensagem', render: (v) => v || '-' },
    { key: 'sent', title: 'De', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'receive', title: 'Para', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'type', title: 'Tipo', render: (v) => v || '-' },
    { key: 'createdAt', title: 'D/H', render: fmtDate },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={16} />Mensagens
        </h4>
        {conversation && (
          <button className="btn btn-secondary" onClick={() => onSelectConversation(null)}>Trocar conversa</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '240px' }}>
          <label>Booking *</label>
          <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)}
            placeholder="ID do booking" disabled={!!conversation} />
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading || !currentBooking}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />Carregar
        </button>
      </div>

      <DataTable data={messages} columns={cols} loading={loading} emptyMessage="Nenhuma mensagem nesta conversa" />

      <form onSubmit={send} style={{ marginTop: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Send size={16} />Enviar / Responder
        </h4>
        <div className="form-group">
          <label>Destinatário *</label>
          <select value={form.receive} onChange={(e) => setForm((p) => ({ ...p, receive: e.target.value }))}>
            <option value="passenger">Passageiro</option>
            <option value="driver">Motorista</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mensagem *</label>
          <textarea name="message" rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required placeholder="Digite a mensagem..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={sending}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {sending ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Send size={16} />Enviar</>}
        </button>
      </form>
    </div>
  );
};

export default MobilityMessages;
