const authMiddleware = (req, res, next) => {
  const appKey = req.header('authorization');

  if (!appKey || `${appKey}` !== `${process.env.APP_KEY}`) {
    return res.status(401).send({
      message: 'Chave de acesso inválida ou não fornecida',
    });
  }

  next();
};

export default authMiddleware;
