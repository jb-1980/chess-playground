export type Prefix<P extends string, T extends string> = `${P}${T}`

export type PrefixedObjectValues<
  K extends Record<string, string>,
  T extends string,
> = {
  [P in keyof K]: Prefix<T, K[P]>
}
