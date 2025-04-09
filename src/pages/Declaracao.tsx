import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";
import { jsPDF } from "jspdf";

export function Declaracao() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [selectedAtiradores, setSelectedAtiradores] = useState<string[]>([]);
    const [faltas, setFaltas] = useState<any[]>([]);
    const [semanaSelecionada, setSemanaSelecionada] = useState<string>('current'); // "current" ou "previous"
    const [diasDaSemana, setDiasDaSemana] = useState<any[]>([]);
    const [hourDates, setHourDates] = useState<any>({}); // Armazenar as horas para cada dia

    // Função para gerar as datas de segunda a sábado
    const obterDiasDaSemana = (data: Date) => {
        const dias = [];
        const diaDaSemana = data.getDay();
        const primeiraSegunda = new Date(data);
        primeiraSegunda.setDate(data.getDate() - diaDaSemana + 1); // Ajusta para a segunda-feira da semana

        // Preencher os dias da semana (segunda a sábado, excluindo domingo)
        for (let i = 0; i < 6; i++) {  // Apenas de segunda a sábado (6 dias)
            const dia = new Date(primeiraSegunda);
            dia.setDate(primeiraSegunda.getDate() + i);
            dias.push({
                data: dia.toISOString().split('T')[0], // Formato "YYYY-MM-DD"
                nome: dia.toLocaleDateString('pt-BR', { weekday: 'long' }), // Nome do dia da semana
                dataFormatada: `${dia.getDate().toString().padStart(2, '0')}/${(dia.getMonth() + 1).toString().padStart(2, '0')}` // Exibe apenas "DD/MM"
            });
        }

        return dias;
    };

    // Função para ajustar a data para a semana passada
    const ajustarParaSemanaPassada = (data: Date) => {
        const semanaPassada = new Date(data);
        semanaPassada.setDate(data.getDate() - 7); // Ajusta para o mesmo dia da semana passada
        return obterDiasDaSemana(semanaPassada);
    };

    useEffect(() => {
        // Carregar os dados dos atiradores
        axios.get('http://localhost:5000/atiradores')
            .then((response) => {
                setAtiradores(response.data);
            })
            .catch((error) => {
                console.error('Erro ao carregar atiradores:', error);
            });

        // Carregar as faltas para a semana
        axios.get('http://localhost:5000/faltas')
            .then((response) => {
                setFaltas(response.data);
            })
            .catch((error) => {
                console.error('Erro ao carregar faltas:', error);
            });

        // Carregar as horas (isso pode variar dependendo de como você tem a estrutura de dados)
        axios.get('http://localhost:5000/hours')
            .then((response) => {
                setHourDates(response.data); // Aqui você pode ter um objeto com as horas
            })
            .catch((error) => {
                console.error('Erro ao carregar horas:', error);
            });
    }, []);

    useEffect(() => {
        // Gerar os dias da semana com base na data atual ou semana passada
        const hoje = new Date();
        const dias = semanaSelecionada === 'current'
            ? obterDiasDaSemana(hoje)
            : ajustarParaSemanaPassada(hoje);
        setDiasDaSemana(dias);
    }, [semanaSelecionada]);

    const handleCheckboxChange = (id: string) => {
        setSelectedAtiradores((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((name) => name !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    const gerarPDFs = () => {
        const doc = new jsPDF();
      
        // Verificar se algum atirador foi selecionado
        if (selectedAtiradores.length === 0) {
            alert("Nenhum atirador selecionado!");
            return;
        }
      
        // Iterar sobre os atiradores selecionados
        selectedAtiradores.forEach((id, index) => {
            const atirador = atiradores.find(a => a.id === id); // Comparar pelo id
            if (atirador) {
                let yPosition = 30;
                let textoFaltas = ""; // String para acumular as faltas (data + hora)
        
                // Adicionar o nome do atirador
                if (index > 0) doc.addPage(); // Nova página após a primeira
                doc.text(`Atirador: ${atirador.nomeatr}`, 20, yPosition);
                yPosition += 10; // Ajustar a posição
        
                // Iterar sobre os dias da semana (segunda a sábado)
                diasDaSemana.forEach((dia) => {
                    // Verificar se o atirador faltou nesse dia específico
                    const faltaNoDia = faltas.find(falta => 
                        falta.atiradores.includes(atirador.id) && falta.data === dia.data);
            
                    // Se o atirador faltar, mostrar a data e a hora
                    if (faltaNoDia) {
                        const hora = faltaNoDia.hora || ""; // Pega o horário ou deixa vazio
                        if (hora) {
                            textoFaltas += `${dia.dataFormatada} ${hora}, `; // Concatenar a data e hora com vírgula
                        } else {
                            textoFaltas += `${dia.dataFormatada}, `; // Apenas a data, sem a hora
                        }
                    } else {
                        // Se o atirador NÃO faltou, adicionar a data sem hora
                        textoFaltas += `${dia.dataFormatada}, `;
                    }
                });
        
                // Remover a última vírgula e espaço extras (se houver)
                if (textoFaltas.endsWith(", ")) {
                    textoFaltas = textoFaltas.slice(0, -2);
                }
        
                // Exibir o texto das faltas acumuladas
                doc.text(textoFaltas, 20, yPosition);
                yPosition += 10; // Ajustar a posição vertical
            }
        });
      
        // Exibir o PDF gerado
        doc.output('dataurlnewwindow');
    };
    
    
    
    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1 relative">
                <h1 className="font-bold text-2xl">Gerar Declaração</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setSemanaSelecionada('current')}
                        className={`px-4 py-2 ${semanaSelecionada === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        Semana Atual
                    </button>
                    <button
                        onClick={() => setSemanaSelecionada('previous')}
                        className={`px-4 py-2 ${semanaSelecionada === 'previous' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        Semana Passada
                    </button>
                </div>

                <div className="flex flex-col gap-2 h-[84%] overflow-y-scroll mt-4">
                    {atiradores
                        .sort((a, b) => a.numero - b.numero)
                        .map((atirador) => (
                            <div key={atirador.id} className="flex gap-4 bg-white rounded-lg p-4 w-[99.5%] justify-between items-center">
                                <label className="flex gap-4">
                                    <input
                                        type="checkbox"
                                        value={atirador.id}
                                        onChange={() => handleCheckboxChange(atirador.id)}
                                    />
                                    {atirador.numero} - {atirador.nomeatr}
                                </label>
                            </div>
                        ))}
                </div>
                <button
                    onClick={gerarPDFs}
                    className="mt-4 bg-blue-500 text-white p-2 rounded bottom-4 left-4 w-full"
                >
                    Gerar PDFs
                </button>
            </div>
        </div>
    );
}
