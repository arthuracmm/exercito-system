import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Cadastro } from "./pages/Cadastro"
import { ListaAtiradores } from "./pages/ListaAtiradores"
import { Declaracao } from "./pages/Declaracao"
import { Faltas } from "./pages/Faltas"
import { FaltasSP } from "./pages/FaltasSP"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/lista-atiradores" element={<ListaAtiradores />} />
        <Route path="/declaracao" element={<Declaracao />} />
        <Route path="/faltas" element={<Faltas />} />
        <Route path="/faltas/semana-passada" element={<FaltasSP />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
