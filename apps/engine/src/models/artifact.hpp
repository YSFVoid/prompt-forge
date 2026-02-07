#pragma once

#include <string>
#include <memory>
#include <mutex>
#include <fstream>
#include <nlohmann/json.hpp>
#include "../inference/tfidf.hpp"
#include "../inference/classifier.hpp"
#include "../inference/retrieval.hpp"

namespace models {

using json = nlohmann::json;

class ArtifactManager {
public:
    static ArtifactManager& instance() {
        static ArtifactManager instance;
        return instance;
    }
    
    bool load(const std::string& artifacts_path) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        try {
            // Load idea classifier
            std::string idea_path = artifacts_path + "/idea_classifier.json";
            if (load_classifier(idea_path, idea_classifier_, idea_vectorizer_)) {
                idea_classifier_loaded_ = true;
            }
            
            // Load quality scorer
            std::string quality_path = artifacts_path + "/quality_scorer.json";
            if (load_classifier(quality_path, quality_classifier_, quality_vectorizer_)) {
                quality_classifier_loaded_ = true;
            }
            
            // Load RAG examples
            std::string rag_path = artifacts_path + "/rag_examples.json";
            if (load_rag(rag_path)) {
                rag_loaded_ = true;
            }
            
            return idea_classifier_loaded_ || quality_classifier_loaded_ || rag_loaded_;
        } catch (const std::exception& e) {
            last_error_ = e.what();
            return false;
        }
    }
    
    // Idea scoring
    double score_idea(const std::string& text) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!idea_classifier_loaded_) return 0.5;
        
        auto features = idea_vectorizer_.transform(text);
        return idea_classifier_.predict_proba(features);
    }
    
    bool is_idea(const std::string& text, double threshold = 0.6) {
        return score_idea(text) >= threshold;
    }
    
    // Quality scoring
    double score_quality(const std::string& idea, const std::string& prompt) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!quality_classifier_loaded_) return 0.5;
        
        std::string combined = idea + " [SEP] " + prompt;
        auto features = quality_vectorizer_.transform(combined);
        return quality_classifier_.predict_proba(features);
    }
    
    // RAG retrieval
    std::vector<inference::RetrievalResult> retrieve(const std::string& query, size_t k = 3) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!rag_loaded_) return {};
        return retrieval_engine_.retrieve(query, k);
    }
    
    // Status
    bool is_idea_classifier_loaded() const { return idea_classifier_loaded_; }
    bool is_quality_classifier_loaded() const { return quality_classifier_loaded_; }
    bool is_rag_loaded() const { return rag_loaded_; }
    size_t rag_size() const { return retrieval_engine_.size(); }
    std::string last_error() const { return last_error_; }

private:
    ArtifactManager() = default;
    ArtifactManager(const ArtifactManager&) = delete;
    ArtifactManager& operator=(const ArtifactManager&) = delete;
    
    std::mutex mutex_;
    
    inference::TfIdfVectorizer idea_vectorizer_;
    inference::LogisticClassifier idea_classifier_;
    bool idea_classifier_loaded_ = false;
    
    inference::TfIdfVectorizer quality_vectorizer_;
    inference::LogisticClassifier quality_classifier_;
    bool quality_classifier_loaded_ = false;
    
    inference::RetrievalEngine retrieval_engine_;
    bool rag_loaded_ = false;
    
    std::string last_error_;
    
    bool load_classifier(const std::string& path,
                        inference::LogisticClassifier& classifier,
                        inference::TfIdfVectorizer& vectorizer) {
        std::ifstream file(path);
        if (!file.is_open()) return false;
        
        json data = json::parse(file);
        
        // Load weights
        std::vector<double> weights = data["weights"].get<std::vector<double>>();
        double bias = data["bias"].get<double>();
        classifier.load_weights(weights, bias);
        
        // Load vocabulary
        std::unordered_map<std::string, size_t> vocab;
        std::unordered_map<std::string, double> idf;
        
        for (auto& [term, idx] : data["vocabulary"].items()) {
            vocab[term] = idx.get<size_t>();
        }
        for (auto& [term, val] : data["idf"].items()) {
            idf[term] = val.get<double>();
        }
        
        vectorizer.load_vocabulary(vocab, idf);
        return true;
    }
    
    bool load_rag(const std::string& path) {
        std::ifstream file(path);
        if (!file.is_open()) return false;
        
        json data = json::parse(file);
        
        std::vector<std::pair<std::string, std::string>> examples;
        for (const auto& item : data["examples"]) {
            examples.push_back({
                item["id"].get<std::string>(),
                item["text"].get<std::string>()
            });
        }
        
        retrieval_engine_.load_examples(examples);
        return true;
    }
};

} // namespace models
