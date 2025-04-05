import React, { useEffect, useState } from "react";
import axios from "axios";
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

type Atirador = {
    nome: string;
    id: string; // id agora é string
    numero: string;
    nomeatr: string;
    nomeguerra: string;
    datanasc: string;
};

export const Declaracao: React.FC = () => {
    const [atiradores, setAtiradores] = useState<Atirador[]>([]);
    const [selectedAtiradores, setSelectedAtiradores] = useState<string[]>([]); // id dos atiradores como string
    const [selectedDates, setSelectedDates] = useState<string[]>([]); // Dias selecionados
    const [horariosPorDia, setHorariosPorDia] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        axios
            .get("http://localhost:5000/atiradores")
            .then((response) => {
                if (response.data && response.data.length > 0) {
                    setAtiradores(response.data);
                    setIsLoading(false);
                } else {
                    console.error("Sem dados para exibir.");
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar atiradores:", error);
                setIsLoading(false);
            });
    }, []);

    const handleAtiradorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedAtiradores((prev) =>
            event.target.checked ? [...prev, value] : prev.filter((id) => id !== value)
        );
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        if (date && !selectedDates.includes(date)) {
            setSelectedDates([...selectedDates, date]);
        }
    };

    const handleHorarioChange = (date: string, horario: string) => {
        setHorariosPorDia((prev) => {
            const newHorarios = new Map(prev);
            newHorarios.set(date, horario);
            return newHorarios;
        });
    };

    // Agrupar dias consecutivos com o mesmo horário
    const groupConsecutiveDates = (dates: string[], horarios: Map<string, string>) => {
        const grouped = [];
        let currentGroup: string[] = [];
        let currentHorario: string = "";

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const horario = horarios.get(date) || "";

            if (currentGroup.length === 0) {
                currentGroup.push(date);
                currentHorario = horario;
            } else {
                const prevDate = currentGroup[currentGroup.length - 1];
                const prevDateObj = new Date(prevDate);
                const currentDateObj = new Date(date);
                const isConsecutive = (currentDateObj.getTime() - prevDateObj.getTime()) === 86400000; // 24 horas em milissegundos

                if (isConsecutive && horario === currentHorario) {
                    currentGroup.push(date);
                } else {
                    grouped.push({ dates: currentGroup, horario: currentHorario });
                    currentGroup = [date];
                    currentHorario = horario;
                }
            }
        }

        if (currentGroup.length > 0) {
            grouped.push({ dates: currentGroup, horario: currentHorario });
        }

        return grouped;
    };

    // Componente para gerar o PDF único
    const PDFDocument: React.FC<{ atiradores: Atirador[], selectedDates: string[], horariosPorDia: Map<string, string> }> = ({ atiradores, selectedDates, horariosPorDia }) => {
        const styles = StyleSheet.create({
            page: { padding: 20, fontSize: 12 },
            title: { fontSize: 18, marginBottom: 10 },
            section: { marginBottom: 20 },
        });

        const groupedDates = groupConsecutiveDates(selectedDates, horariosPorDia);

        return (
            <Document>
                {atiradores.map((atirador) => (
                    <Page style={styles.page} key={atirador.id}>
                        <Text style={styles.title}>Atirador: {atirador.nome}</Text>
                        {groupedDates.map((group, index) => (
                            <div key={index} style={styles.section}>
                                <Text>Dias: {group.dates.join(", ")}</Text>
                                <Text>Horário: {group.horario}</Text>
                            </div>
                        ))}
                    </Page>
                ))}
            </Document>
        );
    };

    // Gerar o PDF para todos os atiradores
    const generatePDF = () => (
        <PDFDownloadLink
            document={<PDFDocument atiradores={atiradores.filter((atirador) => selectedAtiradores.includes(atirador.id))} selectedDates={selectedDates} horariosPorDia={horariosPorDia} />}
            fileName="relatorio_atiradores.pdf"
        >
            {({ loading }) => (loading ? "Gerando PDF..." : "Baixar PDF Completo")}
        </PDFDownloadLink>
    );

    return (
        <div>
            <h1>Gerar PDF de Atiradores</h1>
            {isLoading ? <p>Carregando atiradores...</p> : (
                <div>
                    <h3>Selecione os Atiradores</h3>
                    {atiradores.map((atirador) => (
                        <div key={atirador.id}>
                            <input type="checkbox" value={atirador.id} onChange={handleAtiradorChange} />
                            <label>{atirador.nomeguerra}</label>
                        </div>
                    ))}
                    <h3>Selecione os Dias</h3>
                    <input type="date" onChange={handleDateChange} />
                    <h3>Digite os Horários</h3>
                    {selectedDates.map((date) => (
                        <div key={date}>
                            <input type="text" placeholder={`Digite o horário para ${date}`} onChange={(e) => handleHorarioChange(date, e.target.value)} />
                        </div>
                    ))}
                    <div>{generatePDF()}</div>
                </div>
            )}
        </div>
    );
};

export default Declaracao;
