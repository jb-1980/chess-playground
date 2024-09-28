import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query"

const queryClient = new QueryClient()

export const QueryClientProvier = (props: { children: React.ReactNode }) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {props.children}
    </ReactQueryClientProvider>
  )
}
