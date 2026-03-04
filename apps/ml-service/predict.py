from artifacts import load_latest_artifact

_idea_model = None
_quality_model = None


def _load_models():
    global _idea_model, _quality_model
    _idea_model = load_latest_artifact("idea_model")
    _quality_model = load_latest_artifact("quality_model")


def predict_idea(text: str) -> dict:
    global _idea_model
    if _idea_model is None:
        _load_models()

    if _idea_model is None:
        keywords = ["build", "create", "make", "app", "website", "tool", "system", "platform", "service"]
        lower = text.lower()
        score = sum(1 for kw in keywords if kw in lower) / len(keywords)
        return {
            "score": round(min(score * 2, 1.0), 3),
            "is_idea": score > 0.15,
            "confidence": 0.0,
            "method": "keyword_fallback",
        }

    vectorizer = _idea_model.get("vectorizer")
    classifier = _idea_model.get("classifier")
    if vectorizer is None or classifier is None:
        return {"score": 0.5, "is_idea": False, "confidence": 0.0, "method": "model_incomplete"}

    X = vectorizer.transform([text])
    proba = classifier.predict_proba(X)[0]
    score = float(proba[1]) if len(proba) > 1 else 0.5
    return {
        "score": round(score, 3),
        "is_idea": score > 0.5,
        "confidence": round(abs(score - 0.5) * 2, 3),
        "method": "trained_model",
    }


def predict_quality(prompt: str) -> dict:
    global _quality_model
    if _quality_model is None:
        _load_models()

    if _quality_model is None:
        length_score = min(len(prompt) / 500, 1.0)
        has_structure = any(kw in prompt.lower() for kw in ["role", "context", "goal", "constraint", "output", "format"])
        score = (length_score * 0.4 + (0.6 if has_structure else 0.0))
        return {
            "score": round(min(score, 1.0), 3),
            "confidence": 0.0,
            "method": "heuristic_fallback",
        }

    vectorizer = _quality_model.get("vectorizer")
    regressor = _quality_model.get("regressor")
    if vectorizer is None or regressor is None:
        return {"score": 0.5, "confidence": 0.0, "method": "model_incomplete"}

    X = vectorizer.transform([prompt])
    score = float(regressor.predict(X)[0])
    return {
        "score": round(max(0, min(score, 1.0)), 3),
        "confidence": 0.8,
        "method": "trained_model",
    }
