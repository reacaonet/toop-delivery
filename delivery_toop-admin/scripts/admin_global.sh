#!/bin/bash

# PARA NOVOS SH -> chmod a+x fileName 

#variables
path="/home/app/admin"

echo "Sincronizando projeto ADMIN"

echo -e "Iniciando build! \n\nSelecione um tipo:"

select type in develop homologation master
do
echo "Iniciando build do tipo: $type"
break;
done

cd ~
cd $path
git reset --hard
git checkout develop
git pull
git checkout homologation
git pull
git merge develop

# Atualizando backend
echo "Sincronizando projeto ADMIN -> Backend"

cd $path
cd ./backend
npm install
docker stop admin-homologation-api
make admin-h

# Atualizando frontend
echo "Sincronizando projeto ADMIN -> Frontend"
cd $path
cd ./frontend
npm install
node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng build --aot --prod --vendor-chunk --common-chunk --delete-output-path --buildOptimizer

echo "Projeto ADMIN atualizado com sucesso!"
