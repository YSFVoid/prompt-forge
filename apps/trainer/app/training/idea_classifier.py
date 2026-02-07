"""
Prompt Forge Trainer - Idea Classifier Training
"""
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import numpy as np
import structlog

logger = structlog.get_logger()


def train_idea_classifier(data: list[dict], output_path: str) -> dict:
    """
    Train a classifier to determine if text is a valid idea.
    
    Args:
        data: List of {"text": str, "is_idea": bool}
        output_path: Path to save model artifacts
    
    Returns:
        Training metrics
    """
    if len(data) < 10:
        raise ValueError("Need at least 10 samples to train")
    
    texts = [d["text"] for d in data]
    labels = [1 if d["is_idea"] else 0 for d in data]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42
    )
    
    # Vectorize
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Train classifier
    classifier = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    )
    classifier.fit(X_train_vec, y_train)
    
    # Evaluate
    train_acc = classifier.score(X_train_vec, y_train)
    test_acc = classifier.score(X_test_vec, y_test)
    
    logger.info("Idea classifier trained", train_acc=train_acc, test_acc=test_acc)
    
    # Save model for C++ engine
    os.makedirs(output_path, exist_ok=True)
    
    model_data = {
        "weights": classifier.coef_[0].tolist(),
        "bias": float(classifier.intercept_[0]),
        "vocabulary": {term: int(idx) for term, idx in vectorizer.vocabulary_.items()},
        "idf": {term: float(vectorizer.idf_[idx]) for term, idx in vectorizer.vocabulary_.items()}
    }
    
    with open(os.path.join(output_path, "idea_classifier.json"), "w") as f:
        json.dump(model_data, f)
    
    return {
        "samples": len(data),
        "train_accuracy": round(train_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "vocabulary_size": len(vectorizer.vocabulary_)
    }
