import { mongoDB } from "src/database/connection"

export async function resetDatabase() {
  await mongoDB.dropDatabase()
}
