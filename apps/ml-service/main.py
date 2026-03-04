import os
from fastapi import FastAPI, HTTPException, Header
from dotenv import load_dotenv
from predict import predict_idea, predict_quality
from train import run_training, get_training_status

load_dotenv()

app = FastAPI(title="Prompt Forge ML Service", version="1.0.0")

ADMIN_KEY = os.getenv("ADMIN_KEY", "")


def check_admin(authorization: str = Header(None)):
    if not ADMIN_KEY:
        return
    if authorization != f"Bearer {ADMIN_KEY}":
        raise HTTPException(status_code=403, detail="forbidden")


@app.get("/health")
async def health():
    return {"ok": True, "service": "ml-service", "version": "1.0.0"}


@app.post("/predict/idea")
async def api_predict_idea(body: dict):
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    result = predict_idea(text)
    return result


@app.post("/predict/quality")
async def api_predict_quality(body: dict):
    prompt = body.get("prompt", "")
    if not prompt:
        raise HTTPException(status_code=400, detail="prompt required")
    result = predict_quality(prompt)
    return result


@app.post("/train/run")
async def api_train_run(authorization: str = Header(None)):
    check_admin(authorization)
    result = run_training()
    return result


@app.get("/train/status")
async def api_train_status():
    return get_training_status()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
