// ecosystem.config.cjs
module.exports = {
    apps: [
      {
        name: "super-campos-backend",
        script: "dist/main.js",  // Ruta al entrypoint compilado
        instances: 1,           // Número de instancias (1 para desarrollo)
        autorestart: true,      // Reinicio automático ante caídas
        watch: false,           // No monitorear cambios (mejor para producción)
        env: {
          NODE_ENV: "production",
          PORT: 3000,           // Ajusta el puerto según tu .env
        },
      },
    ],
  };