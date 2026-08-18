function Subordinates() {
  const axios = require("axios");
  const generateToken = require("./Token");
  const Debug = require("./Debug");

  async function create(data) {
    try {
      const token = await generateToken();
      const baseUrl = process.env.BRASPAG_SPLIT_ONBOARDING;

      const response = await baseUrl.post(`${baseUrl}/api/subordinates/`, data, {
        headers: {
          authorization: `Bearer ${token.access_token}`,
        },
      });
      return response;
    } catch (err) {
      Debug().error("subordinate-create", err);
    }
  }

  async function verify(merchantId) {
    try {
      const token = await generateToken();
      const baseUrl = process.env.BRASPAG_SPLIT_ONBOARDING;

      const response = await baseUrl.get(`${baseUrl}/api/subordinates/${merchantId}`, {
        headers: {
          authorization: `Bearer ${token.access_token}`,
        },
      });
      return response;
    } catch (err) {
      Debug().error("subordinate-verify", err);
      return false;
    }
  }

  return {
    verify,
    create,
  };
}

module.exports = Subordinates;
