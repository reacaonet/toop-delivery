export class Alert {
    message: string;
    type: string;

    // mostra no inicio do frontend ao fechar modal
    constructor(message: string, type: string) {
        this.message = message;
        this.type = type;
    }
}
