import { JSX, splitProps, ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

export const appBarVariants = cva(
  "w-full flex items-center px-4 shadow-md bg-primary text-primary-foreground",
  {
    variants: {
      position: {
        static: "relative",
        fixed: "fixed top-0 left-0",
        absolute: "absolute top-0 left-0",
        sticky: "sticky top-0",
      },
      color: {
        default: "bg-primary text-primary-foreground",
        transparent: "bg-transparent text-primary-foreground",
        inherit: "bg-inherit text-inherit",
      },
    },
    defaultVariants: {
      position: "static",
      color: "default",
    },
  },
)

type AppBarProps<T extends ValidComponent = "header"> = VariantProps<
  typeof appBarVariants
> & {
  class?: string
  as?: T
  children?: JSX.Element
}

export const AppBar = <T extends ValidComponent = "header">(
  props: AppBarProps<T>,
) => {
  const [local, rest] = splitProps(props, ["class", "position", "color", "as"])

  const Component = local.as || "header"

  return (
    <Dynamic
      component={Component}
      class={cn(
        appBarVariants({
          position: local.position,
          color: local.color,
        }),
        local.class,
      )}
      {...rest}
    />
  )
}
