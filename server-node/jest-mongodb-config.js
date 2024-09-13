module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "7.0.12",
      skipMD5: true,
    },
    instance: {
      dbName: "jest",
    },
    autoStart: false,
  },
  mongoURLEnvName: "MONGO_CONNECTION_STRING",
}
