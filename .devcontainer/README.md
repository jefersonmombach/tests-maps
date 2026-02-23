# Entwicklungsumgebung - Dev Container

Configuração de desenvolvimento containerizado com os seguintes componentes:

- **Node.js**: Última versão LTS (v22)
- **Next.js**: Última versão disponível
- **Go Lang**: Última versão LTS (1.22)
- **PostgreSQL + PostGIS**: Container com suporte a dados geoespaciais
- **pg_tileserv**: Servidor de tiles para servir dados do PostGIS via API

## Quick Start

### Using VS Code Dev Container

1. Certifique-se de ter o Docker e Docker Compose instalados
2. Abra a pasta no VS Code
3. Clique em "Reabrir em Container" (ou use a paleta de comandos com `Remote-Containers: Reopen in Container`)
4. VS Code instalará as extensões necessárias e configurará o ambiente automaticamente

### Acessar os serviços

- **Next.js Development Server**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pg_tileserv**: http://localhost:7800

## Variáveis de Ambiente

As variáveis de ambiente estão configuradas no `devcontainer.json`. Para desenvolvimento local, copie `.env.example` para `.env`:

```bash
cp .devcontainer/.env.example .env
```

## Estrutura dos Arquivos

- `Dockerfile`: Imagem customizada com Node.js, Go Lang e ferramentas de desenvolvimento
- `devcontainer.json`: Configuração do VS Code Dev Container
- `docker-compose.yml`: Orquestração dos serviços (PostgreSQL, PostGIS, pg_tileserv)
- `init-db.sql`: Script de inicialização do banco de dados
- `.env.example`: Template de variáveis de ambiente

## Conexão ao Banco de Dados

### Via psql

```bash
psql postgresql://postgres:postgres@localhost:5432/tilemaps
```

### Variables de conexão

- **HOST**: db (dentro do container) ou localhost (do host)
- **PORT**: 5432
- **USER**: postgres
- **PASSWORD**: postgres
- **DATABASE**: tilemaps

## Usar pg_tileserv

O pg_tileserv está acessível em `http://localhost:7800` e automaticamente conectado ao banco de dados PostgreSQL + PostGIS.

Documentação: https://crunchydata.github.io/pg_tileserv/

## Volumes

- `pgdata`: Persiste os dados do PostgreSQL entre reinicializações
- `node-modules-cache`: Cache dos node_modules para melhor performance

## Ports

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Next.js | 3000 | Application Development Server |
| PostgreSQL | 5432 | Database Server |
| pg_tileserv | 7800 | Tile Server API |
| Dev | 8080 | Additional Development Port |

## Troubleshooting

### Container não inicia

```bash
docker-compose -f .devcontainer/docker-compose.yml logs
```

### Reset do banco de dados

```bash
docker volume rm tests-maps-pgdata
docker-compose -f .devcontainer/docker-compose.yml up -d db
```

### Reconectar ao container

```bash
docker-compose -f .devcontainer/docker-compose.yml down
# Depois reabra em container no VS Code
```

## Extensões VS Code Instaladas

- Go (golang.go)
- Go Test Explorer
- ESLint
- Prettier
- Prisma
- Docker

## Comandos Úteis

```bash
# Iniciar o servidor Next.js
npm run dev

# Build do projeto
npm run build

# Compilar Go
go build ./...

# Executar testes Go
go test ./...

# Conectar ao banco de dados
psql $DATABASE_URL
```
