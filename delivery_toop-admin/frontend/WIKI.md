
## Para buildar o app

sudo ng build --prod --aot --vendor-chunk --common-chunk --delete-output-path --buildOptimizer


sudo ng build --prod --aot --vendor-chunk --common-chunk --delete-output-path --buildOptimizer --base-href=/nomeProjeto/  --project=nomeProjeto




https://www.digitalocean.com/community/tutorials/containerizing-a-node-js-application-for-development-with-docker-compose-pt





## Configuração do servidor na DigitalOcean

- https://www.digitalocean.com/community/tutorials/how-to-secure-a-containerized-node-js-application-with-nginx-let-s-encrypt-and-docker-compose-pt

## Configuração do DNS na DigitalOcean

https://www.digitalocean.com/docs/networking/dns/quickstart/



https://www.digitalocean.com/community/tutorials/como-proteger-o-nginx-com-o-let-s-encrypt-no-ubuntu-18-04-pt

## Build

```
node --max_old_space_size=8048 ./node_modules/@angular/cli/bin/ng build --aot --prod --vendor-chunk --common-chunk --delete-output-path --buildOptimizer
```
