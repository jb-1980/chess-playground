import { JSX, ValidComponent } from "solid-js"

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  // leadingIcon?: JSX.Element
  // trailingIcon?: JSX.Element
  fullWidth?: boolean
}

import clsx from "clsx"

const baseClass = clsx(
  "inline-flex",
  "justify-center",
  "items-center",
  "gap-x-1.5",
  "font-semibold",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
)

const variants = {
  primary: clsx(
    "bg-primary-main",
    "text-white",
    "hover:bg-primary-light",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-button-600",
    "shadow-sm",
  ),
  light: clsx(
    "bg-lightButton-50",
    "text-button-700",
    "ring-inset",
    "ring-1",
    "ring-button-500",
    "hover:bg-button-50",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-button-600",
    "shadow-sm",
  ),
  ghost: clsx(
    "bg-transparent",
    "text-button-700",
    "hover:bg-button-50",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-button-600",
  ),
}
const sizes = {
  xs: "px-2 py-1 text-xs rounded",
  sm: "px-2 py-1 text-sm rounded",
  md: "px-2.5 py-1.5 text-sm rounded-md",
  lg: "px-3 py-2 text-sm rounded-md",
  xl: "px-3.5 py-2.5 text-sm rounded-md",
}

export const Button = ({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  ...props
}: {
  leadingIcon?: ValidComponent | null
  trailingIcon?: ValidComponent | null
} & ButtonProps) => {
  const _className = `${baseClass} ${variants[variant]} ${sizes[size]}`
  const { class: className, children, ...rest } = props
  // let LeadingIcon = null
  // if (leadingIcon) {
  //   LeadingIcon = (
  //     <Dynamic component={leadingIcon} class="-ml-0.5 h-5 w-5" aria-hidden />
  //   )
  // }
  // let TrailingIcon = null
  // if (trailingIcon) {
  //   TrailingIcon = (
  //     <Dynamic component={trailingIcon} class="-mr-0.5 h-5 w-5" aria-hidden />
  //   )
  // }
  return (
    <button class={`${_className} ${className}`} {...rest}>
      {/* {LeadingIcon} */}
      {children}
      {/* {TrailingIcon} */}
    </button>
  )
}
