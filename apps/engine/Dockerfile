# Build stage
FROM gcc:13-bookworm AS builder
WORKDIR /app

# Install CMake
RUN apt-get update && apt-get install -y cmake && rm -rf /var/lib/apt/lists/*

# Copy source
COPY CMakeLists.txt ./
COPY src ./src

# Build
RUN mkdir build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    cmake --build . --config Release

# Production stage
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build/engine ./engine
RUN mkdir -p ./artifacts

EXPOSE 8080

ENV PORT=8080
ENV ARTIFACTS_PATH=./artifacts

CMD ["./engine"]
