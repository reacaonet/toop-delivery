import React, { useState, useEffect } from 'react';
import { Plus, X, Shield, Users, KeyRound, Layers } from 'lucide-react';
import { aclService, accessGroupService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TABS = {
  roles: 'roles',
  permissions: 'permissions',
  groups: 'groups',
};

const emptyRole = () => ({ name: '', status: true });
const emptyPermission = (roleId) => ({ name: '', roles: roleId || '', route: '', level: 1, title: '' });
const emptyGroup = (moduleId) => ({ name: '', modules: moduleId || '', status: true });

const AccessControl = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS.roles);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyRole());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === TABS.roles) {
        const res = await aclService.getRoles();
        setRoles(Array.isArray(res) ? res : []);
      } else if (tab === TABS.permissions) {
        const res = await aclService.getPermissions();
        setPermissions(Array.isArray(res) ? res : []);
      } else if (tab === TABS.groups) {
        const tree = await accessGroupService.getTree();
        setGroups(Array.isArray(tree?.groups) ? tree.groups : []);
        setModules(Array.isArray(tree?.modules) ? tree.modules : []);
      }
    } catch (e) {
      console.error('Erro ao carregar ACL:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    if (tab === TABS.roles) setFormData(emptyRole());
    else if (tab === TABS.permissions) setFormData(emptyPermission(roles[0]?._id || ''));
    else setFormData(emptyGroup(modules[0]?._id || ''));
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setSelected(item);
    if (tab === TABS.roles) setFormData({ name: item.name || '', status: item.status !== false });
    else if (tab === TABS.permissions) {
      const roleId = item.roles?._id || item.roles || '';
      setFormData({
        name: item.name || '',
        roles: roleId,
        route: item.route || '',
        level: item.level ?? 1,
        title: item.title || '',
      });
    } else {
      const moduleId = item.modules?._id || item.modules || '';
      setFormData({ name: item.name || '', modules: moduleId, status: item.status !== false });
    }
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    const label = item.name || item.title || 'registro';
    if (!window.confirm(`Excluir "${label}"?`)) return;
    try {
      if (tab === TABS.roles) await aclService.deleteRole(item._id);
      else if (tab === TABS.permissions) await aclService.deletePermission(item._id);
      else await accessGroupService.remove(item._id);
      load();
    } catch (e) {
      alert('Erro ao excluir: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (tab === TABS.roles) {
        const payload = { name: formData.name, status: formData.status ? 'true' : 'false' };
        if (selected) await aclService.updateRole(selected._id, payload);
        else await aclService.createRole(payload);
      } else if (tab === TABS.permissions) {
        const payload = { name: formData.name, roles: formData.roles, route: formData.route, level: Number(formData.level), title: formData.title };
        if (selected) await aclService.updatePermission(selected._id, payload);
        else await aclService.createPermission(payload);
      } else {
        const payload = { name: formData.name, modules: formData.modules, status: formData.status ? 'true' : 'false' };
        if (selected) await accessGroupService.update(selected._id, payload);
        else await accessGroupService.create(payload);
      }
      load();
      setModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Guarda por role: apenas administradores gerenciam ACL
  if (user && user.role !== 'admin' && user.role !== undefined && user.role !== 'manager') {
    return (
      <div className="card">
        <div className="card-header">
          <h3><Shield size={20} style={{ marginRight: '0.5rem' }} />Controle de Acesso</h3>
        </div>
        <p style={{ padding: '1rem' }}>Apenas administradores podem gerenciar o controle de acesso.</p>
      </div>
    );
  }

  const columns =
    tab === TABS.roles
      ? [
          { key: 'name', title: 'Nome', render: (v) => v || '-' },
          { key: 'status', title: 'Status', render: (v) => (v ? 'Ativo' : 'Inativo') },
        ]
      : tab === TABS.permissions
      ? [
          { key: 'title', title: 'Título', render: (v) => v || '-' },
          { key: 'route', title: 'Rota', render: (v) => v || '-' },
          { key: 'level', title: 'Nível', render: (v) => v ?? '-' },
          { key: 'roles', title: 'Role', render: (v) => (v?.name ? v.name : v || '-') },
        ]
      : [
          { key: 'name', title: 'Nome', render: (v) => v || '-' },
          { key: 'modules', title: 'Módulo', render: (v) => (v?.name ? v.name : v || '-') },
          { key: 'status', title: 'Status', render: (v) => (v ? 'Ativo' : 'Inativo') },
        ];

  const itemList =
    tab === TABS.roles ? roles : tab === TABS.permissions ? permissions : groups;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3><Shield size={20} style={{ marginRight: '0.5rem' }} />Controle de Acesso</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="tab-group" style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className={`btn ${tab === TABS.roles ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTab(TABS.roles)}
                style={{ fontSize: '0.8rem' }}
              >
                <Users size={16} style={{ marginRight: '0.25rem' }} />Roles
              </button>
              <button
                className={`btn ${tab === TABS.permissions ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTab(TABS.permissions)}
                style={{ fontSize: '0.8rem' }}
              >
                <KeyRound size={16} style={{ marginRight: '0.25rem' }} />Permissões
              </button>
              <button
                className={`btn ${tab === TABS.groups ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTab(TABS.groups)}
                style={{ fontSize: '0.8rem' }}
              >
                <Layers size={16} style={{ marginRight: '0.25rem' }} />Grupos
              </button>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              {tab === TABS.roles ? 'Nova Role' : tab === TABS.permissions ? 'Nova Permissão' : 'Novo Grupo'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : itemList.length === 0 ? (
          <p style={{ padding: '1rem', color: '#64748b' }}>Nenhum registro encontrado.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.title}</th>)}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itemList.map((item) => (
                <tr key={item._id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item[c.key]) : item[c.key]}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(item)}>Editar</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(item)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected ? 'Editar' : 'Novo'} {tab === TABS.roles ? 'Role' : tab === TABS.permissions ? 'Permissão' : 'Grupo de Acesso'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>{tab === TABS.permissions ? 'Título *' : 'Nome *'}</label>
                <input
                  type="text"
                  name={tab === TABS.permissions ? 'title' : 'name'}
                  value={tab === TABS.permissions ? formData.title : formData.name}
                  onChange={handleChange}
                  required
                  placeholder={tab === TABS.permissions ? 'Ex: Menu module' : 'Ex: Administrador'}
                />
              </div>

              {tab === TABS.permissions && (
                <>
                  <div className="form-group">
                    <label>Nome da permissão</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: accessToFoodMenu" />
                  </div>
                  <div className="form-group">
                    <label>Rota *</label>
                    <input type="text" name="route" value={formData.route} onChange={handleChange} required placeholder="Ex: delivery-products" />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select name="roles" value={formData.roles} onChange={handleChange} required>
                      <option value="">Selecione</option>
                      {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nível *</label>
                    <input type="number" name="level" value={formData.level} onChange={handleChange} required min={0} />
                  </div>
                </>
              )}

              {tab === TABS.groups && (
                <div className="form-group">
                  <label>Módulo *</label>
                  <select name="modules" value={formData.modules} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    {modules.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              )}

              {tab !== TABS.permissions && (
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                    {' '}Ativo
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
