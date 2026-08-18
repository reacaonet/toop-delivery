// import adminFirebase from '../../../service/firebase/firebaseService';
import idInstanceApi from '../../../service/firebase/IdInstanceApi';

const getTokenTopics = async (req, res) => {
  try {
    const {token} = req.query;

    if (!token) {
      return res.status(400).send({
        message: 'Informe um token'
      });
    }

    const {data: response} =  await idInstanceApi.get(`/info/${token}?details=true`);

    if (!response || response.error) {
      return res.status(400).send({
        message: 'Nenhum topico cadastrado',
        err: response.error,
      });
    }
    
    let listTopics = [];

    if (response.rel && response.rel.topics) {
      listTopics = response.rel.topics;
    }

    return res.status(200).send(listTopics);
  } catch (err) {
    return res.status(500).send({
      message: 'Não foi possível retornar informações',
    });
  }
};

export default getTokenTopics;