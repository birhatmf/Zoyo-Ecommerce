module.exports = {
  apps: [
    {
      name: "ZoyoEcommerce",
      script: "/home/birhatmff/.nvm/versions/node/v20.20.0/bin/pnpm",
      args: "start",
      cwd: "/home/birhatmff/Zoyo-Ecommerce",
      env_production: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      node_args: "--max-old-space-size=1024",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/home/birhatmff/Zoyo-Ecommerce/logs/error.log",
      out_file: "/home/birhatmff/Zoyo-Ecommerce/logs/out.log",
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
