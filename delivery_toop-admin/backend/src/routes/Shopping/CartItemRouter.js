const router = require('express').Router();
const itemController = require('../../controllers/Shopping/Cart/Item');

// shopper
router.put('/shopper/:shopper', itemController.method.checkItem);
router.post('/shopper/:shopper/card/:shoppingCart', itemController.method.addItem);
router.delete('/shopper/:shopper/item/:itemId', itemController.method.deleteItem);
router.put('/shopper/:shopper/item/:itemId', itemController.method.changeItem);


// lista de carrinho com itens removidos e alterados
router.get('/show-all/:cart', itemController.method.showAll);

// Item cart
router.get('/:cart', itemController.method.list);
// Adiciona um produto ao carrinho
router.post('/:cart/:product', itemController.method.create);
router.put('/:cart/:id', itemController.method.update);
router.delete('/:cart/:id', itemController.method.remove);


module.exports = router;
