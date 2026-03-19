import adminFirebase from '../../../service/firebase/firebaseService';

const messageTopicController = async (req, res) => {
  try {
    const {message, title, topic, data, priority} = req.body;

    if (!message || typeof message !== 'string' || message.length < 3) {
      return res.status(200).send({
        message: 'Infome uma mensagem válida',
      });
    }

    if (!topic || typeof message !== 'string' ) {
      return res.status(200).send({
        message: 'Infome um tópico válido',
      });
    }

    if (title && typeof title !== 'string') {
      return res.status(200).send({
        message: 'Infome um título válido',
      });
    }

    let content = {
      notification: {
        title: title || 'ToopDelivery',
        body: message,
      },
      data: data,
      topic: topic
    };

    const response = await adminFirebase.messaging().send(content);

    return res.status(200).send({
      message: 'Mensagens enviadas',
      response,
    });
  } catch (err) {
    return res.status(400).send({
      message: 'Falha ao enviar mensgem',
      err: err.message
    });
  }
};

export default messageTopicController;