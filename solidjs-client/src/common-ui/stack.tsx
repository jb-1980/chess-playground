import { JSX } from "solid-js"

interface StackProps extends JSX.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column"
  spacing?: number
}

export const Stack = (props: StackProps) => {
  const {
    direction = "row",
    spacing = 0,
    children,
    class: className = "",
    ...rest
  } = props
  const directionClass = direction === "row" ? "flex-row" : "flex-col"
  const spacingClass = `gap-${spacing}`

  return (
    <div
      class={`flex ${directionClass} ${spacingClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
