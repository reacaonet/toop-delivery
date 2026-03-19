module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'FindDelivery',
      script: './dist/index.js',
      args: 'start',
      autorestart: true,
      cwd: '/home/app/microservice_deliveryman/',
      max_memory_restart: '500M',
      env: {
        COMMON_VARIABLE: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
