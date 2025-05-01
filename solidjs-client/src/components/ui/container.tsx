import { splitProps, JSX, ValidComponent } from "solid-js"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { Dynamic } from "solid-js/web"
import { PolymorphicProps } from "@kobalte/core/polymorphic"

// Container component styles using cva
const containerVariants = cva("mx-auto px-4", {
  variants: {
    maxWidth: {
      xs: "max-w-xs", // 320px
      sm: "max-w-sm", // 384px
      md: "max-w-md", // 448px
      lg: "max-w-lg", // 512px
      xl: "max-w-xl", // 576px
      "2xl": "max-w-2xl", // 672px
      "3xl": "max-w-3xl", // 768px
      "4xl": "max-w-4xl", // 896px
      "5xl": "max-w-5xl", // 1024px
      "6xl": "max-w-6xl", // 1152px
      "7xl": "max-w-7xl", // 1280px
      full: "max-w-full", // 100%
      none: "", // No max width
    },
    disableGutters: {
      true: "px-0",
      false: "",
    },
    fixed: {
      true: "w-full",
      false: "",
    },
  },
  defaultVariants: {
    maxWidth: "7xl",
    disableGutters: false,
    fixed: true,
  },
})

type ContainerVariantsProps = VariantProps<typeof containerVariants>

export type ContainerProps<T extends ValidComponent = "div"> =
  ContainerVariantsProps & {
    children: JSX.Element
    class?: string
    as?: T // Allow specifying a custom component
  } & Omit<
      JSX.IntrinsicElements[T extends keyof JSX.IntrinsicElements ? T : "div"],
      "class" | "children"
    >

export const Container = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, ContainerProps<T>>,
) => {
  const [local, rest] = splitProps(props, [
    "maxWidth",
    "disableGutters",
    "fixed",
    "class",
    "as",
  ])

  const Component = local.as || "div" // Use the custom component or fallback to "div"
  return (
    <Dynamic
      component={Component}
      class={cn(
        containerVariants({
          maxWidth: local.maxWidth || "7xl",
          disableGutters: local.disableGutters || false,
          fixed: local.fixed !== false,
        }),
        local.class,
      )}
      {...rest}
    />
  )
}
