import "dotenv/config"
import { createServer } from "http"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import cors from "cors"
import express from "express"

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"

import {
  apolloContextFunction,
  ApolloContextType,
} from "./server-config/context"
import { typeDefs } from "./server-config/type-defs.generated"
import { resolvers } from "./server-config/resolvers.generated"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { authenticationMiddleware } from "./middleware/auth"

const app = express()
const httpServer = createServer(app)

const schema = makeExecutableSchema({ typeDefs, resolvers })

const ws = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions",
})

const serverCleanup = useServer(
  {
    schema,
    context: (ctx, msg, args) => {
      console.dir({ ctx, msg }, { depth: 6 })
    },
  },
  ws,
)

const server = new ApolloServer<ApolloContextType>({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})
await server.start()

app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  express.json(),
  authenticationMiddleware,
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: apolloContextFunction,
  }),
)

httpServer.listen({ port: 3001 }, () => {
  console.info(`🚀 Server ready at http://localhost:3001/graphql`)
})
