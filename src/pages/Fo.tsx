import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import Select from "react-select";
import axios from "axios";

export function Fo() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [numero, setNumero] = useState<number>(0);
    const [tipofo, SetTipoFo] = useState<string>('');
    const [datafo, SetDataFO] = useState<string>('');
    const [atiradorSelecionado, setAtiradorSelecionado] = useState<any | null>(null);

    const numberOptions = Array.from({ length: 101 }, (_, i) => ({
        value: i.toString().padStart(3, '0'),
        label: i.toString().padStart(3, '0'),
    }));

    // Carregar todos os atiradores apenas uma vez
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

    // Buscar o atirador pelo número quando o número for alterado
    useEffect(() => {
        const atirador = atiradores.find((atirador) => atirador.numero === numero.toString().padStart(3, '0'));
        setAtiradorSelecionado(atirador || null);
    }, [numero, atiradores]);

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            boxShadow: "none",
            borderColor: "#d1d5db",
            "&:hover": {
                borderColor: "#9ca3af",
            },
        }),
    };

    const HandleSubmit = (e: any) => {
        e.preventDefault();
        axios.post('http://localhost:5000/fo', {
            numero: numero.toString().padStart(3, '0'),
            tipofo,
            nomeguerra: atiradorSelecionado?.nomeguerra,
            datafo
        });
        window.alert('Usuario Criado com Sucesso');
    };

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <h1 className="font-bold text-2xl">Fato Observado</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                <div className="flex flex-col gap-2 flex-1 items-center justify-center">
                    <form onSubmit={HandleSubmit} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Select
                                id="select"
                                options={numberOptions}
                                className="w-50 text-sm"
                                placeholder="Selecione um número"
                                styles={customStyles}
                                onChange={(selectedOption) => setNumero(parseInt(selectedOption?.value || '0', 10))}
                            />
                            {atiradorSelecionado && (
                                <p className="w-50 text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none text-center">{atiradorSelecionado.nomeguerra}</p>
                            )}
                            <Select
                                id="select"
                                options={[
                                    { value: 'FO Positivo', label: 'FO Positivo' },
                                    { value: 'FO Negativo', label: 'FO Negativo' }
                                ]}
                                className="w-55 text-sm"
                                placeholder="Selecione o tipo de FO"
                                styles={customStyles}
                                onChange={(selectedOption) => SetTipoFo(selectedOption?.value || '')}
                            />
                            <input
                                type="date"
                                className="w-50 text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none"
                                onChange={(e) => SetDataFO(e.target.value)}
                                value={new Date().toISOString().split('T')[0]} 
                            />
                        </div>
                        <input
                            type="text"
                            className="w-full text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none"
                            onChange={(e) => SetDataFO(e.target.value)}
                        />
                    </form>
                    <button
                        className="w-50 text-sm bg-green-500 hover:bg-green-400 cursor-pointer p-2 rounded-sm outline-none text-white transition-all"
                        onClick={HandleSubmit}
                    >
                        Criar FO
                    </button>
                </div>
            </div>
        </div>
    );
}
