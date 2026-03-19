export class Company {
  _id: string;
  type: string;
  main: string;
  name: string;

  clear() {
    this._id = '';
    this.type = '';
    this.main = '';
    this.name = '';
  }
}
