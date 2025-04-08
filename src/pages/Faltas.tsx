import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";
import { Link } from "react-router-dom";

export function Faltas() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [selectedFaltas, setSelectedFaltas] = useState<{ [key: string]: string[] }>({}); // Para armazenar as faltas selecionadas

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
        twoWeeksAgoMonday.setDate(currentMonday.getDate() - 7);
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

    const handleCheckboxChange = (atiradorId: string, date: string, isChecked: boolean) => {
        setSelectedFaltas((prevSelected) => {
            const newSelected = { ...prevSelected };
            if (isChecked) {
                if (!newSelected[date]) newSelected[date] = [];
                newSelected[date].push(atiradorId);
            } else {
                newSelected[date] = newSelected[date].filter((id: string) => id !== atiradorId);
                if (newSelected[date].length === 0) delete newSelected[date];
            }
            return newSelected;
        });
    };

    const handleUpdateFaltas = () => {
        axios.post('http://localhost:5000/faltas', selectedFaltas)
            .then((response) => {
                console.log('Faltas atualizadas com sucesso:', response.data);
            })
            .catch((error) => {
                console.error('Erro ao atualizar faltas:', error);
            });
    };

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-2xl">Consultar Faltas <span className="block text-sm font-medium">Semana Atual</span></h1>
                    <Link to="/faltas/semana-passada" className="text-blue-500 hover:text-blue-700">
                        Ver Semana Passada
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
                                                    onChange={(e) => handleCheckboxChange(atirador.id, weekDay.date, e.target.checked)} // Adiciona o evento de mudança
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    <button 
                        onClick={handleUpdateFaltas} 
                        className="bg-green-500 p-2 text-white rounded-lg hover:bg-green-600 transition-all w-[20%] cursor-pointer"
                    >
                        Atualizar Faltas
                    </button>
                </div>
            </div>
        </div>
    );
}
