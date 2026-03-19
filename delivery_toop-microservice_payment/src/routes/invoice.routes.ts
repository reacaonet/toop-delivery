/* eslint-disable new-cap */
import * as express from 'express';
const InvoiceRoute = express.Router();
import CreateController from '../controllers/Invoice/CreateController';
import UpController from '../controllers/Invoice/UpController';
import UpPriceController from '../controllers/Invoice/UpPriceController';
import ListController from '../controllers/Invoice/ListController';
import ReceivableController from '../controllers/Invoice/ReceivableController';


// rotas Temporárias
InvoiceRoute.get(`/invoice-up`, UpController);
InvoiceRoute.get(`/invoice-up-price`, UpPriceController);

InvoiceRoute.get('/receivable', ReceivableController);
InvoiceRoute.get('/:id?', ListController);
InvoiceRoute.post(`/`, CreateController);

export default InvoiceRoute;
