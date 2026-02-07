#include "handlers.hpp"
#include <nlohmann/json.hpp>
#include "../models/artifact.hpp"
#include <iostream>
#include <chrono>

namespace handlers {

using json = nlohmann::json;

void setup_routes(httplib::Server& server, const std::string& artifacts_path) {
    auto& artifacts = models::ArtifactManager::instance();
    
    // Load artifacts at startup
    if (artifacts.load(artifacts_path)) {
        std::cout << "[INFO] Artifacts loaded successfully" << std::endl;
    } else {
        std::cout << "[WARN] No artifacts loaded: " << artifacts.last_error() << std::endl;
    }
    
    // Health check
    server.Get("/health", [&](const httplib::Request&, httplib::Response& res) {
        json response = {
            {"status", "healthy"},
            {"service", "prompt-forge-engine"},
            {"version", "1.0.0"},
            {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
        };
        res.set_content(response.dump(), "application/json");
    });
    
    // Status with loaded models info
    server.Get("/status", [&](const httplib::Request&, httplib::Response& res) {
        json response = {
            {"status", "running"},
            {"models", {
                {"idea_classifier", artifacts.is_idea_classifier_loaded()},
                {"quality_scorer", artifacts.is_quality_classifier_loaded()},
                {"rag_engine", artifacts.is_rag_loaded()},
                {"rag_examples", artifacts.rag_size()}
            }}
        };
        res.set_content(response.dump(), "application/json");
    });
    
    // Idea scoring endpoint
    server.Post("/infer/idea_score", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string text = body.value("text", "");
            std::string language = body.value("language", "en");
            
            if (text.empty()) {
                res.status = 400;
                res.set_content(json({{"error", "text is required"}}).dump(), "application/json");
                return;
            }
            
            double score = artifacts.score_idea(text);
            bool is_idea = artifacts.is_idea(text);
            
            json response = {
                {"score", score},
                {"isIdea", is_idea},
                {"language", language}
            };
            res.set_content(response.dump(), "application/json");
            
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(json({{"error", e.what()}}).dump(), "application/json");
        }
    });
    
    // Quality scoring endpoint
    server.Post("/infer/quality_score", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string idea = body.value("idea", "");
            std::string prompt = body.value("prompt", "");
            
            if (idea.empty() || prompt.empty()) {
                res.status = 400;
                res.set_content(json({{"error", "idea and prompt are required"}}).dump(), "application/json");
                return;
            }
            
            double score = artifacts.score_quality(idea, prompt);
            
            json response = {
                {"score", score},
                {"quality", score >= 0.7 ? "high" : (score >= 0.5 ? "medium" : "low")}
            };
            res.set_content(response.dump(), "application/json");
            
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(json({{"error", e.what()}}).dump(), "application/json");
        }
    });
    
    // RAG retrieval endpoint
    server.Post("/retrieve/examples", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string query = body.value("query", "");
            size_t k = body.value("k", 3);
            
            if (query.empty()) {
                res.status = 400;
                res.set_content(json({{"error", "query is required"}}).dump(), "application/json");
                return;
            }
            
            auto results = artifacts.retrieve(query, k);
            
            json examples = json::array();
            for (const auto& r : results) {
                examples.push_back({
                    {"id", r.id},
                    {"text", r.text},
                    {"score", r.score}
                });
            }
            
            json response = {
                {"examples", examples},
                {"count", results.size()}
            };
            res.set_content(response.dump(), "application/json");
            
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(json({{"error", e.what()}}).dump(), "application/json");
        }
    });
    
    // Reload artifacts
    server.Post("/reload", [&](const httplib::Request&, httplib::Response& res) {
        bool success = artifacts.load(artifacts_path);
        
        json response = {
            {"success", success},
            {"models", {
                {"idea_classifier", artifacts.is_idea_classifier_loaded()},
                {"quality_scorer", artifacts.is_quality_classifier_loaded()},
                {"rag_engine", artifacts.is_rag_loaded()}
            }}
        };
        
        if (!success) {
            response["error"] = artifacts.last_error();
        }
        
        res.set_content(response.dump(), "application/json");
    });
}

} // namespace handlers
