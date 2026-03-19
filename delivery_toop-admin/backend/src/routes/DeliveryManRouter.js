const router = require("express").Router();
const deliveryMan = require("../controllers/DeliveryMan");
const deliveryManOnline = require("../controllers/DeliveryMan/Online");
const Queue = require("../controllers/DeliveryMan/Queue");

const checkFranchises = require("../middleware/checkFranchises");

const byName = require("../controllers/DeliveryMan/listByName");

router.get("/by-name/:name", checkFranchises, byName);

router.get("/paginator", checkFranchises, deliveryMan.method.paginator);

router.get("/list/:id?", deliveryMan.method.list);
router.get("/search", deliveryMan.method.search);
router.get("/delivery-price/:orderId", deliveryMan.method.deliveryPrice);
router.put("/update/:id", deliveryMan.method.update);
router.post("/update-background/:id", deliveryMan.method.updateLocation); // utilizado no background do aap, biblioteca só envia via POST

router.delete("/delete/:id", deliveryMan.method.remove);

router.post("/register", deliveryMan.method.register);
router.post("/race/canceled", deliveryMan.method.raceCanceled);
// Retorna um DeliveryMan para orderStatus
router.post("/searchOne", deliveryMan.method.searchOne);
router.post("/search-one", deliveryMan.method.searchOne);
router.post("/", checkFranchises, deliveryMan.method.create);
router.get("/race/list", deliveryMan.method.raceCanceledList);

// History acept - recused Delivery
router.post("/race-history", deliveryMan.method.raceHistory);

//Salva em que o entregador esta online
router.get("/online-last-week/:deliveryMan", deliveryManOnline.method.ListOnlineLastWeek);
router.post("/online", deliveryManOnline.method.create);
router.put("/offline/:deliveryMan", deliveryManOnline.method.update);

router.get("/DeliveryStatus/", checkFranchises, deliveryMan.method.listDeliveryManOrderStatus);

// Pesquisa as Filas para serem processadas
router.get("/queue", Queue.method.list);
router.get("/queue/status/:status", Queue.method.statusOne);
router.get("/queue/have-queue-active/:orderId", Queue.method.haveQueueActive); // Front-end

// Altera Estado da Fila
router.put("/queue/:queueId", Queue.method.updateDeliveryQueue);
router.put("/queue/:queueId/status", Queue.method.updateStatus);

// Delivery-man recebeu a notificação
router.put("/queue-notification-received/:orderId", Queue.method.updateReceived);

// Voltar um pedido para retentativa
router.put("/back-to-queue", Queue.method.backToQueue);

module.exports = router;
