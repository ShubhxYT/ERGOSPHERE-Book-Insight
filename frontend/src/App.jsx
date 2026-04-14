import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import BookList from "./pages/BookList"
import BookDetail from "./pages/BookDetail"
import QAPage from "./pages/QAPage"

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="text-xl font-bold text-blue-600 mr-6">
          📚 Book Insights
        </span>
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/qa" className={linkClass}>
          Q&A
        </NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
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
