import database from '../../config/firebase';
import cloudMessage from '../../service/cloudMessage';
import EconomizeBrasil from '../../service/economizeBrasil';

module.exports = {
  async General(req, res) {
    try {
      const appKey = req.header('authorization');
      if (!appKey || `${appKey}` !== `${process.env.APP_KEY}`) {
        return res.status(404).send({
          message: 'You do not have access or did not enter the right key',
        });
      }

      const {message} = req.body;
      if (!message) {
        return res.status(404).send({message: 'Message not informed'});
      }

      if (String(message).length > 255) {
        return res.status(400).send({
          message: 'Number of characters is greater than 255',
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
          // registration_ids,
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
        err,
      });
    }
  },

  async UserId(req, res) {
    try {
      const {id} = req.params;
      const appKey = req.header('authorization');

      if (!appKey || `${appKey}` !== `${process.env.APP_KEY}`) {
        return res.status(404).send({
          message: 'You do not have access or did not enter the right key',
        });
      }

      const {
        user: {message, auth, params},
      } = req.body;

      if (!message) {
        return res.status(404).send({
          message: 'Message not informed',
        });
      }

      if (String(message).length > 200) {
        return res.status(400).send({
          message: 'Number of characters is greater than 45',
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

      // se utilizar posteriormente verificar as regras do firebase de leitura e gravação
      // if (params) {
      //   await database.ref().child(`user_${id}`).push({ message, params });
      //   await database.ref().child(`user_${id}`).remove();
      // } else {
      //   await database.ref().child(`user_${id}`).push({ message });
      //   await database.ref().child(`user_${id}`).remove();
      // }

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
        user: { message = null, auth = null },
        image = null,
        params = {},
        clickAction = null,
        cloud_messaging_token = process.env.CLOUD_MESSAGING_TOKEN ?? '',
      } = req.body;
  
      console.log(cloud_messaging_token);
  
      if (!auth) {
        return res.code(404).send({
          message: 'Informe o token de notificação',
        });
      }
  
      if (!message) {
        return res.code(404).send({
          message: 'Informe uma mensagem',
        });
      }
  
      if (String(message).length > 200) {
        return res.code(400).send({
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
            Authorization: `key=${cloud_messaging_token}`,
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
