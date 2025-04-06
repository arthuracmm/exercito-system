import { Link } from "react-router-dom";
import { Eye, FileText, House, List, PlusCircle, Search } from "lucide-react";
import { SidebarLeft } from "../components/SidebarLeft";
import { Footer } from "../components/Footer";

const items = [{
    nome: "Cadastrar Atirador",
    icon: PlusCircle,
    path: '/cadastro'
},
{
    nome: "Fato Observado",
    icon: Eye,
    path: '/fo'
},
{
    nome: "Lista Atiradores",
    icon: List,
    path: '/lista-atiradores'
},
{
    nome: "Declaração",
    icon: FileText,
    path: '/declaracao'
},

]

export function Home() {
    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1 justify-between">
                <div className="flex flex-col">
                    <h1 className="font-bold text-2xl">Pagina principal</h1>
                    <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {items.map((item) => (
                            <Link to={item.path}>
                                <div className="flex flex-col items-center bg-white hover:bg-zinc-100 transition-all py-8 rounded-lg shadow-md" key={item.nome}>
                                    <item.icon size={50} />
                                    <p >{item.nome}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}