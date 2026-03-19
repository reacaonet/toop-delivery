import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Tickets } from '../../models/helpdesk/tickets';
import { Interactions } from '../../models/helpdesk/interactions';

@Injectable({
	providedIn: 'root',
})
export class HelpDeskTicketsService {
	apiUrl = environment.apiURL;

	constructor(private http: HttpClient) {}

	getTickets() {
		return this.http.get(`${this.apiUrl}/helpdesk/tickets/`);
	}

	getTicketsPaginator(page, limit) {
		return this.http.get(`${this.apiUrl}/helpdesk/tickets/paginator/?page=${page}&limit=${limit}`);
	}

	getAppTicketsNome(name) {
		if (name === '') {
			name = 'null';
		} else if (name && typeof name === 'string') {
			name = name.trim();
		}
		return this.http.get(`${this.apiUrl}/helpdesk/tickets/listPorNome?listPorNome=${name}`);
	}

	getTicketByProtocol(protocol) {
		return this.http.get(`${this.apiUrl}/helpdesk/tickets/${protocol}`);
	}

	createTickets(tickets: Tickets) {
		let companyId;
		if (tickets && tickets.company && tickets.company._id) {
			companyId = tickets.company._id;
			return this.http.post(`${this.apiUrl}/helpdesk/tickets`, tickets);
		}

		return this.http.post(`${this.apiUrl}/helpdesk/tickets/${companyId}`, tickets);
	}

	updateTickets(tickets: Tickets) {
		return this.http.put(`${this.apiUrl}/helpdesk/tickets/${tickets._id}`, tickets);
	}

	deleteTickets(id) {
		return this.http.delete(`${this.apiUrl}/helpdesk/tickets/${id}`);
	}

	createInteraction(interaction: Interactions) {
		let ticket_id = interaction.ticket_id;

		return this.http.post(`${this.apiUrl}/helpdesk/tickets/${ticket_id}/interactions`, interaction);
	}

}
