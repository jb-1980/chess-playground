import type { Environment } from "vitest/environments"

import { MongoMemoryServer } from "mongodb-memory-server"

export default <Environment>{
  name: "mongodb",
  transformMode: "ssr",
  async setup() {
    const mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_CONNECTION_STRING = mongoServer.getUri()

    return {
      async teardown() {
        await mongoServer.stop()
      },
    }
  },
}
