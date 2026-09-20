#!/usr/bin/env bash
#
# GojaDelivery - Deploy de produção na VPS (Ubuntu + Docker)
#
# Uso:
#   1. Na VPS:  git clone git@github.com:reacaonet/toop-delivery.git
#   2. Copiar .env.production.example -> .env e preencher
#   3. Rodar:   sudo bash scripts/deploy-vps.sh
#
set -euo pipefail

COMPOSE_FILE="docker-compose.production.yml"

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

# UFW allow das portas públicas (proxy externo encaminha para cá)
echo "==> [2/5] Ajustando firewall (UFW)"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 8100/tcp    # api.gojadelivery.com.br
  ufw allow 8081/tcp    # admin.gojadelivery.com.br
  ufw allow 8082/tcp    # loja.gojadelivery.com.br (store)
  ufw allow 8083/tcp    # entregador.gojadelivery.com.br
  ufw allow 8084/tcp    # app.gojadelivery.com.br (web-client)
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

echo "==> [4/5] Subindo stack (build em produção)"
docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" up -d

echo "==> [5/5] Verificando saúde dos serviços"
sleep 10
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Deploy concluído!"
echo "  API..........: http://SERVER_IP:8100   (api.gojadelivery.com.br)"
echo "  Admin........: http://SERVER_IP:8081   (admin.gojadelivery.com.br)"
echo "  Store........: http://SERVER_IP:8082   (loja.gojadelivery.com.br)"
echo "  Entregador...: http://SERVER_IP:8083   (entregador.gojadelivery.com.br)"
echo "  Web-client...: http://SERVER_IP:8084   (app.gojadelivery.com.br)"
echo "  Landpage.....: http://SERVER_IP:80     (gojadelivery.com.br)"
echo ""
echo "Após validar, aponte os registros A/AAAA no DNS para IP da VPS:"
echo "  gojadelivery.com.br      -> IP   (proxy externo -> :80)"
echo "  api.gojadelivery.com.br  -> IP   (proxy externo -> :8100)"
echo "  admin.gojadelivery.com.br-> IP   (proxy externo -> :8081)"
echo "  loja.gojadelivery.com.br -> IP   (proxy externo -> :8082)"
echo "  entregador.gojadelivery.com.br -> IP (proxy externo -> :8083)"
echo "  app.gojadelivery.com.br  -> IP   (proxy externo -> :8084)"