import React, { useState } from 'react';
import { Search as SearchIcon, Store, Package, MapPin } from 'lucide-react';
import { searchService } from '../services/api';

const COMPANY_TYPES = ['restaurant', 'supermarket', 'padaria', 'mercado', 'farmacia', 'drogaria', 'acougue', 'conveniencia'];

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [companyType, setCompanyType] = useState('restaurant');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (!searchText.trim()) { setError('Informe o que você procura.'); setResults(null); return; }
    setLoading(true); setError('');
    try {
      const res = await searchService.companyProducts(searchText, companyType);
      setResults(Array.isArray(res) ? res : []);
    } catch (err) { setError(err.response?.data?.error || err.message); setResults(null); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header"><h3><SearchIcon size={20} style={{ marginRight: '0.5rem' }} />Busca (Empresas / Produtos)</h3></div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '220px' }}>
              <label>O que você procura *</label>
              <input type="text" placeholder="Ex.: pizza, arroz, supermercado..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') run(); }} style={{ padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tipo de empresa *</label>
              <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} style={{ padding: '0.5rem 0.7rem', border: '1px solid #d1d5db', borderRadius: '6px', minWidth: '160px' }}>
                {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={run} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <><SearchIcon size={16} style={{ marginRight: '0.5rem' }} />Buscar</>}
            </button>
          </div>

          {error && <p style={{ color: '#ef4444', fontWeight: 600, marginTop: '1rem' }}>{error}</p>}

          {results && (
            <div style={{ marginTop: '1rem' }}>
              {results.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Nenhum resultado encontrado.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.map((c) => (
                    <div key={c._id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Store size={18} color="#047857" />
                        <b style={{ fontSize: '1.05rem' }}>{c.name}</b>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', background: '#f3f4f6', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>{c.category}</span>
                      </div>
                      {c.description && <p style={{ color: '#4b5563', margin: '0.4rem 0' }}>{c.description}</p>}
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>{c.totalProducts} produto(s)</div>
                      <table className="table" style={{ width: '100%' }}>
                        <thead><tr><th>Produto</th><th>Preço</th><th>Preço promoção</th></tr></thead>
                        <tbody>
                          {c.products.map((p) => (
                            <tr key={p._id}>
                              <td><Package size={14} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />{p.name}</td>
                              <td>{p.price != null ? `R$ ${Number(p.price).toFixed(2)}` : '-'}</td>
                              <td>{p.pricePromotion != null ? `R$ ${Number(p.pricePromotion).toFixed(2)}` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;