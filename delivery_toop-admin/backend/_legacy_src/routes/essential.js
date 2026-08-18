const router = require("express").Router();

// Health check básico
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Toop Delivery API - Servidor iniciado com sucesso",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Rota básica
router.get("/", (req, res) => {
  res.json({
    message: "Toop Delivery API",
    status: "running",
    docs: "/api-docs"
  });
});

// Endpoint de teste CORS
router.options("/cors-test", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

router.post("/cors-test", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    message: "CORS test successful",
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Endpoint OPTIONS para auth (pre-flight CORS)
router.options("/auth", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4202');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Endpoint OPTIONS para companies (pre-flight CORS)
router.options("/companies", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4202');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Importar rotas essenciais gradualmente
const AuthRoute = require("./AuthRoutes");

// Usar rotas essenciais sem autenticação por enquanto
router.use("/auth", AuthRoute);

// Rota de empresas simplificada para admin (sem middleware complexo)
const Company = require("../models/Company/CompanyModel");

router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find({ deletedAt: { $exists: false } })
      .select('name status address phone _id')
      .sort({ name: 1 })
      .limit(50);
    
    res.json(companies);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// CRUD para empresas
router.post("/companies", async (req, res) => {
  try {
    const { name, address, phone, status = true } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Nome e endereço são obrigatórios' });
    }
    
    // Buscar ou criar group e segment padrões
    const Group = require("../models/GroupModel");
    const CompanySegment = require("../models/Company/SegmentModel");
    
    let group = await Group.findOne({ name: "Padrão" });
    if (!group) {
      group = new Group({
        name: "Padrão",
        description: "Grupo padrão para empresas",
        status: true
      });
      await group.save();
    }
    
    let segment = await CompanySegment.findOne({ name: "Padrão" });
    if (!segment) {
      segment = new CompanySegment({
        name: "Padrão",
        category: "delivery",
        order: 1,
        status: true
      });
      await segment.save();
    }
    
    const company = new Company({
      name,
      address,
      phone: phone || '',
      status,
      location: { type: 'Point', coordinates: [0, 0] }, // Placeholder
      groups: group._id,
      segment: segment._id,
      shoppingFlow: "MENU",
      runProcess: []
    });
    
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa: ' + error.message });
  }
});

router.put("/companies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, status } = req.body;
    
    const company = await Company.findByIdAndUpdate(
      id,
      { name, address, phone, status },
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

router.delete("/companies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
});

// Endpoint OPTIONS para users (pre-flight CORS)
router.options("/users", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rota de usuários simplificada para admin
const User = require("../models/UserModel");
const Person = require("../models/Person/PersonModel");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ deletedAt: { $exists: false } })
      .populate('person', 'name email phone')
      .select('name email status person')
      .sort({ name: 1 })
      .limit(50);
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// CRUD para usuários
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, status = true } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Gerar referralCode único
    const crypto = require('crypto');
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Criar Person primeiro
    const person = new Person({
      name,
      email,
      status: true,
      referralCode
    });
    
    await person.save();
    
    // Hash da senha
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar User
    const user = new User({
      name,
      email,
      password: hashedPassword,
      status,
      person: person._id
    });
    
    await user.save();
    
    // Retornar usuário sem senha
    const userResponse = await User.findById(user._id)
      .populate('person', 'name email phone')
      .select('name email status person');
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;
    
    // Verificar se usuário existe
    const user = await User.findById(id).populate('person');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se email já existe (se foi alterado)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }
    
    // Atualizar Person
    if (user.person) {
      await Person.findByIdAndUpdate(user.person._id, { name, email });
    }
    
    // Atualizar User
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, status },
      { new: true, runValidators: true }
    ).populate('person', 'name email phone');
    
    // Garantir que o nome esteja sincronizado
    if (updatedUser.person) {
      updatedUser.person.name = name;
      await updatedUser.person.save();
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Endpoint OPTIONS para orders (pre-flight CORS)
router.options("/orders", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rota de pedidos simplificada para admin
const Booking = require("../models/Mobility/Booking/BookingModel");

router.get("/orders", async (req, res) => {
  try {
    const orders = await Booking.find({ deletedAt: { $exists: false } })
      .populate('company', 'name address phone')
      .populate('user', 'name email')
      .select('company user status totalValue createdAt _id')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Se não houver pedidos, retornar dados mock
    if (!orders || orders.length === 0) {
      const mockOrders = [
        {
          _id: "order_001",
          company: {
            _id: "company_1",
            name: "Restaurantes Central",
            address: "Rua das Flores, 123",
            phone: "1122334455"
          },
          user: {
            _id: "user_1",
            name: "João Silva",
            email: "joao@economizebr.com"
          },
          status: "completed",
          totalValue: 150.50,
          createdAt: new Date('2024-01-15T10:30:00Z')
        },
        {
          _id: "order_002",
          company: {
            _id: "company_2",
            name: "Mercado Express",
            address: "Av. Principal, 456",
            phone: "9988776655"
          },
          user: {
            _id: "user_2",
            name: "Maria Santos",
            email: "maria@economizebr.com"
          },
          status: "pending",
          totalValue: 89.90,
          createdAt: new Date('2024-01-15T14:20:00Z')
        },
        {
          _id: "order_003",
          company: {
            _id: "company_3",
            name: "Pizzaria Boa Vista",
            address: "Rua da Pizza, 789",
            phone: "5544332211"
          },
          user: {
            _id: "user_3",
            name: "Pedro Costa",
            email: "pedro@economizebr.com"
          },
          status: "cancelled",
          totalValue: 245.00,
          createdAt: new Date('2024-01-15T16:45:00Z')
        }
      ];
      return res.json(mockOrders);
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Endpoint OPTIONS para payments (pre-flight CORS)
router.options("/payments", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rota de pagamentos simplificada para admin
router.get("/payments", async (req, res) => {
  try {
    // Mock de dados de pagamentos para teste
    const mockPayments = [
      {
        _id: "1",
        orderId: "order_001",
        amount: 150.50,
        status: "completed",
        method: "credit_card",
        createdAt: new Date('2024-01-15T10:30:00Z'),
        customer: "João Silva"
      },
      {
        _id: "2",
        orderId: "order_002", 
        amount: 89.90,
        status: "pending",
        method: "pix",
        createdAt: new Date('2024-01-15T14:20:00Z'),
        customer: "Maria Santos"
      },
      {
        _id: "3",
        orderId: "order_003",
        amount: 245.00,
        status: "failed",
        method: "debit_card",
        createdAt: new Date('2024-01-15T16:45:00Z'),
        customer: "Pedro Costa"
      }
    ];
    
    res.json(mockPayments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

router.options("/deliverymen", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4202');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// GET deliverymen - listar todos com criação automática se vazio
router.get("/deliverymen", async (req, res) => {
  try {
    console.log('🔄 [Backend] Buscando entregadores...');
    
    const DeliveryMan = require("../models/DeliveryMan/DeliveryManModel");
    const Person = require("../models/Person/PersonModel");
    
    // Buscar entregadores no banco
    let deliverymen = await DeliveryMan.find({ deletedAt: { $exists: false } })
      .populate('person', 'name email phone')
      .limit(50);
    
    console.log('📊 [Backend] Entregadores encontrados no banco:', deliverymen.length);
    
    // Se não houver entregadores, criar dados iniciais automaticamente
    if (!deliverymen || deliverymen.length === 0) {
      console.log('⚠️ [Backend] Nenhum entregador encontrado, criando dados iniciais...');
      
      // Criar pessoas e entregadores iniciais
      const initialDeliverymen = [
        {
          name: "Carlos Silva",
          email: "carlos@economizebr.com",
          phone: "11987654321",
          vehicleType: "MOTO",
          status: true
        },
        {
          name: "Ana Santos", 
          email: "ana@economizebr.com",
          phone: "11976543210",
          vehicleType: "BICYCLE",
          status: true
        },
        {
          name: "Pedro Costa",
          email: "pedro@economizebr.com", 
          phone: "11965432109",
          vehicleType: "CAR",
          status: false
        }
      ];
      
      const createdDeliverymen = [];
      
      for (const deliverymanData of initialDeliverymen) {
        // Criar pessoa primeiro
        const newPerson = new Person({
          name: deliverymanData.name,
          email: deliverymanData.email,
          phone: deliverymanData.phone,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedPerson = await newPerson.save();
        
        // Criar entregador
        const newDeliveryman = new DeliveryMan({
          name: deliverymanData.name,
          email: deliverymanData.email,
          status: deliverymanData.status,
          typeOfVehicle: deliverymanData.vehicleType,
          person: savedPerson._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedDeliveryman = await newDeliveryman.save();
        
        // Buscar com populate para retorno
        const populatedDeliveryman = await DeliveryMan.findById(savedDeliveryman._id)
          .populate('person', 'name email phone');
        
        createdDeliverymen.push(populatedDeliveryman);
      }
      
      console.log('✅ [Backend] Entregadores iniciais criados:', createdDeliverymen.length);
      return res.json(createdDeliverymen);
    }
    
    // Retornar entregadores existentes
    console.log('✅ [Backend] Retornando', deliverymen.length, 'entregadores');
    res.json(deliverymen);
    
  } catch (error) {
    console.error('❌ [Backend] Erro ao buscar entregadores:', error);
    res.status(500).json({ error: 'Erro ao buscar entregadores: ' + error.message });
  }
});

// CRUD para entregadores (banco de dados real)
router.post("/deliverymen", async (req, res) => {
  try {
    const { name, email, phone, vehicleType, status = true } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    const Person = require("../models/Person/PersonModel");
    const DeliveryMan = require("../models/DeliveryMan/DeliveryManModel");
    const mongoose = require("mongoose");
    
    // Criar pessoa primeiro
    const newPerson = new Person({
      name,
      email,
      phone: phone || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedPerson = await newPerson.save();
    
    // Criar entregador
    const newDeliveryman = new DeliveryMan({
      name,
      email,
      status,
      typeOfVehicle: vehicleType === 'Moto' ? 'MOTO' : vehicleType.toUpperCase(),
      person: savedPerson._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedDeliveryman = await newDeliveryman.save();
    
    // Retornar com populate
    const populatedDeliveryman = await DeliveryMan.findById(savedDeliveryman._id)
      .populate('person', 'name email phone');
    
    console.log('✅ [Backend] Entregador criado no banco:', populatedDeliveryman);
    res.status(201).json(populatedDeliveryman);
  } catch (error) {
    console.error('❌ [Backend] Erro ao criar entregador:', error);
    res.status(500).json({ error: 'Erro ao criar entregador: ' + error.message });
  }
});

router.put("/deliverymen/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, vehicleType, status } = req.body;
    
    console.log('🔍 [Backend] PUT /deliverymen/:id recebido:', { id, name, email, phone, vehicleType, status });
    
    const DeliveryMan = require("../models/DeliveryMan/DeliveryManModel");
    const Person = require("../models/Person/PersonModel");
    const mongoose = require("mongoose");
    
    // Tentar buscar por _id ObjectId primeiro
    let deliveryman;
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('🔍 [Backend] Buscando por ObjectId:', id);
      deliveryman = await DeliveryMan.findById(id).populate('person');
    } else {
      console.log('🔍 [Backend] Buscando por _id string:', id);
      deliveryman = await DeliveryMan.findOne({_id: id}).populate('person');
    }
    
    if (!deliveryman) {
      console.log('❌ [Backend] Entregador não encontrado com ID:', id);
      return res.status(404).json({ error: 'Entregador não encontrado' });
    }
    
    console.log('✅ [Backend] Entregador encontrado:', deliveryman);
    
    // Atualizar pessoa
    if (deliveryman.person) {
      console.log('🔄 [Backend] Atualizando pessoa:', deliveryman.person._id);
      await Person.findByIdAndUpdate(deliveryman.person._id, {
        name,
        email,
        phone: phone || '',
        updatedAt: new Date()
      });
    }
    
    // Mapear vehicleType para typeOfVehicle
    let mappedVehicleType = 'MOTO'; // default
    if (vehicleType === 'Moto') mappedVehicleType = 'MOTO';
    else if (vehicleType === 'Bicicleta') mappedVehicleType = 'BICYCLE';
    else if (vehicleType === 'Carro') mappedVehicleType = 'CAR';
    else if (vehicleType === 'Van') mappedVehicleType = 'VAN';
    
    console.log('🔄 [Backend] Mapeamento vehicleType:', vehicleType, '->', mappedVehicleType);
    
    // Atualizar entregador - usar ObjectId se for válido
    let updatedDeliveryman;
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('🔄 [Backend] Atualizando por ObjectId:', id);
      updatedDeliveryman = await DeliveryMan.findByIdAndUpdate(id, {
        name,
        email,
        status,
        typeOfVehicle: mappedVehicleType,
        updatedAt: new Date()
      }, { new: true }).populate('person', 'name email phone');
    } else {
      console.log('🔄 [Backend] Atualizando por _id string:', id);
      updatedDeliveryman = await DeliveryMan.findOneAndUpdate(
        {_id: id}, 
        {
          name,
          email,
          status,
          typeOfVehicle: mappedVehicleType,
          updatedAt: new Date()
        }, 
        { new: true }
      ).populate('person', 'name email phone');
    }
    
    console.log('✅ [Backend] Entregador atualizado no banco:', updatedDeliveryman);
    res.json(updatedDeliveryman);
  } catch (error) {
    console.error('❌ [Backend] Erro ao atualizar entregador:', error);
    console.error('❌ [Backend] Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro ao atualizar entregador: ' + error.message });
  }
});

router.delete("/deliverymen/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const DeliveryMan = require("../models/DeliveryMan/DeliveryManModel");
    
    // Soft delete
    const result = await DeliveryMan.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      updatedAt: new Date()
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Entregador não encontrado' });
    }
    
    console.log('✅ [Backend] Entregador excluído do banco:', id);
    res.json({ message: 'Entregador excluído com sucesso' });
  } catch (error) {
    console.error('❌ [Backend] Erro ao excluir entregador:', error);
    res.status(500).json({ error: 'Erro ao excluir entregador: ' + error.message });
  }
});

// Endpoint OPTIONS para notifications (pre-flight CORS)
router.options("/notifications", (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rota de notificações simplificada para admin
const Notification = require("../models/Mobility/Notification/NotificationModel");

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ deletedAt: { $exists: false } })
      .populate('user', 'name email')
      .populate('company', 'name')
      .select('user company type title message createdAt read _id')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Se não houver notificações, retornar dados mock
    if (!notifications || notifications.length === 0) {
      const mockNotifications = [
        {
          _id: "1",
          type: "order",
          title: "Novo Pedido Recebido",
          message: "Pedido #12345 foi recebido e está aguardando confirmação",
          createdAt: new Date('2024-01-15T10:30:00Z'),
          read: false,
          user: {
            _id: "user_1",
            name: "João Silva",
            email: "joao@economizebr.com"
          },
          company: {
            _id: "company_1",
            name: "Restaurantes Central"
          }
        },
        {
          _id: "2",
          type: "delivery",
          title: "Entregador em Trânsito",
          message: "Seu pedido está a caminho! Chegará em aproximadamente 15 minutos",
          createdAt: new Date('2024-01-15T11:45:00Z'),
          read: true,
          user: {
            _id: "user_2",
            name: "Maria Santos",
            email: "maria@economizebr.com"
          },
          company: {
            _id: "company_2",
            name: "Mercado Express"
          }
        },
        {
          _id: "3",
          type: "system",
          title: "Manutenção Programada",
          message: "O sistema estará em manutenção hoje das 23:00 às 01:00",
          createdAt: new Date('2024-01-15T09:00:00Z'),
          read: true,
          user: null,
          company: null
        },
        {
          _id: "4",
          type: "payment",
          title: "Pagamento Confirmado",
          message: "Pagamento do pedido #12346 foi confirmado com sucesso",
          createdAt: new Date('2024-01-15T14:20:00Z'),
          read: false,
          user: {
            _id: "user_3",
            name: "Pedro Costa",
            email: "pedro@economizebr.com"
          },
          company: {
            _id: "company_3",
            name: "Pizzaria Boa Vista"
          }
        }
      ];
      return res.json(mockNotifications);
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// TODO: Habilitar rotas de empresas após resolver dependências
// const CompanyRoute = require("./Company/CompanyRouter");
// router.use("/companies", CompanyRoute);

module.exports = router;
