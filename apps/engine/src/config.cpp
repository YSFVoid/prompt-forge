#include "config.hpp"
#include <cstdlib>
#include <fstream>
#include <sstream>

namespace config {

namespace {
    std::string get_env(const char* name, const std::string& default_value) {
        const char* value = std::getenv(name);
        return value ? std::string(value) : default_value;
    }
    
    void load_env_file(const std::string& path) {
        std::ifstream file(path);
        if (!file.is_open()) return;
        
        std::string line;
        while (std::getline(file, line)) {
            if (line.empty() || line[0] == '#') continue;
            
            auto pos = line.find('=');
            if (pos == std::string::npos) continue;
            
            std::string key = line.substr(0, pos);
            std::string value = line.substr(pos + 1);
            
            // Remove quotes if present
            if (value.size() >= 2 && value.front() == '"' && value.back() == '"') {
                value = value.substr(1, value.size() - 2);
            }
            
            #ifdef _WIN32
            _putenv_s(key.c_str(), value.c_str());
            #else
            setenv(key.c_str(), value.c_str(), 0);
            #endif
        }
    }
}

Config load() {
    load_env_file(".env");
    
    Config cfg;
    cfg.port = static_cast<uint16_t>(std::stoi(get_env("PORT", "8080")));
    cfg.artifacts_path = get_env("ARTIFACTS_PATH", "./artifacts");
    cfg.log_level = get_env("LOG_LEVEL", "info");
    
    return cfg;
}

} // namespace config
