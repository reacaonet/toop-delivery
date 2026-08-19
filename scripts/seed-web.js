db.categories.insertMany([
  { name: "Lanches", company: ObjectId("6a831a7b736b6dbe209df8a3"), order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Pizzas", company: ObjectId("6a831a7b736b6dbe209df8a3"), order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Bebidas", company: ObjectId("6a831a7b736b6dbe209df8a3"), order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Doces", company: ObjectId("6a831a7b736b6dbe209df8a3"), order: 4, active: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Combos", company: ObjectId("6a831a7b736b6dbe209df8a3"), order: 5, active: true, createdAt: new Date(), updatedAt: new Date() }
]);
print("Categorias: " + db.categories.countDocuments());

var cats = db.categories.find({ company: ObjectId("6a831a7b736b6dbe209df8a3") }).toArray();
var lanchesId = cats.find(c => c.name === "Lanches")._id;
var pizzasId = cats.find(c => c.name === "Pizzas")._id;
var bebidasId = cats.find(c => c.name === "Bebidas")._id;
var docesId = cats.find(c => c.name === "Doces")._id;
var combosId = cats.find(c => c.name === "Combos")._id;

db.products.insertMany([
  { name: "X-Burger", description: "Hamburguer com queijo, alface e tomate", price: 22.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: lanchesId, preparationTime: 15, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "X-Bacon", description: "Hamburguer com queijo e bacon crocante", price: 27.90, promoPrice: 24.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: lanchesId, preparationTime: 15, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "X-Tudo", description: "Hamburguer completo com ovo, presunto e bacon", price: 32.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: lanchesId, preparationTime: 20, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Frango com Catupiry", description: "Pizza de frango com catupiry cremoso", price: 44.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: pizzasId, preparationTime: 30, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Pepperoni", description: "Pizza de pepperoni com queijo muçarela", price: 49.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: pizzasId, preparationTime: 30, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Margherita", description: "Pizza de tomate, manjericão e muçarela", price: 39.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: pizzasId, preparationTime: 30, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Coca-Cola 2L", description: "Coca-Cola garrafa 2 litros", price: 14.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: bebidasId, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Suco Natural", description: "Suco de laranja natural 500ml", price: 9.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: bebidasId, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Brownie", description: "Brownie de chocolate com calda", price: 12.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: docesId, active: true, available: true, createdAt: new Date(), updatedAt: new Date() },
  { name: "Combo X-Burger + Refri", description: "X-Burger + Coca-Cola 500ml", price: 29.90, promoPrice: 26.90, company: ObjectId("6a831a7b736b6dbe209df8a3"), category: combosId, preparationTime: 15, active: true, available: true, createdAt: new Date(), updatedAt: new Date() }
]);
print("Produtos: " + db.products.countDocuments());
