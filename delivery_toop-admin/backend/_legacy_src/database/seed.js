const fs = require("fs");
const path = require("path");

const stateModel = require("../models/Setting/StateModel");
const cityModel = require("../models/Setting/CityModel");
const personModel = require("../models/Person/PersonModel");
const userModel = require("../models/UserModel");
const groupModel = require("../models/GroupModel");
const companyModel = require("../models/Company/CompanyModel");

const AccountModel = require("../models/Finance/DigitalAccounts/AccountModel");
const AgencyModel = require("../models/Finance/DigitalAccounts/AgencyModel");
const PriceCalculationModel = require("../models/Mobility/PriceCalculations/PriceCalculationsModel");

const brazilianBanksModel = require("../models/Setting/BrazilianBanks");
const EmailVariablesModel = require("../models/Email/EmailVariablesModel");

const getBank = require("./../services/Finance/DigitalAccounts/getBank");

const listState = [
  {
    _id: "5e8658970775173a7838ea72",
    country: "BRASIL",
    name: "Amazonas",
    uf: "AM",
  },
  {
    _id: "5e8764413080b03a40fe4b80",
    country: "BRASIL",
    name: "Acre",
    uf: "AC",
  },
  {
    _id: "5e8765183080b03a40fe4b81",
    country: "BRASIL",
    name: "Alagoas",
    uf: "AL",
  },
  {
    _id: "5e87658c3080b03a40fe4b82",
    country: "BRASIL",
    name: "Amapá",
    uf: "AP",
  },
  {
    _id: "5e8765de3080b03a40fe4b83",
    country: "BRASIL",
    name: "Bahia",
    uf: "BA",
  },
  {
    _id: "5e8765fb3080b03a40fe4b84",
    country: "BRASIL",
    name: "Ceará",
    uf: "CE",
  },
  {
    _id: "5e87662c3080b03a40fe4b85",
    country: "BRASIL",
    name: "Distrito Federal",
    uf: "DF",
  },
  {
    _id: "5e87664d3080b03a40fe4b86",
    country: "BRASIL",
    name: "Espírito Santo",
    uf: "ES",
  },
  {
    _id: "5e87673d3080b03a40fe4b87",
    country: "BRASIL",
    name: "Goiás",
    uf: "GO",
  },
  {
    _id: "5e87675b3080b03a40fe4b88",
    country: "BRASIL",
    name: "Maranhão",
    uf: "MA",
  },
  {
    _id: "5e8767853080b03a40fe4b89",
    country: "BRASIL",
    name: "Mato Grosso",
    uf: "MT",
  },
  {
    _id: "5e87679f3080b03a40fe4b8a",
    country: "BRASIL",
    name: "Mato Grosso do Sul",
    uf: "MS",
  },
  {
    _id: "5e8767b43080b03a40fe4b8b",
    country: "BRASIL",
    name: "Minas Gerais",
    uf: "MG",
  },
  {
    _id: "5e8767ce3080b03a40fe4b8c",
    country: "BRASIL",
    name: "Pará",
    uf: "PA",
  },
  {
    _id: "5e8767e83080b03a40fe4b8d",
    country: "BRASIL",
    name: "Paraíba",
    uf: "PB",
  },
  {
    _id: "5e8767fe3080b03a40fe4b8e",
    country: "BRASIL",
    name: "Paraná",
    uf: "PR",
  },
  {
    _id: "5e8768183080b03a40fe4b8f",
    country: "BRASIL",
    name: "Pernambuco",
    uf: "PE",
  },
  {
    _id: "5e87682b3080b03a40fe4b90",
    country: "BRASIL",
    name: "Piauí",
    uf: "PI",
  },
  {
    _id: "5e8768483080b03a40fe4b91",
    country: "BRASIL",
    name: "Rio de Janeiro",
    uf: "RJ",
  },
  {
    _id: "5e8768663080b03a40fe4b92",
    country: "BRASIL",
    name: "Rio Grande do Norte",
    uf: "RN",
  },
  {
    _id: "5e87687f3080b03a40fe4b93",
    country: "BRASIL",
    name: "Rio Grande do Sul",
    uf: "RS",
  },
  {
    _id: "5e8768a03080b03a40fe4b94",
    country: "BRASIL",
    name: "Rondônia",
    uf: "RO",
  },
  {
    _id: "5e8768be3080b03a40fe4b95",
    country: "BRASIL",
    name: "Roraima",
    uf: "RR",
  },
  {
    _id: "5e8768db3080b03a40fe4b96",
    country: "BRASIL",
    name: "Santa Catarina",
    uf: "SC",
  },
  {
    _id: "5e8768ff3080b03a40fe4b97",
    country: "BRASIL",
    name: "São Paulo",
    uf: "SP",
  },
  {
    _id: "5e8769203080b03a40fe4b98",
    country: "BRASIL",
    name: "Sergipe",
    uf: "SE",
  },
  {
    _id: "5e8769883080b03a40fe4b99",
    country: "BRASIL",
    name: "Tocantins",
    uf: "TO",
  },
  {
    _id: "5e90c2f2ea5fe738708d83b4",
    country: "BRASIL",
    name: "Goiás",
    uf: "GO",
  },
];

const listCity = [
  {
    _id: "5ea4828c23c97e034c013ecb",
    name: "Goiânia",
    state: "5e90c2f2ea5fe738708d83b4",
  },
  {
    _id: "5ea482a923c97e034c013ecd",
    name: "Brasília",
    state: "5e87662c3080b03a40fe4b85",
  },
];

const listPerson = [
  {
    _id: "5ec593cb9c488f1ce8043892",
    devices: [],
    name: "Gojá Delivery Padrão",
    cpf: null,
    city: null,
    phone: null,
    birthdate: null,
    status: true,
  },
];

const listUser = [
  {
    _id: "5ec5ad42fdc57b267890c367",
    status: true,
    person: "5ec593cb9c488f1ce8043892",
    name: "Gojá",
    email: "admin@economizebr.com",
    password: "$2b$11$8v2S/XcK4utsNMGEgCssje7FeRQCHTpyC8ZYBXh1G9i9SOASsK4mm",
    company: "5eb311b4161dd2f719517d62",
  },
];

const listGroup = [
  {
    _id: "5eb3115f161dd213fa517d5d",
    images: ["https://economizebr.sfo2.digitaloceanspaces.com/producthomolog/34a85e48-b90b-447a-89a9-3ed48bf74bee.png"],
    name: "Gojá Delivery",
    description: "Gojá Delivery",
    status: true,
  },
];

const listCompany = [
  {
    _id: "5eb311b4161dd2f719517d62",
    type: "supermarket",
    images: ["https://economizebr.sfo2.digitaloceanspaces.com/producthomolog/ee5a3ff9-8938-489b-88b0-5a4ec2fe659a.png"],
    name: "Gojá Delivery",
    description: "Gojá Delivery",
    status: true,
    address: "R. Tomaz Edson, 400",
    phone: 62888888888.0,
    groups: "5eb3115f161dd213fa517d5d",
    location: {
      coordinates: [-49.265043, -16.722015],
      _id: "5eb311b4161dd2bd94517d64",
      type: "Point",
    },
  },
];

const listPriceCalculations = [
  {
    _id: "608a782bd2ff8b8975d9f315",
    name: "Preço por Minuto",
    info: "Cálculo de Preço: PB + (TM*PM)",
  },
  {
    _id: "608a7835d2ff8b8975d9f316",
    name: "Preço por Hora",
    info: "Cálculo de Preço: PB + (TH*PH)",
  },
  {
    _id: "608a783dd2ff8b8975d9f317",
    name: "Preço por Distância",
    info: "Cálculo de Preço: PB + (TKms-DB*PKms)",
  },
  {
    _id: "608a7845d2ff8b8975d9f318",
    name: "Preço por Distância e Minuto",
    info: "Cálculo de Preço: PB + (TKms-DB*PKms) + (TM*PM)",
  },
  {
    _id: "608a7851d2ff8b8975d9f319",
    name: "Preço por Distância e Hora",
    info: "Cálculo de Preço: PB + ((TKms-DB)*PKms) + (TH*PH)",
  },
];

const emailVariableList = [
  {
    name: "{{franquia_nome}}",
    title: "Será substituído pelo Nome da franquia",
  },
  {
    name: "{{cliente_nome}}",
    title: "Será substituído pelo Nome do cliente",
  },
  {
    name: "{{cliente_cpf}}",
    title: "Será substituído pelo CPF do cliente",
  },
  {
    name: "{{cliente_email}}",
    title: "Será substituído pelo E-mail do cliente",
  },
  {
    name: "{{usuario_nome}}",
    title: "Será substituído pelo Nome do usuário do estabelecimento",
  },
  {
    name: "{{usuario_email}}",
    title: "Será substituído pelo E-mail do usuário do estabelecimento",
  },
  {
    name: "{{empresa_nome}}",
    title: "Será substituído pelo Nome do estabelecimento",
  },
  {
    name: "{{empresa_endereco}}",
    title: "Será substituído pelo Endereço do estabelecimento",
  },
  {
    name: "{{pedido_numero}}",
    title: "Será substituído pelo Número do pedido",
  },
  {
    name: "{{pedido_status}}",
    title: "Será substituído pelo Status do pedido",
  },
  {
    name: "{{pedido_forma_de_pagamento}}",
    title: "Será substituído pelo forma de pagamento do pedido",
  },
  {
    name: "{{pedido_valor}}",
    title: "Será substituído pelo Valor final do pedido",
  },
  {
    name: "{{pedido_itens}}",
    title: "Bloco que será criado para repetição dos itens do pedido",
  },
  {
    name: "{{pedido_data}}",
    title: "Será substituído pela Data de solicitação do pedido",
  },
];

const createCity = async () => {
  for await (city of listCity) {
    await cityModel.updateOne(
      {
        _id: city._id,
      },
      {
        $set: city,
      },
      {
        upsert: true,
      },
    );
  }
};

const createStates = async () => {
  for await (state of listState) {
    await stateModel.updateOne(
      {
        _id: state._id,
      },
      {
        $set: state,
      },
      {
        upsert: true,
      },
    );
  }
};

const createPerson = async () => {
  for await (person of listPerson) {
    await personModel.updateOne(
      {
        _id: person._id,
      },
      {
        $set: person,
      },
      {
        upsert: true,
      },
    );
  }
};

const createUser = async () => {
  for await (user of listUser) {
    await userModel.updateOne(
      {
        _id: user._id,
      },
      {
        $set: user,
      },
      {
        upsert: true,
      },
    );
  }
};

const createGroup = async () => {
  for await (group of listGroup) {
    await groupModel.updateOne(
      {
        _id: group._id,
      },
      {
        $set: group,
      },
      {
        upsert: true,
      },
    );
  }
};

const createCompany = async () => {
  for await (company of listCompany) {
    await companyModel.updateOne(
      {
        _id: company._id,
      },
      {
        $set: company,
      },
      {
        upsert: true,
      },
    );
  }
};

const createDigitalAccount = async () => {
  for await (company of listCompany) {
    const alreadyExists = await AccountModel.findOne({ holder: company._id, onModel: "Company" });

    if (!alreadyExists) {
      const bank = await getBank();

      const agency = await AgencyModel.create({
        code: "0001",
        bank: await bank._id,
        name: `Agência ${company.description}`,
        status: true,
      });

      const account = await AccountModel.create({
        code: "0000001",
        bank: await bank._id,
        agency: agency._id,
        holder: company._id,
        type: "PJ",
        onModel: "Company",
      });
    }
  }
};

const createPriceCalculations = async () => {
  for await (price of listPriceCalculations) {
    const alreadyExists = await PriceCalculationModel.findOne({ _id: price._id });

    if (!alreadyExists) {
      await PriceCalculationModel.create(price);
    }
  }
};

const createBrazilianBanksList = async () => {
  const listBrazilianBanks = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "assets", "json", "brazilian_banks.json")));

  let countBank = 0;
  for await (bank of listBrazilianBanks) {
    await brazilianBanksModel.updateOne(
      {
        compe: bank.COMPE,
      },
      {
        $set: {
          compe: bank.COMPE,
          ispb: bank.ISPB,
          document: bank.document,
          long_name: bank.LongName,
          short_name: bank.ShortName,
          network: bank.Network,
          type: bank.Type,
          pix_type: bank.PixType,
          url: bank.Url,
        },
      },
      {
        upsert: true,
      },
    );
  }
};

const createEmailVariable = async () => {
  for await (variable of emailVariableList) {
    await EmailVariablesModel.updateOne(
      {
        name: variable.name,
      },
      {
        $set: variable,
      },
      {
        upsert: true,
      },
    );
  }
};

const populate = async () => {
  await createBrazilianBanksList();
  await createStates();
  //await createCity();
  await createGroup();
  await createCompany();
  await createPerson();
  await createUser();
  await createDigitalAccount();
  await createPriceCalculations();
  await createEmailVariable();
};

module.exports = {
  populate,
};
