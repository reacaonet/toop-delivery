module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": [
        "airbnb-base",
        "prettier",
        "eslint:recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": ["prettier"],
    "rules": {
        "prettier/prettier": "error"
    }
};