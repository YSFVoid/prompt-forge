import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.model_selection import cross_val_score
from models import get_messages, get_feedback
from artifacts import save_artifact
from pii import redact_pii

_training_status = {"status": "idle", "last_run": None, "results": {}}


def get_training_status():
    return _training_status


def run_training():
    global _training_status
    _training_status = {"status": "running", "last_run": None, "results": {}}

    try:
        idea_result = train_idea_classifier()
        quality_result = train_quality_scorer()
        rag_result = build_rag_store()

        from datetime import datetime
        _training_status = {
            "status": "complete",
            "last_run": datetime.utcnow().isoformat(),
            "results": {
                "idea_classifier": idea_result,
                "quality_scorer": quality_result,
                "rag_store": rag_result,
            },
        }
        return _training_status
    except Exception as e:
        _training_status = {"status": "error", "error": str(e)}
        return _training_status


def train_idea_classifier():
    messages = get_messages(limit=5000)
    if not messages or len(messages) < 10:
        return {"status": "skipped", "reason": "insufficient data", "count": len(messages)}

    texts = []
    labels = []

    idea_keywords = ["build", "create", "make", "app", "website", "tool", "system", "platform"]

    for msg in messages:
        if msg.get("role") != "user":
            continue
        content = redact_pii(msg.get("content", ""))
        if not content.strip():
            continue
        texts.append(content)
        lower = content.lower()
        is_idea = int(any(kw in lower for kw in idea_keywords) and len(content) > 20)
        labels.append(is_idea)

    if len(texts) < 10 or len(set(labels)) < 2:
        return {"status": "skipped", "reason": "insufficient variety", "count": len(texts)}

    vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), stop_words="english")
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    clf = LogisticRegression(max_iter=500, C=1.0)
    scores = cross_val_score(clf, X, y, cv=min(5, len(texts)), scoring="accuracy")
    clf.fit(X, y)

    artifact = save_artifact("idea_model", {
        "vectorizer": vectorizer,
        "classifier": clf,
    }, {"accuracy": float(scores.mean()), "samples": len(texts)})

    return {
        "status": "trained",
        "samples": len(texts),
        "accuracy": round(float(scores.mean()), 3),
        "version": artifact["version"],
    }


def train_quality_scorer():
    feedback = get_feedback(limit=5000)
    if not feedback or len(feedback) < 10:
        return {"status": "skipped", "reason": "insufficient feedback", "count": len(feedback)}

    messages = get_messages(limit=10000)
    msg_map = {}
    for msg in messages:
        msg_map[str(msg.get("_id", ""))] = msg

    texts = []
    scores = []

    for fb in feedback:
        msg_id = str(fb.get("messageId", ""))
        msg = msg_map.get(msg_id)
        if not msg:
            continue
        content = redact_pii(msg.get("content", ""))
        if not content.strip():
            continue
        texts.append(content)
        scores.append(float(fb.get("rating", 0)))

    if len(texts) < 10:
        return {"status": "skipped", "reason": "insufficient paired data", "count": len(texts)}

    vectorizer = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), stop_words="english")
    X = vectorizer.fit_transform(texts)
    y = np.array(scores)

    reg = Ridge(alpha=1.0)
    cv_scores = cross_val_score(reg, X, y, cv=min(5, len(texts)), scoring="r2")
    reg.fit(X, y)

    artifact = save_artifact("quality_model", {
        "vectorizer": vectorizer,
        "regressor": reg,
    }, {"r2": float(cv_scores.mean()), "samples": len(texts)})

    return {
        "status": "trained",
        "samples": len(texts),
        "r2": round(float(cv_scores.mean()), 3),
        "version": artifact["version"],
    }


def build_rag_store():
    messages = get_messages(limit=5000)
    prompt_packs = []

    for msg in messages:
        if msg.get("type") == "prompt_pack" and msg.get("masterPrompt"):
            prompt_packs.append({
                "master_prompt": redact_pii(msg["masterPrompt"][:500]),
                "content": redact_pii(msg.get("content", "")[:200]),
            })

    if len(prompt_packs) < 3:
        return {"status": "skipped", "reason": "insufficient prompt_packs", "count": len(prompt_packs)}

    texts = [p["master_prompt"] for p in prompt_packs]
    vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 2), stop_words="english")
    vectors = vectorizer.fit_transform(texts)

    artifact = save_artifact("rag_store", {
        "vectorizer": vectorizer,
        "vectors": vectors,
        "examples": prompt_packs,
    }, {"count": len(prompt_packs)})

    return {
        "status": "built",
        "examples": len(prompt_packs),
        "version": artifact["version"],
    }
