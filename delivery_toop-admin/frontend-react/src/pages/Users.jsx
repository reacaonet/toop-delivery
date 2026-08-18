import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { userService } from '../services/api';
import DataTable from '../components/DataTable';
import UserModal from '../components/UserModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuario "${user?.person?.name || user?.name || 'este usuario'}"?`)) {
      return;
    }

    try {
      await userService.deleteUser(user._id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const handleSave = (savedUser) => {
    loadUsers();
  };

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (name, user) => user.person?.name || user.name || 'N/A'
    },
    {
      key: 'email',
      title: 'Email',
      render: (email) => email || 'N/A'
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span className={`status-badge ${status ? 'status-active' : 'status-inactive'}`}>
          {status ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Usuários</h3>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Novo Usuário
          </button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          emptyMessage="Nenhum usuário encontrado"
        />
      </div>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSave={handleSave}
      />
    </div>
  );
};

export default Users;
