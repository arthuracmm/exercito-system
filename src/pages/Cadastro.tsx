import { useState } from "react";
import { SidebarLeft } from "../components/SidebarLeft";
import Select from "react-select";
import axios from "axios";

export function Cadastro() {
    const [numero, setNumero] = useState(0);
    const [nomeatr, SetNomeAtr] = useState("");
    const [nomeguerra, SetNomeGuerra] = useState("");
    const [datanasc, SetDataNasc] = useState("");


    const options = Array.from({ length: 101 }, (_, i) => ({
        value: i.toString().padStart(3, '0'),
        label: i.toString().padStart(3, '0'),
    }));

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
        axios.post('http://localhost:5000/atiradores', {
            numero: numero.toString().padStart(3, '0'),
            nomeatr,
            nomeguerra,
            datanasc
        });
        window.alert('Usuario Criado com Sucesso')
    };


    return (
        <div className="flex flex-1 h-screen w-full font-josefin">
            <SidebarLeft />
            <div className="flex flex-col flex-1 ml-50 bg-zinc-200 overflow-hidden py-6 px-8 gap-1">
                <h1 className="font-bold text-2xl">Cadastro</h1>
                <div className="w-[10%] h-0.5 rounded-lg bg-green-500" />
                <div className="flex flex-col gap-2 flex-1 items-center justify-center">
                    <form onSubmit={HandleSubmit} className="flex gap-2">
                        <Select
                            id="select"
                            options={options}
                            className="w-50 text-sm"
                            placeholder="Selecione um número"
                            styles={customStyles}
                            onChange={(selectedOption) => setNumero(parseInt(selectedOption?.value || "0", 10))}
                        />
                        <input
                            type="text"
                            placeholder="Nome do Atirador"
                            className="w-50 text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none"
                            onChange={(e) => SetNomeAtr(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Nome de Guerra"
                            className="w-50 text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none"
                            onChange={(e) => SetNomeGuerra(e.target.value)}
                        />
                        <input
                            type="date"
                            className="w-50 text-sm bg-white p-2 rounded-sm border-1 border-zinc-300 outline-none"
                            onChange={(e) => SetDataNasc(e.target.value)}
                        />

                    </form>
                    <button className="w-50 text-sm bg-green-500 hover:bg-green-400 cursor-pointer p-2 rounded-sm outline-none text-white transition-all" onClick={HandleSubmit}>Criar Atirador</button>
                </div>
            </div>
        </div>
    );
}