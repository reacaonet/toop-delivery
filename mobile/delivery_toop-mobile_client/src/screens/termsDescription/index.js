import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import styles from './styles';
import {Colors} from '../../styles';
import LinearGradient from 'react-native-linear-gradient';
import {getAuthenticated} from '../../services/userAuth';
import {updateCustomer} from '../../services/service/customer';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TermsDescription({navigation}) {
  const go = async status => {
    if (status) {
      const resultUser = await getAuthenticated();

      if (resultUser === false) {
        navigation.navigate('Login', {
          screen: 'login',
        });
        return;
      }

      await updateCustomer(resultUser.user._id, {termsNotAccepted: false});

      navigation.navigate('Home', {screen: 'Home'});
    } else {
      navigation.navigate('Login', {screen: 'Login'});
    }
  };

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <LinearGradient
          colors={Colors.GRADIENTE_GREY}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.container}>
          <View style={styles.content}>
            <View>
              <Icon
                name="clear"
                size={28}
                style={styles.icon}
                onPress={() => navigation.goBack()}
              />
            </View>
            <Text style={styles.txtHeader}>Termos e condições de uso</Text>
            <Text style={styles.description}>
              Os seus dados são seus. Respeitamos a sua privacidade e tratamos
              os seus dados como parte da nossa missão de proporcionar um
              serviço cada vez melhor. Essa Declaração de Privacidade descreve
              como obtemos, armazenamos, utilizamos e compartilhamos as suas
              informações. A proteção dos seus dados e da sua privacidade são
              muito importantes para o como um todo, mas aqui estão alguns
              pontos importantes para que você entenda como seus dados são
              tratados no TOOP DELIVERY LTDA:
            </Text>
            <Text style={styles.description}>
              Os dados que você cadastra em nossas plataformas são tratados de
              forma segura e limitamos o tratamento para suas devidas
              finalidades. Seus dados completos de cartão não ficam armazenados
              em nossas bases, mas sim em seu telefone celular ou dispositivo
              utilizado na compra. Você pode alterar suas preferências de
              comunicação no próprio aplicativo, mas ainda poderemos contatá-lo
              para informações sobre o seu pedido. Você poderá tirar suas
              dúvidas e solicitar informações a qualquer momento através da aba
              Ajuda em nossas plataformas.As informações do cadastro são
              cadastradas através de requisição para nossa API no endereço
              https://admin.toopdelivery.com
            </Text>
            <Text style={styles.txtMiniHeader}>
              1.A quem essa Declaração se aplica?
            </Text>
            <Text style={styles.description}>
              Esta Declaração de Privacidade, também chamada de “Declaração”, é
              aplicável àqueles que acessarem ou se cadastrarem em nossa
              Plataforma (conforme definição abaixo) e àqueles que de qualquer
              outra forma utilizarem os produtos do TOOP DELIVERY LTDA. Nosso
              aplicativo e site serão denominados, em conjunto, como Plataforma
              ou Plataformas. Quando houver menção aos termos “TOOP DELIVERY
              LTDA”, “nós” ou “nossos”, estamos nos referindo ao TOOP DELIVERY
              LTDA; da mesma forma, toda vez que houver menção aos termos
              “você”, “seu”, “sua”, estamos nos referindo a você.
            </Text>
            <Text style={styles.txtMiniHeader}>
              2.Quem controla o tratamento dos dados pessoais?
            </Text>
            <Text style={styles.description}>
              O controlador é a pessoa física ou jurídica que decide sobre o
              tratamento de dados pessoais. Quando você acessar ou se cadastrar
              em nossa Plataforma, o TOOP DELIVERY LTDA exerce o papel de
              controlador do tratamento de seus dados pessoais, atuando conforme
              a legislação aplicável e conforme descrito na presente Declaração.
            </Text>
            <Text style={styles.txtMiniHeader}>
              3.Quais dados são coletados?
            </Text>
            <Text style={styles.txtMiniHeader}>
              3.1 Dados que você nos fornece Quando você criar uma conta para
              ser um usuário registrado no TOOP DELIVERY LTDA, poderemos obter
              uma série de informações sobre você, tais como:
            </Text>
            <Text style={styles.description}>
              A) Dados do seu perfil Esses dados incluem seu nome, CPF (quando
              aplicável), e-mail, endereço de entrega, número de telefone, foto
              de perfil e preferências de contato. Informamos que comunicar o
              CPF é opcional, sendo necessária sua indicação para certos
              estabelecimentos para fins fiscais. Para criar o seu cadastro no
              Website ou Aplicativo do TOOP DELIVERY LTDA você pode ainda usar a
              sua conta em redes sociais. Por exemplo, ao utilizar o Gmail para
              se inscrever no nosso Serviço, você estará permitindo que o TOOP
              DELIVERY LTDA acesse as informações pessoais em sua conta do
              Gmail, tais como seu nome e e-mail (caso os tenha cadastrado no
              Gmail). As informações que iremos obter, nesse caso, são as mesmas
              assim e dependem das suas configurações de privacidade junto ao
              serviço. B) Dados de pagamento Ao fazer o seu pedido pelo TOOP
              DELIVERY LTDA, é possível que, a depender do restaurante
              escolhido, você possa fazer o pagamento diretamente por nossas
              plataformas. Ao escolher fazer o pagamento direto no nosso Website
              ou Aplicativo, você poderá nos fornecer os seus dados de
              pagamento, tais como aqueles de cartão de crédito e de meios de
              pagamento parceiros. Atenção: suas informações de pagamento online
              são armazenadas somente de forma anonimizada pelo TOOP DELIVERY
              LTDA (6 primeiros e 4 últimos dígitos do cartão), de modo que não
              temos acesso aos seus dados financeiros completos. C) Dados de
              localização Para realizarmos a entrega do seu pedido, nós
              precisamos que você também nos informe a sua localização
              (localização atual) ou a localização do local em que gostaria que
              entregássemos o seu pedido(localização exata). Essa localização
              pode ser fornecida pelo endereço que você inserir manualmente no
              aplicativo, ou através da localização obtida do seu dispositivo
              via GPS e redes móveis (torres de celular, Wi-Fi e outras
              modalidades de localização) e confirmada por você. Para fins da
              lei n° 12.965 de 2014 (Marco Civil da Internet), ou qualquer lei
              que venha substituí-la, a localização fornecida será considerada
              como dado cadastral.
            </Text>
            <Text style={styles.txtMiniHeader}>
              3.2 Dados gerados durante a utilização dos serviços
            </Text>
            <Text style={styles.description}>
              A) Dados dos seus dispositivos Nós podemos coletar informações
              automaticamente sobre os dispositivos a partir dos quais você
              acessa o TOOP DELIVERY LTDA como: endereços IP, IMEI, tipo de
              navegador e idioma, provedor de Serviços de Internet
              (ISP),histórico de pesquisa, páginas de consulta e saída, sistema
              operacional, registros de falha, informações sobre data e horário,
              dados sobre a sequência de cliques, fabricante do dispositivo,
              operadora, modelo, versão do aparelho, versão do aplicativo,
              versão do sistema operacional, identificador de publicidade do
              aparelho (IDFA), informações de acessibilidade do aparelho e redes
              Wi-Fi. B) Dados transacionais e dados sobre sua utilização
              Coletamos dados sobre suas interações em nossa plataforma,
              incluindo data e horário de acessos, buscas e visualizações na
              Plataforma. Também podemos coletar dados transacionais
              relacionados aos uso dos nossos serviços como detalhes do pedido,
              data e hora do pedido, valor cobrado, distância entre o
              estabelecimento e local de entrega e método de pagamento. C) Dados
              de comunicação Intermediamos a comunicação entre usuários,
              entregadores e estabelecimentos parceiros através da nossa
              Plataforma. Permitimos, por exemplo, que usuários, entregadores
              estabelecimentos parceiros, enviem mensagens através do chat ou de
              telefone anonimizados. Para prestar este serviço, o TOOP DELIVERY
              LTDA recebe alguns dados relativos às chamadas, textos ou outras
              comunicações, incluindo a data e hora das comunicações e o
              conteúdo das comunicações.
            </Text>
            <Text style={styles.txtMiniHeader}>
              3.3 Informações não-pessoais
            </Text>
            <Text style={styles.description}>
              Nós também podemos obter informações não-pessoais, ou seja, dados
              que não permitem a associação direta com qualquer pessoa
              especificamente. São exemplos de dados não-pessoais o agrupamento
              de pedidos por região.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.Como utilizamos esses dados? 4.1 Prover nossos serviços
            </Text>
            <Text style={styles.description}>
              Podemos utilizar os dados coletados para prover, manter, melhorar
              e personalizar nossos produtos e serviços destinados a você,
              existentes ou a serem criados. Esse tratamento inclui a utilização
              dos dados para: Criar e atualizar sua conta; permitir o preparo e
              entrega dos pedidos pelos estabelecimentos parceiros; personalizar
              sua conta; e prover operações internas necessárias. Também
              poderemos usar seus dados pessoais para fins internos, tais como
              auditoria, análise de dados e pesquisas para aprimorar os
              produtos, serviços e comunicações com os clientes, bem como
              geração de análises estatísticas com respeito ao uso dos nossos
              serviços, incluindo tendências de consumo.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.2 Avaliação de restaurantes
            </Text>
            <Text style={styles.description}>
              Ao enviar comentários e feedback com relação à Plataforma e os
              serviços de delivery dos nossos parceiros, você nos autoriza a
              publicar e utilizar tais comentários e feedbacks na Plataforma,
              bem como a analisar, processar e tratar esse feedback de forma
              isolada ou agregada. Para tanto, apenas identificamos você através
              de seu nome de cadastro.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.3 Comunicação não comercial
            </Text>
            <Text style={styles.description}>
              Periodicamente poderemos usar seus dados pessoais para enviar
              avisos e notificações importantes, como comunicados sobre compras,
              alterações em prazos, condições e políticas. Como estas
              informações são importantes para a sua interação com o TOOP
              DELIVERY LTDA, você não poderá optar por não receber esse tipo de
              comunicação, já que são inerentes ao uso do serviço.
            </Text>
            <Text style={styles.txtMiniHeader}>4.4 Suporte</Text>
            <Text style={styles.description}>
              Também teremos acesso às suas informações quando você solicitar
              suporte sobre problemas com pedidos ou entregas, seja por meio da
              aba “Ajuda” no Website ou no Aplicativo. Neste caso, poderemos
              utilizar informações como seus dados cadastrais para: nos
              certificarmos de que você é o usuário que solicitou o pedido em
              questão; direcionar suas dúvidas para o atendente de suporte;
              investigar e direcionar TOOP DELIVERY LTDA seu problema e;
              monitorar e melhorar nossos procedimentos de suporte.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.5 Gerenciamento de pagamentos efetuados online.
            </Text>
            <Text style={styles.description}>
              Segurança da informação e compliance com a legislação financeira é
              uma das grandes preocupações do TOOP DELIVERY LTDA. Por isso,
              armazenamos suas informações financeiras apenas de forma
              anonimizada, o que nos impede de ter acesso a seus dados
              financeiros completos. Além disso, somente processamos seus dados
              para a finalidade especificada, qual seja, a de permitir que uma
              transação seja efetuada online com cobrança para você. Não se
              preocupe: o TOOP DELIVERY LTDA nunca processará suas informações
              financeiras e/ou bancárias de forma a desrespeitar as normas de
              compliance aplicáveis.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.6 Segurança e prevenção à fraudes.
            </Text>
            <Text style={styles.description}>
              Nós também podemos utilizar seus dados pessoais para aprimorar a
              nossa segurança e melhorar os serviços e as ofertas do TOOP
              DELIVERY LTDA destinadas a você. Dessa forma, podemos analisar e
              solucionar problemas técnicos, bem como identificar e coibir
              fraudes na utilização do nosso serviço.
            </Text>
            <Text style={styles.txtMiniHeader}>4.7 Marketing</Text>
            <Text style={styles.description}>
              Nós poderemos usar seus dados pessoais para enviar publicidade,
              bem como outros materiais promocionais voltados ao marketing de
              nossos serviços e de novidades para você, o que inclui marketing
              direcionado em redes sociais e notificações push. Nesse caso, você
              pode optar por não receber mais notificações de marketing a
              qualquer momento, alterando as suas preferências pelo Aplicativo,
              na aba “Gerenciar notificações” em “Configurações”. Além disso,
              poderemos compartilhar apenas as informações estritamente
              necessárias para essa finalidade com parceiros do TOOP DELIVERY
              LTDA, para fins de desenvolver campanhas de marketing mais
              relevantes para interessados nos produtos do TOOP DELIVERY LTDA,
              como sua identificação de usuário, telefone ou e-mail. TOOP
              DELIVERY LTDA somente compartilhará dados com parceiros que
              possuírem política de privacidade que ofereça níveis compatíveis
              de proteção àquele oferecido por essa declaração.
            </Text>
            <Text style={styles.txtMiniHeader}>4.8 Promoções</Text>
            <Text style={styles.description}>
              Se você participar de um concurso, competição ou qualquer outra
              modalidade de promoção, poderemos usar as informações que você
              fornecer para administrar esses programas.
            </Text>
            <Text style={styles.txtMiniHeader}>4.9 Pesquisas diversas</Text>
            <Text style={styles.description}>
              Podemos utilizar seus dados para entrar em contato diretamente com
              você a fim de coletar feedbacks importantes para aprimoramento de
              nossos serviços. Nesta hipótese, você será questionado se deseja
              participar da pesquisa em questão, sempre podendo se recusar a nos
              ajudar em nossa melhoria diária.
            </Text>
            <Text style={styles.txtMiniHeader}>
              4.10 Requisições legais e regulatórias
            </Text>
            <Text style={styles.description}>
              Seus dados poderão ser utilizados para endereçarmos reivindicações
              jurídicas e regulatórias relacionadas à utilização dos nossos
              serviços.
            </Text>
            <Text style={styles.txtMiniHeader}>
              5.Como utilizamos cookies e outras tecnologias?
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA se utiliza de tecnologias como cookies, pixel
              tags, armazenamento local ou outros identificadores, tanto de
              dispositivos móveis ou não, ou tecnologias semelhantes (“cookies e
              outras tecnologias”), para uma variedade de funções. Essas
              tecnologias nos ajudam a autenticar a sua conta, promover e
              aperfeiçoar os serviços do TOOP DELIVERY LTDA, personalizar a sua
              experiência e avaliar a eficácia da nossa comunicação e
              publicidade.
            </Text>
            <Text style={styles.txtMiniHeader}>
              5.1 O que são essas tecnologias?
            </Text>
            <Text style={styles.description}>
              Cookies são pequenos arquivos armazenados no seu navegador,
              celular ou outro dispositivo. Pixel tags (ou GIFs limpos, web
              beacons ou pixels) são pequenos blocos de código em uma página da
              web que permitem que elas realizem ações como ler e armazenar
              cookies e transmitir informações para o TOOP DELIVERY LTDA. A
              conexão resultante pode incluir informações como o endereço de IP
              de um dispositivo, a hora em que uma pessoa visualizou o pixel, um
              identificador associado ao navegador ou dispositivo e o tipo de
              navegador em uso. Identificadores de dispositivo mobile são
              códigos que possibilitam a identificação do seu dispositivo
              mobile, seja de maneira persistente ou transitória, tais como o ID
              de Publicidade ou o ID de seu sistema operacional.
            </Text>
            <Text style={styles.txtMiniHeader}>
              5.2 Promover uma experiência personalizada
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA e os seus parceiros também usam cookies e
              outras tecnologias para memorizar informações pessoais quando você
              usa o nosso Website, Aplicativo ou a rede de parceiros do TOOP
              DELIVERY LTDA que possam usar tecnologias similares. A nossa meta
              nesses casos é fazer com que a sua experiência com o TOOP DELIVERY
              LTDA seja mais conveniente e personalizada. Por exemplo, saber o
              seu primeiro nome nos permite dar boas-vindas a você na próxima
              vez em que você acessar o TOOP DELIVERY LTDA. Conhecer seu país e
              idioma nos permite viabilizar a você uma experiência de compras
              personalizada e mais útil. Saber que você adquiriu determinado
              produto ou usou um determinado Serviço permite fazer com que sua
              publicidade e comunicações de e-mail sejam mais relevantes para os
              seus interesses. Nessa linha, podemos também usar essas
              informações para classificar os usuários dentro da rede TOOP
              DELIVERY LTDA, identificando os usuários a partir de eventos
              realizados, como a primeira compra ou o download do nosso
              aplicativo, e a partir de determinadas características de seu
              perfil, como usuários que pedem mais determinada categoria de
              comida ou que realizam mais de 4 pedidos por mês.
            </Text>
            <Text style={styles.txtMiniHeader}>
              5.3 Avaliar a eficácia da nossa comunicação e publicidade
            </Text>
            <Text style={styles.description}>
              Nós usamos essas informações também para entender e analisar
              tendências, administrar os nossos serviços, aprender sobre o
              comportamento do usuário e obter informações demográficas sobre a
              nossa base de usuários de maneira geral. Em algumas de nossas
              mensagens de e-mail, nós usamos uma "URL click-through" (endereço
              externo) vinculada ao conteúdo do TOOP DELIVERY LTDA. Quando os
              clientes clicam em uma dessas URLs, os usuários são enviados para
              um servidor diferente antes de chegarem à página de destino no
              nosso serviço. Nós monitoramos esses dados de click-through para
              entender o interesse em determinados tópicos e avaliar a eficácia
              das comunicações com os nossos clientes. Se você preferir não ser
              monitorado dessa maneira, não clique em texto ou links contidos em
              mensagens de e-mail enviadas pelo TOOP DELIVERY LTDA. Os pixel
              tags nos permitem enviar mensagens de e-mail em formatos que os
              usuários possam ler e nos dizer se o e-mail foi aberto ou não. Nós
              podemos usar essas informações para reduzir ou eliminar as
              mensagens enviadas aos usuários.
            </Text>
            <Text style={styles.txtMiniHeader}>
              5.4 Tecnologia de terceiros
            </Text>
            <Text style={styles.description}>
              Além dos cookies e outras tecnologias do TOOP DELIVERY LTDA, nós
              podemos permitir que terceiros contratados pelo TOOP DELIVERY LTDA
              utilizem cookies e outras tecnologias de sua propriedade para
              identificar seu navegador e dispositivo, de modo a lhe oferecer
              publicidade direcionada do TOOP DELIVERY LTDA quando você acessa
              websites ou aplicativos de terceiros. Esses terceiros podem também
              fornecer ao TOOP DELIVERY LTDA informações acerca do desempenho
              das campanhas de marketing desenvolvidas por meio do
              compartilhamento de dados conosco. A título de exemplo, algumas
              dessas empresas podem utilizar cookies e outras tecnologias
              próprios nos serviços do TOOP DELIVERY LTDA, tais como: Facebook,
              Google Analytics e Double Click.
            </Text>
            <Text style={styles.txtMiniHeader}>
              6.Como os dados são armazenados? 6.1 Onde os dados são
              armazenados?
            </Text>
            <Text style={styles.description}>
              Os dados que coletamos de você são armazenados em serviços de
              nuvem confiáveis de parceiros que podem estar localizados no
              Brasil ou em outros países que ofereçam Serviço de armazenamento
              de nuvem confiáveis e usualmente utilizados por empresas de
              tecnologia, tais como Estados Unidos da América (EUA) e em países
              da América Latina e da Europa. Na contratação desses serviços, o
              TOOP DELIVERY LTDA sempre busca empresas que empregam alto nível
              de segurança no armazenamento de suas informações, estabelecendo
              contratos que não violam as definições de privacidade previstas
              nesta Declaração.
            </Text>
            <Text style={styles.txtMiniHeader}>
              6.2 Por quanto tempo os dados são armazenados?
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA armazena as suas informações durante o
              período necessário para as finalidades apresentadas nos Termos e
              Condições de Uso do TOOP DELIVERY LTDA e nesta Declaração de
              Privacidade, respeitando o período de retenção de dados
              determinado pela legislação aplicável. Caso você solicite a
              exclusão de sua conta, as suas informações pessoais fornecidas ao
              TOOP DELIVERY LTDA durante a sua utilização dos nossos serviços
              serão excluídos, salvo para as finalidades permitidas pela
              legislação de proteção de dados. Em alguns casos, poderemos reter
              suas informações mesmo que você exclua sua conta, tais como nas
              hipóteses de guarda obrigatória de registros previstas em leis
              aplicáveis, se houver uma questão não resolvida relacionada à sua
              conta (como, por exemplo, uma reclamação ou disputa não
              resolvida), bem como para o exercício regular de nossos direitos,
              ou ainda caso seja necessário para nossos interesses legítimos,
              como prevenção de fraudes e aprimoramento da segurança dos nossos
              usuários.
            </Text>
            <Text style={styles.txtMiniHeader}>
              7.O TOOP DELIVERY LTDA transfere os dados para outros países?
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA poderá realizar transferências internacionais
              de dados para outros países, tais como Estados Unidos da América e
              para países da União Europeia e da América Latina, a fim de
              realizar algumas das atividades envolvidas nos serviços prestados
              a você. Em qualquer caso de compartilhamento com parceiros ou
              prestadores de serviços localizados em outros países,
              estabelecemos contratualmente que o parceiro possua padrão de
              proteção de dados e segurança da informação compatível com esta
              Declaração e com a legislação aplicável.
            </Text>
            <Text style={styles.txtMiniHeader}>
              8.Como os dados são compartilhados? 8.1 Provedores de serviços
            </Text>
            <Text style={styles.description}>
              Por razões de processamento de dados em nome do TOOP DELIVERY
              LTDA, poderemos compartilhar dados para terceiros prestadores de
              serviços. Nesse caso, os dados serão tratados de forma a proteger
              a sua privacidade, tendo essas empresas o dever contratual de
              proteção compatível com a legislação aplicável e com os termos
              deste Declaração de Privacidade do TOOP DELIVERY LTDA. Nós podemos
              utilizar os serviços dessas empresas para facilitar nosso serviço,
              prover o serviço do TOOP DELIVERY LTDA em nosso nome e executar
              atividades relacionadas ao serviço, incluindo: manutenção dos
              serviços; gerenciamento de banco de dados, sistemas de
              computadores e provedores de armazenamento em nuvem; central de
              atendimento ao cliente; agências de publicidade. Em relação ao
              pagamento de suas compras em nossa Plataforma, caso opte por pagar
              diretamente online, nós poderemos compartilhar seus dados de
              pagamento com empresas processadores de pagamento com os quais
              trabalhamos. Esse compartilhamento é feito com o fim exclusivo de
              viabilizar a compra efetivada por você. Essas empresas ou
              indivíduos têm acesso à sua informação pessoal, restrito ao
              necessário, apenas para executar atividades solicitadas pelo TOOP
              DELIVERY LTDA e são obrigados a não usar ou divulgar tais
              informações para nenhuma outra finalidade.
            </Text>
            <Text style={styles.txtMiniHeader}>
              8.2 Estabelecimentos parceiros do TOOP DELIVERY LTDA
            </Text>
            <Text style={styles.description}>
              Ao fazer um pedido em um estabelecimento parceiro por nossa
              Plataforma, nós podemos compartilhar algumas informações suas com
              esse estabelecimento parceiro, bem como fornecer dados a respeito
              do pedido em específico. Os dados compartilhados podem incluir
              nome, endereço de entrega e CPF (quando for solicitado). Caso você
              inicie um chat com o estabelecimento durante a entrega,
              compartilharemos os mesmos dados citados acima além do conteúdo da
              mensagem escrita por você.
            </Text>
            <Text style={styles.txtMiniHeader}>8.3 Parceiros comerciais</Text>
            <Text style={styles.description}>
              Podemos compartilhar seus dados com empresas com atividades
              financeiras ou comerciais com as quais o TOOP DELIVERY LTDA mantém
              um relacionamento de colaboração ou parceria, a fim de oferecer
              promoções, produtos e serviços dessas empresas em conjunto Nesses
              casos, são firmados acordos ou contratos com o objetivo de
              proteger a privacidade dos dados pessoais de nossos usuários e o
              cumprimento da legislação aplicável para que todas as medidas
              cabíveis para garantir o cumprimento dos padrões de
              confidencialidade e segurança sejam tomadas.
            </Text>
            <Text style={styles.txtMiniHeader}>
              8.4 Empresas do Grupo TOOP DELIVERY LTDA
            </Text>
            <Text style={styles.description}>
              As empresas do Grupo do TOOP DELIVERY LTDA seguem o mesmo padrão
              de proteção de dados pessoais descrito nesta Declaração de
              Privacidade do TOOP DELIVERY LTDA e obedecem às mesmas finalidades
              descritas neste documento. Ao compartilharmos os seus dados com
              essas empresas, as mesmas garantias e cuidados que o TOOP DELIVERY
              LTDA possui com os seus dados serão replicados pelas empresas do
              Grupo do TOOP DELIVERY LTDA. O compartilhamento de dados com
              empresas do Grupo do TOOP DELIVERY LTDA terá como finalidades: (a)
              o desenvolvimento de novos produtos, funcionalidades e serviços,
              bem como sua melhoria e aperfeiçoamento; (b) a oferta de produtos
              e serviços que melhor atendam aos seus interesses; (c) geração de
              dados estatísticos e agregados acerca do uso de nossos produtos e
              serviços e perfis dos usuários; (d) marketing, prospecção,
              pesquisas de mercado, de opinião e promoção de produtos e
              serviços; e (e) investigações e medidas de prevenção e combate a
              ilícitos e fraudes.
            </Text>
            <Text style={styles.txtMiniHeader}>
              8.5 Em alteração de controle societário do TOOP DELIVERY LTDA
            </Text>
            <Text style={styles.description}>
              No caso de operações societárias, como reestruturação, fusão ou
              venda de ativos do TOOP DELIVERY LTDA, do grupo econômico ou de
              parte dele, seus dados poderão ser transferidos, desde que
              respeitados os termos da presente Declaração.
            </Text>
            <Text style={styles.txtMiniHeader}>
              8.6 Publicidade e Serviços de análise
            </Text>
            <Text style={styles.description}>
              Para entregarmos publicidade e promoções adequadas para você, bem
              como aperfeiçoar nossos serviços, nós também podemos compartilhar
              os seus dados anonimizados com empresas especializadas em
              marketing e análise de dados digitais que ofereçam nível de
              proteção de dados compatível com esta Declaração de Privacidade.
            </Text>
            <Text style={styles.txtMiniHeader}>8.7 Entrega de pedidos</Text>
            <Text style={styles.description}>
              Para que seja realizada a entrega de seu pedido, podemos
              compartilhar com nossos parceiros de entrega seu nome e endereço.
              Caso sua entrega seja realizada por um entregador cadastrado na
              plataforma do TOOP DELIVERY LTDA, você poderá iniciar um chat para
              resolver diretamente eventuais problemas de entrega.
            </Text>
            <Text style={styles.txtMiniHeader}>8.8 Autoridades públicas</Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA também poderá compartilhar suas informações
              com autoridades policiais ou judiciais, autoridades públicas
              competentes ou outros terceiros, dentro e fora do país em que você
              reside, caso seja requerido pela legislação aplicável, por decisão
              judicial e por requisição de autoridades, ou se necessário para
              responder a processos judiciais ou para participar em eventuais
              litígios ou disputas de qualquer natureza. Nestas situações, o
              TOOP DELIVERY LTDA cooperará com as autoridades competentes na
              medida do estipulado por lei. Além disso, o TOOP DELIVERY LTDA
              reserva a si a prerrogativa de compartilhar informações sobre seus
              usuários a terceiros quando houver motivos suficientes para
              considerar que a atividade de um usuário é suspeita, ilegal ou
              prejudicial ao TOOP DELIVERY LTDA ou a terceiros. Essa
              prerrogativa será utilizada pelo TOOP DELIVERY LTDA quando
              considerar apropriado ou necessário para manter a integridade e a
              segurança do seu serviço, para o cumprimento dos seus Termos e
              Condições de Uso, para o exercício regular de seus direitos e com
              o intuito de cooperar com a execução e o cumprimento da lei,
              independentemente de existir ou não uma ordem judicial ou
              administrativa para tanto.
            </Text>
            <Text style={styles.txtMiniHeader}>
              9.Como protegemos seus dados?
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA adota medidas de segurança, técnicas e
              administrativas aptas a proteger os dados pessoais de acessos não
              autorizados e de situações acidentais ou ilícitas de destruição,
              perda, alteração, comunicação ou qualquer forma de tratamento
              inadequado ou ilícito. Utilizamos os princípios estipulados por
              lei, respeitando a sua privacidade e protegendo seus dados em
              nossos processos internos como um todo. Só tratamos os seus dados
              mediante alto grau de segurança, implementando as melhores
              práticas em uso na indústria para a proteção de dados, tais como
              técnicas de criptografia, monitoramento e testes de segurança
              periódicos.
            </Text>
            <Text style={styles.txtMiniHeader}>
              10.Como iremos notificá-lo em caso de mudanças à essa Declaração?
            </Text>
            <Text style={styles.description}>
              O TOOP DELIVERY LTDA poderá atualizar essa Declaração de
              Privacidade periodicamente, sendo que a versão em vigor será
              sempre a mais recente. Se fizermos alguma alteração na Declaração
              em termos materiais, colocaremos um aviso no nosso Website,
              Aplicativo ou te enviar um e-mail, juntamente com a Declaração
              Privacidade atualizada. Para verificar a data da versão em vigor,
              verifique a “Data de atualização” no início desse documento.
            </Text>
            <Text style={styles.txtMiniHeader}>
              11.Como exercer seus direitos enquanto titular de dados pessoais?
            </Text>
            <Text style={styles.description}>
              A fim de exercer seus direitos enquanto titular de dados pessoais,
              o TOOP DELIVERY LTDA disponibiliza meios específicos para as
              requisições através da aba “Ajuda” em nossas Plataformas.
            </Text>
            <Text style={styles.description}>
              Você pode clicar no menu inferior “Perfil”, depois em “Ajuda” e,
              em seguida, “Conta” e encontrará respostas e direcionamento
              específicos para sua requisição. Se você tiver algum
              questionamento ou dúvida com relação a esta Declaração de
              Privacidade do TOOP DELIVERY LTDA ou qualquer prática aqui
              descrita, você também poderá entrar em contato conosco através da
              nossa página de Ajuda na Plataforma. TOOP DELIVERY LTDA
            </Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.button} onPress={() => go(false)}>
                <Text style={styles.buttonText}>Não concordo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={() => go(true)}>
                <Text style={styles.buttonText}>Li e concordo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </>
  );
}
