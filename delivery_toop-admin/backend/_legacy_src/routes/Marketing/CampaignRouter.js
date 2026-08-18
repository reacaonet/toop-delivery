const router = require('express').Router();

const campaignController = require('../../controllers/marketing/Campaign');

router.get('/paginator', campaignController.method.paginator);
router.get('/', campaignController.method.list);
router.post('/', campaignController.method.create);
router.put('/:id', campaignController.method.update);
router.delete('/:id', campaignController.method.remove);


module.exports = router;