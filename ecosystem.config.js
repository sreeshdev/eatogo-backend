module.exports = {
  apps: [
    {
      name: "backend",
      script: "npm start",

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: "one two",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    test: {
      user: "root",
      host: "159.65.147",
      ref: "origin/development",
      repo: "githubURL",
      path: "/var/www/autoinn/backend",
      "post-deploy":
        "sudo docker-compose up -d && sudo npm install && sudo prisma deploy --force && sudo prisma generate && sudo pm2 reload ecosystem.config.js --env production",
    },
  },
};
