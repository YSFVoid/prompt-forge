#pragma once

#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include "tfidf.hpp"

namespace inference {

struct RetrievalResult {
    std::string id;
    std::string text;
    double score;
};

class RetrievalEngine {
public:
    RetrievalEngine() = default;
    
    // Load examples into the engine
    void load_examples(const std::vector<std::pair<std::string, std::string>>& examples) {
        examples_.clear();
        vectors_.clear();
        
        std::vector<std::string> texts;
        for (const auto& [id, text] : examples) {
            examples_.push_back({id, text});
            texts.push_back(text);
        }
        
        vectorizer_.fit(texts);
        
        for (const auto& text : texts) {
            vectors_.push_back(vectorizer_.transform(text));
        }
    }
    
    // Retrieve top-k similar examples
    std::vector<RetrievalResult> retrieve(const std::string& query, size_t k = 3) const {
        if (examples_.empty()) {
            return {};
        }
        
        auto query_vec = vectorizer_.transform(query);
        
        std::vector<std::pair<size_t, double>> scores;
        for (size_t i = 0; i < vectors_.size(); ++i) {
            double score = cosine_similarity(query_vec, vectors_[i]);
            scores.push_back({i, score});
        }
        
        // Sort by score descending
        std::sort(scores.begin(), scores.end(),
            [](const auto& a, const auto& b) { return a.second > b.second; });
        
        std::vector<RetrievalResult> results;
        for (size_t i = 0; i < std::min(k, scores.size()); ++i) {
            const auto& [idx, score] = scores[i];
            results.push_back({
                examples_[idx].first,
                examples_[idx].second,
                score
            });
        }
        
        return results;
    }
    
    size_t size() const { return examples_.size(); }

private:
    TfIdfVectorizer vectorizer_;
    std::vector<std::pair<std::string, std::string>> examples_; // id, text
    std::vector<std::vector<double>> vectors_;
    
    static double cosine_similarity(const std::vector<double>& a, const std::vector<double>& b) {
        if (a.size() != b.size() || a.empty()) return 0.0;
        
        double dot = 0.0, norm_a = 0.0, norm_b = 0.0;
        for (size_t i = 0; i < a.size(); ++i) {
            dot += a[i] * b[i];
            norm_a += a[i] * a[i];
            norm_b += b[i] * b[i];
        }
        
        if (norm_a == 0 || norm_b == 0) return 0.0;
        return dot / (std::sqrt(norm_a) * std::sqrt(norm_b));
    }
};

} // namespace inference
