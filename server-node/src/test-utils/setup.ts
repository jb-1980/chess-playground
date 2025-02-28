import dotenv from "dotenv"

dotenv.config({ path: "test.env" })

export default async function setup() {
  process.env.TEST = "true"
}
