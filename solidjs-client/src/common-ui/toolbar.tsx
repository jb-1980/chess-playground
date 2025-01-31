import { JSX } from "solid-js"

interface ToolbarProps {
  class?: string
  children: JSX.Element | JSX.Element[]
}

export const Toolbar = (props: ToolbarProps) => {
  return (
    <div class={`flex items-center p-4 ${props.class}`}>{props.children}</div>
  )
}
