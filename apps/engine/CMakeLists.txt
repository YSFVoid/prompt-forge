cmake_minimum_required(VERSION 3.16)
project(prompt-forge-engine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Fetch dependencies
include(FetchContent)

# nlohmann/json for JSON parsing
FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
)

# cpp-httplib for HTTP server
FetchContent_Declare(
    httplib
    GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
    GIT_TAG v0.14.3
)

FetchContent_MakeAvailable(json httplib)

# Source files
set(SOURCES
    src/main.cpp
    src/config.cpp
    src/inference/tfidf.cpp
    src/inference/classifier.cpp
    src/inference/retrieval.cpp
    src/models/artifact.cpp
    src/handlers/handlers.cpp
)

# Create executable
add_executable(engine ${SOURCES})

# Include directories
target_include_directories(engine PRIVATE
    ${CMAKE_SOURCE_DIR}/src
    ${json_SOURCE_DIR}/include
    ${httplib_SOURCE_DIR}
)

# Link libraries
target_link_libraries(engine PRIVATE
    nlohmann_json::nlohmann_json
)

# Platform-specific settings
if(WIN32)
    target_link_libraries(engine PRIVATE ws2_32)
endif()

# Install
install(TARGETS engine DESTINATION bin)
