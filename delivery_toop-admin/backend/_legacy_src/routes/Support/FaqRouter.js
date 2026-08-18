const router = require('express').Router();

const faqController = require('../../controllers/Support/Faq');

router.get('/paginator', faqController.method.paginator);
router.get('/', faqController.method.list);
router.post('/', faqController.method.create);
router.put('/:id', faqController.method.update);
router.delete('/:id', faqController.method.remove);

module.exports = router;