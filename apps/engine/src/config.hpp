#pragma once

#include <string>
#include <cstdint>

namespace config {

struct Config {
    uint16_t port = 8080;
    std::string artifacts_path = "./artifacts";
    std::string log_level = "info";
};

Config load();

} // namespace config
