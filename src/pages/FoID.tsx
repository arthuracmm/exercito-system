import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";

export function FoID() {
    const [fo, setFo] = useState<any[]>([]);

    const numAtirador = window.location.pathname.split('/').pop();


    useEffect(() => {
        axios.get('http://localhost:5000/fo')
            .then((response) => {
                console.log('Dados retornados:', response.data);
                setFo(response.data);
            })
            .catch((error) => {
                console.error('Erro ao carregar atiradores:', error);
            });
    }, []);

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <h1 className="font-bold text-2xl">Fatos Atirador {numAtirador}</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                <div className="flex flex-col w-full mt-4 gap-4">
                    <div className="flex flex-col bg-zinc-100 p-4 rounded-lg shadow-lg">
                        <h1 className="font-bold text-2xl">Positivos</h1>
                        <div className="w-[10%] h-0.5 rounded-lg bg-green-500 mb-2" />
                        {fo.filter((item: any) => item.numero === numAtirador && item.tipofo === "FO Positivo").map((fo: any) => (
                            <div key={fo.nomeguerra} className="flex flex-col m-2 w-full">
                                <div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg p-4">
                                    <div className="flex gap-4 text-zinc-500">
                                        <p className="text-lg">
                                            {new Date(fo.datafo).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex">
                                        <p className="text-lg">{fo.conteudofo}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col bg-zinc-100 p-4 rounded-lg shadow-lg">
                        <h1 className="font-bold text-2xl">Negativos</h1>
                        <div className="w-[10%] h-0.5 rounded-lg bg-red-500 mb-2" />
                        {fo.filter((item: any) => item.numero === numAtirador && item.tipofo === "FO Negativo").map((fo: any) => (
                            <div key={fo.nomeguerra} className="flex flex-col m-2 w-full">
                                <div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg p-4">
                                    <div className="flex gap-4 text-zinc-500">
                                        <p className="text-lg">
                                            {new Date(fo.datafo).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex">
                                        <p className="text-lg">{fo.conteudofo}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}