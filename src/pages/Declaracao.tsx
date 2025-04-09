import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";

export function Declaracao() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [selectedAtiradores, setSelectedAtiradores] = useState<string[]>([]);
    const [faltas, setFaltas] = useState<any[]>([]);
    const [semanaSelecionada, setSemanaSelecionada] = useState<string>('current');
    const [diasDaSemana, setDiasDaSemana] = useState<any[]>([]);

    // Carregar a lib html2pdf dinamicamente
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const obterDiasDaSemana = (data: Date) => {
        const dias = [];
        const diaDaSemana = data.getDay();
        const primeiraSegunda = new Date(data);
        primeiraSegunda.setDate(data.getDate() - diaDaSemana + 1);

        for (let i = 0; i < 6; i++) {
            const dia = new Date(primeiraSegunda);
            dia.setDate(primeiraSegunda.getDate() + i);
            dias.push({
                data: dia.toISOString().split('T')[0],
                nome: dia.toLocaleDateString('pt-BR', { weekday: 'long' }),
                dataFormatada: `${dia.getDate().toString().padStart(2, '0')}/${(dia.getMonth() + 1).toString().padStart(2, '0')}`
            });
        }
        return dias;
    };

    const ajustarParaSemanaPassada = (data: Date) => {
        const semanaPassada = new Date(data);
        semanaPassada.setDate(data.getDate() - 7);
        return obterDiasDaSemana(semanaPassada);
    };

    useEffect(() => {
        axios.get('http://localhost:5000/atiradores').then((res) => setAtiradores(res.data));
        axios.get('http://localhost:5000/faltas').then((res) => setFaltas(res.data));
    }, []);

    useEffect(() => {
        const hoje = new Date();
        const dias = semanaSelecionada === 'current'
            ? obterDiasDaSemana(hoje)
            : ajustarParaSemanaPassada(hoje);
        setDiasDaSemana(dias);
    }, [semanaSelecionada]);

    const handleCheckboxChange = (id: string) => {
        setSelectedAtiradores(prev => prev.includes(id)
            ? prev.filter((i) => i !== id)
            : [...prev, id]);
    };

    const gerarTextoPresencas = (id: string) => {
        const presencas = diasDaSemana.filter(dia => {
            const faltou = faltas.some(f =>
                f.atiradores.includes(id) &&
                f.data === dia.data
            );
            return !faltou;
        }).map(dia => dia.dataFormatada);

        return presencas.join(", ");
    };

    const gerarPDF = () => {
        const elemento = document.getElementById("pdf-content");
        if (!elemento) return;

        elemento.style.display = "block"; // Mostra antes de gerar

        const options = {
            margin: 0,
            filename: 'declaracao.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // @ts-ignore
        html2pdf().set(options).from(elemento).outputPdf('bloburl').then((pdfUrl: string) => {
            window.open(pdfUrl, '_blank');
            elemento.style.display = "none"; // Esconde de novo
        });
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

                <div className="flex flex-col gap-2 h-[70%] overflow-y-scroll mt-4">
                    {atiradores
                        .sort((a, b) => a.numero - b.numero)
                        .map((atirador) => (
                            <div key={atirador.id} className="flex gap-4 bg-white rounded-lg p-4 justify-between items-center">
                                <label className="flex gap-4">
                                    <input
                                        type="checkbox"
                                        onChange={() => handleCheckboxChange(atirador.id)}
                                    />
                                    {atirador.numero} - {atirador.nomeatr}
                                </label>
                            </div>
                        ))}
                </div>

                <button
                    onClick={gerarPDF}
                    className="mt-4 bg-blue-500 text-white p-2 rounded w-full"
                >
                    Gerar PDFs
                </button>

                {/* PDF invisível para renderização */}
                <div id="pdf-content" style={{ display: "none", padding: "40px", fontFamily: "serif" }}>
                    {selectedAtiradores.map((id) => {
                        const atirador = atiradores.find(a => a.id === id);
                        const texto = gerarTextoPresencas(id);
                        return (
                            <div key={id} style={{ pageBreakAfter: 'always', marginBottom: '60px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <img src="public/images/tg-icon.png" alt="icone tg" width={60} />
                                    <div style={{ textAlign: 'center', fontSize: '12px' }}>
                                        <p><strong style={{ margin: '2px 0' }}>MINISTÉRIO DA DEFESA</strong></p>
                                        <p><strong style={{ margin: '2px 0' }}>EXÉRCITO BRASILEIRO</strong></p>
                                        <p><strong style={{ margin: '2px 0' }}>COMANDO MILITAR DO SUDESTE</strong></p>
                                        <p><strong style={{ margin: '2px 0' }}>COMANDO MILITAR DA 2ª REGIÃO MILITAR</strong></p>
                                        <p style={{ margin: '2px 0' }}>(Cmdo das Armas Prov PR/1890)</p>
                                        <p><strong style={{ margin: '2px 0' }}>"REGIÃO DAS BANDEIRAS"</strong></p>
                                        <p><strong style={{ margin: '2px 0' }}>TIRO DE GUERRA 02-013 (FRANCA-SP)</strong></p>
                                        <p><strong style={{ margin: '2px 0' }}>Aislan Alves Moreira</strong></p>
                                    </div>
                                    <img src="public/images/tg-icon.png" alt="icone tg" width={60} />
                                </div>

                                <h1 style={{ fontSize: '40px', marginTop: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                                    DECLARAÇÃO
                                </h1>

                                <p style={{ fontSize: '12px', marginTop: '80px', lineHeight: '1.6', textAlign: 'justify', textIndent: '30px' }}>
                                    Declaramos para os devidos fins que o(a) atirador(a) <strong>{atirador?.nomeatr.toUpperCase()}</strong> esteve em cumprimento de missões militares (INSTRUÇÃO SEMANAL) no TIRO DE GUERRA 02-013 (FRANCA-SP), sito à Av. Distrito Federal, 1010 - Vila Aparecida - CEP: 14.401-342, nesta cidade de Franca-SP, <strong>{texto}</strong>, conforme amparo na Constituição da República Federativa do Brasil de 1988 e Lei N° 4.375, de 17 AGO 64 (Lei do Serviço Militar).
                                </p>

                                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '40px', lineHeight: '1.5', textAlign: 'justify', textIndent: '30px' }}>
                                    Esta declaração só terá validade sendo ORIGINAL com MARCA D'ÁGUA e assinada apenas pelo <strong>Subtenente AISLAN ALVES MOREIRA</strong>. As declarações diferentes deste modelo não terão validade, incluindo a reprodução de CÓPIAS.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '80px' }}>
                                    <p style={{ fontSize: '12px', marginTop: '4px' }}> <strong>AISLAN ALVES MOREIRA - Subtenente </strong></p>
                                    <p style={{ fontSize: '12px' }}>Chefe de Instrução Tiro de Guerra 02-013</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
