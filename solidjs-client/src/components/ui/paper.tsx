import { JSX, ValidComponent, splitProps } from "solid-js"
import { Dynamic } from "solid-js/web"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { PolymorphicProps } from "@kobalte/core/polymorphic"

// Define the Paper component variants using cva
const paperVariants = cva("relative bg-white", {
  variants: {
    elevation: {
      0: "border border-gray-200",
      1: "shadow-paper-1",
      2: "shadow-paper-2",
      3: "shadow-paper-3",
      4: "shadow-paper-4",
      6: "shadow-paper-6",
      8: "shadow-paper-8",
      12: "shadow-paper-12",
      16: "shadow-paper-16",
      24: "shadow-paper-24",
    },
    variant: {
      elevation: "", // Default,
      outlined: "border border-gray-200 shadow-none",
      plain: "", // No border or elevation
    },
    square: {
      true: "rounded-none",
      false: "rounded-lg",
    },
    color: {
      default: "bg-white",
      primary: "bg-blue-50",
      secondary: "bg-purple-50",
      info: "bg-cyan-50",
      success: "bg-green-50",
      warning: "bg-amber-50",
      error: "bg-red-50",
      transparent: "bg-transparent",
    },
  },
  compoundVariants: [
    {
      variant: "elevation",
      elevation: 0,
      class: "border-none shadow-none",
    },
  ],
  defaultVariants: {
    elevation: 1,
    variant: "elevation",
    square: false,
    color: "default",
  },
})

// Combine PaperVariantProps with additional props
type PaperVariantProps = VariantProps<typeof paperVariants>

type PaperProps<T extends ValidComponent = "div"> = PaperVariantProps & {
  component?: T
  class?: string
  children?: JSX.Element
} & Omit<
    JSX.IntrinsicElements[T extends keyof JSX.IntrinsicElements ? T : "div"],
    "class" | "children"
  >

export const Paper = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, PaperProps<T>>,
) => {
  const [local, rest] = splitProps(props, [
    "component",
    "elevation",
    "variant",
    "square",
    "color",
    "class",
  ] as const)

  // Generate classes using cva and cn utility
  const paperClasses = () => {
    return cn(
      paperVariants({
        elevation: local.elevation,
        variant: local.variant,
        square: local.square,
        color: local.color,
      }),
      local.class,
    )
  }

  return (
    <Dynamic
      component={local.component || "div"}
      class={paperClasses()}
      {...rest}
    ></Dynamic>
  )
}

// Convenience components for common paper variations
export const Card = <T extends ValidComponent = "div">(
  props: Omit<PaperProps<T>, "variant" | "elevation"> & {
    elevation?: PaperVariantProps["elevation"]
  },
) => <Paper elevation={props.elevation || 2} {...props} />

export const OutlinedCard = <T extends ValidComponent = "div">(
  props: Omit<PaperProps<T>, "variant" | "elevation">,
) => <Paper variant="outlined" {...props} />

export const FlatCard = <T extends ValidComponent = "div">(
  props: Omit<PaperProps<T>, "variant" | "elevation">,
) => <Paper variant="plain" elevation={0} {...props} />
