

## Documentação Carrinho de compras

## :: Carrinho de compras

1. Carrinho de compras

####  GET: /shopping/cart/:customer/:company?

  * :customer: Id do cliente (obrigatorio)
  * :company: Id da empresa (opcional)

  ```javascript
  StatusPossíveis: {
    'pending': 'Compra em andamento',
    'inProgress': 'Compra concluída e em progresso de coleta e entrega',
    'concluded': 'Compra concluída',
    'deleted': 'Quando limpa a cesta completa'
  }
  ```

 Payload:

  #### RESPONSE

    ```javascript
    [
      {
        "status": "pending",
        "isDeleted": false,
        "_id": "5e7b67e4d865622af4cd1e70",
        "customer": {
          "status": true,
          "_id": "5e6eb9fc6455b7125b175c5e",
          "name": "Mauricio Martins"
        },
        "company": {
          "type": "supermarket",
          "_id": "5e6a70eee33fdf3f8e49468e",
          "name": "Pró Brazilian",
          "status": true,
          "groups": "5e7598a0e040223bb2441a29"
        },
        "createdAt": "2020-03-25T14:17:08.510Z",
        "updatedAt": "2020-03-25T14:17:08.510Z",
        "__v": 0
      }
    ]
    ```

##### POST: /shopping/cart/:customer/:company

  * :customer: Id do cliente (obrigatorio)
  * :company: Id da empresa

  Payload:

  #### REQUEST

    ```javascript
    {}
    ```

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Carrinho de Compras criado com sucesso",
      "data": {
        "status": "pending",
        "isDeleted": false,
        "_id": "5e7b67e4d865622af4cd1e70",
        "customer": "5e6eb9fc6455b7125b175c5e",
        "company": "5e6a70eee33fdf3f8e49468e",
        "createdAt": "2020-03-25T14:17:08.510Z",
        "updatedAt": "2020-03-25T14:17:08.510Z",
        "__v": 0
      }
    }
    ```



##### PUT: /shopping/cart/:id

  * :id: Id do Carrinho

  Payload:

  #### REQUEST

    ```javascript
    {
      "status": "inProgress",
      "isDeleted": false
    }
    ```

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Grupo atualizado com sucesso",
      "data": {
        "status": "inProgress",
        "isDeleted": false,
        "_id": "5e7ac58cde9e33601e659348",
        "customer": "5e6eb9fc6455b7125b175c5e",
        "company": "5e6a70eee33fdf3f8e49468e",
        "createdAt": "2020-03-25T02:44:28.374Z",
        "updatedAt": "2020-03-25T03:06:55.394Z",
        "__v": 0
      }
    }
    ```


##### DELETE: /shopping/cart/:id

  * :id: Id do Carrinho

  Payload:

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Carrinho de Compras deletado com sucesso"
    }
    ```




## :: Itens Carrinho de compras

1. Itens Carrinho de compras

####  GET: /shopping/cart-item/:cart

  * :cart: Id do Carrinho (obrigatorio)

 Payload:

  #### RESPONSE

    ```javascript
    [
      {
        "amount": 5,
        "_id": "5e7b714a7f41ee4d9a298bfb",
        "product": {
          "images": [
            "https://economizebr.sfo2.digitaloceanspaces.com/producthomolog/d7140a76-c868-49dc-a527-de0ae6d2b243.jpeg"
          ],
          "_id": "5e7111220af9a77576288ac0",
          "name": "Energético Monster 473ml",
          "barcode": "154165"
        },
        "shoppingCart": {
          "status": "pending",
          "_id": "5e7b67e4d865622af4cd1e70",
          "customer": "5e6eb9fc6455b7125b175c5e",
          "company": "5e6a70eee33fdf3f8e49468e"
        },
        "price": 5.99,
        "pricePromotional": 5.49,
        "createdAt": "2020-03-25T14:57:14.863Z",
        "updatedAt": "2020-03-25T14:57:14.863Z",
        "__v": 0
      }
    ]
    ```

##### POST: /shopping/cart-item/:cart/:product

  * :cart: Id do carrinho (obrigatorio)
  * :product: Id do produto (obrigatorio)

  Payload:

  #### REQUEST

    ```javascript
    {
      "amount": 2,
      "price": 2.38
    }
    ```

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Item adicionado ao Carrinho com sucesso",
      "data": {
        "amount": 2,
        "_id": "5e7b72b536e65056e5504b42",
        "product": "5e6d6b2b1e19ce4d2655dd0d",
        "shoppingCart": "5e7b67e4d865622af4cd1e70",
        "price": 2.38,
        "createdAt": "2020-03-25T15:03:17.869Z",
        "updatedAt": "2020-03-25T15:03:17.869Z",
        "__v": 0
      }
    }
    ```



##### PUT: /shopping/cart-item/:cart/:id

  * :cart: Id do Carrinho
  * :id: Id do Item

  Payload:

  #### REQUEST

    ```javascript
    {
      "amount": 3,
      "price": 2.99
    }
    ```

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Item atualizado com sucesso",
      "data": {
        "amount": 5,
        "_id": "5e7b714a7f41ee4d9a298bfb",
        "product": "5e7111220af9a77576288ac0",
        "shoppingCart": "5e7b67e4d865622af4cd1e70",
        "price": null,
        "pricePromotional": null,
        "createdAt": "2020-03-25T14:57:14.863Z",
        "updatedAt": "2020-03-25T18:14:10.935Z",
        "__v": 0
      }
    }
    ```

##### DELETE: /shopping/cart-item/:cart/:id

  * :cart: Id do Carrinho
  * :id: Id do Item

  Payload:

  #### RESPONSE

    ```javascript
    {
      "status": 200,
      "message": "Item removido do Carrinho com sucesso"
    }
    ```

