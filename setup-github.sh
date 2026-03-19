#!/bin/bash

# Script para configurar repositório GitHub
# USO: ./setup-github.sh <GITHUB_USERNAME> <GITHUB_TOKEN>

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar parâmetros
if [ $# -ne 2 ]; then
    echo -e "${RED}Uso: $0 <GITHUB_USERNAME> <GITHUB_TOKEN>${NC}"
    echo -e "${YELLOW}Exemplo: $0 johndoe ghp_xxxxxxxxxxxxxxxxxxxx${NC}"
    exit 1
fi

USERNAME=$1
TOKEN=$2
REPO_NAME="toop-delivery"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para criar repositório via API
create_repo() {
    log_info "Criando repositório $REPO_NAME..."
    
    response=$(curl -s -X POST \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d '{
            "name": "'$REPO_NAME'",
            "description": "Plataforma completa de delivery com microserviços",
            "private": true,
            "has_issues": true,
            "has_projects": true,
            "has_wiki": true
        }')
    
    if echo "$response" | grep -q "full_name"; then
        log_info "Repositório criado com sucesso!"
        REPO_URL=$(echo "$response" | grep -o '"clone_url": "[^"]*' | cut -d'"' -f4)
        log_info "URL: $REPO_URL"
    else
        log_error "Erro ao criar repositório:"
        echo "$response"
        exit 1
    fi
}

# Função para configurar branches
setup_branches() {
    log_info "Configurando branches..."
    
    # Proteger branch master
    log_info "Protegendo branch master..."
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/$USERNAME/$REPO_NAME/branches/master/protection \
        -d '{
            "required_status_checks": null,
            "enforce_admins": true,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1
            },
            "restrictions": null
        }' > /dev/null
    
    # Proteger branch homologation
    log_info "Protegendo branch homologation..."
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/$USERNAME/$REPO_NAME/branches/homologation/protection \
        -d '{
            "required_status_checks": null,
            "enforce_admins": true,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1
            },
            "restrictions": null
        }' > /dev/null
    
    log_info "Branches configuradas!"
}

# Função para adicionar secrets
setup_secrets() {
    log_info "Configurando secrets (placeholders)..."
    
    # Secrets que precisarão ser configuradas manualmente
    secrets=(
        "SSH_USER"
        "SSH_KEY"
        "DEV_SERVER"
        "STAGING_SERVER"
        "PROD_SERVER"
        "STAGING_URL"
        "PROD_URL"
    )
    
    for secret in "${secrets[@]}"; do
        log_warn "Configure manualmente no GitHub: $secret"
    done
}

# Função para fazer push
push_to_github() {
    log_info "Enviando código para GitHub..."
    
    # Adicionar remote
    git remote add origin https://$USERNAME:$TOKEN@github.com/$USERNAME/$REPO_NAME.git
    
    # Push de todas as branches
    log_info "Enviando branch master..."
    git push -u origin master
    
    log_info "Enviando branch develop..."
    git push -u origin develop
    
    log_info "Enviando branch homologation..."
    git push -u origin homologation
    
    log_info "Configurando branch padrão para master..."
    curl -s -X PATCH \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/$USERNAME/$REPO_NAME \
        -d '{"default_branch": "master"}' > /dev/null
    
    log_info "Código enviado com sucesso!"
}

# Executar fluxo
main() {
    log_info "Iniciando setup do repositório GitHub..."
    
    create_repo
    setup_branches
    push_to_github
    setup_secrets
    
    log_info "Setup concluído! 🎉"
    echo ""
    echo -e "${GREEN}Repositório: https://github.com/$USERNAME/$REPO_NAME${NC}"
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo "1. Configure as secrets no GitHub Settings → Secrets"
    echo "2. Configure os servidores de deploy"
    echo "3. Teste o CI/CD fazendo push para as branches"
}

# Executar
main
