if (process.env.DB === "POSTGRES") {
  const module = require("./postgres")
  exports.GameLoader = module.GameLoader
  exports.UserLoader = module.UserLoader
  exports.GameMutator = module.GameMutator
  exports.UserMutator = module.UserMutator
} else {
  const module = require("./mongodb")
  exports.GameLoader = module.GameLoader
  exports.UserLoader = module.UserLoader
  exports.GameMutator = module.GameMutator
  exports.UserMutator = module.UserMutator
}
