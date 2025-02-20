if (process.env.DB === "POSTGRES") {
  const module = require("./postgres")
  exports.DBGameLoader = module.PostgresGameLoader
  exports.DBUserLoader = module.PostgresUserLoader
  exports.DBGameMutator = module.PostgresGameMutator
  exports.DBUserMutator = module.PostgresUserMutator
} else {
  const module = require("./mongodb")
  exports.DBGameLoader = module.MongoDBGameLoader
  exports.DBUserLoader = module.MongoDBUserLoader
  exports.DBGameMutator = module.MongoDBGameMutator
  exports.DBUserMutator = module.MongoDBUserMutator
}
