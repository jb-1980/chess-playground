import { JSX, splitProps, ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

export const toolbarVariants = cva("flex items-center w-full", {
  variants: {
    dense: {
      true: "min-h-[48px]",
      false: "min-h-[64px]",
    },
  },
  defaultVariants: {
    dense: false,
  },
})

type ToolbarProps<T extends ValidComponent = "div"> = VariantProps<
  typeof toolbarVariants
> & {
  class?: string
  component?: T
  children?: JSX.Element
}

export const Toolbar = <T extends ValidComponent = "div">(
  props: ToolbarProps<T>,
) => {
  const [local, rest] = splitProps(props, ["class", "dense", "component"])

  const Component = local.component || "div"

  return (
    <Dynamic
      component={Component}
      class={cn(
        toolbarVariants({
          dense: local.dense,
        }),
        local.class,
      )}
      {...rest}
    ></Dynamic>
  )
}
