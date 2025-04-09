import { useEffect, useState } from "react";
import axios from "axios";
import { SidebarLeft } from "../components/SidebarLeft";
import { Link } from "react-router-dom";
import { Eraser } from "lucide-react";

export function Faltas() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [_, setFaltas] = useState<{ [key: string]: any }>({});
    const [selectedAtiradores, setSelectedAtiradores] = useState<{ [key: string]: Set<string> }>({});
    const [activeDates, setActiveDates] = useState<{ [key: string]: boolean }>({});
    const [weekDays, setWeekDays] = useState<any[]>([]);

    // Função para obter os dias da semana atual
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

        setWeekDays(weekDates);
    };

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
                const faltasData: { [key: string]: any } = {};
                const selectedAtiradoresData: { [key: string]: Set<string> } = {};
                const activeDatesData: { [key: string]: boolean } = {};

                response.data.forEach((falta: any) => {
                    const data = falta.data;
                    const atiradores = falta.atiradores;

                    faltasData[data] = falta;
                    selectedAtiradoresData[data] = new Set(atiradores);
                    activeDatesData[data] = falta.ativo !== undefined ? falta.ativo : true; // Default ativo
                });

                setFaltas(faltasData);
                setSelectedAtiradores(selectedAtiradoresData);
                setActiveDates(activeDatesData);
            })
            .catch((error) => {
                console.error('Erro ao carregar faltas:', error);
            });

        // Chama a função para gerar os dias da semana
        getWeekDays();
    }, []);

    const formatDateForDisplay = (isoDate: string) => {
        const [year, month, day] = isoDate.split("-");
        return `${day}/${month}/${year}`;
    };

    const handleDateStatusChange = (date: string) => {
        setActiveDates((prevState) => {
            const newState = { ...prevState };
            const newStatus = !newState[date]; // Alterna entre ativo e inativo
            newState[date] = newStatus;
            return newState;
        });
    };

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
        // Envia as alterações ao banco de dados apenas quando o botão for clicado
        Object.keys(activeDates).forEach((date) => {
            const atiradoresForDay = Array.from(selectedAtiradores[date] || []);
            const dataToSend = {
                id: date,
                data: date,
                atiradores: atiradoresForDay,
                ativo: activeDates[date], // Mantém o status ativo da data
            };

            // Verifica se a data já existe no banco de dados
            axios.get(`http://localhost:5000/faltas/${date}`)
                .then(() => {
                    // Se a data existir, realiza a atualização com PUT
                    axios.put(`http://localhost:5000/faltas/${date}`, dataToSend)
                        .then(() => {
                            console.log(`Faltas para ${date} atualizadas com sucesso`);
                        })
                        .catch((error) => {
                            console.error(`Erro ao atualizar faltas para ${date}:`, error.response ? error.response.data : error.message);
                        });
                })
                .catch((error) => {
                    if (error.response && error.response.status === 404) {
                        // Se a data não existir, cria uma nova entrada no banco com POST
                        axios.post('http://localhost:5000/faltas', dataToSend)
                            .then(() => {
                                console.log(`Faltas para ${date} criadas com sucesso`);
                            })
                            .catch((createError) => {
                                console.error(`Erro ao criar faltas para ${date}:`, createError.response ? createError.response.data : createError.message);
                            });
                    } else {
                        console.error(`Erro ao verificar a existência da data ${date}:`, error.response ? error.response.data : error.message);
                    }
                });
        });
    };

    const handleRemoveAtirador = (atiradorId: string) => {
        if (window.confirm('Tem certeza que deseja limpar a semana de faltas desse atirador?')) {
            Object.keys(selectedAtiradores).forEach((date) => {
                if (selectedAtiradores[date]?.has(atiradorId)) {
                    setSelectedAtiradores((prevSelected) => {
                        const updatedSelected = { ...prevSelected };
                        updatedSelected[date]?.delete(atiradorId);
                        return updatedSelected;
                    });

                    // Atualiza o banco de dados para remover o atirador da data específica
                    axios.put(`http://localhost:5000/faltas/${date}`, {
                        id: date,
                        data: date,
                        atiradores: Array.from(selectedAtiradores[date] || []).filter((id) => id !== atiradorId),
                        ativo: activeDates[date], // Mantém o status ativo da data
                    })
                        .then(() => {
                            console.log(`Atirador ${atiradorId} removido da data ${date} com sucesso`);
                        })
                        .catch((error) => {
                            console.error(`Erro ao remover atirador ${atiradorId} da data ${date}:`, error.response ? error.response.data : error.message);
                        });
                }
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

                <div className="flex flex-1 flex-col w-full mt-2 overflow-x-hidden overflow-y-scroll items-center pr-2">
                    <div className="flex justify-between w-full">
                        {weekDays.map((weekDay) => (
                            <button
                                key={weekDay.date}
                                className={`px-4 py-2 rounded-lg ${activeDates[weekDay.date] ? 'bg-red-300' : 'bg-green-300'}`}
                                onClick={() => handleDateStatusChange(weekDay.date)}
                            >
                                {activeDates[weekDay.date] ? 'Desativar' : 'Ativar'} {weekDay.day}
                            </button>
                        ))}
                    </div>

                    {atiradores
                        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                        .map((atirador) => (
                            <div key={atirador.id} className="flex flex-1 gap-4 bg-white rounded-lg p-4 m-2 w-full items-center">
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
                                                    disabled={!activeDates[weekDay.date]}
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
                </div>

                <button
                    className="bg-green-500 p-2 text-white rounded-lg hover:bg-green-600 transition-all w-[20%] cursor-pointer"
                    onClick={handleSubmit}
                >
                    Atualizar Faltas
                </button>
            </div>
        </div>
    );
}
