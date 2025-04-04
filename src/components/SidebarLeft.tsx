import { Eye, FileText, House, List, PlusCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

const items = [{
    nome: "Pagina Principal",
    icon: House,
    path: '/'
},
{
    nome: "Cadastrar Atr.",
    icon: PlusCircle,
    path: '/cadastro'
},
{
    nome: "Fato Observado",
    icon: Eye,
    path: '/fo' 
},
{
    nome: "Lista Atr.",
    icon: List,
    path: '/lista-atiradores' 
},
{
    nome: "Declaração",
    icon: FileText,
    path: '/declaracao' 
},

]

const verifyPath = (path: string) => {
    return location.pathname === path
        ? 'text-green-500'
        : 'text-zinc-600';
}

export function SidebarLeft() {
    return (
        <div className="flex flex-col fixed h-screen bg-zinc-100 p-4 w-50 items-center justify-between left-0 shadow-lg">
            <div className="flex flex-col gap-8 items-center">
                <img src="/public/images/tg-icon.png" alt="tg icone" className="size-30" />

                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <Link to={item.path} key={item.nome}>
                            <div className={`flex gap-2 cursor-pointer ${verifyPath(item.path)}`}>
                                <div className={`bg-green-500 w-1 rounded-md ${location.pathname === item.path ? 'visible' : 'invisible'}`} />
                                <item.icon />
                                {item.nome}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex">
                <h1 className="text-sm text-zinc-500 underline">TG 02-013 FRANCA-SP</h1>
            </div>
        </div>
    )
}