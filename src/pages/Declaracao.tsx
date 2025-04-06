import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";
import { jsPDF } from "jspdf";

export function Declaracao() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [selectedAtiradores, setSelectedAtiradores] = useState<string[]>([]);
    const [dataHora, setDataHora] = useState<string>('');

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

    const handleCheckboxChange = (nomeatr: string) => {
        setSelectedAtiradores(prevState =>
            prevState.includes(nomeatr)
                ? prevState.filter(nome => nome !== nomeatr)
                : [...prevState, nomeatr]
        );
    };

    const handleDataHoraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataHora(e.target.value);
    };

    const gerarPDFs = () => {
        // Criar uma nova instância do jsPDF
        const doc = new jsPDF();

        // Adicionar conteúdo para cada atirador selecionado
        selectedAtiradores.forEach((nomeatr, index) => {
            const atirador = atiradores.find(a => a.nomeatr === nomeatr);
            if (atirador) {
                // Adicionar o nome do atirador e a data na página
                if (index > 0) doc.addPage(); // Adicionar uma nova página após a primeira

                doc.text(`Atirador: ${atirador.nomeatr}`, 20, 20);
                doc.text(`Data e Hora: ${dataHora}`, 20, 30);
            }
        });

        doc.output('dataurlnewwindow');
    };

    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1 relative">
                <h1 className="font-bold text-2xl">Gerar Declaração</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                <div className="flex flex-col gap-2 h-[84%] overflow-y-scroll mt-4">
                    {atiradores
                        .sort((a, b) => a.numero - b.numero)
                        .map((atirador) => (
                            <div key={atirador.nomeatr} className="flex gap-4 bg-white rounded-lg p-4 w-[99.5%] justify-between items-center">
                                <label className="flex gap-4">
                                    <input
                                        type="checkbox"
                                        value={atirador.nomeatr}
                                        onChange={() => handleCheckboxChange(atirador.nomeatr)}
                                    />
                                    {atirador.numero} - {atirador.nomeatr}
                                </label>
                            </div>
                        ))}
                </div>

                <input
                    type="text"
                    placeholder="Digite a data e hora"
                    value={dataHora}
                    onChange={handleDataHoraChange}
                    className="bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none w-full"
                />
                <button
                    onClick={gerarPDFs}
                    className="mt-4 bg-blue-500 text-white p-2 rounded
                        bottom-4 left-4 w-full"
                >
                    Gerar PDFs
                </button>
            </div>

        </div>
    );
}
