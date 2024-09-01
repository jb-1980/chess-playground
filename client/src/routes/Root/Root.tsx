import { NavLink, Outlet } from "react-router-dom"

import "./styles.css"

export const Root = () => {
  return (
    <>
      <MainHeader />
      <main>
        <Outlet />
      </main>
    </>
  )
}

const MainHeader = () => {
  return (
    <nav className="navbar">
      <div>
        <h1 className="logo">Chess App</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/games">Games</NavLink>
        </div>
      </div>
    </nav>
  )
}
