#!/bin/bash

# ToopDelivery Setup Script
# Este script configura o ambiente de desenvolvimento

set -e

echo "🚀 Configurando ToopDelivery Development Environment..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de utilidade
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Por favor instale Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js versão 18+ requerida. Versão atual: $(node -v)"
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não encontrado. Por favor instale Docker"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não encontrado. Por favor instale Docker Compose"
        exit 1
    fi
    
    log_info "Pré-requisitos verificados com sucesso! ✓"
}

# Configurar variáveis de ambiente
setup_environment() {
    log_info "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        log_info "Arquivo .env criado a partir do template"
        log_warn "Por favor edite o arquivo .env com suas configurações"
    else
        log_warn "Arquivo .env já existe"
    fi
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    # Instalar dependências principais
    npm install
    
    # Instalar dependências dos serviços
    npm run install:all
    
    log_info "Dependências instaladas com sucesso! ✓"
}

# Construir imagens Docker
build_docker() {
    log_info "Construindo imagens Docker..."
    
    docker-compose -f docker-compose.dev.yml build
    
    log_info "Imagens Docker construídas com sucesso! ✓"
}

# Iniciar serviços
start_services() {
    log_info "Iniciando serviços..."
    
    # Criar diretórios necessários
    mkdir -p scripts
    mkdir -p logs
    
    # Iniciar serviços em background
    docker-compose -f docker-compose.dev.yml up -d
    
    log_info "Serviços iniciados! ✓"
    
    # Aguardar serviços estarem prontos
    log_info "Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Verificar saúde dos serviços
    check_services_health
}

# Verificar saúde dos serviços
check_services_health() {
    log_info "Verificando saúde dos serviços..."
    
    # Verificar Admin API
    if curl -f http://localhost:8100/api-docs &> /dev/null; then
        log_info "Admin API: OK ✓"
    else
        log_error "Admin API: FALHOU ✗"
    fi
    
    # Verificar Payment API
    if curl -f http://localhost:8400/health &> /dev/null; then
        log_info "Payment API: OK ✓"
    else
        log_warn "Payment API: Verificação manual necessária"
    fi
    
    # Verificar Redis Commander
    if curl -f http://localhost:8181 &> /dev/null; then
        log_info "Redis Commander: OK ✓"
    else
        log_warn "Redis Commander: Verificação manual necessária"
    fi
}

# Criar scripts de inicialização
create_scripts() {
    log_info "Criando scripts de utilidade..."
    
    # Script de start
    cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.dev.yml up -d
echo "Serviços iniciados em modo desenvolvimento"
echo "Admin API: http://localhost:8100/api-docs"
echo "Payment API: http://localhost:8400"
echo "Redis Commander: http://localhost:8181"
EOF

    # Script de stop
    cat > scripts/stop-dev.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.dev.yml down
echo "Serviços parados"
EOF

    # Script de logs
    cat > scripts/logs.sh << 'EOF'
#!/bin/bash
SERVICE=${1:-admin-api}
docker-compose -f docker-compose.dev.yml logs -f $SERVICE
EOF

    chmod +x scripts/*.sh
    
    log_info "Scripts criados em ./scripts/ ✓"
}

# Menu de ajuda
show_help() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  setup     - Configuração completa do ambiente"
    echo "  start     - Inicia os serviços"
    echo "  stop      - Para os serviços"
    echo "  logs      - Mostra logs dos serviços"
    echo "  build     - Constrói imagens Docker"
    echo "  clean     - Limpa containers e imagens"
    echo "  help      - Mostra esta ajuda"
    echo ""
    echo "Serviços disponíveis:"
    echo "  admin-api"
    echo "  payment-microservice"
    echo "  notification-microservice"
    echo "  deliveryman-microservice"
    echo "  redis"
    echo "  admin-mongodb"
    echo "  payment-postgres"
}

# Main
case "${1:-setup}" in
    setup)
        check_prerequisites
        setup_environment
        install_dependencies
        build_docker
        create_scripts
        start_services
        log_info "Setup completo! 🎉"
        echo ""
        echo "Serviços disponíveis:"
        echo "  📚 Admin API: http://localhost:8100/api-docs"
        echo "  💳 Payment API: http://localhost:8400"
        echo "  🔔 Notification API: http://localhost:8200"
        echo "  🚚 Deliveryman API: http://localhost:8300"
        echo "  🗄️ Redis Commander: http://localhost:8181"
        echo ""
        echo "Scripts úteis:"
        echo "  ./scripts/start-dev.sh - Iniciar serviços"
        echo "  ./scripts/stop-dev.sh - Parar serviços"
        echo "  ./scripts/logs.sh <serviço> - Ver logs"
        ;;
    start)
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    stop)
        docker-compose -f docker-compose.dev.yml down
        ;;
    logs)
        SERVICE=${2:-admin-api}
        docker-compose -f docker-compose.dev.yml logs -f $SERVICE
        ;;
    build)
        docker-compose -f docker-compose.dev.yml build --no-cache
        ;;
    clean)
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac
