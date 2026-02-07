# Prompt Forge Python Trainer

ML training service for training idea classifiers, quality scorers, and building RAG stores.

## Setup

```bash
cd apps/trainer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/training/status` | GET | Get all training status |
| `/training/status/{model}` | GET | Get specific model status |
| `/training/train` | POST | Trigger training |

## Models

- `idea_classifier` - Classifies if text is a valid idea
- `quality_scorer` - Scores prompt quality  
- `rag_store` - Builds example store for retrieval
