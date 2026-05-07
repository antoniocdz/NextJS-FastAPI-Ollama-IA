"use client";
import { useState } from "react";

export default function Home() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  async function perguntarIA() {
    if (!pergunta.trim()) {
      setResposta("Digite uma pergunta");
      return;
    }

    try {
      setLoading(true);
      setResposta("");

      const res = await fetch("http://localhost:9000/ia/perguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pergunta }),
      });

      const text = await res.text();

      console.log("STATUS:", res.status);
      console.log("RESPOSTA:", text);

      if (!res.ok) {
        throw new Error(text || "Erro na API");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Resposta não é JSON válido");
      }

      setResposta(data?.resposta || "Sem resposta da IA");

    } catch (error: any) {
      console.error("ERRO:", error);

      setResposta(
        error.message?.includes("Failed to fetch")
          ? "Erro de conexão com a API (verifique se o servidor está rodando)"
          : error.message || "Erro ao consultar a API"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Consulta com IA</h1>

      <textarea
        style={{
          width: "100%",
          height: "120px",
          padding: "10px",
          fontSize: "16px",
        }}
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
        placeholder="Digite sua pergunta"
      />

      <br /><br />

      <button
        onClick={perguntarIA}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "gray" : "blue",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Pensando..." : "Perguntar"}
      </button>

      <p><b>Resposta:</b></p>

      <div
        style={{
          background: "#f4f4f4",
          padding: 15,
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          minHeight: 100,
        }}
      >
        {loading ? "Gerando resposta..." : resposta}
      </div>
    </div>
  );
}