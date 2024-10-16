import Aurelia from "aurelia"
import { MyApp } from "./my-app"
import { EmotionCustomAttribute } from "./resources/emotion"
import { RouterConfiguration } from "@aurelia/router"
import { MissingPage } from "./missing-page/missing-page"

Aurelia.register(EmotionCustomAttribute)
  .register(
    RouterConfiguration.customize({
      useUrlFragmentHash: false,
      useHref: false,
      fallback: MissingPage,
    }),
  )

  .app(MyApp)
  .start()
