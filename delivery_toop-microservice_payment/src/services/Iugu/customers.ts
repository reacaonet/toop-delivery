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

export default class CustomerServices {
  public options: {
    method: 'POST' | 'PUT' | 'GET' | 'DELETE';
    headers: any;
    data: any;
    url: string;
  };

  constructor() {
    this.options = {
      url: `${process.env.IUGU_API}/customers`,
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

  public async store(record: iPayloadStore) {
    try {
      this.options.method = 'POST';
      this.options.data = {
        email: record.email,
        name: record.name,
        cpf_cnpj: record?.cpf_cnpj?.replace(/\D/g, ''),
        // zip_code: record?.zip_code ? record?.zip_code?.replace(/\D/g, '') : '',
        number: record.number ? record.number : 'S/N',
        street: record.street ? record.street : '',
        city: record.city ? record.city : '',
        state: record.state ? record.state : '',
        district: record.district ? record.district : '',
      };

      return await axios
        .request(this.options)
        .then(async (response) => {
          if (response.data && response.data.id) {
            return response.data;
          } else {
            /** TODO: ENVIAR EMAIL DE ERRO */
            return false;
          }
        })
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.errors)
            console.error(err.response.data.errors);
          else console.error(err);
          return false;
          /** TODO: ENVIAR EMAIL DE ERRO */
        });
    } catch (error) {
      console.log('Erro ao criar cliente na iugu', error);
      /** TODO: ENVIAR EMAIL DE ERRO */

      return false;
    }
  }

  public async update(record: iPayloadStore) {
    if (!record.payment_id) return this.store(record);

    try {
      this.options.method = 'PUT';
      this.options.url = `${this.options.url}/${record.payment_id}`;
      this.options.data = {
        email: record.email,
        name: record.name,
        cpf_cnpj: record?.cpf_cnpj?.replace(/\D/g, ''),
        zip_code: record?.zip_code ? record?.zip_code?.replace(/\D/g, '') : '',
        number: record.number ? record.number : 'S/N',
        street: record.street ? record.street : '',
        city: record.city ? record.city : '',
        state: record.state ? record.state : '',
        district: record.district ? record.district : '',
      };

      axios
        .request(this.options)
        .then(async (response) => {
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
      console.log('Erro ao criar cliente na iugu', error);
      /** TODO: ENVIAR EMAIL DE ERRO */
      return false;
    }
  }
}

interface iPayloadStore {
  payment_id?: string;
  email?: string;
  name?: string;
  cpf_cnpj?: string;
  zip_code?: string;
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  district?: string;
}
