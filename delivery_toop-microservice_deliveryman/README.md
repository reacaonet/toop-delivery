# Configurações gerais
1. Definição de qual porta o microserviço vai rodar:

```
PORT=3333
```
2. Defininção do ambiente da aplicação. Obs: enquanto estiver em desenvolvimento matenha essa opção como false

```
PRODUCTION=false
```

# Controle de versão
Você poderá manter uma versão estável da sua api (LTS) e programar uma nova versão se necessário (CURRENT). As rotas devem seguir o padrão abaixo:

```javascript
`/${process.env.LTS}/health`
```

Quando necessários fazer um teste de uma nova versão, poderá ser preenchido no .env o número da versão e as todas dessa nova versão seguir esse padrão:

```javascript
`/${process.env.CURRENT}/health`
```
Assim o microserviço terá 2 versões no ar. Ficando mais fácil de identificar e de trocar. Se o current for se tornar LTS baste trocar no .env.

# Credenciais de comunicação JWT
A comunicação com esse microserviço deverá ser através de um token JWT.

1. Você deverá preencher no .env as chaves **appToken** e **appSecret**. Para lhe auxiliar nesses tokens eu recomendo usar esse comando no console para gerar strings base 64 de 120 caracteres.

```
node -e "console.log(require('crypto').randomBytes(120).toString('base64'));"
```
2. O serviço que ira acessar as informações desse micro serviço deverá bater na rota ``/${process.env.LTS}/token`` informando um JSON com o **appToken** e **appSecret**.

3. Essa rotá irá retornar o token JWT para ser usado nas próximas requisições.

4. Por isso a controller a ser criada aqui dentro deverá pegar esse token através do Bearer Authorization encontrado no header. Usar a lib do JWT para dar um **verify**, e confirmar que é um token gerado por esse serviço, em seguida entregar o que se espera.

# Integração com o backend da EconomizeBR
Essa base já tem essa integração e poderá ser chamada através do import. A URL deverá ser preenchida no .env:

```javascript
  import apiEconomizeBr from '../../services/apiEconomizeBr';
```

# Estrutura do projeto
Deverá seguir a metodologia do MVC(model, view, controller) e todas as pastas e arquivos deverão ficar dentro do **src**.

Qualquer alteração universal do projeto deverá ser discutido com a equipe e feito no [projeto base](https://bitbucket.org/tilary/ecbr_microservice_base).

# Avisos em tempo reals
A base possue integração com o socket.io através da URL. Você poderá emitir (emit) qualquer comunicação em tempo real que for necessário.

# Scripts
## yarn start
`Vai buildar o typscript e iniciar o servidor node dele.`

## yarn build
`Vai apenas buildar o typscript.`

## yarn dev
`Builda o typscript em tempo real, usado apenas em desenvolvimento.`

## yarn server
`Sobe o docker e start a api dentro do container, usar apenas em produção`

# Dicas
Mantenha 2 remotes no projeto, a **origin** vai conter a url do bitbucket do seu projeto atual e uma outra model chamada **base**, por exemplo

```
git remote base {URL BASE DO PROJETO}
```

Assim se a base tiver alguma atualização de melhoria baste escrever

```
git pull base master
```

Que a base do projeto irá atualizar mantendo as alterações do seu microserviço atual do mesmo jeito.