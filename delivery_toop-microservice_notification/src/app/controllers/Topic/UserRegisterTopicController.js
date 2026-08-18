import adminFirebase from '../../../service/firebase/firebaseService';

const userRegisterTopicController = async (req, res) => {
  try {
    const {topic, instanceIdToken} = req.body;

    if (!topic) {
      return res.status(400).send({
        message: 'Informe pelo menos um tópico'
      });
    }

    if (!instanceIdToken) {
      return res.status(400).send({
        message: 'Informe o token do usuário'
      });
    }

    let listTopics = topic;
    let registrationTokens = instanceIdToken;
    let listError = [];

    if (typeof topic !== 'object' ) {
      listTopics = [topic];
    }

    if (typeof instanceIdToken !== 'object') {
      registrationTokens = [instanceIdToken]
    }

    for await (const topic of listTopics) {
      try {
        const response =
          await adminFirebase.messaging().subscribeToTopic(registrationTokens, topic);

        if (!response || response.failureCount > 0) {
          listError.push({
            topic: topic,
            token: registrationTokens,
            err: response ? response.errors : 'Subscription failed',
          });
        }

      } catch (err) {
        listError.push({
          topic: topic,
          token: registrationTokens,
          err: err.message,
        });
      }
    }

    if (listError.length <= 0) {
      listError = null;
    }

    return res.status(200).send({
      status: true,
      listError,
    });

  } catch (err) {
    return res.status(400).send({
      message: 'Falha ao registrar usuário no tópico',
      err: err.message,
    });
  }
};

export default userRegisterTopicController;