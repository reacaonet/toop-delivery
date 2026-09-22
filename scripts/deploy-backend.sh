#!/usr/bin/env bash
#
# GojaDelivery - Deploy BACKEND na VPS 69.169.101.230 (API + Banco + Redis)
#
# Uso:
#   1. Na VPS:  git clone git@github.com:reacaonet/toop-delivery.git
#   2. Copiar .env.production.example -> .env e preencher
#   3. Rodar:   sudo bash scripts/deploy-backend.sh
#
set -euo pipefail

COMPOSE_FILE="docker-compose.backend.yml"

echo "==> [1/5] Instalando Docker + Compose (se necessário)"
if ! command -v docker &>/dev/null; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
  echo "    Docker já instalado: $(docker --version)"
fi

# UFW: só API na porta 8100 (microserviços ficam na rede interna)
echo "==> [2/5] Ajustando firewall (UFW)"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp
  ufw allow 8100/tcp    # api.gojadelivery.com.br
  ufw --force enable
fi

echo "==> [3/5] Validando .env"
if [ ! -f .env ]; then
  echo "ERRO: arquivo .env não encontrado. Copie .env.production.example para .env e preencha."
  exit 1
fi
missing_keys=$(grep -oE '^[A-Z_]+=' .env.production.example | sed 's/=//' | while read -r k; do
  grep -q "^${k}=" .env || echo "$k"
done || true)
if [ -n "$missing_keys" ]; then
  echo "AVISO: chaves ausentes no .env:"
  echo "$missing_keys"
fi

echo "==> [4/5] Subindo stack backend (build em produção)"
docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" up -d

echo "==> [5/5] Verificando saúde dos serviços"
sleep 10
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Backend concluído!"
echo "  API.........: http://69.169.101.230:8100  -> api.gojadelivery.com.br"
echo "  Mongo/Postgres/Redis: internos (sem porta pública)"
echo ""
echo "Após validar, aponte no DNS:"
echo "  api.gojadelivery.com.br -> 69.169.101.230  (proxiado p/ :8100)"