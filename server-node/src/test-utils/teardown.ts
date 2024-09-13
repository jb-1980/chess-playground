import { mongoClient } from "../repository/connection"

export default async function teardown() {
  // close the MongoDB connection
  await mongoClient.close()
}
