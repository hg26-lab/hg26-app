module.exports = {
  apps: [
    {
      name: 'hg26-app',
      script: './server.js',
      cwd: '/var/www/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_PATH: '/var/lib/hg26-app/app.db',
      },
    },
  ],
}
