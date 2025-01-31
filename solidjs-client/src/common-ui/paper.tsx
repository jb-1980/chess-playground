import { JSX } from "solid-js"

interface PaperProps extends JSX.HTMLAttributes<HTMLDivElement> {
  elevation?: number
}

const elevationClasses = [
  "shadow-none",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "shadow-3xl",
  "shadow-4xl",
  "shadow-5xl",
  "shadow-6xl",
]

export const Paper = (props: PaperProps) => {
  const { elevation = 1, class: className = "", children, ...rest } = props
  const elevationClass = elevationClasses[elevation] || elevationClasses[1]

  return (
    <div
      class={`bg-white p-4 rounded ${elevationClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
