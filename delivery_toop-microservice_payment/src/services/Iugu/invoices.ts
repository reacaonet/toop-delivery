/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable curly */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/camelcase */

/** services */
import axios from 'axios';

/** helpers */

/** models */

export default class InvoiceServices {
  public options: {
    method: 'POST' | 'PUT' | 'GET' | 'DELETE';
    headers: any;
    data: any;
    url: string;
    base_url: string;
  };

  constructor() {
    this.options = {
      url: `${process.env.IUGU_API}/invoices`,
      base_url: `${process.env.IUGU_API}/invoices`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          process.env.IUGU_TOKEN_API ?? '',
        ).toString('base64')}`,
      },
      data: {},
    };
  }

  public async store(record: iPayloadStore): Promise<any> {
    try {
      this.options.method = 'POST';
      this.options.data = {
        order_id: record.order_id,
        email: record.email,
        due_date: record.due_date,
        ensure_workday_due_date: false,
        items: record.items,
        payable_with: [record.payable_with],
        custom_variables: record.custom_variables,
        early_payment_discount: false,
        payer: {
          cpf_cnpj: record?.payer?.cpf_cnpj,
          name: record?.payer?.name,
          email: record?.payer?.email,
          phone_prefix: record?.payer?.phone_prefix,
          phone: record?.payer?.phone,
          address: record?.payer?.address,
        },
      };

      return await axios
        .request(this.options)
        .then(async (response: any) => {
          if (response.data && response.data.id) {
            return response.data;
            // return await this.getById(response.data.id);
          } else {
            /** TODO: ENVIAR EMAIL DE ERRO */
            return false;
          }
        })
        .catch(async (err) => {
          let error;
          if (err.response && err.response.data && err.response.data.errors) {
            error = err.response.data.errors;
          } else {
            error = err;
            console.error(err);
          }

          return error;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar fatura na iugu', error);
      /** TODO: ENVIAR EMAIL DE ERRO */

      return error;
    }
  }

  public async storeCharge(record: any): Promise<any> {
    try {
      this.options.method = 'POST';
      this.options.url = `${process.env.IUGU_API}/charge`;
      this.options.data = {
        customer_payment_method_id: record.customer_payment_method_id,
        // token: record.token,
        invoice_id: record.invoice_id,
      };

      return await axios
        .request(this.options)
        .then(async (response: any) => {
          return response.data;
        })
        .catch(async (err) => {
          let error;
          if (err.response && err.response.data && err.response.data.errors) {
            error = err.response.data.errors;
          } else {
            error = err;
            console.error(err);
          }

          return error;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar fatura direta na iugu', error);
      /** TODO: ENVIAR EMAIL DE ERRO */

      return false;
    }
  }

  public async update(record: iPayloadStore) {
    if (!record.payment_id) return false;

    try {
      this.options.method = 'PUT';
      this.options.url = `${this.options.base_url}/${record.payment_id}`;
      this.options.data = {};

      axios
        .request(this.options)
        .then(async (response: any) => {
          if (response.data && response.data.id) return response.data;
          else return false;
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);
          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao atualizar fatura na iugu', error);
      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async getById(payment_id: string) {
    try {
      this.options.method = 'GET';
      this.options.url = `${this.options.base_url}/${payment_id}`;
      this.options.data = {};

      return await axios
        .request(this.options)
        .then(async (response: any) => {
          const data = response.data;

          // obtem a subscription
          return data;
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao consultar faturas da assinatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async sendEmail(payment_id: string) {
    try {
      this.options.method = 'POST';
      this.options.url = `${this.options.base_url}/${payment_id}/send_email`;
      this.options.data = {};

      return await axios
        .request(this.options)
        .then(() => {
          return this.getById(payment_id);
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao enviar email da fatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async cancel(payment_id: string) {
    try {
      this.options.method = 'PUT';
      this.options.url = `${this.options.base_url}/${payment_id}/cancel`;
      this.options.data = {};

      return await axios
        .request(this.options)
        .then(() => {
          return this.getById(payment_id);
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao enviar email da fatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async refund(payment_id: string) {
    try {
      this.options.method = 'POST';
      this.options.url = `${this.options.base_url}/${payment_id}/refund`;
      this.options.data = {};

      return await axios
        .request(this.options)
        .then(() => {
          return this.getById(payment_id);
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao enviar email da fatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async duplicate(
    payment_id: string,
    due_date: string,
  ): Promise<string | boolean> {
    try {
      this.options.method = 'POST';
      this.options.url = `${this.options.base_url}/${payment_id}/duplicate`;
      this.options.data = {due_date};

      return await axios
        .request(this.options)
        .then((response) => {
          return response.data.secure_url;
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar 2º via da fatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }

  public async compensation(
    payment_id: string,
    // payment_subscription_id: string,
    // due_date: string = '',
    // payload: iPayloadCompensation,
  ) {
    try {
      this.options.method = 'PUT';
      this.options.url = `${this.options.base_url}/${payment_id}/cancel`;
      this.options.data = {};

      return await axios
        .request(this.options)
        .then(async (response) => {
          return response.data;
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);

          return null;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao efetuar a compensação da fatura na iugu', error);

      /** TODO: ENVIAR EMAIL DE ERRO */
      return null;
    }
  }
}

interface iPayloadStoreItems {
  description: string;
  quantity: number;
  price_cents: number;
}

interface iPayloadCustomVariables {
  value: any;
  name: string;
}

interface iPayloadStorePayer {
  cpf_cnpj: string;
  name: string;
  email?: string;
  phone_prefix?: string;
  phone?: string;
  address?: {
    zip_code: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country: string;
    complement?: string;
  };
}

interface iPayloadStore {
  order_id: string;
  payment_id?: string;
  email?: string;
  due_date?: string;
  items?: iPayloadStoreItems[];
  payable_with?: 'credit_card' | 'bank_slip' | 'pix';
  payer?: iPayloadStorePayer;
  custom_variables?: iPayloadCustomVariables[];
  splits?: any[];
}
