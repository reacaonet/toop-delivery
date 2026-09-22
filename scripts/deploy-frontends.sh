#!/usr/bin/env bash
#
# GojaDelivery - Deploy FRONTENDS na VPS 167.148.161.88
#
# Uso:
#   1. Na VPS:  git clone git@github.com:reacaonet/toop-delivery.git
#   2. Copiar .env.production.example -> .env (opcional; se ausente usa URLs padrão)
#   3. Rodar:   sudo bash scripts/deploy-frontends.sh
#
set -euo pipefail

COMPOSE_FILE="docker-compose.frontends.yml"

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

# UFW: libera as portas públicas dos frontends
echo "==> [2/5] Ajustando firewall (UFW)"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp
  ufw allow 80/tcp     # gojadelivery.com.br (landpage)
  ufw allow 8081/tcp   # admin.gojadelivery.com.br
  ufw allow 8082/tcp   # loja.gojadelivery.com.br (store)
  ufw allow 8083/tcp   # entregador.gojadelivery.com.br
  ufw allow 8084/tcp   # app.gojadelivery.com.br (web-client)
  ufw --force enable
fi

echo "==> [3/5] Validando .env (opcional)"
if [ ! -f .env ]; then
  echo "    .env não encontrado — usando padrões (api.gojadelivery.com.br)."
fi

echo "==> [4/5] Subindo stack frontend (build em produção)"
docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" up -d

echo "==> [5/5] Verificando saúde dos serviços"
sleep 10
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Frontends concluídos!"
echo "  Landpage....: http://167.148.161.88:80     -> gojadelivery.com.br"
echo "  Admin.......: http://167.148.161.88:8081   -> admin.gojadelivery.com.br"
echo "  Store.......: http://167.148.161.88:8082   -> loja.gojadelivery.com.br"
echo "  Entregador..: http://167.148.161.88:8083   -> entregador.gojadelivery.com.br"
echo "  Web-client..: http://167.148.161.88:8084   -> app.gojadelivery.com.br"
echo ""
echo "DNS (gojadelivery.com.br -> 167.148.161.88; proxy externo encaminha p/ portas acima)."