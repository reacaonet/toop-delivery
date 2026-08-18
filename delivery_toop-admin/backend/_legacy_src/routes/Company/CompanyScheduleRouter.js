const router = require('express').Router();

const scheduleController = require('../../controllers/Company/schedule');

router.get('/:company', scheduleController.method.list);
router.post('/:company', scheduleController.method.create);
router.put('/:id', scheduleController.method.update);
router.delete('/:id', scheduleController.method.remove);

module.exports = router;