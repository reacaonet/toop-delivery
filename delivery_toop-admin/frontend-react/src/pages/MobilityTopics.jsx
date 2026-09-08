import React, { useState } from 'react';
import { Car, Radio, Send, Users, Plus, X } from 'lucide-react';
import { mobilityTopicService } from '../services/api';

const MobilityTopics = () => {
  const [tab, setTab] = useState('subscribe');

  const tabs = [
    { key: 'subscribe', label: 'Inscrição em tópicos', icon: Radio },
    { key: 'send', label: 'Enviar push por tópico', icon: Send },
    { key: 'link', label: 'Vincular usuários', icon: Users },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Tópicos de Mobilidade</h3>
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
          {tab === 'subscribe' && <SubscribeTab />}
          {tab === 'send' && <SendPushTab />}
          {tab === 'link' && <LinkUsersTab />}
        </div>
      </div>
    </div>
  );
};

const SubscribeTab = () => {
  const [token, setToken] = useState('');
  const [topics, setTopics] = useState([{ name: '', value: '' }]);
  const [unsubs, setUnsubs] = useState([]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const addTopicRow = () => setTopics((p) => [...p, { name: '', value: '' }]);
  const removeTopicRow = (i) => setTopics((p) => p.filter((_, idx) => idx !== i));
  const changeTopic = (i, field, v) => setTopics((p) => p.map((r, idx) => idx === i ? { ...r, [field]: v } : r));

  const addUnsubRow = () => setUnsubs((p) => [...p, { name: '', value: '' }]);
  const removeUnsubRow = (i) => setUnsubs((p) => p.filter((_, idx) => idx !== i));
  const changeUnsub = (i, field, v) => setUnsubs((p) => p.map((r, idx) => idx === i ? { ...r, [field]: v } : r));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const payload = {
        token,
        topics: topics.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), ...(t.value.trim() ? { value: t.value.trim() } : {}) })),
      };
      const filteredUnsubs = unsubs.filter((u) => u.name.trim());
      if (filteredUnsubs.length > 0) {
        payload.unsubscribeTopic = filteredUnsubs.map((u) => ({ name: u.name.trim(), ...(u.value.trim() ? { value: u.value.trim() } : {}) }));
      }
      const data = await mobilityTopicService.subscribe(payload);
      setResult(data);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Token do dispositivo *</label>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="FCM device token" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <h4 style={{ margin: 0 }}>Tópicos para inscrever</h4>
        <button type="button" className="btn btn-secondary" onClick={addTopicRow}><Plus size={14} style={{ marginRight: '0.3rem' }} />Adicionar</button>
      </div>
      {topics.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <input type="text" placeholder="Nome *" value={t.name} onChange={(e) => changeTopic(i, 'name', e.target.value)} required style={{ flex: 2 }} />
          <input type="text" placeholder="Valor (opcional)" value={t.value} onChange={(e) => changeTopic(i, 'value', e.target.value)} style={{ flex: 2 }} />
          {topics.length > 1 && <button type="button" className="btn btn-danger" onClick={() => removeTopicRow(i)} style={{ padding: '0.4rem' }}><X size={14} /></button>}
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <h4 style={{ margin: 0 }}>Tópicos para desinscrever</h4>
        <button type="button" className="btn btn-secondary" onClick={addUnsubRow}><Plus size={14} style={{ marginRight: '0.3rem' }} />Adicionar</button>
      </div>
      {unsubs.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>Nenhum tópico de desinscrição adicionado.</p>}
      {unsubs.map((u, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <input type="text" placeholder="Nome *" value={u.name} onChange={(e) => changeUnsub(i, 'name', e.target.value)} required style={{ flex: 2 }} />
          <input type="text" placeholder="Valor (opcional)" value={u.value} onChange={(e) => changeUnsub(i, 'value', e.target.value)} style={{ flex: 2 }} />
          <button type="button" className="btn btn-danger" onClick={() => removeUnsubRow(i)} style={{ padding: '0.4rem' }}><X size={14} /></button>
        </div>
      ))}

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Inscrever'}
        </button>
      </div>

      {result && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <strong>Tópicos inscritos:</strong>
          {Array.isArray(result.topics) && result.topics.length > 0 ? (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              {result.topics.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          ) : (
            <p style={{ margin: '0.5rem 0 0' }}>Nenhum tópico inscrito.</p>
          )}
        </div>
      )}
    </form>
  );
};

const SendPushTab = () => {
  const [form, setForm] = useState({ topic: '', title: '', subject: '', franchise: '', priority: '' });
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const payload = { topic: form.topic, title: form.title, subject: form.subject };
      if (form.franchise.trim()) payload.franchise = form.franchise.trim();
      if (form.priority.trim()) payload.priority = form.priority.trim();
      const data = await mobilityTopicService.send(payload);
      setResult(data);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Tópico *</label>
        <input type="text" name="topic" value={form.topic} onChange={change} required placeholder="Nome do tópico alvo" />
      </div>
      <div className="form-group">
        <label>Título *</label>
        <input type="text" name="title" value={form.title} onChange={change} required />
      </div>
      <div className="form-group">
        <label>Mensagem *</label>
        <input type="text" name="subject" value={form.subject} onChange={change} required />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Franchise (opcional)</label>
          <input type="text" name="franchise" value={form.franchise} onChange={change} placeholder="ID da franquia" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Prioridade</label>
          <input type="text" name="priority" value={form.priority} onChange={change} placeholder="max (padrão)" />
        </div>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Enviar push'}
        </button>
      </div>

      {result && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <strong>Push enviado!</strong>
          <p style={{ margin: '0.5rem 0 0' }}><b>Response:</b> {result.response}</p>
          <p style={{ margin: '0.25rem 0 0' }}><b>Condition:</b> {result.condition}</p>
        </div>
      )}
    </form>
  );
};

const LinkUsersTab = () => {
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const run = async () => {
    if (!window.confirm('Vincular todos os motoristas e passageiros sem tópicos aos tópicos padrão?')) return;
    setSaving(true);
    setResult(null);
    try {
      const data = await mobilityTopicService.linkUserTopics();
      setResult(data);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = result && (
    (Array.isArray(result.driverErr) && result.driverErr.length > 0) ||
    (Array.isArray(result.passengerErr) && result.passengerErr.length > 0)
  );

  return (
    <div>
      <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Sincroniza motoristas e passageiros que possuem token mas ainda não possuem tópicos.
        Cada usuário será inscrito em <code>driver</code>/<code>passenger</code>, <code>application_root</code> e <code>franchise_{'<id>'}</code>.
      </p>
      <button className="btn btn-primary" onClick={run} disabled={saving}>
        {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><Users size={16} style={{ marginRight: '0.5rem' }} />Vincular usuários</>}
      </button>

      {result && !hasErrors && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          Todos os usuários vinculados com sucesso. Nenhum erro reportado.
        </div>
      )}

      {result && hasErrors && (
        <div style={{ marginTop: '1rem' }}>
          {Array.isArray(result.driverErr) && result.driverErr.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
              <strong>Motoristas com erro ({result.driverErr.length})</strong>
              <table className="table" style={{ marginTop: '0.5rem' }}>
                <thead><tr><th>ID do motorista</th></tr></thead>
                <tbody>{result.driverErr.map((id, i) => <tr key={i}><td>{id}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {Array.isArray(result.passengerErr) && result.passengerErr.length > 0 && (
            <div className="alert alert-warning">
              <strong>Passageiros com erro ({result.passengerErr.length})</strong>
              <table className="table" style={{ marginTop: '0.5rem' }}>
                <thead><tr><th>ID do passageiro</th></tr></thead>
                <tbody>{result.passengerErr.map((id, i) => <tr key={i}><td>{id}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobilityTopics;
