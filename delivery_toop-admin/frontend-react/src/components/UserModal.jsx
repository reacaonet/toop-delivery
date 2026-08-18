import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { userService } from '../services/api';

const UserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: true
  });
  const [loading, setLoading] = useState(false);

  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.person?.name || user.name || '',
          email: user.email || '',
          password: '',
          status: user.status || false
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          status: true
        });
      }
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = { ...formData };
      
      // Só inclui senha se for novo usuário ou se foi preenchida
      if (!isEdit && !formData.password) {
        alert('Senha é obrigatória para novos usuários');
        setLoading(false);
        return;
      }
      
      if (!isEdit) {
        dataToSave.password = formData.password;
      } else {
        delete dataToSave.password; // Remove senha se não foi preenchida na edição
      }

      let response;
      if (isEdit) {
        response = await userService.updateUser(user._id, dataToSave);
      } else {
        response = await userService.createUser(dataToSave);
      }

      onSave(response);
      onClose();
      setFormData({ name: '', email: '', password: '', status: true });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {isEdit ? 'Senha (deixe em branco para manter atual)' : 'Senha *'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />
              Status Ativo
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <>
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
