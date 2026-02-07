#pragma once

#include <vector>
#include <cmath>
#include <algorithm>

namespace inference {

class LogisticClassifier {
public:
    LogisticClassifier() = default;
    
    // Load pre-trained weights
    void load_weights(const std::vector<double>& weights, double bias) {
        weights_ = weights;
        bias_ = bias;
    }
    
    // Predict probability (sigmoid output)
    double predict_proba(const std::vector<double>& features) const {
        if (weights_.empty() || features.size() != weights_.size()) {
            return 0.5; // Default probability
        }
        
        double z = bias_;
        for (size_t i = 0; i < features.size(); ++i) {
            z += weights_[i] * features[i];
        }
        
        return sigmoid(z);
    }
    
    // Binary prediction with threshold
    bool predict(const std::vector<double>& features, double threshold = 0.5) const {
        return predict_proba(features) >= threshold;
    }
    
    bool is_loaded() const { return !weights_.empty(); }

private:
    std::vector<double> weights_;
    double bias_ = 0.0;
    
    static double sigmoid(double z) {
        return 1.0 / (1.0 + std::exp(-std::clamp(z, -500.0, 500.0)));
    }
};

} // namespace inference
