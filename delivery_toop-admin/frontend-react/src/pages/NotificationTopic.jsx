import React, { useState } from 'react';
import { Car, Radio, Send, Plus, X } from 'lucide-react';
import { notificationTopicService } from '../services/api';

const NotificationTopic = () => {
  const [tab, setTab] = useState('create');
  const [sessionTopics, setSessionTopics] = useState([]);

  const addSessionTopics = (keys) => {
    if (!keys || !Array.isArray(keys)) return;
    setSessionTopics((prev) => {
      const merged = [...prev];
      keys.forEach((k) => {
        if (k && !merged.includes(k)) merged.push(k);
      });
      return merged;
    });
  };

  const removeSessionTopic = (key) => {
    setSessionTopics((prev) => prev.filter((t) => t !== key));
  };

  const tabs = [
    { key: 'create', label: 'Criar tópico', icon: Radio },
    { key: 'send', label: 'Enviar push', icon: Send },
    { key: 'list', label: 'Tópicos da sessão', icon: Radio },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />Push por Tópico (Notification Topic)</h3>
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
          {tab === 'create' && <CreateTopicTab onCreated={addSessionTopics} />}
          {tab === 'send' && <SendPushTab sessionTopics={sessionTopics} />}
          {tab === 'list' && <SessionTopicsTab topics={sessionTopics} onRemove={removeSessionTopic} />}
        </div>
      </div>
    </div>
  );
};

const CreateTopicTab = ({ onCreated }) => {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState([{ name: '', value: '' }]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const addRow = () => setRows((p) => [...p, { name: '', value: '' }]);
  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));
  const changeRow = (i, field, v) => setRows((p) => p.map((r, idx) => idx === i ? { ...r, [field]: v } : r));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const payload = {
        token,
        topics: rows.filter((r) => r.name.trim()).map((r) => ({
          name: r.name.trim(),
          ...(r.value.trim() ? { value: r.value.trim() } : {}),
        })),
      };
      const data = await notificationTopicService.create(payload);
      onCreated(data.topics);
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
        <h4 style={{ margin: 0 }}>Tópicos</h4>
        <button type="button" className="btn btn-secondary" onClick={addRow}><Plus size={14} style={{ marginRight: '0.3rem' }} />Adicionar</button>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <input type="text" placeholder="Nome *" value={r.name} onChange={(e) => changeRow(i, 'name', e.target.value)} required style={{ flex: 2 }} />
          <input type="text" placeholder="Valor (opcional)" value={r.value} onChange={(e) => changeRow(i, 'value', e.target.value)} style={{ flex: 2 }} />
          {rows.length > 1 && <button type="button" className="btn btn-danger" onClick={() => removeRow(i)} style={{ padding: '0.4rem' }}><X size={14} /></button>}
        </div>
      ))}
      <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Inscreve o token nos tópicos do FCM. Tópico efetivo: {`'<nome>'`} ou {`'<nome>_<valor>'`} quando o valor é informado.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Criar / Inscrever'}
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

const SendPushTab = ({ sessionTopics }) => {
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
      const data = await notificationTopicService.send(payload);
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
        <input type="text" name="topic" value={form.topic} onChange={change} required list="notification-topic-suggestions" placeholder="Nome do tópico alvo" />
        <datalist id="notification-topic-suggestions">
          {sessionTopics.map((t, i) => <option key={i} value={t} />)}
        </datalist>
      </div>

      {sessionTopics.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {sessionTopics.map((t, i) => (
            <button key={i} type="button" onClick={() => setForm((p) => ({ ...p, topic: t }))} style={{
              padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', borderRadius: '999px',
              border: '1px solid #10b981', background: '#ecfdf5', color: '#047857',
            }}>{t}</button>
          ))}
        </div>
      )}

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

const SessionTopicsTab = ({ topics, onRemove }) => {
  return (
    <div>
      <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Não existe endpoint de listagem nesta versão do backend (POST /v2/notification-topic e
        POST /v2/notification-topic/send são os únicos). A lista abaixo é local à sessão, formada
        pelos tópicos criados nesta tela.
      </p>
      {topics.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Nenhum tópico criado nesta sessão.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>Tópico</th><th style={{ width: '60px' }}></th></tr>
          </thead>
          <tbody>
            {topics.map((t, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{t}</td>
                <td>
                  <button type="button" className="btn btn-danger" onClick={() => onRemove(t)} style={{ padding: '0.4rem' }}>
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NotificationTopic;