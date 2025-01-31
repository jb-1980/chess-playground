import { JSX, mergeProps } from "solid-js"

interface AppBarProps {
  position?: "static" | "fixed" | "absolute" | "sticky"
  class?: string
  children: JSX.Element | JSX.Element[]
}

const positionClasses = {
  static: "static",
  fixed: "fixed top-0 left-0 w-full",
  absolute: "absolute top-0 left-0 w-full",
  sticky: "sticky top-0",
}

export const AppBar = (props: AppBarProps) => {
  const mergedProps = mergeProps({ position: "static" as const }, props)
  const positionClass = positionClasses[mergedProps.position]

  return (
    <header
      class={`bg-primary-main text-primary-contrast-text p-4 ${positionClass} ${mergedProps.class}`}
    >
      {mergedProps.children}
    </header>
  )
}
