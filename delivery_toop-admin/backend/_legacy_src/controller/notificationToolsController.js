const express = require('express');

const router = express.Router();

const NotificationTools = require('../models/notificationTools');

router.post('/create', async (req, res) => {

    try {
        const data = req.body;

        const notificationTools = await NotificationTools.create(data);

        return res.send({
            status: 200,
            message: 'Sucesso ao criar Notification Tools',
            data: notificationTools
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Falha ao criar NotificationTools',
            error: err
        });
    }
});

router.get('/list', async (req, res) => {
    try {
        const list = await NotificationTools.find().populate('group');

        return res.json({ list })
    } catch (err) {
        return res.status(400).send({
            message: 'Falha ao listar NotificationTools',
            error: err
        });
    }
});


router.put('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const novoRegistro = await NotificationTools.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true });

        res.send({
            status: 200,
            data: novoRegistro
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Error ao atualizar NotificationTools',
            error: err
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id

        await NotificationTools.findOneAndRemove({ _id: id });

        res.send({
            status: 200,
            message: ""
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Error ao deletar NotificationTools',
            error: err
        });
    }
});

module.exports = app => app.use('/notificationTools', router);