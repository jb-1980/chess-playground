import type { Context } from "./middleware/context"

declare module "ws" {
  export class WebSocket {
    context: Context
  }
}
