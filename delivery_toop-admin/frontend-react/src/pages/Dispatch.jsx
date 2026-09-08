import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Radio, Truck, RefreshCw, RotateCcw, XCircle, Search, WifiOff, CheckCircle2 } from 'lucide-react';
import { dispatchService } from '../services/api';
import DataTable from '../components/DataTable';

const QUEUE_STATUSES = ['WAIT', 'PROCESS', 'FINISH', 'NOT_FOUND_DELIVERYMAN'];
const RACE_STATUSES = ['ACCEPTED', 'REFUSED', 'CANCELED'];

const extractData = (res) => {
  if (!res) return [];
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.list)) return body.list;
  if (body && typeof body === 'object') return [body];
  return [];
};

const extractTotal = (res) => {
  if (!res) return 0;
  const body = res?.data ?? res;
  return body?.total ?? (Array.isArray(body) ? body.length : 0);
};

const fmtId = (v) => (v && typeof v === 'object' ? v._id || v.name || JSON.stringify(v) : v) || '-';
const fmtDt = (v) => (v ? new Date(v).toLocaleString('pt-BR') : '-');

const Dispatch = () => {
  const [tab, setTab] = useState('queue');

  const tabs = [
    { key: 'queue', label: 'Fila de Despacho', icon: ClipboardList },
    { key: 'races', label: 'Races / Corridas', icon: Truck },
    { key: 'online', label: 'Online', icon: Radio },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><ClipboardList size={20} style={{ marginRight: '0.5rem' }} />Despacho de Entregas</h3>
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
          {tab === 'queue' && <QueueTab />}
          {tab === 'races' && <RacesTab />}
          {tab === 'online' && <OnlineTab />}
        </div>
      </div>
    </div>
  );
};

/* ---------------- TAB 1: FILA DE DESPACHO ---------------- */
const QueueTab = () => {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dispatchService.queueList(status ? { status } : {});
      setList(extractData(res));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (item, nextStatus) => {
    setBusyId(item._id);
    try {
      await dispatchService.queueUpdateStatus(item._id, nextStatus);
      await load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setBusyId(null); }
  };

  const backToQueue = async (item) => {
    if (!window.confirm('Enviar este pedido de volta para a fila?')) return;
    setBusyId(item._id);
    try {
      const orderId = fmtId(item.order);
      await dispatchService.backToQueue({ order: orderId });
      await load();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setBusyId(null); }
  };

  const cols = [
    { key: 'order', title: 'Pedido', render: (v) => <b>{fmtId(v)}</b> },
    { key: 'deliveryMan', title: 'Entregador', render: (v) => fmtId(v) },
    { key: 'status', title: 'Status', render: (v) => <span className="badge" style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
    { key: 'attempt', title: 'Tentativa', render: (v) => v ?? 0 },
    { key: 'createdAt', title: 'Criado', render: (v) => fmtDt(v) },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem', alignItems: 'center' }}>
        <h4>Fila de Despacho</h4>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={14} style={{ marginRight: '0.3rem' }} />Atualizar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', ...(status === '' ? { borderColor: '#10b981', color: '#047857', background: '#ecfdf5', fontWeight: 700 } : {}) }}
          onClick={() => setStatus('')}>Todos</button>
        {QUEUE_STATUSES.map((s) => (
          <button key={s} className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', ...(status === s ? { borderColor: '#10b981', color: '#047857', background: '#ecfdf5', fontWeight: 700 } : {}) }}
            onClick={() => setStatus(s)}>{s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      <DataTable
        data={list}
        columns={cols}
        loading={loading}
        emptyMessage="Nenhuma entrada na fila"
        onView={(item) => {
          const order = fmtId(item.order);
          const dm = fmtId(item.deliveryMan) !== '-' ? fmtId(item.deliveryMan) : '';
          const msg =
            `Pedido: ${order}\n` +
            `Status: ${item.status}\n` +
            `Entregador: ${dm}\n` +
            `Tentativa: ${item.attempt ?? 0}\n` +
            `Criado: ${fmtDt(item.createdAt)}`;
          window.alert(msg);
        }}
      />

      <h4 style={{ fontSize: '0.8rem', color: '#6b7280', margin: '1rem 0 0.4rem' }}>Ações da fila (selecione pela listagem acima)</h4>
      {list.map((item) => (
        <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <b style={{ minWidth: '230px' }}>{fmtId(item.order)}</b>
          <span className="badge" style={{ textTransform: 'capitalize' }}>{item.status}</span>
          <select
            defaultValue=""
            disabled={busyId === item._id}
            onChange={(e) => { if (e.target.value) updateStatus(item, e.target.value); e.target.value = ''; }}
            style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}
          >
            <option value="">Alterar status…</option>
            {QUEUE_STATUSES.filter((s) => s !== item.status).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button className="btn btn-secondary" disabled={busyId === item._id} onClick={() => backToQueue(item)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
            <RotateCcw size={14} />Voltar à fila
          </button>
        </div>
      ))}
    </div>
  );
};

/* ---------------- TAB 2: RACES / CORRIDAS ---------------- */
const RacesTab = () => {
  const [raceList, setRaceList] = useState([]);
  const [raceLoading, setRaceLoading] = useState(false);
  const [searchOrder, setSearchOrder] = useState('');
  const [raceAll, setRaceAll] = useState(true);

  const [cancelForm, setCancelForm] = useState({ deliveryMan: '', order: '', date: '' });
  const [historyForm, setHistoryForm] = useState({ deliveryMan: '', order: '', statusRace: 'ACCEPTED' });
  const [busy, setBusy] = useState(false);

  const loadRaces = useCallback(async (orderId, all) => {
    if (!orderId) { setRaceList([]); return; }
    setRaceLoading(true);
    try {
      const res = await dispatchService.raceList({ order: orderId, all: all ? 'true' : '' });
      setRaceList(Array.isArray(res?.data ?? res)
        ? (res?.data ?? res)
        : (((res?.data ?? res) && typeof (res?.data ?? res) === 'object') ? [res?.data ?? res] : []));
    } catch (e) { console.error(e); setRaceList([]); } finally { setRaceLoading(false); }
  }, []);

  const registerCanceled = async (e) => {
    e.preventDefault();
    if (!cancelForm.order || !cancelForm.deliveryMan || !cancelForm.date) { alert('Preencha deliveryMan, order e date'); return; }
    setBusy(true);
    try {
      await dispatchService.raceCanceled(cancelForm);
      alert('Cancelamento registrado');
      setCancelForm({ deliveryMan: '', order: '', date: '' });
      if (searchOrder) loadRaces(searchOrder, raceAll);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setBusy(false); }
  };

  const registerHistory = async (e) => {
    e.preventDefault();
    if (!historyForm.deliveryMan || !historyForm.order || !historyForm.statusRace) { alert('Preencha todos os campos'); return; }
    setBusy(true);
    try {
      await dispatchService.raceHistory(historyForm);
      alert('Histórico de corrida registrado');
      setHistoryForm({ deliveryMan: '', order: '', statusRace: 'ACCEPTED' });
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setBusy(false); }
  };

  const raceCols = [
    { key: 'order', title: 'Pedido', render: (v) => <b>{fmtId(v)}</b> },
    { key: 'deliveryMan', title: 'Entregador', render: (v) => fmtId(v) },
    { key: 'date', title: 'Data', render: (v) => fmtDt(v) },
    { key: 'createdAt', title: 'Criado', render: (v) => fmtDt(v) },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
      <div>
        <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem', alignItems: 'center' }}>
          <h4>Corridas Canceladas (por pedido)</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} placeholder="Order ID…"
              style={{ padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem' }} />
            <label style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input type="checkbox" checked={raceAll} onChange={(e) => setRaceAll(e.target.checked)} />Todos
            </label>
            <button className="btn btn-primary" onClick={() => loadRaces(searchOrder, raceAll)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Search size={14} />Buscar
            </button>
          </div>
        </div>
        <DataTable data={raceList} columns={raceCols} loading={raceLoading} emptyMessage="Nenhuma corrida cancelada" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card">
          <div className="card-header"><h4><XCircle size={18} style={{ marginRight: '0.4rem' }} />Registrar Cancelamento</h4></div>
          <form onSubmit={registerCanceled} style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="text" className="form-control" placeholder="DeliveryMan ID" value={cancelForm.deliveryMan} onChange={(e) => setCancelForm({ ...cancelForm, deliveryMan: e.target.value })} required />
            <input type="text" className="form-control" placeholder="Order ID" value={cancelForm.order} onChange={(e) => setCancelForm({ ...cancelForm, order: e.target.value })} required />
            <input type="datetime-local" className="form-control" value={cancelForm.date} onChange={(e) => setCancelForm({ ...cancelForm, date: e.target.value })} required />
            <button className="btn btn-primary" type="submit" disabled={busy}>Registrar</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h4><CheckCircle2 size={18} style={{ marginRight: '0.4rem' }} />Registrar Histórico de Corrida</h4></div>
          <form onSubmit={registerHistory} style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="text" className="form-control" placeholder="DeliveryMan ID" value={historyForm.deliveryMan} onChange={(e) => setHistoryForm({ ...historyForm, deliveryMan: e.target.value })} required />
            <input type="text" className="form-control" placeholder="Order ID" value={historyForm.order} onChange={(e) => setHistoryForm({ ...historyForm, order: e.target.value })} required />
            <select className="form-control" value={historyForm.statusRace} onChange={(e) => setHistoryForm({ ...historyForm, statusRace: e.target.value })}>
              {RACE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" type="submit" disabled={busy}>Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ---------------- TAB 3: ONLINE ---------------- */
const OnlineTab = () => {
  const [dmId, setDmId] = useState('');
  const [list, setList] = useState([]);
  const [totalMedia, setTotalMedia] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await dispatchService.onlineLastWeek(id);
      const body = res?.data ?? res;
      setList(Array.isArray(body?.list) ? body.list : []);
      const media = Array.isArray(body?.totalMedia) ? body.totalMedia : [];
      setTotalMedia(media.length ? (media[0].mediaTime ?? 0) : 0);
    } catch (err) { console.error(err); setList([]); setTotalMedia(0); } finally { setLoading(false); }
  };

  useEffect(() => { if (dmId) load(dmId); }, []);

  const goOffline = async (rec) => {
    const id = fmtId(rec.deliveryMan);
    if (!window.confirm('Colocar este entregador offline?')) return;
    setBusyId(rec._id);
    try {
      await dispatchService.offline(id);
      await load(dmId);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); } finally { setBusyId(null); }
  };

  const cols = [
    { key: 'deliveryMan', title: 'Entregador', render: (v) => fmtId(v) },
    { key: 'online', title: 'Online', render: (v) => fmtDt(v) },
    { key: 'offline', title: 'Offline', render: (v) => (v ? fmtDt(v) : <span className="badge" style={{ color: '#10b981' }}>Online</span>) },
    { key: 'total', title: 'Total (min)', render: (v) => (v != null ? v : '-') },
  ];

  return (
    <div>
      <div className="card-header" style={{ padding: 0, border: 'none', marginBottom: '0.75rem', alignItems: 'center' }}>
        <h4>Entregadores Online (últimos 7 dias)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" value={dmId} onChange={(e) => setDmId(e.target.value)} placeholder="DeliveryMan ID…"
            style={{ padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem' }} />
          <button className="btn btn-primary" onClick={() => load(dmId)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Search size={14} />Buscar
          </button>
        </div>
      </div>

      {totalMedia > 0 && (
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
          Média de tempo online (7 dias): <b>{totalMedia.toFixed(0)} min</b>
        </p>
      )}

      <DataTable
        data={list}
        columns={cols}
        loading={loading}
        emptyMessage="Nenhum registro online encontrado"
        onView={async (rec) => {
          const msg =
            `Entregador: ${fmtId(rec.deliveryMan)}\n` +
            `Online: ${fmtDt(rec.online)}\n` +
            `Offline: ${rec.offline ? fmtDt(rec.offline) : 'ainda online'}\n` +
            `Total: ${rec.total != null ? rec.total + ' min' : '-'}`;
          window.alert(msg);
        }}
      />

      {list.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.4rem' }}>Ações</h4>
          {list.map((rec) => (
            <div key={rec._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <b style={{ minWidth: '230px' }}>{fmtId(rec.deliveryMan)}</b>
              <span>{rec.offline ? 'Offline' : 'Online'}</span>
              {!rec.offline && (
                <button className="btn btn-danger" disabled={busyId === rec._id} onClick={() => goOffline(rec)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
                  <WifiOff size={14} />Offline
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dispatch;
