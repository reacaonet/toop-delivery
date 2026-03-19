const statusMessage = index => {
    try {
        let list = [];

        /*
        list[0] = 'Aguardando atualização de status';
        list[1] = 'Pagamento apto a ser capturado ou definido como pago';
        list[2] = 'Pagamento confirmado e finalizado';
        list[3] = 'Pagamento negado por Autorizador';
        list[10] = 'Pagamento cancelado';
        list[11] = 'Pagamento cancelado após 23:59 do dia de autorização';
        list[12] = 'Aguardando Status de instituição financeira';
        list[13] = 'Pagamento cancelado por falha no processamento ou por ação do AF',
        list[20] = 'Recorrência agendada';
        */

        list[0] = 'Aguardando atualização de status';
        list[1] = 'Pagamento Aprovado';
        list[2] = 'Pagamento Aprovado';
        list[3] = 'Pagamento negado pelo Autorizador';
        list[10] = 'Pagamento cancelado';
        list[11] = 'Pagamento cancelado após 23:59 do dia de autorização';
        list[12] = 'Aguardando Status de instituição financeira';
        list[13] = 'Pagamento cancelado por falha no processamento ou por ação do Antifraude',
        list[20] = 'Recorrência agendada';

        /*
        const indexFind = list.findIndex((element, i) => i === index)
        if (indexFind == -1 )
            return false;
        */

        return list[index];
    } catch (err) {
        return false;
    }
};

//const paymentOptions = () => {}

module.exports = {statusMessage};
