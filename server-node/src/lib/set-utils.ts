export const shiftSet = <T>(set: Set<T>): T | undefined => {
  for (const item of set) {
    set.delete(item)
    return item
  }
  return
}
