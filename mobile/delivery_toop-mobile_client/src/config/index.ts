import * as Dev from './dev';
import * as Homolog from './homologation';
import * as Production from './production';

import * as base64 from 'base-64';

if (!global.btoa) {
  global.btoa = base64.encode;
}

if (!global.atob) {
  global.atob = base64.decode;
}

let env = 'prod';
let config: any = {};

switch (env) {
  case 'dev':
    config = Dev;
    config.environment = 'Development';
    break;
  case 'homolog':
    config = Homolog;
    config.environment = 'Homologation';
    break;
  case 'prod':
    config = Production;
    config.environment = 'Production';
    break;
  default:
    config = Dev;
    config.environment = 'Development';
}

export {config};
export default config;
