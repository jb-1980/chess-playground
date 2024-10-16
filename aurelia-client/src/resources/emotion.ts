import { resolve } from "aurelia"
import { css, cache } from "@emotion/css"

export class EmotionCustomAttribute {
  private element: Element = resolve(Element)
  attached() {
    if (this.isInShadow(this.element)) {
      cache.sheet.container = this.element.getRootNode() as HTMLElement
    } else {
      cache.sheet.container = document.head
    }
    // @ts-expect-error, value is not defined??
    this.element.classList.add(css(this.value))
  }
  private isInShadow(el: Element) {
    return el.getRootNode() instanceof ShadowRoot
  }
}
