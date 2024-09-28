import { pubsub } from "../../../../pubsub"
import type { SubscriptionResolvers } from "./../../../types.generated"
export const observeGame: NonNullable<SubscriptionResolvers["observeGame"]> = {
  subscribe: async (_parent, { gameId }, _ctx) => {
    /* Implement Subscription.observeGame resolver logic here */
    return pubsub.asyncIterator(`OBSERVE_GAME${gameId}`)
  },
}
