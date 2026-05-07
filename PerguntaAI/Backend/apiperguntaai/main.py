import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "fastapiperguntaai:app",
        host="127.0.0.1",
        port=9000,
        log_level="info",
        reload=True
    )
