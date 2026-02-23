#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento

set -e

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está em execução. Por favor, inicie o Docker."
    exit 1
fi

# Navegar para o diretório .devcontainer
cd "$(dirname "$0")"

echo "📦 Buildando imagens Docker..."
docker-compose build

echo "🔨 Iniciando containers..."
docker-compose up -d

echo "⏳ Aguardando banco de dados ficar saudável..."
docker-compose exec -T db pg_isready -U postgres

echo "✅ Ambiente pronto!"
echo ""
echo "📝 Próximas etapas:"
echo "1. Abra VS Code e clique em 'Reabrir em Container'"
echo "2. Aguarde as extensões serem instaladas"
echo "3. Quando criar seu projeto Next.js, execute npm install na pasta dele"
echo ""
echo "🌐 Serviços disponíveis:"
echo "   - Next.js: http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - pg_tileserv: http://localhost:7800"
