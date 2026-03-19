/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/camelcase */
import {Request, Response} from 'express';

/** Model */
import LogsModel from '../../models/logsModel';

/** Service */
import {apiPagarMe} from '../../services/PagarMe/api';

const statusMessage = (status: string) => {
  switch (status) {
  case 'processing':
    return 'Transação está em processo de autorização';
  case 'authorized':
    return 'Transação foi autorizada';
  case 'paid':
    return 'Pagamento realizado';
  case 'refunded':
    return 'Pagamento estornado';
  case 'waiting_payment':
    return 'Aguardando Pagamento';
  case 'refused':
    return 'Pagamento recusado, não autorizado';
  case 'chargedback':
    return 'Pagamento sofreu chargeback';
  case 'analyzing':
    return 'Pagamento encaminhada para a análise manual feita por um especialista em prevenção a fraude';
  case 'pending_review':
    return 'Pagamento pendente de revisão manual por parte do lojista';
  default:
    return '';
  }
};

const acquirerMessage = (code: string) => {
  switch (`${code}`) {
  case '1000':
    return 'Não Autorizado, entre em contato com banco/emissor do cartão';
  case '1001':
    return 'Cartão vencido ou data de vencimento incorreta. Oriente o usuário a contatar o banco/emissor do cartão';
  case '1002':
    return 'Pagamento Recusado, Cartão com suspeita de fraude';
  case '1003':
    return 'Pagamento Recusado, favor contatar a operadora de cartão';
  case '1004':
    return 'Cartão com restrição, entre em contato com banco/emissor do cartão';
  case '1005':
    return 'Não Autorizado, favor contatar a operadora de cartão';
  case '1006':
    return 'Não Autorizado, excedeu o número de tentativas';
  case '1007':
    return 'Transação recusada pelo banco, entre em contato com banco/emissor do cartão';
  case '1008':
    return 'Transação recusada pelo banco, entre em contato com banco/emissor do cartão';
  case '1009':
    return 'Pagamento Não autorizado, entre em contato com banco/emissor do cartão';
  case '1012':
    return 'Senha necessária para efetuar a transação';
  case '1013':
    return 'Taxa inválida';
  case '1016':
    return 'Saldo insuficiente';
  case '1017':
    return 'Senha incorreta';
  case '1018':
    return 'Não há registros deste cartão';
  case '1019':
    return 'Sistema de prevenção do banco não autorizou a compra, entre em contato com banco/emissor do cartão';
  case '1022':
    return 'Transação não autorizada por violação de segurança';
  case '1024':
    return 'Transação não autorizada por violação das leis';
  case '1025':
    return 'Cartão desabilitado, entre em contato com banco/emissor do cartão';
  case '1029':
    return 'Não autorizado, Cartão com suspeita de falsificação';
  case '1030':
    return 'Não autorizado, Moeda não suportada pelo cartão';
  case '1032':
    return 'Cartão bloqueado por perda ou roubo';
  case '1033':
    return 'Período para autorização solicitada não aceito';
  case '1034':
    return 'Não autorizado, Período da autorização expirado';
  case '1035':
  case '1036':
  case '1037':
  case '1038':
  case '1039':
    return 'Não autorizado, entre em contato com banco/emissor do cartão';
  case '1040':
    return 'Não autorizado, Cartão inadimplente';
  case '1041':
  case '1042':
    return 'Não autorizado, Conta com status negativo';
  case '1046':
    return 'Não autorizado, Valor da Transação não encontrado';
  case '1049':
  case '1050':
    return 'Não autorizado, Banco/emissor do cartão inválido';
  case '1058':
    return 'Não autorizado, Informações pessoais não encontradas';
  case '1068':
  case '1069':
  case '1070':
    return 'Não autorizado, Número do documento de identificação do usuário inválido';
  case '2000':
    return 'Transação recusada pelo banco, entre em contato com banco/emissor do cartão';
  case '2001':
    return 'Cartão vencido ou data de vencimento incorreta, entre em contato com banco/emissor do cartão';
  case '2002':
    return 'Não autorizado, Transação com suspeita de fraude';
  case '2003':
    return 'Não autorizado, entre em contato com banco/emissor do cartão';
  case '2004':
  case '2007':
    return 'Cartão com restrição, entre em contato com banco/emissor do cartão';
  case '2008':
  case '2009':
    return 'Cartão bloqueado por perda ou roubo';
  case '2010':
    return 'Cartão com suspeita de falsificação';
  case '5007':
    return 'Cartão de débito, por favor informe um cartão de crédito';
  case '5016':
    return 'O valor Solicitado para captura não é válido';
  case '5025':
    return 'Código de segurança (CVV) do cartão não foi enviado';
  case '5034':
    return 'Campo obrigatório ano ausente';
  case '5046':
    return 'Valor do campo Mês inválido';
  case '5047':
    return 'Campo Mês ausente';
  case '5086':
    return 'Cartão poupança, por favor utilize um cartão de crédito';
  case '5087':
    return 'Transação não autorizada. Limite diário excedido';
  case '5088':
    return 'Transação não autorizada AmEx';
  case '5093':
    return 'Transação não autorizada,  entre em contato com banco/emissor do cartão';
  case '9107':
    return 'O banco/emissor do cartão ou a conexão parece estar offline';
  case '9109':
    return 'Erro no sistema do banco ou operadora de cartão';
  case '9110':
    return 'Banco/emissor do cartão parece estar offline';
  case '9111':
    return 'Time out. Banco/emissor do cartão não respondeu';
  case '9112':
    return 'Banco/emissor do cartão indisponível';
  case '9113':
    return 'Cancelado, Transmissão duplicada';
  case '9124':
    return 'Código de segurança inválido';
  case '9133':
    return 'Atualização não permitida';
  default:
    return 'Pagamento Não autorizado';
  }
};

let appDebug: any = {};

const sales = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body;
    appDebug = {};
    appDebug.body = data;

    if ( !data.reference_key ) {
      registerLog({
        appDebug: appDebug,
        message: 'Informe um identificador',
      });

      return res.status(400).send({
        message: 'Informe um identificador ...',
      });
    }

    if (!data.customer || !data.customer.name) {
      registerLog({
        appDebug: appDebug,
        message: 'Informe o comprador',
      });

      return res.status(400).send({
        message: 'Informe o comprador',
      });
    }

    const lastNumber = Math.floor(1000 + Math.random() * 9000);
    data.reference_key = `${data.reference_key}${lastNumber}`;
    data.metadata = data.metadata ? data.metadata : {};
    data.metadata.idCard = data.reference_key;

    if (data.customer && data.customer.name) {
      data.metadata.clientName = data.customer.name;
    }

    const {data: respPagarMe} = await apiPagarMe.post(`/transactions`, data);

    let statusM = statusMessage(respPagarMe.status);

    if (respPagarMe.status !== 'paid' && respPagarMe.acquirer_response_code) {
      statusM = acquirerMessage(respPagarMe.acquirer_response_code);
    }

    sucessLog(respPagarMe, statusM);

    return res.status(200).json({
      message: 'Successful create Sales',
      data: respPagarMe,
      statusMessage: statusM,
    });
  } catch (error) {
    const err: any = error;

    let errPayload = null;

    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    console.log('oops fail pagarme', errPayload);
    createLog(err, errPayload);

    return res.status(400).json({
      message: 'Fail create Sales',
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
      category: 'pagarme',
      originError: 'fail-process-pagarme',
    });
  } catch (error) {
    console.log('fail create log', error);
  }
};

const sucessLog = (payload: any, message: any) => {
  try {
    LogsModel.create({
      typeLog: 'SUCCESS',
      description: {
        payload: payload,
        message: message,
      },
      category: 'pagarme',
      originError: 'create-pagarme',
    });
  } catch (error) {
    console.log('fail create sucessLog', error);
  }
};

const registerLog = (payload: any, type = 'WARN') => {
  try {
    LogsModel.create({
      typeLog: type,
      description: {
        payload: payload,
      },
      category: 'pagarme',
      originError: 'validate-pagarme',
    });
  } catch (error) {
    console.log('fail create sucessLog', error);
  }
};

export default sales;
