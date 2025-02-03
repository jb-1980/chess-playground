## Patterns

The app is principally organized around routes. I find this most intutive for
front-end applications as it allows for a clear separation of concerns and
makes it easy to reason about the app's structure: You want to know where the code
for a particular page is? Look in the routes directory for that route.

Some of the patterns to look for:

- The `routes` directory contains all the routes for the app. Ideally, each route
  should be a self-contained module that exports a function that takes a `router`
  object and attaches the route to it.
- A route would have:
  - A `routes.tsx` file that exports a route function, which is a function that
    returns a route obect including the path and component to render.
  - The main component for the route, which is a React component that is rendered
    when the route is visited.
  - Any other components would be in the components directory.
  - A `styles.css` file that is imported into the main component to style it.
  - A `models.ts` file that would contain domain models for the route.
  - A `data` directory that would contain any data fetching logic for the route. (Not implemented in this app)
  - A `hooks` directory that would contain any custom hooks for the route. (Not implemented in this app)
  - A `utils` directory that would contain any utility functions for the route. (Not implemented in this app)
- Global items are at the root level, similar to the route:
  - `components`: directory that would have UI components like buttons, cards, spinners, or any other custom UI components that don't fit within a specific route.
  - `styles.css`: global styles for the app.
  - `models.ts`: global models for the app.
  - `context`: directory that would contain any global context providers for the app, like a `UserContext` or `ThemeContext`.

## Technologies

- Vite is really becoming the next build tool for front end applications. It's
  fast, I have found it is easier to configure than Webpack, and it has a lot of
  nice features out of the box.
- React is the most popular front-end library, and for good reason. It's easy to
  use, has a large community, and is very powerful.
- React Router is the most popular routing library for React. It's easy to use
  and has a lot of nice features, but I am particularly fond of the nested routes.
  It also has the option of `loaders` and `actions` which are functions that can
  be leveraged to get data into the the route, as well as mutate data in the route.
  I have not fully explored these features yet, but I think they could be very
  powerful.