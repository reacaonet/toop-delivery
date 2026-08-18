/* eslint-disable prefer-const */
import dev from './dev';
import homolog from './homolog';
import production from './production';

let typeEnv = 'dev';
// const typeEnv = 'homolog';
let env: any = {};

if (typeEnv === 'prod') {
  env = production;
} else if (typeEnv === 'homolog') {
  env = homolog;
} else {
  env = dev;
}

export default env;
