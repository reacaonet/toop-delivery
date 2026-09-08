import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, ScanLine, Car, Copy, Check, Clock } from 'lucide-react';
import { mobileQrCodeService, driverService } from '../services/api';

const extractDrivers = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.list)) return res.list;
  return [];
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const driverLabel = (d) => d?.name || d?._id || '-';

const driverStatusText = (d) => {
  if (!d) return '-';
  if (d.activeRunStatus) return d.activeRunStatus;
  if (typeof d.active === 'boolean' || typeof d.online === 'boolean' || typeof d.available === 'boolean') {
    return `${d.online ? 'online' : 'offline'} / ${d.available ? 'disponível' : 'indisponível'} / ${d.active ? 'ativo' : 'inativo'}`;
  }
  return '-';
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (err) {
      return false;
    }
  }
};

const CodeField = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const ok = await copyText(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      alert('Erro: não foi possível copiar o código');
    }
  };
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input type="text" readOnly value={code} style={{ flex: 1 }} />
      <button type="button" className="btn btn-secondary" onClick={onCopy} style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

const MobilityQrCodes = () => {
  const [tab, setTab] = useState('generate');

  const tabs = [
    { key: 'generate', label: 'Gerar QR Code', icon: QrCode },
    { key: 'verify', label: 'Verificar código', icon: ScanLine },
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Car size={20} style={{ marginRight: '0.5rem' }} />QR Codes de Motoristas</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
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
          {tab === 'generate' && <GenerateTab />}
          {tab === 'verify' && <VerifyTab />}
        </div>
      </div>
    </div>
  );
};

const GenerateTab = () => {
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  const loadDrivers = useCallback(() => {
    setLoadingDrivers(true);
    driverService.getDrivers({ limit: 100 })
      .then((res) => {
        const list = extractDrivers(res);
        setDrivers(list);
        setSelectedDriver(list.length > 0 ? list[0]._id : '');
      })
      .catch(() => {})
      .finally(() => setLoadingDrivers(false));
  }, []);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const selected = drivers.find((d) => d._id === selectedDriver) || null;

  const submit = async (e) => {
    e.preventDefault();
    const driverId = drivers.length > 0 ? selectedDriver : manualId.trim();
    if (!driverId) {
      alert('Erro: selecione um motorista ou informe o ObjectId manualmente');
      return;
    }
    setSaving(true);
    setResult(null);
    try {
      const data = await mobileQrCodeService.generateDriver(driverId);
      setResult(data);
      setExpiresAt(new Date(Date.now() + 60 * 60 * 1000));
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        {drivers.length > 0 ? (
          <>
            <label>Motorista *</label>
            <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>{driverLabel(d)}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label>ObjectId do motorista *</label>
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              required
              placeholder="Ex.: 665f1a2b3c4d5e6f7a8b9c0d (nenhum motorista cadastrado — informe manualmente)"
            />
          </>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><QrCode size={16} style={{ marginRight: '0.5rem' }} />Gerar QR Code</>}
      </button>

      {loadingDrivers && drivers.length === 0 && <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.85rem' }}>Carregando motoristas...</p>}

      {result && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          <strong>QR Code gerado com sucesso!</strong>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', alignItems: 'flex-start' }}>
            <div>
              <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'inline-block' }}>
                <img src={result.qrcode} alt="QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Código</label>
                <div style={{ marginTop: '0.25rem' }}><CodeField code={result.code} /></div>
              </div>
              <p style={{ margin: '0 0 0.5rem' }}>
                <b>Motorista:</b> {selected ? driverLabel(selected) : result.driver?.name || '-'}
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <b>Status:</b> {driverStatusText(selected || result.driver)}
              </p>
              <p style={{ margin: '0' }}>
                <b><Clock size={14} style={{ verticalAlign: '-2px' }} /> Validade:</b> 1 hora — válido até {formatDate(expiresAt)}
                <span style={{ color: '#047857' }}> (verificação até agora + 1h)</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

const VerifyTab = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setResult(null);
    setChecked(false);
    try {
      const data = await mobileQrCodeService.listDriverCode(code.trim());
      setResult(data);
      setChecked(true);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.error || err.message));
      setResult(null);
      setChecked(true);
    } finally {
      setVerifying(false);
    }
  };

  const driver = result?.driver && typeof result.driver === 'object' ? result.driver : null;

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Código *</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          minLength={6}
          placeholder="Ex.: ABC123DEF (mínimo 6 caracteres)"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={verifying}>
        {verifying ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><ScanLine size={16} style={{ marginRight: '0.5rem' }} />Verificar código</>}
      </button>

      {checked && result && (
        <div style={{ marginTop: '1rem' }}>
          <div className="alert alert-success">
            <strong>Código válido!</strong>
            <p style={{ margin: '0.5rem 0 0' }}><b>Código:</b> {result.code}</p>
            <p style={{ margin: '0.25rem 0 0' }}><b>Cabia ao motorista emitido em:</b> {formatDate(result.createdAt)}</p>
          </div>
          <table className="table" style={{ marginTop: '0.75rem' }}>
            <thead>
              <tr><th>Campo</th><th>Valor</th></tr>
            </thead>
            <tbody>
              {driver ? (
                <>
                  <tr><td>ID do motorista</td><td>{driver._id}</td></tr>
                  <tr><td>Nome</td><td>{driver.name || '-'}</td></tr>
                  <tr><td>Status</td><td>{driverStatusText(driver)}</td></tr>
                </>
              ) : (
                <tr><td>Motorista</td><td>{result.driver || '-'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
};

export default MobilityQrCodes;