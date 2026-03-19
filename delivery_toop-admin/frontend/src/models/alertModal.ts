export class AlertModal {
  message: string;
  type: string;

  // opera dentro dos modals
  constructor(message: string, type: string) {
      this.message = message;
      this.type = type;
  }
}
