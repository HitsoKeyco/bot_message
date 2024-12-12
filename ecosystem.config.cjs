module.exports = {
    apps: [
      {
        script: 'src/app.js',
        watch: false,
        env: {
          PORT: 3010,
          PORT_SOCKET_IO: 3011,
          TOKEN_IO_SOCKET: '2f01e2cf6f779f6b4722e430dd4dacf6ff11bf0d13f96d98e5bc9eb60a9a5219'
        }
      }
    ]
  };
  
  