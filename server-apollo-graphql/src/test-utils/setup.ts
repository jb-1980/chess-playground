import { config } from "dotenv"
import { expect } from "vitest"
import * as matchers from "jest-extended"

config({ path: "test.env" })
expect.extend(matchers)
