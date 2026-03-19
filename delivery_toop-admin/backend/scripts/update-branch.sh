#!/bin/bash

# PARA NOVOS SH -> chmod a+x file

#variables
path="/home/home/ecbr/admin"
project="backend"
path_package_frontend="${path}/frontend/package.json"
path_package_backend="${path}/backend/package.json"

# Atualizando develop
echo -e "Atualizando branch develop:"

# Rodar project
echo "Quer rodar o projeto local?"
select runProject in SIM NAO
do
echo "Iniciando processo... $runProject"
break;
done

echo VERSAO ATUAL FRONTEND:
jq -r .version $path_package_frontend
echo VERSAO ATUAL BACKEND:
jq -r .version $path_package_backend

# Rodar project
echo "ALTERAR VERSAO DO PRODUTO?"
select alterVersionApp in SIM NAO
do
echo "Você respondeu: $alterVersionApp"
break;
done

if [ $alterVersionApp = 'SIM' ]; then
  echo VERSAO ATUAL FRONTEND:
  jq -r .version $path_package_frontend
  echo VERSAO ATUAL BACKEND:
  jq -r .version $path_package_backend

  echo DIGITE O versionCode Atual
  read versionCodeAtual
  echo DIGITE O versionName Atual
  read versionNameAtual
  echo DIGITE O versionCode Novo
  read versionCodeNew
  echo DIGITE O versionName Novo
  read versionNameNew

  echo "VersionCode novo: $versionCodeNew, VersionName novo: $versionNameNew. Confirma?"
  select confirmAlterVersionApp in SIM NAO
  do
  if [ $confirmAlterVersionApp = 'SIM' ]; then
    echo Enable Spearate Build
    replace "\"version\": \"$versionNameAtual\"" "\"version\": \"$versionNameNew\"" -- $path_package_frontend
    replace "\"version\": \"$versionNameAtual\"" "\"version\": \"$versionNameNew\"" -- $path_package_backend
  fi;
  break;
  done
fi;

cd $path
pwd
git add .
git commit -m 'Commit sync'
git checkout develop
git pull
git push
cd $project

if [ $runProject = 'SIM' ]; then
  echo "Rodando projeto"
  npm install
  npm start
fi;

if [ $alterVersionApp = 'SIM' ]; then
  echo gerando nova tag
  if git rev-parse $versionNameNew >/dev/null 2>&1; then
    git tag
    echo "Removendo tag pré-existente com mesma versão: $versionNameNew"
    git push --delete origin $versionNameNew
    git tag --delete $versionNameNew
  fi
  git tag
  git tag -a $versionNameNew -m "my version $versionNameNew"
  git push origin --tags
fi;
