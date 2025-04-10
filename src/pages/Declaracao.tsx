import { useEffect, useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import axios from "axios";

export function Declaracao() {
    const [atiradores, setAtiradores] = useState<any[]>([]);
    const [selectedAtiradores, setSelectedAtiradores] = useState<string[]>([]);
    const [faltas, setFaltas] = useState<any[]>([]);
    const [semanaSelecionada, setSemanaSelecionada] = useState<string>('current');
    const [diasDaSemana, setDiasDaSemana] = useState<any[]>([]);
    const [tipoDeclaracao, setTipoDeclaracao] = useState<string>('declaracaoSemanalAtirador');
    const [dataPersonalizada, setDataPersonalizada] = useState<string>('');

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

        elemento.style.display = "block";

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
            elemento.style.display = "none";
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

                <div className="flex gap-4">
                    <label className="flex flex-col w-full">
                        Selecione o tipo de declaração:
                        <select
                            className="w-full p-2 rounded-lg bg-white px-4 h-10"
                            defaultValue="declaracaoSemanalAtirador"
                            onChange={(e) => setTipoDeclaracao(e.target.value)}
                        >
                            <option value="declaracaoSemanalAtirador">Semanal Atirador</option>
                            <option value="declaracaoSemanalMonitor">Semanal Monitor</option>
                            <option value="declaracaoFaculdadeEmpresa">Faculdade/Empresa</option>
                            <option value="declaracaoMissaoEscala">Missão Escala</option>
                            <option value="declaracaoMissaoExternaEscala">Missão Externa Escala</option>
                            <option value="declaracaoMissaoExternaVoluntario">Missão E. E. Voluntario</option>
                            <option value="declaracaoMissaoVoluntaria">Missão Voluntária</option>
                            <option value="declaracaoServico">Serviço</option>
                        </select>
                    </label>
                    <label className="flex flex-col w-full">
                        Digite a data personalizada:
                    <input type="text"
                    className="w-full p-2 rounded-lg bg-white px-4 h-10 outline-none"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataPersonalizada(e.target.value)}
                    placeholder="Digite a Data Personalizada"
                    value={dataPersonalizada}
                    />
                    </label>
                </div>

                <div className="flex flex-col gap-2 h-full overflow-y-scroll mt-4">
                    {atiradores
                        .sort((a, b) => a.numero - b.numero)
                        .map((atirador) => (
                            <div key={atirador.id} className="flex gap-4 bg-white rounded-lg p-4 justify-between items-center w-[99.5%]">
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

                {/* PDF invisível */}
                <div id="pdf-content" style={{ display: "none", fontFamily: "serif" }}>
                    {selectedAtiradores.map((id) => {
                        const atirador = atiradores.find((a) => a.id === id);
                        const texto = gerarTextoPresencas(id);

                        let textoDeclaracao = '';

                        switch (tipoDeclaracao) {
                            case 'declaracaoSemanalAtirador':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong>Atirador ${atirador?.nomeatr.toUpperCase()}</strong> 02-013 (FRANCA-SP), sito à Av. Distrito Federal, 1010 - Vila Aparecida - CEP: 14.401-342, nesta cidade de Franca-SP, <strong>${texto}</strong>, conforme amparo na Constituição da República Federativa do Brasil de 1988 e Lei nº 4.375, de 17 AGO 64 (Lei do Serviço Militar).`;
                                break;
                            case 'declaracaoSemanalMonitor':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong>Monitor ${atirador?.nomeatr.toUpperCase()}</strong> esteve em cumprimento de missões militares... <strong>${texto}</strong>,conforme amparo na Constituição da República Federativa do Brasil de 1988 e Lei nº 4.375, de 17 AGO 64 (Lei do Serviço Militar).`;
                                break;
                            case 'declaracaoFaculdadeEmpresa':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong> Atirador ${atirador?.nomeatr.toUpperCase()}</strong> , está matriculado no TIRO DE GUERRA 02-013 (FRANCA), e prestará o Serviço Militar Inicial Obrigatório, no período ${dataPersonalizada}.`;
                                break;
                            case 'declaracaoMissaoEscala':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong>Atirador ${atirador?.nomeatr.toUpperCase()}</strong> esteve em cumprimento de missões militares <strong>${dataPersonalizada}</strong>.`;
                                break;
                            case 'declaracaoMissaoExternaEscala':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong> Atirador ${atirador?.nomeatr.toUpperCase()}</strong> , esteve em cumprimento de missões militares no TIRO DE GUERRA 02-013 (FRANCA-SP), sito à Av. Distrito Federal, 1010 - Vila Aparecida - CEP: 14.401-342, nesta cidade de Franca-SP, <strong>${dataPersonalizada}</strong>, conforme amparo na Constituição da República Federativa do Brasil de 1988 e Lei nº 4.375, de 17 AGO 64 (Lei do Serviço Militar).`;
                                break;
                            case 'declaracaoMissaoExternaVoluntario':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong>Atirador ${atirador?.nomeatr.toUpperCase()}</strong> esteve <strong>voluntariamente</strong> em cumprimento de missões militares no(a) <strong>${dataPersonalizada}</strong>, conforme amparo na Constituição da República Federativa do Brasil de 1988 e Lei nº 4.375, de 17 AGO 64 (Lei do Serviço Militar).`;
                                break;
                            case 'declaracaoMissaoVoluntaria':
                                textoDeclaracao = `Declaro para os devidos fins, que o <strong>Atirador ${atirador?.nomeatr.toUpperCase()}</strong> esteve <strong>voluntariamente</strong> em cumprimento de missões neste TIRO DE GUERRA 02-013 (FRANCA-SP), sito à Av. Distrito Federal, 1010 - Vila Aparecida - CEP: 14.401-342, nesta cidade de Franca-SP <strong>${dataPersonalizada}</strong>.`;
                                break;
                            default:
                                textoDeclaracao = `Declaro que o Atirador <strong>${atirador?.nomeatr.toUpperCase()}</strong> esteve em missão de guarda no TG 02-013 <strong>${dataPersonalizada}</strong>.`;
                        }

                        return (
                            <div
                                key={id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    height: '1120px',
                                    width: '100%',
                                    padding: '40px',
                                    boxSizing: 'border-box',
                                    pageBreakAfter: 'always',
                                    position: 'relative',
                                    zIndex: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Imagem de fundo (marca d'água) */}
                                <img
                                    src="public/images/tg-icon.png"
                                    alt="marca d'água"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '80%',
                                        height: 'auto',
                                        opacity: 0.1,
                                        zIndex: 0,
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Cabeçalho */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '80%', zIndex: 1 }}>
                                    <img src="public/images/exercito-icon.png" alt="icone exercito" width={70} />
                                    <div style={{ textAlign: 'center', fontSize: '15px' }}>
                                        <p><strong>MINISTÉRIO DA DEFESA</strong></p>
                                        <p><strong>EXÉRCITO BRASILEIRO</strong></p>
                                        <p><strong>COMANDO MILITAR DO SUDESTE</strong></p>
                                        <p><strong>COMANDO MILITAR DA 2ª REGIÃO MILITAR</strong></p>
                                        <p>(Cmdo das Armas Prov PR/1890)</p>
                                        <p><strong>"REGIÃO DAS BANDEIRAS"</strong></p>
                                        <p><strong>TIRO DE GUERRA 02-013 (FRANCA-SP)</strong></p>
                                    </div>
                                    <img src="public/images/tg-icon.png" alt="icone tg" width={100} />
                                </div>

                                {/* Corpo da declaração */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <h1 style={{ fontSize: '40px', marginTop: '40px', textAlign: 'center', fontWeight: 'bold' }}>DECLARAÇÃO</h1>

                                    <p style={{ marginTop: 40, fontSize: 16, textAlign: 'justify', textIndent: 30 }} dangerouslySetInnerHTML={{ __html: textoDeclaracao }} />

                                    <p style={{
                                        fontSize: '15px',
                                        fontStyle: 'italic',
                                        marginTop: '40px',
                                        lineHeight: '1.5',
                                        textAlign: 'justify',
                                        textIndent: '30px',
                                        zIndex: 1
                                    }}>
                                        Esta declaração só terá validade sendo ORIGINAL com MARCA D'ÁGUA e assinada apenas pelo <strong>Subtenente AISLAN ALVES MOREIRA</strong>. As declarações diferentes deste modelo não terão validade, incluindo a reprodução de CÓPIAS.
                                    </p>

                                    <p style={{
                                        fontSize: '15px',
                                        marginTop: '40px',
                                        fontWeight: 'bold',
                                        lineHeight: '1.5',
                                        textAlign: 'justify',
                                        textIndent: '30px',
                                        zIndex: 1
                                    }}>
                                        Franca-SP, {new Date().toLocaleDateString('pt-BR', { month: 'long', day: '2-digit',year: 'numeric'})}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '100%',
                                        marginTop: '80px',
                                        zIndex: 1
                                    }}>
                                        <p style={{ fontSize: '15px', marginTop: '4px' }}><strong>AISLAN ALVES MOREIRA - Subtenente</strong></p>
                                        <p style={{ fontSize: '15px' }}>Chefe de Instrução Tiro de Guerra 02-013</p>
                                    </div>
                                </div>

                                {/* Rodapé */}
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '80px', zIndex: 1 }}>
                                    <div style={{ width: '100%', height: '1px', backgroundColor: 'black' }} />
                                    <p style={{ fontSize: '12px' }}><strong>Tiro de Guerra 02-013 (Franca-SP)</strong></p>
                                    <p style={{ fontSize: '12px' }}>Av. Distrito Federal, 1010 - Vila Aparecida - CEP: 14.401-342 - Franca-SP</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <img src="public/images/whatsapp-icon.png" alt="whatsapp" style={{ width: 15, height: 'auto' }} />
                                            <p style={{ fontSize: '12px' }}>(16) 3723-9321</p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <img src="public/images/at-icon.png" alt="email" style={{ width: 15, height: 'auto' }} />
                                            <p style={{ color: 'blue', textDecoration: 'underline', fontSize: '12px' }}>franca.tg02013@gmail.com</p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <img src="public/images/instagram-icon.png" alt="instagram" style={{ width: 15, height: 'auto' }} />
                                            <p style={{ color: 'blue', textDecoration: 'underline', fontSize: '12px' }}>
                                                https://www.instagram.com/tirodeguerra_02013/
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
