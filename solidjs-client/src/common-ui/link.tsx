import { A } from "@solidjs/router"
import { JSX } from "solid-js"

interface LinkProps {
  href: string
  component?: (props: any) => JSX.Element
  class?: string
  children: JSX.Element | JSX.Element[]
}

export const Link = (props: LinkProps) => {
  const { href, class: className = "", children, ...rest } = props

  return (
    <A
      href={href}
      class={`text-blue-500 hover:underline ${className}`}
      {...rest}
    >
      {children}
    </A>
  )
}

export default Link
