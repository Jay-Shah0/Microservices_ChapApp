FROM golang:1.22-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o ws-server

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/ws-server .
ENV PORT=4000
ENTRYPOINT ["./ws-server"]
