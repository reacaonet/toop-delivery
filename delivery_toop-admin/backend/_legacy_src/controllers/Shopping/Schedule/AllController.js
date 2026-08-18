const mongoose = require('mongoose');
const moment = require('moment');
require('moment/locale/en-nz');

const Schedule = require('../../../models/Shopping/ScheduleModel');
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {

    // Lista com aggregation
    const companies = await Schedule.aggregate([
      {
        $sort: {
          dayWeek: 1,
          startHour: 1
        }
      },
      {
        $lookup:
        {
          from: 'company',
          localField: 'company',
          foreignField: '_id',
          as: 'companyData'
        }
      },
      { $unwind: { path: "$companyData" } },
      {
        $project:
        {
          "createdAt": 0,
          "updatedAt": 0,
          "__v": 0,
          "companyData": {
            "createdAt": 0,
            "updatedAt": 0,
            "__v": 0,
            "description": 0,
            "type": 0,
            "status": 0,
            "lat": 0,
            "lng": 0,
            "location": 0,
            "address": 0,
            "phone": 0,
            "companyDelivery": 0,
          }
        }
      },
      {
        $group: {
          '_id': '$company',
          company: { $first: { name: '$companyData.name' } },
          count: { $sum: 1 },
          schedules: {  
            $push: '$$ROOT'
          }
        }
      },
      {
        $project:
        {
          "schedules": {
            "companyData": 0
          }
        }
      },
    ]);

    for await (const company of companies) {
      let daysToRetorn = {};
      const hoursByDay = await company.schedules.map(day => {
        if (!daysToRetorn[day.dayWeek]) {
          daysToRetorn[day.dayWeek] = [];
        }
    
        daysToRetorn[day.dayWeek].push({
          id: day._id,
          start: day.startHour,
          end: day.endHour,
        });
        return daysToRetorn;
      });
      company.hours = hoursByDay;
      company.schedules = undefined;
    }

    return res.json(companies);
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Shopping/Schedule/AllController.js',
    error: dadosDoErro?.message,
    method: 'AllController',
    type: 'error',
    level: 0,
    origin: 'backend',
    request: {
      application: req?.application,
      franchise: req?.franchise,
      company: req?.company,
      params: req?.params,
      body: req?.body,
      query: req?.query,
      heders: req?.heders,
      method: req?.method,
      url: req?.url,
    },
  });

  console.log(`Log de erro criado com sucesso.`);


    return res.status(400).send({
      message: "Falha ao listar agendamentno da entrega",
      Error: dadosDoErro
    });
  }
};