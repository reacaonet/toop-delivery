const router = require("express").Router();

const cartController = require("../../controllers/Shopping/Cart");
const checkFranchises = require("../../middleware/checkFranchises");

router.get("/paginator", checkFranchises, cartController.method.paginator);

// Busca Carrinho de compras filtrando por customer e company
router.get("/all", checkFranchises, cartController.method.all);
router.get("/current/:cart", cartController.method.cartUser);

// Refazer a compra
router.get("/cart-reorder/:cart", cartController.method.cartReorder)

// Busca Carrinho de compras filtrando por customer e company
router.get("/:customer/:company?", cartController.method.list);

// Cria um novo Carrinho de compras vinculado a um customer e company
router.post("/:customer/:company", cartController.method.create);
// Atualiza o carrinho de compras
router.put("/:id", cartController.method.update);
router.delete("/:id", cartController.method.remove);

module.exports = router;
