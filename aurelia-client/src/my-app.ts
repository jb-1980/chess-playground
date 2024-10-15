export class MyApp {
  static routes = [
    {
      path: "",
      component: import("./routes/root/root"),
      title: "Home",
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
