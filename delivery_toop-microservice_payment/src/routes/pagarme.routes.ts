/* eslint-disable new-cap */
import * as express from 'express';
const PagarMeRoute = express.Router();

/** Payments */
import sales from '../controllers/PagarMe/sales';
import pix from '../controllers/PagarMe/PIX/generateBilling';

import getCard from '../controllers/PagarMe/getCard';
import saveCard from '../controllers/PagarMe/saveCard';
import getTransaction from '../controllers/PagarMe/getTransaction';

import createRecipient from '../controllers/PagarMe/Recipient/createRecipient';
import updateRecipient from '../controllers/PagarMe/Recipient/updateRecipient';

/** ChargeBack */
import chargeback from '../controllers/PagarMe/chargeback';

PagarMeRoute.post('/recipient', createRecipient);
PagarMeRoute.put('/recipient/:recipientId', updateRecipient);

PagarMeRoute.get(`/card/:cardId`, getCard);
PagarMeRoute.post(`/cards`, saveCard);

PagarMeRoute.get('/transactions/:id', getTransaction);
PagarMeRoute.post('/transactions', sales);
PagarMeRoute.post('/pix', pix);

PagarMeRoute.post('/cancellation/:transactionId', chargeback);

export default PagarMeRoute;
