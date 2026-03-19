/* eslint-disable new-cap */
import * as express from 'express';
const IuguRoute = express.Router();

import invoice from '../controllers/Iugu/Invoice';
import customer from '../controllers/Iugu/Customer';
import creditCard from '../controllers/Iugu/CreditCard';

IuguRoute.post('/customers', customer.store);
IuguRoute.post('/customers/:customer_id/credit-cards', creditCard.store);

IuguRoute.post('/transactions', invoice.store);
IuguRoute.get('/transactions/:invoice_id', invoice.get);
IuguRoute.post('/transactions/:invoice_id/retry', invoice.retry);
IuguRoute.post('/transactions/:invoice_id/cancel', invoice.cancel);
IuguRoute.post('/transactions/:invoice_id/refund', invoice.refund);

export default IuguRoute;
