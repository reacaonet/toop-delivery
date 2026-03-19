/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {Request, Response} from 'express';

/** Model */
import LogsModel from '../../../models/logsModel';

/** Service */
import IuguInvoicesServices from '../../../services/Iugu/invoices';
import IuguCustomersServices from '../../../services/Iugu/customers';

/** validators */
import validatorInvoice from './../../../validators/Iugu/invoice';

let appDebug: any = {};

const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body;

    appDebug = {};
    appDebug.body = body;

    const isValidPayload = validatorInvoice(body);
    if (isValidPayload !== true) {
      return res.status(400).send({
        message: isValidPayload,
        data: 'Fail validation',
      });
    }

    if (!body.customer_id) {
      const iuguCustomersServices = new IuguCustomersServices();
      const customer = await iuguCustomersServices.store({
        ...body.payer,
        ...body.payer.address,
      });
      body.customer_id = customer.id;
    }

    const iuguInvoicesServices = new IuguInvoicesServices();
    let invoice = await iuguInvoicesServices.store(body);

    if (!invoice || !invoice.id) {
      return res.status(400).send({
        message: 'oops fail creating invoice in iugu',
        data: invoice,
      });
    }

    if (body.payable_with === 'credit_card') {
      const directInvoice = await iuguInvoicesServices.storeCharge({
        customer_payment_method_id: body.token ?? '',
        // token: body.token,
        customer_id: body.customer_id,
        invoice_id: invoice.id,
        payer: body.payer,
        items: body.items,
        order_id: body.order_id,
      });
      invoice = await iuguInvoicesServices.getById(invoice.id);
      invoice.response = directInvoice;
      invoice.acquirerMessage = acquirerMessage(invoice.response.LR);
    } else {
      invoice = await iuguInvoicesServices.getById(invoice.id);
    }

    invoice.customer_id = body.customer_id;
    invoice.statusMessage = statusMessage(invoice.status);
    appDebug.invoice = invoice;

    return res.status(200).send(invoice);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail create Sales in iugu',
      data: errPayload,
    });
  }
};

const retry = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {invoice_id} = req.params;
    const body = req.body;

    appDebug = {};
    appDebug.body = body;

    const iuguInvoicesServices = new IuguInvoicesServices();

    const retry = await iuguInvoicesServices.storeCharge({
      customer_payment_method_id: body.token,
      invoice_id: invoice_id,
    });

    const invoice = await iuguInvoicesServices.getById(invoice_id);

    invoice.acquirerMessage = acquirerMessage(retry.LR);
    invoice.statusMessage = statusMessage(retry.status);
    invoice.response = retry;

    appDebug.retry = retry;
    appDebug.invoice = invoice;

    return res.status(200).send(invoice);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail create Sales in iugu',
      data: errPayload,
    });
  }
};

const cancel = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {invoice_id} = req.params;
    const body = req.body;

    appDebug = {};
    appDebug.body = body;

    const iuguInvoicesServices = new IuguInvoicesServices();

    const cancel = await iuguInvoicesServices.cancel(invoice_id);

    appDebug.cancel = cancel;

    return res.status(200).send(cancel);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail cancel Sales in iugu',
      data: errPayload,
    });
  }
};

const refund = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {invoice_id} = req.params;
    const body = req.body;

    appDebug = {};
    appDebug.body = body;

    const iuguInvoicesServices = new IuguInvoicesServices();

    const refund = await iuguInvoicesServices.refund(invoice_id);

    appDebug.refund = refund;

    return res.status(200).send(refund);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail refund Sales in iugu',
      data: errPayload,
    });
  }
};

const get = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {invoice_id} = req.params;

    const iuguInvoicesServices = new IuguInvoicesServices();

    const invoice = await iuguInvoicesServices.getById(invoice_id);

    return res.status(200).send(invoice);
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail iugu', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail get Sales in iugu',
      data: errPayload,
    });
  }
};
const createLog = async (err: any, errPayload: any) => {
  try {
    LogsModel.create({
      typeLog: 'ERROR',
      description: {
        messageErr: err.message,
        err: errPayload,
        appDebug: appDebug,
      },
      category: 'iugu',
      originError: 'fail-invoices',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

const statusMessage = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pagamento não efetuado';
    case 'paid':
      return 'Pagamento realizado';
    case 'captured':
      return 'Pagamento realizado';
    case 'canceled':
      return 'Fatura cancelada';
    case 'in_analysis':
      return 'Fatura em analise';
    case 'draft':
      return 'a fatura ainda não foi gerada, apenas os dados foram salvos';
    case 'partially_paid':
      return 'Pagamento parcial';
    case 'refunded':
      return 'Pagamento recusado, não autorizado';
    case 'expired':
      return 'Pagamento expirado';
    case 'in_protest':
      return 'Fatura em protesto';
    case 'chargeback':
      return 'Fatura Contestada';
    default:
      return '';
  }
};

const acquirerMessage = (code: string) => {
  switch (`${code}`) {
    case '00':
      return 'Transação autorizada com sucesso.';
    case '000':
      return 'Transação autorizada com sucesso.';
    case '01':
      return 'Transação não autorizada. Referida (suspeita de fraude) pelo banco emissor.';
    case '02':
      return 'Transação não autorizada. Referida (suspeita de fraude) pelo banco emissor.';
    case '03':
      return 'Transação não permitida. Estabelecimento inválido. Entre com contato com a Cielo.';
    case '04':
      return 'Transação não autorizada. Cartão bloqueado pelo banco emissor.';
    case '05':
      return 'Transação não autorizada. Não foi possível processar a transação. Questão relacionada a segurança, inadimplencia ou limite do portador.';
    case '06':
      return 'Transação não autorizada. Não foi possível processar a transação. Cartão cancelado permanentemente pelo banco emissor.';
    case '07':
      return 'Transação não autorizada por regras do banco emissor.';
    case '08':
      return 'Transação não autorizada. Código de segurança inválido. Oriente o portador a corrigir os dados e tentar novamente.';
    case '11':
      return 'Transação autorizada com sucesso.';
    case '12':
      return 'Não foi possível processar a transação. Solicite ao portador que verifique os dados do cartão e tente novamente.';
    case '13':
      return 'Transação não permitida. Valor inválido. Solicite ao portador que reveja os dados e novamente. Se o erro persistir, entre em contato com a Cielo.';
    case '14':
      return 'Transação não autorizada. Cartão inválido. Pode ser bloqueio do cartão no banco emissor, dados incorretos ou tentativas de testes de cartão. Use o Algoritmo de Lhum (Mod 10) para evitar transações não autorizadas por esse motivo. Consulte https://www.cielo.com.br/desenvolvedores para implantar o Algoritmo de Lhum.';
    case '15':
      return 'Transação não autorizada. Banco emissor indisponível.';
    case '19':
      return 'Não foi possível processar a transação. Refaça a transação ou tente novamente mais tarde. Se o erro persistir, entre em contato com a Cielo.';
    case '21':
      return 'Não foi possível processar o cancelamento. Se o erro persistir, entre em contato com a Cielo.';
    case '22':
      return 'Não foi possível processar a transação. Número de parcelas inválidas. Se o erro persistir, entre em contato com a Cielo.';
    case '23':
      return 'Não foi possível processar a transação. Valor da prestação inválido. Se o erro persistir, entre em contato com a Cielo.';
    case '24':
      return 'Não foi possível processar a transação. Quantidade de parcelas inválido. Se o erro persistir, entre em contato com a Cielo.';
    case '25':
      return 'Não foi possível processar a transação. Solicitação de autorização não enviou o número do cartão. Se o erro persistir, verifique a comunicação entre loja virtual e Cielo.';
    case '28':
      return 'Não foi possível processar a transação. Arquivo temporariamente indisponível. Reveja a comunicação entre Loja Virtual e Cielo. Se o erro persistir, entre em contato com a Cielo.';
    case '30':
      return 'Não foi possível processar a transação. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir verifique a comunicação com a Cielo esta sendo feita corretamente.';
    case '39':
      return 'Transação não autorizada. Erro no banco emissor.';
    case '41':
      return 'Transação não autorizada. Cartão bloqueado por perda.';
    case '43':
      return 'Transação não autorizada. Cartão bloqueado por roubo.';
    case '51':
      return 'Transação não autorizada. Limite excedido/sem saldo.';
    case '52':
      return 'Não foi possível processar a transação. Cartão com dígito de controle inválido.';
    case '53':
      return 'Transação não permitida. Cartão poupança inválido.';
    case '54':
      return 'Transação não autorizada. Cartão vencido.';
    case '55':
      return 'Transação não autorizada. Senha inválida.';
    case '57':
      return 'Transação não autorizada. Transação não permitida para o cartão.';
    case '58':
      return 'Transação não permitida. Opção de pagamento inválida. Reveja se a opção de pagamento escolhida está habilitada no cadastro';
    case '59':
      return 'Transação não autorizada. Suspeita de fraude.';
    case '60':
      return 'Transação não autorizada. Tente novamente. Se o erro persistir o portador deve entrar em contato com o banco emissor.';
    case '61':
      return 'Transação não autorizada. Banco emissor indisponível.';
    case '62':
      return 'Transação não autorizada. Cartão restrito para uso doméstico.';
    case '63':
      return 'Transação não autorizada. Violação de segurança.';
    case '64':
      return 'Transação não autorizada. Entre em contato com seu banco emissor.';
    case '65':
      return 'Transação não autorizada. Excedida a quantidade de transações para o cartão.';
    case '67':
      return 'Transação não autorizada. Cartão bloqueado para compras hoje. Bloqueio pode ter ocorrido por excesso de tentativas inválidas. O cartão será desbloqueado automaticamente à meia noite.';
    case '70':
      return 'Transação não autorizada. Limite excedido/sem saldo.';
    case '72':
      return 'Cancelamento não efetuado. Saldo disponível para cancelamento insuficiente. Se o erro persistir, entre em contato com a Cielo.';
    case '74':
      return 'Transação não autorizada. A senha está vencida.';
    case '75':
      return 'Transação não autorizada.';
    case '76':
      return 'Cancelamento não efetuado. Banco emissor não localizou a transação original';
    case '77':
      return 'Cancelamento não efetuado. Não foi localizado a transação original';
    case '78':
      return 'Transação não autorizada. Cartão bloqueado primeiro uso. Solicite ao portador que desbloqueie o cartão diretamente com seu banco emissor.';
    case '80':
      return 'Transação não autorizada. Data da transação ou data do primeiro pagamento inválida.';
    case '82':
      return 'Transação não autorizada. Cartão Inválido. Solicite ao portador que reveja os dados e tente novamente.';
    case '83':
      return 'Transação não autorizada. Erro no controle de senhas';
    case '85':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case '86':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case '89':
      return 'Transação não autorizada. Erro na transação. O portador deve tentar novamente e se o erro persistir, entrar em contato com o banco emissor.';
    case '90':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case '91':
      return 'Transação não autorizada. Banco emissor temporariamente indisponível.';
    case '92':
      return 'Transação não autorizada. Tempo de comunicação excedido.';
    case '93':
      return 'Transação não autorizada. Violação de regra - Possível erro no cadastro.';
    case '96':
      return 'Não foi possível processar a transação. Falha no sistema da Cielo. Se o erro persistir, entre em contato com a Cielo.';
    case '97':
      return 'Transação não autorizada. Valor não permitido para essa transação.';
    case '98':
      return 'Transação não autorizada. Sistema do emissor sem comunicação. Se for geral, verificar SITEF, GATEWAY e/ou Conectividade.';
    case '99':
      return 'Transação não autorizada. Sistema do emissor sem comunicação. Tente mais tarde. Pode ser erro no SITEF, favor verificar !';
    case '999':
      return 'Transação não autorizada. Sistema do emissor sem comunicação. Tente mais tarde. Pode ser erro no SITEF, favor verificar !';
    case 'AA':
      return 'Tempo excedido na comunicação com o banco emissor. Oriente o portador a tentar novamente, se o erro persistir será necessário que o portador contate seu banco emissor.';
    case 'AC':
      return 'Transação não permitida. Cartão de débito sendo usado com crédito. Solicite ao portador que selecione a opção de pagamento Cartão de Débito.';
    case 'AE':
      return 'Tempo excedido na comunicação com o banco emissor. Oriente o portador a tentar novamente, se o erro persistir será necessário que o portador contate seu banco emissor.';
    case 'AF':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case 'AG':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case 'AH':
      return 'Transação não permitida. Cartão de crédito sendo usado com débito. Solicite ao portador que selecione a opção de pagamento Cartão de Crédito.';
    case 'AI':
      return 'Transação não autorizada. Autenticação não foi realizada. O portador não concluiu a autenticação. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir, entre em contato com a Cielo informando o BIN (6 primeiros dígitos do cartão)';
    case 'AJ':
      return 'Transação não permitida. Transação de crédito ou débito em uma operação que permite apenas Private Label. Solicite ao portador que tente novamente selecionando a opção Private Label. Caso não disponibilize a opção Private Label verifique na Cielo se o seu estabelecimento permite essa operação.';
    case 'AV':
      return 'Falha na validação dos dados da transação. Oriente o portador a rever os dados e tentar novamente.';
    case 'BD':
      return 'Transação não permitida. Houve um erro no processamento.Solicite ao portador que digite novamente os dados do cartão, se o erro persistir pode haver um problema no terminal do lojista, nesse caso o lojista deve entrar em contato com a Cielo.';
    case 'BL':
      return 'Transação não autorizada. Limite diário excedido. Solicite ao portador que entre em contato com seu banco emissor.';
    case 'BM':
      return 'Transação não autorizada. Cartão inválido. Pode ser bloqueio do cartão no banco emissor ou dados incorretos. Tente usar o Algoritmo de Lhum (Mod 10) para evitar transações não autorizadas por esse motivo.';
    case 'BN':
      return 'Transação não autorizada. O cartão ou a conta do portador está bloqueada. Solicite ao portador que entre em contato com seu banco emissor.';
    case 'BO':
      return 'Transação não permitida. Houve um erro no processamento. Solicite ao portador que digite novamente os dados do cartão, se o erro persistir, entre em contato com o banco emissor.';
    case 'BP':
      return 'Transação não autorizada. Não possível processar a transação por um erro relacionado ao cartão ou conta do portador. Solicite ao portador que entre em contato com o banco emissor.';
    case 'BV':
      return 'Transação não autorizada. Cartão vencido.';
    case 'CF':
      return 'Transação não autorizada. Falha na validação dos dados. Solicite ao portador que entre em contato com o banco emissor.';
    case 'CG':
      return 'Transação não autorizada. Falha na validação dos dados. Solicite ao portador que entre em contato com o banco emissor.';
    case 'DA':
      return 'Transação não autorizada. Falha na validação dos dados. Solicite ao portador que entre em contato com o banco emissor.';
    case 'DF':
      return 'Transação não permitida. Falha no cartão ou cartão inválido. Solicite ao portador que digite novamente os dados do cartão, se o erro persistir, entre em contato com o banco';
    case 'DM':
      return 'Transação não autorizada. Limite excedido/sem saldo.';
    case 'DQ':
      return 'Transação não autorizada. Falha na validação dos dados. Solicite ao portador que entre em contato com o banco emissor.';
    case 'DS':
      return 'Transação não autorizada. Transação não permitida para o cartão.';
    case 'EB':
      return 'Transação não autorizada. Limite diário excedido. Solicite ao portador que entre em contato com seu banco emissor.';
    case 'EE':
      return 'Transação não permitida. Valor da parcela inferior ao mínimo permitido. Não é permitido parcelas inferiores a R$ 5,00. Necessário rever calculo para parcelas.';
    case 'EK':
      return 'Transação não autorizada. Transação não permitida para o cartão. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir significa que o lojista não possui essa modalidade de pagamento habilitada. Entre em contato com a Cielo e solicite a habilitação dessa modalidade.';
    case 'FA':
      return 'Transação não autorizada AmEx.';
    case 'FC':
      return 'Transação não autorizada. Oriente o portador a entrar em contato com o banco emissor.';
    case 'FD':
      return 'Transação não autorizada por regras do banco emissor.';
    case 'FE':
      return 'Transação não autorizada. Data da transação ou data do primeiro pagamento inválida.';
    case 'FF':
      return 'Transação de cancelamento autorizada com sucesso. ATENÇÂO: Esse retorno é para casos de cancelamentos e não para casos de autorizações.';
    case 'FG':
      return 'Transação não autorizada. Oriente o portador a entrar em contato com a Central de Atendimento AmEx.';
    case 'FG':
      return 'Transação não autorizada. Oriente o portador a entrar em contato com a Central de Atendimento AmEx.';
    case 'GA':
      return 'Transação não autorizada. Referida pelo Lynx Online de forma preventiva. A Cielo entrará em contato com o lojista sobre esse caso.';
    case 'GD':
      return 'Transação não permitida. Transação não é possível ser processada no estabelecimento. Entre em contato com a Cielo para obter mais detalhes.';
    case 'HJ':
      return 'Transação não permitida. Código da operação Coban inválido.';
    case 'IA':
      return 'Transação não permitida. Indicador da operação Coban inválido.';
    case 'JB':
      return 'Transação não permitida. Valor da operação Coban inválido.';
    case 'KA':
      return 'Transação não permitida. Houve uma falha na validação dos dados. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir verifique a comunicação entre loja virtual e Cielo.';
    case 'KB':
      return 'Transação não permitida. Selecionado a opção incorreta. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir deve ser verificado a comunicação entre loja virtual e Cielo.';
    case 'KE':
      return 'Transação não autorizada. Falha na validação dos dados. Opção selecionada não está habilitada. Verifique as opções disponíveis para o portador.';
    case 'N7':
      return 'Transação não autorizada. Código de segurança inválido. Oriente o portador corrigir os dados e tentar novamente.';
    case 'R1':
      return 'Transação não autorizada. Não foi possível processar a transação. Questão relacionada a segurança, inadimplencia ou limite do portador.';
    case 'U3':
      return 'Transação não permitida. Houve uma falha na validação dos dados. Solicite ao portador que reveja os dados e tente novamente. Se o erro persistir verifique a comunicação entre loja virtual e Cielo.';

    default:
      return 'Pagamento Não autorizado';
  }
};

export default {store, retry, cancel, refund, get};
