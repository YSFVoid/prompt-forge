# Prompt Forge C++ Engine

Fast ML inference engine for idea scoring, quality assessment, and RAG retrieval.

## Build

```bash
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

## Run

```bash
./engine
# or on Windows:
engine.exe
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Model loading status |
| `/infer/idea_score` | POST | Score if text is a valid idea |
| `/infer/quality_score` | POST | Score prompt quality |
| `/retrieve/examples` | POST | Retrieve similar examples |
| `/reload` | POST | Reload artifacts |

## Artifacts

Place trained model files in `./artifacts/`:
- `idea_classifier.json` - Idea classifier weights
- `quality_scorer.json` - Quality scorer weights
- `rag_examples.json` - RAG example database
