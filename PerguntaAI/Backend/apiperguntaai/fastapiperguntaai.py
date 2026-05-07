from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# LIBERA ACESSO DO NEXT.JS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
TIMEOUT = 300.0  # 5 minutos

@app.post("/ia/perguntar")
async def perguntar_ia(request: Request):
    try:
        body = await request.json()

        if not body:
            raise HTTPException(status_code=400, detail="Body JSON inválido")

        prompt = body.get("pergunta")

        if not prompt or not prompt.strip():
            raise HTTPException(
                status_code=400,
                detail='Campo "pergunta" não informado'
            )

        payload = {
            # Modelo utilizado gemma4:31b-cloud
            "model": "gemma4:31b-cloud",
            "prompt": prompt,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.post(OLLAMA_URL, json=payload)
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ollama não respondeu: {str(e)}"
                )

        # DEBUG
        print("Status Ollama:", response.status_code)
        print("Resposta bruta:", response.text)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Erro no Ollama: {response.text}"
            )

        try:
            json_resp = response.json()
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Erro ao interpretar JSON da IA"
            )

        resposta_ia = json_resp.get("response")

        if not resposta_ia:
            raise HTTPException(
                status_code=500,
                detail="Campo 'response' não encontrado"
            )

        return {
            "resposta": resposta_ia.strip()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )