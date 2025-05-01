import { Component, splitProps } from "solid-js"
import { A, AnchorProps } from "@solidjs/router"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

const linkVariants = cva(
  "inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "text-primary hover:underline",
        underlined: "underline underline-offset-4 hover:text-primary",
        subtle: "text-muted-foreground hover:text-foreground hover:underline",
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface LinkProps
  extends AnchorProps,
    VariantProps<typeof linkVariants> {
  underline?: "none" | "hover" | "always"
  external?: boolean
  class?: string
}

export const Link: Component<LinkProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "variant",
    "size",
    "underline",
    "external",
    "href",
  ])

  // Determine if the link is external based on the href or the external prop
  const isExternal = () =>
    local.external ?? (local.href?.startsWith("http") || false)

  // Handle underline variations
  const getUnderlineClass = () => {
    if (local.underline === "none") return "no-underline"
    if (local.underline === "always") return "underline"
    if (local.underline === "hover") return "no-underline hover:underline"
    return "" // Use the variant default
  }

  return (
    <A
      href={local.href || "#"}
      class={cn(
        linkVariants({ variant: local.variant, size: local.size }),
        getUnderlineClass(),
        local.class,
      )}
      target={isExternal() ? "_blank" : undefined}
      rel={isExternal() ? "noopener noreferrer" : undefined}
      {...others}
    >
      {local.children}
    </A>
  )
}
