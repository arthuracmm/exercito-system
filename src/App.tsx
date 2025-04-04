import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Cadastro } from "./pages/Cadastro"
import { Fo } from "./pages/Fo"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/fo" element={<Fo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
