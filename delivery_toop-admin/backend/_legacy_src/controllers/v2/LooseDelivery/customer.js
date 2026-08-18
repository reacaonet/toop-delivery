const mongoose = require('mongoose')

/** Model */
const PersonModel = require('../../../models/Person/PersonModel')
const CustomerModel = require('../../../models/CustomerModel')
const LogModel = require("../../../models/LogModel");

const idPerson = '60df1778851c46140c60c3ce'
const idCustomer = '60df1779851c46140c60c3d1'

const getCustomer = async () => {
  try {
    const isPerson = await PersonModel.findById(idPerson).lean()
    let person = null

    if (!isPerson) {
      person = await createPerson()
    }

    const isCustomer = await CustomerModel.findById(idCustomer).lean()
    if (!isCustomer) {
      const customer = await createCustomer()
    }



    return await CustomerModel.findById(idCustomer).populate('person').lean()
  } catch (err) {
    console.log('Falhou ao criar usuario ...', err)
    return false
  }
}

const createPerson = async () => {
  const resp = await PersonModel.create({
    _id: idPerson,
    name: 'Cliente Entrega Avulsa',
    cpf: '00000000000',
    phone: '00000000000',
    genre: 'H'
  })

  return resp
}

const createCustomer = async () => {
  const resp = await CustomerModel.create({
    _id: idCustomer,
    person: idPerson,
    name: 'Cliente Entrega Avulsa',
    cpf: '00000000000',
    phone: '00000000000',
    genre: 'H'
  })

  return resp
}

module.exports = getCustomer
