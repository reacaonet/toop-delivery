module.exports = {
  async check(req, res) {
    return res.send({
      status: 200,
      message: "Online"
    });
  },
}
