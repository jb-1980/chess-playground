import { mongoDB } from "../repository/connection"

export async function resetDb() {
  await mongoDB.dropDatabase()
}
