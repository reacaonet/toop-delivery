@echo off
REM Script para configurar repositório GitHub no Windows
REM USO: setup-github.bat <GITHUB_USERNAME> <GITHUB_TOKEN>

if "%~2"=="" (
    echo Uso: %0 ^<GITHUB_USERNAME^> ^<GITHUB_TOKEN^>
    echo Exemplo: %0 johndoe ghp_xxxxxxxxxxxxxxxxxxxx
    exit /b 1
)

set USERNAME=%1
set TOKEN=%2
set REPO_NAME=toop-delivery

echo [INFO] Iniciando setup do repositório GitHub...

REM Criar repositório via API
echo [INFO] Criando repositório %REPO_NAME%...
curl -s -X POST -H "Authorization: token %TOKEN%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\": \"%REPO_NAME%\", \"description\": \"Plataforma completa de delivery com microserviços\", \"private\": true, \"has_issues\": true, \"has_projects\": true, \"has_wiki\": true}"

REM Configurar remote
echo [INFO] Configurando remote...
git remote add origin https://%USERNAME%:%TOKEN%@github.com/%USERNAME%/%REPO_NAME%.git

REM Enviar branches
echo [INFO] Enviando branches...
git push -u origin master
git push -u origin develop
git push -u origin homologation

echo [INFO] Setup concluido! Repositorio: https://github.com/%USERNAME%/%REPO_NAME%
echo [WARN] Configure as secrets manualmente no GitHub Settings!

pause
