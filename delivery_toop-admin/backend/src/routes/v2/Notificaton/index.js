const router = require("express").Router();

const ListTopic = require('../../../controllers/v2/Notification/Topic/ListTopics');
const ListCustomerTopic = require('../../../controllers/v2/Notification/Topic/ListCustomerTopic');
const TotalCustomerTopic = require('../../../controllers/v2/Notification/Topic/TotalCustomerTopic');
const CreateTopic = require('../../../controllers/v2/Notification/Topic/CreateTopic');
const CreateCustomerTopic = require('../../../controllers/v2/Notification/Topic/CreateCustomerTopic');

router.get('/', ListTopic);
router.get('/customer', ListCustomerTopic);
router.get('/customer/total', TotalCustomerTopic);
router.post('/', CreateTopic);
router.post('/customer', CreateCustomerTopic);

module.exports = router;
