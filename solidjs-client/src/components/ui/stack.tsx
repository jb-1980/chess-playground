import { JSX, ValidComponent, splitProps } from "solid-js"
import { Dynamic, For, Show } from "solid-js/web"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      "row-reverse": "flex-row-reverse",
      column: "flex-col",
      "column-reverse": "flex-col-reverse",
    },
    gap: {
      0: "gap-0",
      0.5: "gap-0.5",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
      16: "gap-16",
    },
    alignItems: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justifyContent: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: 4,
  },
})

// Combine StackVariantProps with additional props
type StackVariantProps = VariantProps<typeof stackVariants>

type StackProps<T extends ValidComponent = "div"> = StackVariantProps & {
  as?: T
  divider?: JSX.Element
  class?: string
  children?: JSX.Element
} & Omit<
    JSX.IntrinsicElements[T extends keyof JSX.IntrinsicElements ? T : "div"],
    "class" | "children"
  >

export const Stack = <T extends ValidComponent = "div">(
  props: StackProps<T>,
) => {
  const [local, rest] = splitProps(props as any, [
    "as",
    "direction",
    "spacing",
    "divider",
    "alignItems",
    "justifyContent",
    "wrap",
    "class",
    "children",
  ])

  // Generate classes using cva and cn utility
  const stackClasses = () => {
    return cn(
      stackVariants({
        direction: local.direction,
        gap: local.spacing,
        alignItems: local.alignItems,
        justifyContent: local.justifyContent,
        wrap: local.wrap,
      }),
      local.class,
    )
  }

  // Render children with dividers if specified
  const Children = () => {
    if (!local.divider || !Array.isArray(local.children)) {
      return local.children
    }

    // Add dividers between children
    const childrenArray = Array.isArray(local.children)
      ? local.children
      : [local.children]

    return (
      <For each={childrenArray}>
        {(child, index) => (
          <div>
            {child}
            <Show when={index() < childrenArray.length - 1}>
              <div
                class={cn(
                  "stack-divider",
                  local.direction === "row" || local.direction === "row-reverse"
                    ? "self-stretch"
                    : "w-full",
                )}
              >
                {local.divider}
              </div>
            </Show>
          </div>
        )}
      </For>
    )
  }

  return (
    <Dynamic component={local.as || "div"} class={stackClasses()} {...rest}>
      <Children />
    </Dynamic>
  )
}
