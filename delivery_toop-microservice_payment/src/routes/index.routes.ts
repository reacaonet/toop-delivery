import {Express, Router} from 'express';

/* Routes */
import Invoice from './invoice.routes';
import QueueSplitRoute from './queueSplit.routes';
import PagarMeRoute from './pagarme.routes';
import IuguRoute from './iugu.routes';

/* Controllers */
import Health from '../controllers/Health';
import LogControll from '../controllers/LogControll';
import Token from '../controllers/Token';
import * as Payment from '../controllers/Payment';
import * as Schedule from '../controllers/Schedule';
import * as Sales from '../controllers/Sales';
import * as Subordinates from '../controllers/Subordinates';
import * as Transaction from '../controllers/Transaction';

// After Transaction
import AfterTransaction from '../controllers/Split/AfterTransactionController';

function Routes(Route: Express): Router {
  return (
    Route.use(LogControll.index),
    Route.get(`/${process.env.LTS}/health`, Health.index),
    Route.post(`/${process.env.LTS}/token`, Token.index),
    // Payment
    Route.get(`/${process.env.LTS}/payment/card/:tokenCard`, Payment.listCard),
    Route.post(`/${process.env.LTS}/payment/card`, Payment.saveCard),
    Route.get(
      `/${process.env.LTS}/payment/binCard/:cardNumber`,
      Payment.binCard,
    ),
    // Payment Information
    Route.get(
      `/${process.env.LTS}/payment/information/:paymentId`,
      Payment.information,
    ),
    // Schedule
    Route.get(
      `/${process.env.LTS}/schedule/transactions`,
      Schedule.listTransactions().list,
    ),
    Route.get(
      `/${process.env.LTS}/schedule/transaction/:paymentId/:merchantId`,
      Schedule.oneTransaction().one,
    ),
    Route.get(
      `/${process.env.LTS}/schedule/receivable`,
      Schedule.listReceivable().list,
    ),
    // Sales
    Route.post(`/${process.env.LTS}/sales`, Sales.createPayment),
    // Subordinates
    Route.post(`/${process.env.LTS}/subordinates`, Subordinates.create),
    Route.get(`/${process.env.LTS}/subordinates/:id`, Subordinates.list),
    // Cancellation
    Route.post(
      `/${process.env.LTS}/cancellation/:PaymentId`,
      Sales.cancellation,
    ),
    // Cancellation Partial
    Route.put(
      `/${process.env.LTS}/cancellation-partial/:PaymentId`,
      Sales.cancellationPartial,
    ),
    // Transaction
    Route.get(`/${process.env.LTS}/transaction`, Transaction.listAll),
    // INVOICE
    Route.use(`/${process.env.LTS}/invoice`, Invoice),
    // Queue Split
    Route.use(`/${process.env.LTS}/queue-split`, QueueSplitRoute),
    // pagar.me
    Route.use(`/${process.env.LTS}/pagar-me`, PagarMeRoute),
    // iugu
    Route.use(`/${process.env.LTS}/iugu`, IuguRoute),
    // Split Pos-Transaction
    Route.post(`/${process.env.LTS}/split/after/:PaymentId`, AfterTransaction)
  );
}

export default Routes;
