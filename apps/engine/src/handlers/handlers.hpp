#pragma once

#include <httplib.h>

namespace handlers {

void setup_routes(httplib::Server& server, const std::string& artifacts_path);

} // namespace handlers
