import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";
import { Link } from "react-router-dom";


export function ListaAtiradores() {
    const [atiradores, setAtiradores] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:5000/atiradores')
            .then((response) => {
                console.log('Dados retornados:', response.data);
                setAtiradores(response.data);
            })
            .catch((error) => {
                console.error('Erro ao carregar atiradores:', error);
            });
    }, []);

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <h1 className="font-bold text-2xl">Lista Atiradores</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />

                <div className="flex flex-col w-full mt-4">
                    {atiradores
                        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                        .map((atirador) => (
                            <div key={atirador.nomeguerra} className="flex gap-4 bg-white rounded-lg shadow-lg p-4 m-2 w-full justify-between items-center">
                                <div className="flex gap-4">
                                    <h2 className="text-lg">Numero: <span className="font-bold">{atirador.numero}</span></h2>
                                    <h2 className="text-lg">Nome: <span className="font-bold">{atirador.nomeguerra}</span></h2>
                                </div>
                                <div>
                                    <Link to={`/fo/${atirador.numero}`} className="text-blue-500 hover:text-blue-700">
                                        Ver Detalhes
                                    </Link>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}