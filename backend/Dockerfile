# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Download dependencies first (layer-cache friendly)
COPY go.mod go.sum* ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build a fully static binary (no CGo, no external libs required)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/server ./cmd/server

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM scratch

# Copy TLS CA certificates so the binary can make HTTPS calls if needed
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the compiled binary
COPY --from=builder /app/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]
