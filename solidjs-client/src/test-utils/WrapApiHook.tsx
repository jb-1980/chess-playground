import { ParentComponent } from "solid-js"
import { DatasourceProvider } from "../datasources/datasource-provider"
import { renderHook } from "@solidjs/testing-library"

export const WrapApiHook: ParentComponent = (props) => (
  <DatasourceProvider>{props.children}</DatasourceProvider>
)

export const renderApiHook: typeof renderHook = (hook, options) =>
  renderHook(hook, { wrapper: WrapApiHook, ...options })
