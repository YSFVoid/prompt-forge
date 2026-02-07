#include <iostream>
#include <csignal>
#include <atomic>
#include <httplib.h>

#include "config.hpp"
#include "handlers/handlers.hpp"

std::atomic<bool> running{true};

void signal_handler(int) {
    running = false;
}

int main() {
    // Load configuration
    auto cfg = config::load();
    
    // Setup signal handlers
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);
    
    // Create HTTP server
    httplib::Server server;
    
    // CORS middleware
    server.set_pre_routing_handler([](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        return httplib::Server::HandlerResponse::Unhandled;
    });
    
    // Handle CORS preflight
    server.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204;
    });
    
    // Setup routes
    handlers::setup_routes(server, cfg.artifacts_path);
    
    // Root endpoint
    server.Get("/", [](const httplib::Request&, httplib::Response& res) {
        nlohmann::json response = {
            {"name", "Prompt Forge Engine"},
            {"version", "1.0.0"},
            {"description", "C++ ML Inference Engine"},
            {"endpoints", {
                {"health", "GET /health"},
                {"status", "GET /status"},
                {"ideaScore", "POST /infer/idea_score"},
                {"qualityScore", "POST /infer/quality_score"},
                {"retrieve", "POST /retrieve/examples"},
                {"reload", "POST /reload"}
            }}
        };
        res.set_content(response.dump(2), "application/json");
    });
    
    // Startup banner
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║               ⚡ PROMPT FORGE ENGINE ⚡                       ║\n";
    std::cout << "╠══════════════════════════════════════════════════════════════╣\n";
    std::cout << "║  Server running on: http://localhost:" << cfg.port << "                     ║\n";
    std::cout << "║  Artifacts path: " << cfg.artifacts_path << "                           ║\n";
    std::cout << "║                                                              ║\n";
    std::cout << "║  Endpoints:                                                  ║\n";
    std::cout << "║    POST /infer/idea_score    - Score idea quality            ║\n";
    std::cout << "║    POST /infer/quality_score - Score prompt quality          ║\n";
    std::cout << "║    POST /retrieve/examples   - Retrieve similar examples     ║\n";
    std::cout << "║    GET  /health              - Health check                  ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n";
    std::cout << "\n";
    
    // Start server
    std::cout << "[INFO] Starting server on port " << cfg.port << "...\n";
    
    if (!server.listen("0.0.0.0", cfg.port)) {
        std::cerr << "[ERROR] Failed to start server on port " << cfg.port << "\n";
        return 1;
    }
    
    std::cout << "[INFO] Server stopped gracefully\n";
    return 0;
}
