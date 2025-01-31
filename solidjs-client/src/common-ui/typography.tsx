import { JSX } from "solid-js"

interface TypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption"
    | "overline"
  color?: "error"
  align?: "left" | "center" | "right" | "justify"
  className?: string
  children: JSX.Element
}

const variantClasses = {
  h1: "text-6xl font-bold",
  h2: "text-5xl font-bold",
  h3: "text-4xl font-bold",
  h4: "text-3xl font-bold",
  h5: "text-2xl font-bold",
  h6: "text-xl font-bold",
  subtitle1: "text-lg font-medium",
  subtitle2: "text-base font-medium",
  body1: "text-base",
  body2: "text-sm",
  caption: "text-xs",
  overline: "text-xs uppercase",
}

const colorClasses = {
  error: "text-red-500",
}

export const Typography = (props: TypographyProps) => {
  const {
    variant = "body1",
    color = "",
    align = "left",
    className = "",
    children,
  } = props
  const variantClass = variantClasses[variant]
  const alignClass = `text-${align}`
  const colorClass = color && colorClasses[color]

  return (
    <p class={`${variantClass} ${colorClass} ${alignClass} ${className}`}>
      {children}
    </p>
  )
}
