import {
  QueryClient,
  QueryClientProvider as SolidQueryProvider,
} from "@tanstack/solid-query"
import { JSX } from "solid-js"

const queryClient = new QueryClient()

export const QueryClientProvier = (props: { children: JSX.Element }) => {
  return (
    <SolidQueryProvider client={queryClient}>
      {props.children}
    </SolidQueryProvider>
  )
}
