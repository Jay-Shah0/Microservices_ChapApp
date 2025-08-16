FROM golang:1.22-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o kafka-worker

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/kafka-worker .
ENTRYPOINT ["./kafka-worker"]
