import { mongoClient } from "../repository/mongodb/connection"

export default async function teardown() {
  // close the MongoDB connection
  await mongoClient.close()
}
