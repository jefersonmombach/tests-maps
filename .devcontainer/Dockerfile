FROM node:22-bullseye

# Instalar dependências e Go Lang
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    curl \
    git \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar Go Lang (última versão LTS - 1.22)
ENV GO_VERSION=1.22.0
RUN wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz && \
    rm go${GO_VERSION}.linux-amd64.tar.gz

# Configurar variáveis de ambiente do Go
ENV PATH=$PATH:/usr/local/go/bin \
    GOPATH=/home/node/go \
    GOROOT=/usr/local/go

# Instalar Next.js globalmente (será instalado via npm no projeto também)
RUN npm install -g next

# Criar usuário não-root
RUN id -u node >/dev/null 2>&1 || useradd -m -s /bin/bash node && \
    mkdir -p /home/node/go && \
    chown -R node:node /home/node/go

# Definir usuário de trabalho
USER node
WORKDIR /workspace
