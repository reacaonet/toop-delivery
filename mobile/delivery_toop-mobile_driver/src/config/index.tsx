import * as Dev from './dev';
import * as Homolog from './homologation';
import * as Production from './production';

let env = 'dev';
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

export default config;
