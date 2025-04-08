import { useEffect, useState } from "react";
import axios from "axios";
import { SidebarLeft } from "../components/SidebarLeft";
import { Link } from "react-router-dom";

export function Faltas() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [faltas, setFaltas] = useState<{ [key: string]: string[] }>({});
    const [selectedAtiradores, setSelectedAtiradores] = useState<{ [key: string]: Set<string> }>({});

    useEffect(() => {
        axios.get('http://localhost:5000/atiradores')
            .then((response) => {
                setAtiradores(response.data);
            })
            .catch((error) => {
                console.error('Erro ao carregar atiradores:', error);
            });

        axios.get('http://localhost:5000/faltas')
            .then((response) => {
                const faltasData: { [key: string]: string[] } = {};
                const selectedAtiradoresData: { [key: string]: Set<string> } = {};

                response.data.forEach((falta: any) => {
                    const data = falta.data;
                    const atiradores = falta.atiradores;

                    faltasData[data] = atiradores;
                    selectedAtiradoresData[data] = new Set(atiradores); 
                });

                setFaltas(faltasData);
                setSelectedAtiradores(selectedAtiradoresData);
            })
            .catch((error) => {
                console.error('Erro ao carregar faltas:', error);
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

    const handleCheckboxChange = (date: string, atiradorId: string, checked: boolean) => {
        setSelectedAtiradores((prevSelected) => {
            const updatedSelected = { ...prevSelected };
            if (!updatedSelected[date]) {
                updatedSelected[date] = new Set();
            }

            if (checked) {
                updatedSelected[date].add(atiradorId); 
            } else {
                updatedSelected[date].delete(atiradorId);
            }

            return updatedSelected;
        });
    };

    const handleSubmit = () => {
        weekDays.forEach((weekDay) => {
            const date = weekDay.date;
            const atiradoresForDay = Array.from(selectedAtiradores[date] || []);

            const dataToSend = {
                data: date,
                atiradores: atiradoresForDay
            };

            console.log('Tentando atualizar falta para a data:', date);
            console.log('Dados a serem enviados:', dataToSend);

            if (faltas[date]) {
                axios.put(`http://localhost:5000/faltas/${date}`, dataToSend)
                    .then((_response) => {
                        console.log(`Faltas para ${date} atualizadas com sucesso`);
                    })
                    .catch((error) => {
                        console.error(`Erro ao atualizar faltas para ${date}:`, error.response ? error.response.data : error.message);
                        if (error.response && error.response.status === 404) {
                            axios.post('http://localhost:5000/faltas', dataToSend)
                                .then(() => {
                                    console.log(`Faltas para ${date} criadas com sucesso`);
                                })
                                .catch((createError) => {
                                    console.error(`Erro ao criar faltas para ${date}:`, createError.response ? createError.response.data : createError.message);
                                });
                        }
                    });
            } else {
                axios.post('http://localhost:5000/faltas', dataToSend)
                    .then((_response) => {
                        console.log(`Faltas para ${date} criadas com sucesso`);
                    })
                    .catch((error) => {
                        console.error(`Erro ao criar faltas para ${date}:`, error.response ? error.response.data : error.message);
                    });
            }
        });
    };

    const handleReset = () => {
        if (window.confirm("Você tem certeza de que deseja redefinir todas as faltas? Isso removerá todas as faltas do banco de dados.")) {
            axios.delete('http://localhost:5000/faltas')
                .then(() => {
                    console.log("Todas as faltas foram apagadas com sucesso");
                    setFaltas({});
                    setSelectedAtiradores({});
                })
                .catch((error) => {
                    console.error("Erro ao apagar todas as faltas:", error.response ? error.response.data : error.message);
                });
        }
    };
    

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1 items-center">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-2xl">Consultar Faltas <span className="block text-sm font-medium">Semana Atual</span></h1>
                    <Link to="/faltas/semana-passada" className="text-blue-500 hover:text-blue-700">
                        Ver Semana Passada
                    </Link>
                </div>
                <div className="flex w-full">
                    <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                </div>
                <button
                    className="bg-red-500 text-xs p-2 text-white rounded-lg hover:bg-red-600 transition-all w-fit cursor-pointer mt-2"
                    onClick={handleReset}
                >
                    Redefinir Faltas
                </button>

                <div className="flex flex-1 flex-col w-full mt-2 overflow-x-hidden overflow-y-scroll items-center">
                    {atiradores
                        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                        .map((atirador) => (
                            <div key={atirador.id} className="flex flex-1 gap-4 bg-white rounded-lg p-4 m-2 w-[99%]">
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
                                                    name={weekDay.date}
                                                    id={`${atirador.id}-${weekDay.date}`}
                                                    checked={selectedAtiradores[weekDay.date]?.has(atirador.id) || false}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(weekDay.date, atirador.id, e.target.checked)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    <button
                        className="bg-green-500 p-2 text-white rounded-lg hover:bg-green-600 transition-all w-[20%] cursor-pointer"
                        onClick={handleSubmit}
                    >
                        Atualizar Faltas
                    </button>
                </div>
            </div>
        </div>
    );
}
