import { MongoClient } from "mongodb"

const { MONGO_CONNECTION_STRING } = process.env
if (!MONGO_CONNECTION_STRING) {
  throw new Error(
    "Please define the MONGO_CONNECTION_STRING environment variable inside .env"
  )
}

// adding an `appName` to the connection string helps with monitoring and analytics
// in the MongoDB Atlas UI
const connectionString = !MONGO_CONNECTION_STRING.includes("appName")
  ? MONGO_CONNECTION_STRING.includes("?")
    ? `${MONGO_CONNECTION_STRING}&appName=chess-app`
    : `${MONGO_CONNECTION_STRING}?appName=chess-app`
  : MONGO_CONNECTION_STRING.replace(
      /appName=([a-z0-9]*)/i,
      () => `appName=chess-app`
    )

// MongoDB Client is a singleton and should only be instantiated once (rather than multiple times in tests or request handlers, for example)
let mongoClient: MongoClient
const _global = globalThis as unknown as {
  mongoClient: MongoClient | undefined
}

if (process.env.NODE_ENV === "production") {
  mongoClient = new MongoClient(connectionString)
} else {
  if (!_global.mongoClient) {
    mongoClient = new MongoClient(connectionString)
    _global.mongoClient = mongoClient
    const dbName = mongoClient.options.dbName
    if (!dbName) {
      console.error(
        `Database name not found in connection string: ${connectionString}`
      )
      process.exit(1)
    }
  } else {
    mongoClient = _global.mongoClient
  }
}

process.on("exit", () => {
  console.info("EXIT - MongoDB Client disconnecting")
  mongoClient.close()
})

export const mongoDB = mongoClient.db()
export { mongoClient }
