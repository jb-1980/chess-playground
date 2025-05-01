import { cn } from "@/lib/cn"
import { cva, VariantProps } from "class-variance-authority"
import { ComponentProps, splitProps, ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"

export const typographyVariants = cva("font-[roboto]", {
  variants: {
    variant: {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-bold",
      h3: "text-2xl font-bold",
      h4: "text-xl font-bold",
      h5: "text-lg font-bold",
      h6: "text-base font-bold",
      subtitle1: "text-lg font-semibold",
      subtitle2: "text-base font-semibold",
      body1: "text-base font-normal",
      body2: "text-sm font-normal",
      button: "text-base font-semibold",
      caption: "text-sm font-normal",
      overline: "text-xs font-normal",
    },
    align: {
      inherit: "[text-align:inherit]",
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
      error: "text-destructive",
      warning: "text-warning",
      info: "text-info",
      success: "text-success",
    },
  },
  defaultVariants: {
    variant: "body1",
    align: "inherit",
  },
})

/** The semantic html elements that display text. The Typography is not going to
 * have an opionated style for each, but it combination of the class attribute and
 * component prop, the developer can choose the element to use and add additional
 * styling to make things more semantic.
 */
type TextElement =
  | "p" // paragraph
  | "h1" // main heading
  | "h2" // section heading
  | "h3" // subsection heading
  | "h4" // sub-subsection heading
  | "h5" // minor heading
  | "h6" // minor heading
  | "span" // inline container
  | "strong" // important text
  | "em" // emphasized text
  | "code" // inline code
  | "blockquote" // quoted content
  | "figcaption" // figure caption
  | "label" // form label
  | "legend" // fieldset legend
  | "cite" // citation
  | "abbr" // abbreviation
  | "mark" // highlighted text
  | "time" // time element
  | "address" // contact information
  | "del" // deleted text
  | "ins" // inserted text
  | "small" // small print
  | "b" // bold text (styling)
  | "i" // italic text (styling)
  | "u" // underlined text (styling)
  | "dfn" // definition term
  | "kbd" // keyboard input
  | "var" // variable in math/programming
  | "samp" // sample output
  | "data" // machine-readable data
  | "pre" // preformatted text
  | "summary" // disclosure summary

type typographyProps<T extends ValidComponent = "div"> = ComponentProps<T> &
  VariantProps<typeof typographyVariants> & {
    class?: string
    as?: TextElement
  }

export const Typography = <T extends ValidComponent = "div">(
  props: typographyProps<T>,
) => {
  const [local, rest] = splitProps(props as typographyProps, [
    "class",
    "variant",
    "align",
    "as",
  ])

  const component = () => {
    if (local.as) {
      return local.as
    }
    if (!local.variant) {
      return "div"
    }
    return ["h1", "h2", "h3", "h4", "h5", "h6"].includes(local.variant)
      ? local.variant
      : "div"
  }

  return (
    <Dynamic
      component={component()}
      class={cn(
        typographyVariants({
          align: local.align,
          variant: local.variant,
        }),
        local.class,
      )}
      {...rest}
    />
  )
}
