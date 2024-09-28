import { ApolloClientProvider } from "./apollo-client/client"
import { QueryClientProvier } from "./react-query"

const PROVIDER = import.meta.env.VITE_DATASOURCE

export const DatasourceProvider = (props: { children: React.ReactNode }) => {
  if (PROVIDER === "APOLLO") {
    return <ApolloClientProvider>{props.children}</ApolloClientProvider>
  }
  return <QueryClientProvier>{props.children}</QueryClientProvier>
}
