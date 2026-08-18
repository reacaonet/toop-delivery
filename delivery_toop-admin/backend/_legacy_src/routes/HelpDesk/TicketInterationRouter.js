const router = require('express').Router();

const ticketInterationController = require('../../controllers/HelpDesk/TicketInteration');

router.get('/paginator', ticketInterationController.method.paginator);
router.get('/listPorNome', ticketInterationController.method.listPorNome);
router.get('/', ticketInterationController.method.list);
router.post('/', ticketInterationController.method.create);
router.delete('/:id', ticketInterationController.method.remove);
router.put('/:id', ticketInterationController.method.update);

module.exports = router;