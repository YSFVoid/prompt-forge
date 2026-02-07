"""
Prompt Forge Trainer - RAG Examples Builder
"""
import json
import os
from typing import List, Dict
import structlog

logger = structlog.get_logger()


def build_rag_store(data: List[Dict], output_path: str) -> dict:
    """
    Build RAG example store for retrieval.
    
    Args:
        data: List of {"id": str, "idea": str, "prompt": str, "rating": str}
        output_path: Path to save artifacts
    
    Returns:
        Build metrics
    """
    # Filter to positive examples only
    positive_examples = [d for d in data if d.get("rating") == "positive"]
    
    if len(positive_examples) < 3:
        raise ValueError("Need at least 3 positive examples to build RAG store")
    
    # Create examples for retrieval
    examples = []
    for item in positive_examples:
        example_id = item.get("id", f"ex_{len(examples)}")
        text = f"Idea: {item['idea']}\nPrompt: {item['prompt']}"
        
        examples.append({
            "id": example_id,
            "text": text,
            "idea": item["idea"],
            "prompt": item["prompt"]
        })
    
    logger.info("Built RAG store", examples_count=len(examples))
    
    # Save
    os.makedirs(output_path, exist_ok=True)
    
    rag_data = {
        "version": "1.0",
        "examples": examples
    }
    
    with open(os.path.join(output_path, "rag_examples.json"), "w") as f:
        json.dump(rag_data, f, indent=2)
    
    return {
        "total_samples": len(data),
        "positive_examples": len(positive_examples),
        "examples_stored": len(examples)
    }
