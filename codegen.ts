import { defineConfig } from "@eddeee888/gcg-typescript-resolver-files"
import type { CodegenConfig } from "@graphql-codegen/cli"
import { LocalDateResolver } from "graphql-scalars"

const scalars = {
  LocalDate: LocalDateResolver.extensions.codegenScalarType,
}

const config: CodegenConfig = {
  schema: [
    "./server-apollo-graphql/**/schema.graphql",
    "./server-apollo-graphql/**/domain.graphql",
    "./server-apollo-graphql/**/queries.graphql",
    "./server-apollo-graphql/**/mutations.graphql",
    "./server-apollo-graphql/**/subscriptions.graphql",
  ],
  hooks: {
    afterAllFileWrite: ["npx prettier --write"],
  },
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "server-apollo-graphql/src/gql-modules": defineConfig({
      resolverMainFile: "../server-config/resolvers.generated.ts",
      typeDefsFilePath: "../server-config/type-defs.generated.ts",
      typesPluginsConfig: {
        contextType: "../server-config/context#ApolloContextType",

        enumsAsTypes: false,
      },
      scalarsModule: "graphql-scalars",
    }),

    "client/src/datasources/apollo-client/gql/types.generated.ts": {
      plugins: ["typescript"],
      config: {
        scalars,
        namingConvention: {
          enumValues: "keep",
        },
        enumsAsTypes: true,
      },
    },
    "client/src/routes": {
      documents: ["client/**/*operation.graphql"],
      overwrite: true,
      plugins: ["typescript-operations", "typescript-react-apollo"],
      preset: "near-operation-file",
      presetConfig: {
        extension: ".ts",
        // the preset uses the ~ for a workspace package, and vite has the ~ aliased to src,
        // so using a ~~ to make it work
        baseTypesPath: "../datasources/apollo-client/gql/types.generated.ts",
      },
      config: {
        withHooks: true,
        nonOptionalTypename: true,
        avoidOptionals: true,
        scalars,
      },
    },
    "vue-client/src/datasources/types.generated.ts": {
      plugins: ["typescript"],
      config: {
        scalars,
        namingConvention: {
          enumValues: "keep",
        },
        enumsAsTypes: true,
      },
    },
    "vue-client/src/datasources/apollo-client/operations": {
      documents: ["vue-client/**/*operation.graphql"],
      overwrite: true,
      plugins: ["typescript-operations", "typescript-vue-apollo"],
      preset: "near-operation-file",
      presetConfig: {
        extension: ".ts",
        baseTypesPath: "~@/datasources/types.generated.ts",
      },
      config: {
        withCompositionFunctions: true,
        vueCompositionApiImportFrom: "vue",
        useTypeImports: true,
      },
    },
  },
}
export default config
