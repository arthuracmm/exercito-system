import { useEffect, useState } from "react";
import axios from "axios";
import { SidebarLeft } from "../components/SidebarLeft";
import { Link } from "react-router-dom";
import { Eraser } from "lucide-react";

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

    const formatDateToISO = (dateStr: string) => {
        if (!dateStr || typeof dateStr !== 'string') return '';
        const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');

        if (parts.length !== 3) return '';

        const [a, b, c] = parts;

        // Se for dd/mm/yyyy
        if (dateStr.includes('/')) {
            const day = a.padStart(2, '0');
            const month = b.padStart(2, '0');
            const year = c;
            return `${year}-${month}-${day}`;
        }

        // Se for yyyy-mm-dd
        const year = a;
        const month = b.padStart(2, '0');
        const day = c.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };




    const getWeekDays = () => {
        const daysOfWeek = ['SEGUNDA FEIRA', 'TERÇA FEIRA', 'QUARTA FEIRA', 'QUINTA FEIRA', 'SEXTA FEIRA', 'SABADO'];
        const today = new Date();
        const dayOfWeek = today.getDay();

        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() + diffToMonday);

        const weekDates = [];

        for (let i = 0; i < 6; i++) {
            const day = new Date(currentMonday);
            day.setDate(currentMonday.getDate() + i);

            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');

            const isoDate = `${year}-${month}-${date}`;
            weekDates.push({ day: daysOfWeek[i], date: isoDate });
        }

        return weekDates;
    };

    const formatDateForDisplay = (isoDate: string) => {
        const [year, month, day] = isoDate.split("-");
        return `${day}/${month}/${year}`;
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
            const dateISO = formatDateToISO(date);
            const atiradoresForDay = Array.from(selectedAtiradores[date] || []);

            const dataToSend = {
                id: dateISO, // <-- aqui está a mudança!
                data: dateISO,
                atiradores: atiradoresForDay
            };

            if (faltas[date]) {
                axios.put(`http://localhost:5000/faltas/${dateISO}`, dataToSend)
                    .then(() => {
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
                    .then(() => {
                        console.log(`Faltas para ${date} criadas com sucesso`);
                    })
                    .catch((error) => {
                        console.error(`Erro ao criar faltas para ${date}:`, error.response ? error.response.data : error.message);
                    });
            }
        });
    };


    const handleRemoveAtirador = (atiradorId: string) => {
        const updatedSelected = { ...selectedAtiradores };

        weekDays.forEach((weekDay) => {
            const date = weekDay.date;
            const dateISO = formatDateToISO(formatDateForDisplay(date));

            if (updatedSelected[date]?.has(atiradorId)) {
                updatedSelected[date].delete(atiradorId);
                const updatedList = Array.from(updatedSelected[date]);

                const dataToSend = {
                    id: dateISO,
                    data: dateISO,
                    atiradores: updatedList
                };


                axios.put(`http://localhost:5000/faltas/${dateISO}`, dataToSend)
                    .then(() => {
                        console.log(`Atirador ${atiradorId} removido da data ${date}`);
                        setSelectedAtiradores({ ...updatedSelected });

                        setFaltas((prevFaltas) => ({
                            ...prevFaltas,
                            [date]: updatedList
                        }));
                    })
                    .catch((error) => {
                        console.error(`Erro ao remover atirador da data ${date}:`, error.response ? error.response.data : error.message);
                    });
            }
        });
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

                <div className="flex flex-1 flex-col w-full mt-2 overflow-x-hidden overflow-y-scroll items-center">
                    {atiradores
                        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                        .map((atirador) => (
                            <div key={atirador.id} className="flex flex-1 gap-4 bg-white rounded-lg p-4 m-2 w-[99%] items-center">
                                <div className="flex flex-1 gap-4">
                                    <div className="flex justify-between items-center w-40">
                                        <h2 className="text-sm uppercase font-bold">{atirador.numero}</h2>
                                        <h2 className="text-sm uppercase font-bold">{atirador.nomeguerra}</h2>
                                    </div>
                                    <div className="grid grid-cols-6 bg-zinc-100 rounded-lg p-4 w-full justify-between items-center">
                                        {weekDays.map((weekDay, index) => (
                                            <div key={index} className="flex flex-col items-center">
                                                <span className="text-[10px]">{weekDay.day}</span>
                                                <span className="text-[15px] font-semibold">
                                                    {formatDateForDisplay(weekDay.date)}
                                                </span>
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
                                <button
                                    className="flex size-10 bg-red-500 items-center justify-center rounded-lg cursor-pointer"
                                    onClick={() => handleRemoveAtirador(atirador.id)}
                                >
                                    <Eraser className="text-white" />
                                </button>
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