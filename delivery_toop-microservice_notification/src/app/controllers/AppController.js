import database from '../../config/firebase';
import cloudMessage from '../../service/cloudMessage';
import EconomizeBrasil from '../../service/economizeBrasil';

module.exports = {
  async General(req, res) {
    try {
      const {message} = req.body;
      if (!message) {
        return res.status(400).send({message: 'Mensagem não informada'});
      }

      if (String(message).length > 255) {
        return res.status(400).send({
          message: 'Número de caracteres maior que 255',
        });
      }

      const registration_ids = [];

      await EconomizeBrasil.get('/customer/list').then((data) => {
        data.data.forEach((user) => {
          if (user.device) {
            registration_ids.push(user.device);
          }
        });
      });

      await cloudMessage.post(
        '',
        {
          priority: 'high',
          notification: {
            body: message,
          },
          sound: 'default',
          vibrate: '1',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.CLOUD_MESSAGING_TOKEN}`,
          },
        },
      );

      await database.ref().child('general').push({message});
      await database.ref().child('general').remove();

      return res.status(200).send({message});
    } catch (err) {
      return res.status(400).send({
        message: 'Erro!',
        err: err.message,
      });
    }
  },

  async UserId(req, res) {
    try {
      const {id} = req.params;

      const { message, auth, params } = req.body.user || {};

      if (!auth) {
        return res.status(400).send({
          message: 'Informe o token de notificação',
        });
      }

      if (!message) {
        return res.status(400).send({
          message: 'Mensagem não informada',
        });
      }

      if (String(message).length > 200) {
        return res.status(400).send({
          message: 'Número de caracteres maior que 200',
        });
      }

      await cloudMessage.post(
        '',
        {
          priority: 'high',
          to: auth,
          notification: {body: message},
          sound: 'default',
          vibrate: '1',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.CLOUD_MESSAGING_TOKEN}`,
          },
        },
      );

      return res.status(200).send({message});
    } catch (err) {
      return res.status(400).send({
        message: 'Erro!',
        err: err.message,
      });
    }
  },

  async Push(req, res) {
    try {
      const {
        user,
        image = null,
        params = {},
        clickAction = null,
      } = req.body;

      const message = user?.message ?? null;
      const auth = user?.auth ?? null;

      if (!auth) {
        return res.status(404).send({
          message: 'Informe o token de notificação',
        });
      }

      if (!message) {
        return res.status(404).send({
          message: 'Informe uma mensagem',
        });
      }

      if (String(message).length > 200) {
        return res.status(400).send({
          message: 'Mensagem notificação pode ter até 200 caracteres',
        });
      }

      const { data: response } = await cloudMessage.post(
        '',
        {
          priority: 'high',
          to: auth,
          notification: {
            body: message,
          },
          data: params,
          sound: 'default',
          vibrate: '1',
          android: {
            notification: {
              image: image,
              click_action: clickAction,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.CLOUD_MESSAGING_TOKEN}`,
          },
        },
      );

      return res.send(response);
    } catch (err) {
      return res.status(400).send({
        message: 'Erro!',
        err: err.message,
      });
    }
  },
};
