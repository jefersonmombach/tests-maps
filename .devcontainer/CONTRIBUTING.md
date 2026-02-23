# Contribuindo ao Projeto

## Configuração do Ambiente de Desenvolvimento

Este projeto utiliza Dev Containers para garantir um ambiente consistente de desenvolvimento.

### Pré-requisitos

- Docker Desktop ou Docker + Docker Compose
- VS Code com extensão "Dev Containers" instalada
- Git

### Setup Rápido

#### Opção 1: Automática (Recomendada)

```bash
cd /home/jeferson/p/tests-maps
bash .devcontainer/setup.sh
```

#### Opção 2: VS Code Dev Container

1. Abra a pasta no VS Code
2. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
3. Digite `Remote-Containers: Reopen in Container`
4. Aguarde a inicialização (pode levar alguns minutos)

### Depois de Conectar

```bash
# Instalar dependências
npm install

# Verificar versões
node --version
npm --version
next --version
go version
```

## Estrutura de Pastas

```
.devcontainer/
├── Dockerfile              # Imagem customizada (Node.js + Go)
├── devcontainer.json      # Configuração VS Code Dev Container
├── docker-compose.yml     # Orquestra PostgreSQL, PostGIS, pg_tileserv
├── init-db.sql            # Script de inicialização do banco
├── .env.example           # Template de variáveis de ambiente
├── setup.sh               # Script de setup automático
├── tileserv.conf          # Configuração do pg_tileserv
├── README.md              # Documentação dos Dev Containers
└── CONTRIBUTING.md        # Este arquivo
```

## Variáveis de Ambiente

Clone o arquivo de exemplo e personalize conforme necessário:

```bash
cp .devcontainer/.env.example .env
```

**Não committe .env com senhas reais!** Use `.env.example` como template.

## Banco de Dados

### Conectar ao PostgreSQL

```bash
# Do container (automático)
psql $DATABASE_URL

# Do host
psql postgresql://postgres:postgres@localhost:5432/tilemaps
```

### Usar PostGIS

Toda tabela criada com tipos geoespaciais estará disponível em:

```sql
-- Dentro do psql conectado ao banco tilemaps
SELECT * FROM pg_extension;  -- Ver extensões habilitadas
```

### Usar pg_tileserv

Acesse http://localhost:7800 para:
- Ver documentação da API
- Testar queries
- Gerar URLs de tiles para suas camadas

## Stack Tecnológico

| Componente | Versão | Uso |
|-----------|--------|-----|
| Node.js | 22 LTS | Runtime JavaScript |
| Next.js | Latest | Framework React |
| Go Lang | 1.26 | Backend/APIs |
| PostgreSQL | 16 | Banco de dados |
| PostGIS | 3.4 | Extensão geoespacial |
| pg_tileserv | Latest | Servidor de tiles vetoriais |

## Troubleshooting

### Container não constrói

```bash
# Ver logs detalhados
docker-compose -f .devcontainer/docker-compose.yml logs app
```

### Porta já em uso

Se a porta 3000, 5432 ou 7800 já estiver em uso, modifique o `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Mude a porta do host
```

### Reinicializar containers

```bash
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up -d
```

### Limpar volumes (CUIDADO: Perde dados!)

```bash
docker-compose -f .devcontainer/docker-compose.yml down -v
```

## Comandos Comuns

### Next.js

```bash
# Desenvolvimento
npm run dev      # http://localhost:3000

# Build
npm run build

# Produção
npm start

# Linter
npm run lint
```

### Go

```bash
# Build
go build ./...

# Testes
go test ./...

# Formato
go fmt ./...

# Lint
golangci-lint run ./...
```

### Database

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Ver esquema
\dt                     # Tables
\d table_name          # Table structure
```

## Performance

- Os `node_modules` são armazenados em um volume Docker para melhor performance
- O código-fonte é compartilhado via bind mount para edição em tempo real
- PostGIS e pg_tileserv rodam em containers separados

## CI/CD

Os arquivos de Dev Container também podem ser usados para CI/CD:

```dockerfile
# Usar a mesma imagem em pipelines CI
FROM crunchydata/pg_tileserv:latest
```

## Contato

Para questões sobre configuração de desenvolvimento, entre em contato com a equipe.
