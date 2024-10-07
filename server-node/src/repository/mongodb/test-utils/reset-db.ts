import { mongoDB } from "../connection"

export async function resetDb() {
  await mongoDB.dropDatabase()
}
