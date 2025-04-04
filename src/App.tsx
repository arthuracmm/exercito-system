import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Cadastro } from "./pages/Cadastro"
import { Fo } from "./pages/Fo"
import { ListaAtiradores } from "./pages/ListaAtiradores"
import { FoID } from "./pages/FoID"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/fo" element={<Fo />} />
        <Route path="/fo/:numero" element={<FoID />} />
        <Route path="/lista-atiradores" element={<ListaAtiradores />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
