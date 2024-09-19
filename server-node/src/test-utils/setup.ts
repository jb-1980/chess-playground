import dotenv from "dotenv"

dotenv.config({ path: "test.env" })

export default function setup() {
  process.env.TEST = "true"
}
