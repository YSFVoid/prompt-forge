FROM gcc:13 AS builder
WORKDIR /app
COPY main.cpp retriever.h ./
RUN g++ -std=c++17 -O2 -Wall -o retriever main.cpp

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/retriever .
EXPOSE 6000
CMD ["./retriever"]
