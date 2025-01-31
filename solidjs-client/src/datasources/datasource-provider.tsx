// import { ApolloClientProvider } from "./apollo-client/client"
import { JSX } from "solid-js"
import { QueryClientProvier } from "./solid-query"

// const PROVIDER = import.meta.env.VITE_DATASOURCE

export const DatasourceProvider = (props: { children: JSX.Element }) => {
  // if (PROVIDER === "APOLLO") {
  //   return <ApolloClientProvider>{props.children}</ApolloClientProvider>
  // }
  return <QueryClientProvier>{props.children}</QueryClientProvier>
}
