import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'motorcycle',
    cpf: '',
    cnh: '',
    vehiclePlate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register-deliveryman', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>GoJá Entregador</h1>
          <p>Crie sua conta para começar a entregar</p>
        </div>
        <div className="login-body">
          {success ? (
            <div className="login-success">
              Conta criada! Aguarde aprovação do administrador.
            </div>
          ) : (
            <>
              {error && <div className="login-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nome *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Senha *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vehicleType">Tipo de Veículo</label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    value={form.vehicleType}
                    onChange={handleChange}
                  >
                    <option value="bike">Bicicleta</option>
                    <option value="motorcycle">Motocicleta</option>
                    <option value="car">Carro</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={form.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cnh">CNH</label>
                  <input
                    id="cnh"
                    name="cnh"
                    type="text"
                    value={form.cnh}
                    onChange={handleChange}
                    placeholder="Número da CNH"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vehiclePlate">Placa do Veículo</label>
                  <input
                    id="vehiclePlate"
                    name="vehiclePlate"
                    type="text"
                    value={form.vehiclePlate}
                    onChange={handleChange}
                    placeholder="ABC-1234"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Já tem conta? <Link to="/login">Entrar</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
