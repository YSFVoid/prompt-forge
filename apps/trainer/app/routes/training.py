"""
Prompt Forge Trainer - API Routes
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import structlog
from ..config import settings
from ..database import get_db
from ..training import train_idea_classifier, train_quality_scorer, build_rag_store

logger = structlog.get_logger()
router = APIRouter()

# Training status tracking
training_status = {
    "idea_classifier": {"status": "idle", "progress": 0, "result": None},
    "quality_scorer": {"status": "idle", "progress": 0, "result": None},
    "rag_store": {"status": "idle", "progress": 0, "result": None}
}


class TrainRequest(BaseModel):
    model: str  # "idea_classifier", "quality_scorer", "rag_store", or "all"
    min_samples: int = 10


@router.get("/status")
async def get_training_status():
    """Get status of all training jobs."""
    return training_status


@router.get("/status/{model}")
async def get_model_status(model: str):
    """Get status of a specific model training."""
    if model not in training_status:
        raise HTTPException(status_code=404, detail=f"Unknown model: {model}")
    return training_status[model]


async def run_idea_classifier_training():
    """Background task for training idea classifier."""
    global training_status
    training_status["idea_classifier"]["status"] = "running"
    training_status["idea_classifier"]["progress"] = 10
    
    try:
        db = get_db()
        if db is None:
            raise Exception("Database not connected")
        
        # Fetch training data from messages
        training_status["idea_classifier"]["progress"] = 30
        
        cursor = db.messages.find({"ideaScore": {"$exists": True}})
        data = []
        async for doc in cursor:
            data.append({
                "text": doc["content"],
                "is_idea": doc.get("ideaScore", 0) >= 0.6
            })
        
        if len(data) < 10:
            raise Exception(f"Need at least 10 samples, got {len(data)}")
        
        training_status["idea_classifier"]["progress"] = 50
        
        result = train_idea_classifier(data, settings.artifacts_path)
        
        training_status["idea_classifier"]["progress"] = 100
        training_status["idea_classifier"]["status"] = "completed"
        training_status["idea_classifier"]["result"] = result
        
        logger.info("Idea classifier training completed", result=result)
        
    except Exception as e:
        training_status["idea_classifier"]["status"] = "failed"
        training_status["idea_classifier"]["result"] = {"error": str(e)}
        logger.error("Idea classifier training failed", error=str(e))


async def run_quality_scorer_training():
    """Background task for training quality scorer."""
    global training_status
    training_status["quality_scorer"]["status"] = "running"
    training_status["quality_scorer"]["progress"] = 10
    
    try:
        db = get_db()
        if db is None:
            raise Exception("Database not connected")
        
        training_status["quality_scorer"]["progress"] = 30
        
        # Fetch feedback data with prompt outputs
        pipeline = [
            {"$lookup": {
                "from": "promptoutputs",
                "localField": "promptOutputId",
                "foreignField": "_id",
                "as": "output"
            }},
            {"$unwind": "$output"},
            {"$lookup": {
                "from": "messages",
                "localField": "output.messageId",
                "foreignField": "_id",
                "as": "message"
            }},
            {"$unwind": "$message"}
        ]
        
        cursor = db.feedbacks.aggregate(pipeline)
        data = []
        async for doc in cursor:
            data.append({
                "idea": doc["message"]["content"],
                "prompt": doc["output"]["masterPrompt"],
                "rating": doc["rating"]
            })
        
        if len(data) < 10:
            raise Exception(f"Need at least 10 samples, got {len(data)}")
        
        training_status["quality_scorer"]["progress"] = 50
        
        result = train_quality_scorer(data, settings.artifacts_path)
        
        training_status["quality_scorer"]["progress"] = 100
        training_status["quality_scorer"]["status"] = "completed"
        training_status["quality_scorer"]["result"] = result
        
        logger.info("Quality scorer training completed", result=result)
        
    except Exception as e:
        training_status["quality_scorer"]["status"] = "failed"
        training_status["quality_scorer"]["result"] = {"error": str(e)}
        logger.error("Quality scorer training failed", error=str(e))


async def run_rag_builder():
    """Background task for building RAG store."""
    global training_status
    training_status["rag_store"]["status"] = "running"
    training_status["rag_store"]["progress"] = 10
    
    try:
        db = get_db()
        if db is None:
            raise Exception("Database not connected")
        
        training_status["rag_store"]["progress"] = 30
        
        # Similar pipeline to quality scorer
        pipeline = [
            {"$match": {"rating": "positive"}},
            {"$lookup": {
                "from": "promptoutputs",
                "localField": "promptOutputId",
                "foreignField": "_id",
                "as": "output"
            }},
            {"$unwind": "$output"},
            {"$lookup": {
                "from": "messages",
                "localField": "output.messageId",
                "foreignField": "_id",
                "as": "message"
            }},
            {"$unwind": "$message"}
        ]
        
        cursor = db.feedbacks.aggregate(pipeline)
        data = []
        async for doc in cursor:
            data.append({
                "id": str(doc["_id"]),
                "idea": doc["message"]["content"],
                "prompt": doc["output"]["masterPrompt"],
                "rating": doc["rating"]
            })
        
        training_status["rag_store"]["progress"] = 50
        
        result = build_rag_store(data, settings.artifacts_path)
        
        training_status["rag_store"]["progress"] = 100
        training_status["rag_store"]["status"] = "completed"
        training_status["rag_store"]["result"] = result
        
        logger.info("RAG store built", result=result)
        
    except Exception as e:
        training_status["rag_store"]["status"] = "failed"
        training_status["rag_store"]["result"] = {"error": str(e)}
        logger.error("RAG store build failed", error=str(e))


@router.post("/train")
async def trigger_training(request: TrainRequest, background_tasks: BackgroundTasks):
    """Trigger a training job."""
    
    if request.model == "all":
        background_tasks.add_task(run_idea_classifier_training)
        background_tasks.add_task(run_quality_scorer_training)
        background_tasks.add_task(run_rag_builder)
        return {"message": "All training jobs started", "models": list(training_status.keys())}
    
    if request.model not in training_status:
        raise HTTPException(status_code=400, detail=f"Unknown model: {request.model}")
    
    if training_status[request.model]["status"] == "running":
        raise HTTPException(status_code=409, detail=f"{request.model} is already running")
    
    if request.model == "idea_classifier":
        background_tasks.add_task(run_idea_classifier_training)
    elif request.model == "quality_scorer":
        background_tasks.add_task(run_quality_scorer_training)
    elif request.model == "rag_store":
        background_tasks.add_task(run_rag_builder)
    
    return {"message": f"Training started for {request.model}"}
