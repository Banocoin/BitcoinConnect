const path = require("path");
module.exports = {
  apps: [
    {
      name: "bifrost",
      script: "build/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development",
        LOG_PATH: path.resolve(__dirname, "./.log")
      },
      env_production: {
        NODE_ENV: "production",
        LOG_PATH: path.resolve(__dirname, "./.log")
      }
    }
  ],
  deploy: {
    // "production" is the environment name
    production: {
      // SSH key path, default to $HOME/.ssh
      key: "~/Desktop/relay",
      // SSH user
      user: 'ubuntu',
      // SSH host
      host: ['124.156.121.100'],
      // SSH options with no command-line flag, see 'man ssh'
      // can be either a single string or an array of strings
      ssh_options: 'StrictHostKeyChecking=no',
      // GIT remote/branch
      ref: 'origin/vite',
      // GIT remote
      repo: 'https://github.com/vitelabs/node-walletconnect-bridge.git',
      // path in the server
      path: '/var/www/bifrost',
      // Pre-setup command or path to a script on your local machine
      //   // Post-setup commands or path to a script on the host machine
      //   // eg: placing configurations in the shared dir etc
      'post-setup': 'ls -la',
      // pre-deploy action
      //   pre-deploy-local: "echo 'This is a local executed command'"
      // post-deploy action
      'post-deploy':
        'npm install && npm run build && pm2 start ecosystem.config.js --env production'
    }
  }
};
