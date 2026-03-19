## Development server
As Variáveis de Ambiente são carregadas automáticamente, é necessário executar a implementação a partir da raiz do projeto
Executar na Raiz do Projeto
`npm start`   Navegue até `http://localhost:4001/`

## Auth Cript
A biblioteca `bcrypt` é preciso configurar de acordo com o ambiente utilizado, segue instruções
para cada plataforma
`https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions`


## env
renomear o arquivo em `src/config/.env.example` para `.env`
Verifique as varíaveis de ambiente para refletir seu ambiente atual


## DigitalOcean Spaces - configuração 
```
https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
```


### Error: listen EADDRINUSE: address already in use :::4001
```
sudo lsof -i :4001
kill -9 PID
```


### FIX BUG PUPPETER

docker exec -i -t admin-homologation-api /bin/bash
apt-get install libnss3-dev
apt-get install -y libnss3-dev

apt-cache search libatk-bridge
apt-get install libatk-bridge2.0-0

sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

