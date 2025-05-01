import { cn } from "@/lib/cn"
import { PolymorphicProps } from "@kobalte/core/polymorphic"
import { cva, VariantProps } from "class-variance-authority"
import { type ComponentProps, JSX, splitProps, ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"

export const Table = (props: ComponentProps<"table">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <div class="w-full overflow-auto">
      <table
        class={cn("w-full caption-bottom text-sm", local.class)}
        {...rest}
      />
    </div>
  )
}

export const TableHeader = (props: ComponentProps<"thead">) => {
  const [local, rest] = splitProps(props, ["class"])

  return <thead class={cn("[&_tr]:border-b", local.class)} {...rest} />
}

export const TableBody = (props: ComponentProps<"tbody">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <tbody class={cn("[&_tr:last-child]:border-0", local.class)} {...rest} />
  )
}

export const TableFooter = (props: ComponentProps<"tfoot">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <tbody
      class={cn("bg-primary font-medium text-primary-foreground", local.class)}
      {...rest}
    />
  )
}

export const TableRow = (props: ComponentProps<"tr">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <tr
      class={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        local.class,
      )}
      {...rest}
    />
  )
}

export const TableHead = (props: ComponentProps<"th">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <th
      class={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        local.class,
      )}
      {...rest}
    />
  )
}

export const TableCell = (props: ComponentProps<"td">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <td
      class={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        local.class,
      )}
      {...rest}
    />
  )
}

export const TableCaption = (props: ComponentProps<"caption">) => {
  const [local, rest] = splitProps(props, ["class"])

  return (
    <caption
      class={cn("mt-4 text-sm text-muted-foreground", local.class)}
      {...rest}
    />
  )
}

// TableContainer component styles using cva
const tableContainerVariants = cva("w-full overflow-auto", {
  variants: {
    variant: {
      elevated: "bg-white rounded-md shadow",
      outlined: "border border-gray-200 rounded-md",
      plain: "",
    },
    size: {
      sm: "max-h-64",
      md: "max-h-96",
      lg: "max-h-[32rem]",
      auto: "",
    },
  },
  defaultVariants: {
    variant: "plain",
    size: "auto",
  },
})

type TableContainerVariantsProps = VariantProps<typeof tableContainerVariants>

export type TableContainerProps<T extends ValidComponent = "div"> =
  TableContainerVariantsProps & {
    children: JSX.Element
    class?: string
    as?: T // Allow specifying a custom component
  } & Omit<
      JSX.IntrinsicElements[T extends keyof JSX.IntrinsicElements ? T : "div"],
      "class" | "children"
    >

export const TableContainer = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TableContainerProps<T>>,
) => {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "as"])

  const Component = local.as || "div" // Use the custom component or fallback to "div"

  return (
    <Dynamic
      component={Component}
      class={cn(
        tableContainerVariants({
          variant: local.variant,
          size: local.size,
        }),
        local.class,
      )}
      {...rest}
    />
  )
}
