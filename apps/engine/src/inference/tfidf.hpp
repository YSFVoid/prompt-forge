#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <sstream>
#include <algorithm>
#include <cctype>

namespace inference {

class TfIdfVectorizer {
public:
    TfIdfVectorizer() = default;
    
    // Fit on vocabulary from training data
    void fit(const std::vector<std::string>& documents) {
        vocabulary_.clear();
        idf_.clear();
        
        size_t doc_count = documents.size();
        std::unordered_map<std::string, size_t> doc_freq;
        
        for (const auto& doc : documents) {
            auto tokens = tokenize(doc);
            std::unordered_set<std::string> seen;
            
            for (const auto& token : tokens) {
                if (vocabulary_.find(token) == vocabulary_.end()) {
                    vocabulary_[token] = vocabulary_.size();
                }
                if (seen.find(token) == seen.end()) {
                    doc_freq[token]++;
                    seen.insert(token);
                }
            }
        }
        
        // Calculate IDF
        for (const auto& [term, freq] : doc_freq) {
            idf_[term] = std::log(static_cast<double>(doc_count + 1) / (freq + 1)) + 1.0;
        }
    }
    
    // Transform text to TF-IDF vector
    std::vector<double> transform(const std::string& text) const {
        std::vector<double> vec(vocabulary_.size(), 0.0);
        auto tokens = tokenize(text);
        
        // Count term frequency
        std::unordered_map<std::string, size_t> tf;
        for (const auto& token : tokens) {
            tf[token]++;
        }
        
        // Calculate TF-IDF
        double norm = 0.0;
        for (const auto& [term, count] : tf) {
            auto vocab_it = vocabulary_.find(term);
            if (vocab_it != vocabulary_.end()) {
                auto idf_it = idf_.find(term);
                double idf_val = (idf_it != idf_.end()) ? idf_it->second : 1.0;
                double tfidf = (static_cast<double>(count) / tokens.size()) * idf_val;
                vec[vocab_it->second] = tfidf;
                norm += tfidf * tfidf;
            }
        }
        
        // L2 normalize
        if (norm > 0) {
            norm = std::sqrt(norm);
            for (auto& v : vec) {
                v /= norm;
            }
        }
        
        return vec;
    }
    
    size_t vocab_size() const { return vocabulary_.size(); }
    
    // Serialization
    void load_vocabulary(const std::unordered_map<std::string, size_t>& vocab,
                        const std::unordered_map<std::string, double>& idf) {
        vocabulary_ = vocab;
        idf_ = idf;
    }

private:
    std::unordered_map<std::string, size_t> vocabulary_;
    std::unordered_map<std::string, double> idf_;
    
    std::vector<std::string> tokenize(const std::string& text) const {
        std::vector<std::string> tokens;
        std::string current;
        
        for (char c : text) {
            if (std::isalnum(static_cast<unsigned char>(c))) {
                current += std::tolower(static_cast<unsigned char>(c));
            } else if (!current.empty()) {
                if (current.length() >= 2) {
                    tokens.push_back(current);
                }
                current.clear();
            }
        }
        
        if (!current.empty() && current.length() >= 2) {
            tokens.push_back(current);
        }
        
        return tokens;
    }
};

} // namespace inference
