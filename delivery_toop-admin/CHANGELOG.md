# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.19](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.19/) - 2020-10-01

### Added

- Menu Admin - Banco de produtos

### Changed

- Alterado a forma de deletar os registros sensiveis para funcionamento do sistema
- Tela pedidos mostrando 40 registros ao invés de 20
- Melhorias na tela de impressão de pedidos para mercados

### Fixed

- Erro ao editar produto em Acessórios
- Cadastro de slider - Atualização na seleção de empresa
- A maioria dos autocompletes estavam aparecendo em baixo do modal


## [1.0.18](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.18/) - 2020-08-06

### Added

- Impressão de mercados com imagem dos produtos
- Permissionamento no login com estabelecimento categoria "Acessórios"

## [1.0.14](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.14/) - 2020-08-06

### Added

- Controle de desempenho dos entregadores
- Versão do aplicativo usado pelo Entregador
- Versão do aplicativo usado pelo Shopper
- Atualizada versão do Angular de 8 para 9
- Lista dos clientes que usaram o cupom
- Relatorio dos carrinhos em andamento/finalizado
- Relatorio de clientes cadastrados no app

### Changed

- Melhorias no NOC
- Não é mais permitido excluir Pessoa
- Alterado de 20 minutos para 5 minutos, o intervalo para abrir/fechar estabelecimento automaticamente
- Mapa dos entregadores listando quem tem geolocalização desconhecida

### Fixed

- Bug no chat
- Cardapio - Sumia complementos ao pausar produto

## [1.0.11](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.11/) - 2020-07-31

### Added

- Timer de 30 minutos para o estabelecimento aceitar um pedido

### Changed

- Melhorias no NOC

### Fixed

- Chat só aparecer após shopper aceitar pedido
- Horário de atendimento - Invalid date

## [1.0.10](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.10/) - 2020-07-29

### Added

- Fluxo financeiro do estabelecimento
- Cupon válido somente para primeira compra

### Changed

- Histórico do chat disponível para visualização após o despacho do pedido.

### Fixed

- Bug no chat na tela de pedidos

## [1.0.9](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.9/) - 2020-07-23

### Added

- Chat na tela de pedidos
- Ligação avisando que tem novo pedido
- Adicionado nova logo no template
- Opção para voltar o pedido pra procurar outro entregador
- Estabelecimento pode desativar/ativar Horário de Atendimento automático

### Changed

- Pausar itens do cardapio diretamente pela lista
- Alterado modelo de impressão do pedido
- Cadastro de cupons: Definir limite de cupons
- Cadastro de cupons: Definir se é válido só para a primeira compra

### Fixed

- Erro 403 - Permissionamento
- Horário de atendimento às 00:00h

## [1.0.7](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.7/) - 2020-07-23

### Fixed

- Fixbug Horário de funcionamento (atualizado a cada 20 minutos)

## [1.0.6](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.6/) - 2020-07-22

### Fixed

- Bug firebase
- Atualizar tela de pedido ao recusar uma pedido novo

## [1.0.5](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.5/) - 2020-07-22

### Added

- Gerenciamento do Horário de funcionamento dos estabelecimentos

### Changed

- Melhorias na tela de acompanhamentos de pedidos dos restaurantes

### Fixed

- Melhoria no sistema de busca do app user

## [1.0.2](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.2/) - 2020-07-20

### Added

- Controle automatico do Horário de funcionamento dos estabelecimentos
- Mapa com localização dos entregadores em tempo real

### Changed

- Melhorias na tela de Gerenciamento de pedidos do restaurante
- Aumentado o tamanho da fonte na impressão do pedido

### Fixed

- APP USER: Busca de produtos e/ou estabelecimentos na home do app
- Cardapio: Compactação das fotos para ficar mais leve

## [1.0.1](https://bitbucket.org/tilary/ecbr_admin_2020/src/1.0.1/) - 2020-07-19

### Added

- Endpoint para interação com o controle de pedidos pelo admin
- Cardápio [`/food-menu`] agora mostra na lista os produtos que estão pausados.

### Changed

- Removido pasta e-commerce do template
- Melhorias na tela de acompanhamento de pedidos dos restaurantes

### Fixed

- Nenhum item alterado até o momento
