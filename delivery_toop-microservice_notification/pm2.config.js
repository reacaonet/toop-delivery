module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'Notification',
      script: './dist/server.js',
      args: 'start',
      autorestart: true,
      cwd: '/home/app/ecbr_notification/',
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
