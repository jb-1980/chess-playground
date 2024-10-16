export class MyApp {
  static routes = [
    {
      path: "",
      component: import("./routes/root/root"),
      title: "Home",
    },
    {
      path: "/games",
      component: import("./routes/games/games"),
      title: "Games",
    },
    {
      path: "/games/:gameId/review",
      component: import("./routes/_games.$gameId.review/game-review"),
      title: "Review",
    },
    {
      path: "/signup",
      component: import("./routes/sign-up/sign-up"),
      title: "Sign Up",
    },
    {
      path: "/login",
      component: import("./routes/login/login"),
      title: "Login",
    },
    {
      path: "/logout",
      component: import("./routes/logout/logout"),
      title: "Logout",
    },
  ]
}
