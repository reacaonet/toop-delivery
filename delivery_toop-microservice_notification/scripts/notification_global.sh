#!/bin/bash

# PARA NOVOS SH -> chmod a+x nameFile

#variables
path="/home/home/ecbr/microservice_notification"
path_package="${path}/package.json"

echo "Sincronizando projeto NOTIFICATION"

echo -e "Iniciando build! \n\nSelecione um tipo:"

select type in develop homologation master
do
echo "::: Iniciando build do tipo: $type"
break;
done

echo "==> Você selecionou: $type. Confirma?"
select confirmAlterVersionApp in SIM NAO
do
break;
done

if [ $confirmAlterVersionApp = 'NAO' ]; then
  echo "::: Processo finalizado!"
  exit;
fi;

# Define as variaves do ambiente selecionado
if [ $type = "homologation" ]; then
  path="/home/app/ecbr_notification"
  path_package="${path}/package.json"
elif [ $type = 'master' ]; then
  path="/home/app/ecbr_notification"
  path_package="${path}/package.json"
fi;

echo "::: Atualizando o projeto a partir do: $type"
sleep 5
cd ~
cd $path
git reset --hard
git checkout $type
git pull

echo VERSAO ATUAL:
jq -r .version $path_package

# Alterar versão do android
echo "==> ALTERAR VERSAO DO PRODUTO?"
select alterVersionApp in SIM NAO
do
echo "Iniciando build do tipo: $type"
break;
done

if [ $alterVersionApp = 'SIM' ]; then
  echo VERSAO ATUAL:
  jq -r .version $path_package
  echo DIGITE O versionName ATUAL
  read versionNameAtual
  echo DIGITE O versionName NOVO
  read versionNameNew

  echo "VersionName novo: $versionNameNew. Confirma?"
  select confirmAlterVersionApp in SIM NAO
  do
  if [ $confirmAlterVersionApp = 'SIM' ]; then
    echo "::: Alterando versão do app no branch $type"
    # replace "\"version\": \"$versionNameAtual\"" "\"version\": \"$versionNameNew\"" -- $path_package
    sed -i "s/\"version\": \"$versionNameAtual\"/\"version\": \"$versionNameNew\"/g" $path_package
    git add .
    git commit -m 'Alter version' --no-edit
    git push
  fi;
  break;
  done
fi;

echo "==> DESEJA FAZER MERGE COM O BRANCH FONTE?"
select makeMergeWithBranch in SIM NAO
do
  if [ $makeMergeWithBranch = 'SIM' ]; then
    if [ $type = 'homologation' ]; then
      git checkout develop
      git pull
      sleep 2
      if [ $confirmAlterVersionApp = 'SIM' ]; then
        echo "::: Alterando versão do app no branch develop"
        # replace "\"version\": \"$versionNameAtual\"" "\"version\": \"$versionNameNew\"" -- $path_package
        sed -i "s/\"version\": \"$versionNameAtual\"/\"version\": \"$versionNameNew\"/g" $path_package
        sleep 2
        git add .
        git commit -m 'Alter version' --no-edit
        sleep 2
        git push
        sleep 2
      fi;
      git checkout $type
      git merge develop --no-edit
      sleep 2
      git add .
      git commit -m 'sync merge with develop' --no-edit
      git push
      sleep 2
    elif [ $type = 'master' ]; then
      git checkout homologation
      git pull
      if [ $confirmAlterVersionApp = 'SIM' ]; then
        echo "::: Alterando versão do app no branch homologation"
        # replace "\"version\": \"$versionNameAtual\"" "\"version\": \"$versionNameNew\"" -- $path_package
        sed -i "s/\"version\": \"$versionNameAtual\"/\"version\": \"$versionNameNew\"/g" $path_package
        sleep 2
        git add .
        git commit -m 'Alter version' --no-edit
        sleep 2
        git push
      fi;
      git checkout $type
      git merge homologation --no-edit
      sleep 2
      git add .
      git commit -m 'sync merge with homologation' --no-edit
      sleep 2
      git push
    fi;
  fi;
  break;
done

echo "::: Buildando projeto"

sleep 2
# echo Removendo node_modules
rm -rf ./node_modules
# echo Removendo yarn.lock
rm yarn.lock
sleep 1
npx yarn install
sleep 2
npx yarn build 
sleep 5
docker stop notification-api
sleep 5
docker start notification-api

echo "::: Finalizando processo"
sleep 5
echo "::: Processo Finalizado"
