const BrowserFinger = require("browser_fingerprint");

const options = {
  cookieKey: "__browser_fingerprint",
  toSetCookie: true,
  onlyStaticElements: true,
  settings: {
    path: "/",
    expires: 3600000,
    httpOnly: null
  }
};

const fingerPrinter = new BrowserFinger.BrowserFingerprint(options)
module.exports = fingerPrinter;
