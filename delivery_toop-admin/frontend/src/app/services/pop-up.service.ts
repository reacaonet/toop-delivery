import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {

  constructor() { }

   makePopup(data: any): string {
		if (!data.person){
			return 'Person não cadastrado';
		}

		return `` +
		`<div>Nome: ${data.person.name}</div>` +
		`<div>Veículo: ${data.typeOfVehicle}</div>` +
		`<div>Status: ${data.isOnline ? 'Online' : 'Offline'}</div>` +
		`<div>Situação: ${data.flag === 'FREE' ? 'Liberado' : data.flag === 'ON_ROUTE' ? 'Em rota' : 'Indisponível'}</div>`
	}
}
