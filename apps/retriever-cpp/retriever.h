#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <cmath>
#include <sstream>
#include <algorithm>

struct Example {
    std::string idea_summary;
    std::string master_prompt;
    double score;
};

class Retriever {
public:
    void addExample(const std::string& idea, const std::string& prompt) {
        examples_.push_back({idea, prompt, 0.0});
        auto tokens = tokenize(idea + " " + prompt);
        std::unordered_map<std::string, double> tf;
        for (auto& t : tokens) {
            tf[t] += 1.0;
            df_[t] += 1.0;
        }
        for (auto& p : tf) p.second /= tokens.size();
        tfs_.push_back(tf);
        n_docs_++;
    }

    std::vector<Example> search(const std::string& query, int topK) {
        if (examples_.empty()) return {};
        auto qtokens = tokenize(query);
        std::unordered_map<std::string, double> qtf;
        for (auto& t : qtokens) qtf[t] += 1.0;
        for (auto& p : qtf) p.second /= qtokens.size();

        auto qvec = tfidf(qtf);

        for (size_t i = 0; i < examples_.size(); i++) {
            auto dvec = tfidf(tfs_[i]);
            examples_[i].score = cosine(qvec, dvec);
        }

        std::vector<size_t> indices(examples_.size());
        for (size_t i = 0; i < indices.size(); i++) indices[i] = i;
        std::partial_sort(indices.begin(),
            indices.begin() + std::min((size_t)topK, indices.size()),
            indices.end(),
            [this](size_t a, size_t b) { return examples_[a].score > examples_[b].score; });

        std::vector<Example> results;
        for (int i = 0; i < std::min((size_t)topK, indices.size()); i++) {
            if (examples_[indices[i]].score > 0.01)
                results.push_back(examples_[indices[i]]);
        }
        return results;
    }

    size_t size() const { return examples_.size(); }

private:
    std::vector<Example> examples_;
    std::vector<std::unordered_map<std::string, double>> tfs_;
    std::unordered_map<std::string, double> df_;
    int n_docs_ = 0;

    std::vector<std::string> tokenize(const std::string& text) {
        std::vector<std::string> tokens;
        std::string lower = text;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        std::istringstream iss(lower);
        std::string word;
        while (iss >> word) {
            std::string clean;
            for (char c : word) if (std::isalnum(c)) clean += c;
            if (clean.size() > 1) tokens.push_back(clean);
        }
        return tokens;
    }

    std::unordered_map<std::string, double> tfidf(const std::unordered_map<std::string, double>& tf) {
        std::unordered_map<std::string, double> vec;
        for (auto& p : tf) {
            double idf_val = std::log((double)(n_docs_ + 1) / (df_.count(p.first) ? df_[p.first] + 1 : 1));
            vec[p.first] = p.second * idf_val;
        }
        return vec;
    }

    double cosine(const std::unordered_map<std::string, double>& a,
                  const std::unordered_map<std::string, double>& b) {
        double dot = 0, na = 0, nb = 0;
        for (auto& p : a) {
            na += p.second * p.second;
            auto it = b.find(p.first);
            if (it != b.end()) dot += p.second * it->second;
        }
        for (auto& p : b) nb += p.second * p.second;
        if (na == 0 || nb == 0) return 0;
        return dot / (std::sqrt(na) * std::sqrt(nb));
    }
};
