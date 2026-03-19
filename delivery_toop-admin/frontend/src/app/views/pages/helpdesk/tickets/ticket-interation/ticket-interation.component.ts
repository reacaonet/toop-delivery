import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Company } from './../../../../../../models/company/company';
import { Person } from './../../../../../../models/person';
import { Tickets } from './../../../../../../models/helpdesk/tickets';
import { Interactions } from './../../../../../../models/helpdesk/interactions';
import { HelpDeskTicketsService } from '../../../../../services/helpdesktickets.service';
import { checkObjectIdisValid } from './../../../../../util';

@Component({
	selector: 'kt-ticket-interation',
	templateUrl: './ticket-interation.component.html',
	styleUrls: ['./ticket-interation.component.scss'],
})
export class TicketInterationComponent implements OnInit {
	public Editor = ClassicEditor;

	companies: Company[] = [];
	displayedColumns = ['tickedId', 'person', 'company', 'description', 'department', 'priority', 'status'];
	formData;
	formDataInteract;
	formSubmitTickets = false;
	listPerson: Person[] = [];
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	protocol: string;
	lisTickets: Tickets[] = [];
	ticketsIdToDelete;
	totalLength;
	typeAction = 'create';
	element: Tickets;
	ckeditorContent = '';

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private route: ActivatedRoute,
		private ticketsService: HelpDeskTicketsService,
		private modalService: NgbModal,
		private toastr: ToastrService,
	) {}

	ngOnInit(): void {
		this.protocol = this.route.snapshot.paramMap.get('protocol');
		this.getProtocol();
	}

	//acao de editar o conteudo do ckeditor
	public onChange({ editor }: any) {
		const data = editor.getData();
		this.ckeditorContent = data;
	}

	async getProtocol() {
		try {
			const getByProtocol = await this.ticketsService.getTicketByProtocol(this.protocol).toPromise();
			this.getListProtocol(getByProtocol);
		} catch (err) {
			console.log('erro', err);
		}
	}

	async getListProtocol(protocol) {
		await this.newFormData();

		if (protocol) {
			console.log('QQQQ', protocol)
			this.element = {
				_id: protocol._id,
				tickedId: protocol.tickedId,
				subject: protocol.subject,
				company: protocol.company,
				person: protocol.person,
				description: protocol.description,
				priority: protocol.priority,
				createdAt: protocol.createdAt,
				department: protocol.department,
				status: protocol.status,
				intetactions: protocol.interactions,
				lastIntetactions: protocol.interactions.slice(0, 1),
			};

			this.changeDetectorRefs.detectChanges();
		}
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(''),
				tickedId: new FormControl(''),
				subject: new FormControl(''),
				company: new FormControl('', [checkObjectIdisValid]),
				person: new FormControl('', [checkObjectIdisValid]),
				description: new FormControl(''),
				priority: new FormControl(''),
				department: new FormControl(''),
				status: new FormControl(''),
			});
			return resolve(true);
		});
	}

	// novo for de interacao
	newFormDataInteract() {
		return new Promise(async (resolve, reject) => {
			this.formDataInteract = new FormGroup({
				_id: new FormControl(''),
				ticket_id: new FormControl(''),
				tickedId: new FormControl(''),
			});
			return resolve(true);
		});
	}

	displayFnCompany(company: Company) {
		if (company) {
			return company.name;
		}
	}

	displayFnPerson(person: Person) {
		if (person) {
			return person.name;
		}
	}

	// --> ação de criar ou atualizar um ticket
	async upSertTicketsModalShow(content, tickets: Tickets, type = 'edit') {
		this.typeAction = type;
		this.formSubmitTickets = false;
		await this.newFormData();

		if (tickets) {
			this.formData.patchValue({
				_id: tickets._id,
				tickedId: tickets.tickedId,
				subject: tickets.subject,
				description: tickets.description,
				person: tickets.person,
				company: tickets.company,
				priority: tickets.priority,
				department: tickets.department,
				status: tickets.status,
			});
		}

		this.modalService.open(content, { ariaLabelledBy: 'modal-edit-tickets', size: 'lg' }).result.then(
			result => {},
			reason => {},
		);
	}

	// --> envia a requisicao para criar ou atualizar uma situacao
	async upSertTickets(tickets: Tickets) {
		this.ticketsService.updateTickets(tickets).subscribe(
			async (_: any) => {
				await this.getProtocol();
				this.toastr.success('Registro alterado com sucesso!', 'Alterado');
				this.modalService.dismissAll();
			},
			error => {
				console.error(error);
				this.toastr.warning('Falha ao alterar ticket!', 'Falhou');
				this.modalService.dismissAll();
			},
		);
	}

	// --> ação de criar ou atualizar uma interacao de ticket
	async upSertTicketInteractionModalShow(content, ticket_id: string, tickedId: string) {
		this.formSubmitTickets = false;
		await this.newFormDataInteract();

		if (ticket_id) {
			this.formDataInteract.patchValue({
				ticket_id: ticket_id,
				tickedId: tickedId,
				content: '',
			});
		}

		this.modalService.open(content, { ariaLabelledBy: 'modal-new-ticket-interaction', size: 'lg' }).result.then(
			result => {},
			reason => {},
		);
	}

	// --> envia a requisicao para criar uma interacao
	async upSertTicketInteraction(interaction: Interactions) {
		const user = localStorage.getItem('@user-info') ? JSON.parse(localStorage.getItem('@user-info')) : {};

		interaction = { ...interaction, description: this.ckeditorContent, origin: 'company', author: user?.name };

		this.ticketsService.createInteraction(interaction).subscribe(
			async (_: any) => {
				await this.getProtocol();
				this.toastr.success('Interação enviada com sucesso!', 'Interação Enviada');
				this.modalService.dismissAll();
			},
			error => {
				console.error(error);
				this.toastr.warning('Falha ao alterar interação! Tente novamente', 'Falhou');
			},
		);
	}
}
