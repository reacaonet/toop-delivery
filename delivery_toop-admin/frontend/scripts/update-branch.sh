#!/bin/bash

# PARA NOVOS SH -> chmod a+x 

#variables
path="/home/home/ecbr/admin/frontend"

# Atualizando develop
echo -e "Atualizando branch develop:"

# Rodar project
echo "Quer rodar o projeto local?"
select runProject in SIM NAO
do
echo "Iniciando processo... $runProject"
break;
done

cd $path
pwd
git add .
git commit -m 'Commit sync'
git checkout develop
git pull
git push

if [ $runProject = 'SIM' ]; then
  echo "Rodando projeto"
  npm install
  ng serve
fi;
