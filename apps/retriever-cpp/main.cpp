#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include <cstdlib>
#include "retriever.h"

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#endif

static Retriever retriever;

void loadSeedData() {
    retriever.addExample(
        "Build a mobile app for tracking water intake",
        "You are a health-focused AI assistant. Help the user design and build a mobile application that tracks daily water consumption. Include features for reminders, daily goals, progress visualization, and health insights.");
    retriever.addExample(
        "Create a restaurant reservation system",
        "You are a restaurant technology expert. Design a comprehensive reservation management system. Include table management, waitlist handling, customer notifications, and analytics dashboard.");
    retriever.addExample(
        "Make an AI-powered code review tool",
        "You are a senior software engineer and code quality expert. Create an AI-powered code review tool that analyzes pull requests for bugs, security vulnerabilities, performance issues, and code style. Provide actionable suggestions with explanations.");
}

std::string parseJsonField(const std::string& json, const std::string& field) {
    auto pos = json.find("\"" + field + "\"");
    if (pos == std::string::npos) return "";
    pos = json.find(":", pos);
    if (pos == std::string::npos) return "";
    pos = json.find("\"", pos);
    if (pos == std::string::npos) return "";
    auto end = json.find("\"", pos + 1);
    if (end == std::string::npos) return "";
    return json.substr(pos + 1, end - pos - 1);
}

int parseJsonInt(const std::string& json, const std::string& field, int def) {
    auto pos = json.find("\"" + field + "\"");
    if (pos == std::string::npos) return def;
    pos = json.find(":", pos);
    if (pos == std::string::npos) return def;
    pos++;
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    std::string num;
    while (pos < json.size() && std::isdigit(json[pos])) num += json[pos++];
    return num.empty() ? def : std::stoi(num);
}

std::string escapeJson(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

std::string handleRequest(const std::string& method, const std::string& path, const std::string& body) {
    if (path == "/health" && method == "GET") {
        return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n"
               "{\"ok\":true,\"service\":\"retriever-cpp\",\"version\":\"1.0.0\",\"examples\":" +
               std::to_string(retriever.size()) + "}";
    }

    if (path == "/search" && method == "POST") {
        std::string query = parseJsonField(body, "query");
        int topK = parseJsonInt(body, "top_k", 3);

        if (query.empty()) {
            return "HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\n\r\n"
                   "{\"error\":\"query_required\"}";
        }

        auto results = retriever.search(query, topK);
        std::string json = "{\"examples\":[";
        for (size_t i = 0; i < results.size(); i++) {
            if (i > 0) json += ",";
            json += "{\"idea_summary\":\"" + escapeJson(results[i].idea_summary) +
                    "\",\"master_prompt\":\"" + escapeJson(results[i].master_prompt) +
                    "\",\"score\":" + std::to_string(results[i].score) + "}";
        }
        json += "]}";
        return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + json;
    }

    return "HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n{\"error\":\"not_found\"}";
}

void parseHttp(const std::string& raw, std::string& method, std::string& path, std::string& body) {
    std::istringstream iss(raw);
    iss >> method >> path;
    auto bodyPos = raw.find("\r\n\r\n");
    if (bodyPos != std::string::npos) body = raw.substr(bodyPos + 4);
}

int main() {
    loadSeedData();

    const char* portEnv = std::getenv("RETRIEVER_PORT");
    int port = portEnv ? std::atoi(portEnv) : 6000;

#ifdef _WIN32
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif

    int serverFd = socket(AF_INET, SOCK_STREAM, 0);
    if (serverFd < 0) { std::cerr << "socket failed\n"; return 1; }

    int opt = 1;
    setsockopt(serverFd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    struct sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    if (bind(serverFd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        std::cerr << "bind failed on port " << port << "\n";
        return 1;
    }

    listen(serverFd, 10);
    std::cout << "Retriever C++ listening on :" << port << " (" << retriever.size() << " examples)\n";

    while (true) {
        struct sockaddr_in clientAddr{};
        int clientLen = sizeof(clientAddr);
        int clientFd = accept(serverFd, (struct sockaddr*)&clientAddr, (socklen_t*)&clientLen);
        if (clientFd < 0) continue;

        char buffer[8192] = {};
        recv(clientFd, buffer, sizeof(buffer) - 1, 0);

        std::string method, path, body;
        parseHttp(buffer, method, path, body);
        std::string response = handleRequest(method, path, body);

        send(clientFd, response.c_str(), response.size(), 0);

#ifdef _WIN32
        closesocket(clientFd);
#else
        close(clientFd);
#endif
    }

    return 0;
}
