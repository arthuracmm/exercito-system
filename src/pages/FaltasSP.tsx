import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";
import { Link } from "react-router-dom";

export function FaltasSP() {
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

    const getWeekDays = () => {
        const daysOfWeek = ['SEGUNDA FEIRA', 'TERÇA FEIRA', 'QUARTA FEIRA', 'QUINTA FEIRA', 'SEXTA FEIRA', 'SABADO'];
        const today = new Date();
        const dayOfWeek = today.getDay();

        const diffToMonday = (7 - dayOfWeek + 1) % 7;
        const currentMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMonday);

        const twoWeeksAgoMonday = new Date(currentMonday);
        twoWeeksAgoMonday.setDate(currentMonday.getDate() - 14);
        const weekDates = [];
        for (let i = 0; i < 6; i++) {
            const day = new Date(twoWeeksAgoMonday);
            day.setDate(twoWeeksAgoMonday.getDate() + i);
            const formattedDate = `${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`;
            weekDates.push({ day: daysOfWeek[i], date: formattedDate });
        }

        return weekDates;
    };

    const weekDays = getWeekDays();



    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-2xl">Consultar Faltas <span className="block text-sm font-medium">Semana Passada</span></h1>
                    <Link to="/faltas" className="text-blue-500 hover:text-blue-700">
                        Ver Semana Atual
                    </Link>
                </div>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                <div className="flex flex-1 flex-col w-full mt-2 overflow-x-hidden overflow-y-scroll items-center">
                    {atiradores
                        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                        .map((atirador) => (
                            <div key={atirador.nomeguerra} className="flex flex-1 gap-4 bg-white rounded-lg p-4 m-2 w-[99%]">
                                <div className="flex flex-1 gap-4">
                                    <div className="flex justify-between items-center w-40">
                                        <h2 className="text-sm uppercase font-bold">{atirador.numero}</h2>
                                        <h2 className="text-sm uppercase font-bold">{atirador.nomeguerra}</h2>
                                    </div>
                                    <div className="grid grid-cols-6 bg-zinc-100 rounded-lg p-4 w-full justify-between items-center">
                                        {weekDays.map((weekDay, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <span className="text-[10px]">{weekDay.day}</span>
                                                <span className="text-[15px] font-semibold">{weekDay.date}</span>
                                                <input
                                                    type="checkbox"
                                                    name={weekDay.day}
                                                    id={weekDay.day}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="bg-green-500 p-2 text-white rounded-lg hover:bg-green-600 transition-all w-[20%] cursor-pointer">
                            Atualizar Faltas
                        </button>
                </div>
            </div>
        </div>
    );
}
