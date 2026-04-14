import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import BookList from "./pages/BookList"
import BookDetail from "./pages/BookDetail"
import QAPage from "./pages/QAPage"

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-primary border-b-2 border-primary bg-primary/10"
        : "text-on-surface-variant hover:text-on-surface"
    }`

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(27, 36, 56, 0.80)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <span
          className="text-xl font-bold text-primary mr-6 tracking-tight"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Book Insights
        </span>
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/qa" className={linkClass}>
          Q&amp;A
        </NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        <Nav />
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/qa" element={<QAPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
