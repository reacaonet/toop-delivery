import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

import { Alert } from './../../../../../models/alert';
import { CompanyService } from './../../../../services/company.service';
import { Company } from './../../../../../models/company/company';
import { Person } from './../../../../../models/person';
import { PersonService } from './../../../../services/person.service';
import { Tickets } from './../../../../../models/helpdesk/tickets';
import { HelpDeskTicketsService } from '../../../../services/helpdesktickets.service';
import { checkObjectIdisValid } from './../../../../util';

@Component({
	selector: 'kt-tickets',
	templateUrl: './tickets.component.html',
	styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {
	alert: Alert = undefined;
	appcompanies: Company[] = [];
	dataSource;
	displayedColumns = ['tickedId', 'date', 'person', 'company', 'department', 'status', 'delete'];
	formData;
	formSubmitTickets = false;
	listPerson: Person[] = [];
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	ticketsIdToDelete;
	totalLength;
	typeAction = 'create';
	styleCurrent = 'bg-light';

	constructor(
		private appCompanyService: CompanyService,
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private personService: PersonService,
		private ticketsService: HelpDeskTicketsService,
		private toastr: ToastrService,
	) {}

	async ngOnInit() {
		this.newFormData();
		await this.getListTickets(0, this.pageSize);
	}

	closeAlert() {
		this.alert = null;
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				tickedId: new FormControl('', [Validators.required]),
				subject: new FormControl('', [Validators.required]),
				description: new FormControl('', [Validators.required]),
				priority: new FormControl('LOW', [Validators.required]),
				person: new FormControl('', [Validators.required, checkObjectIdisValid]),
				department: new FormControl('SUPPORT', [Validators.required]),
				company: new FormControl('', [Validators.required, checkObjectIdisValid]),
				status: new FormControl('NEW', [Validators.required]),
			});

			this.formData
				.get('company')
				.valueChanges.pipe(
					startWith(''),
					debounceTime(1000),
					switchMap(value => (typeof value === 'string' && value.length > 0) ? this.appCompanyService.getCompaniesNome(value) : []),
				)
				.subscribe((results: Company[]) => {
					this.appcompanies = results;
					this.changeDetectorRefs.detectChanges();

					resolve(true);
				});

			this.formData
				.get('person')
				.valueChanges.pipe(
					startWith(''),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.personService.getPersonNome(value):[]),
				)
				.subscribe((results: Person[]) => {
					this.listPerson = results;
					this.changeDetectorRefs.detectChanges();
				});

			resolve(true);
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

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getListTickets(event.pageIndex, event.pageSize);
	}

	// --> obtem os items
	async getListTickets(page, limit) {
		const self = this;
		const ELEMENT_DATA = [];

		this.ticketsService.getTicketsPaginator(page, limit).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);

			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((ticket, index) => {
					ELEMENT_DATA.push({
						position: index + 1,
						_id: ticket._id,
						date: ticket.createdAt,
						tickedId: ticket.tickedId,
						subject: ticket.subject,
						description: ticket.description,
						person: ticket.person ? ticket.person : '-',
						company: ticket.company ? ticket.company : '-',
						priority: ticket.priority,
						department: ticket.department,
						status: ticket.status,
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	// --> ação de criar ou atualizar um ticket
	async upSertTicketsModalShow(content, tickets: Tickets, type = 'create') {
		this.typeAction = type;
		this.formSubmitTickets = false;
		await this.newFormData();

		if (tickets) {
			this.formData.patchValue({
				_id: tickets._id,
				position: this.dataSource.data.length + 2,
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

		// Create random protocol
		if (this.typeAction === 'create') {
			const atualDateProtocol = moment().format('YYMMDDHHmm') + Math.floor(10 + Math.random() * 90);

			this.formData.patchValue({
				tickedId: atualDateProtocol,
			});
		}

		this.modalService.open(content, { ariaLabelledBy: 'modal-edit-tickets', size: 'lg' }).result.then(
			result => {},
			reason => {},
		);
	}

	// --> envia a requisicao para criar ou atualizar uma situacao
	async upSertTickets(tickets: Tickets) {
		if (this.typeAction === 'create') {
			this.ticketsService.createTickets(tickets).subscribe(
				async (_: any) => {
					await this.getListTickets(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success('Registro criado com sucesso!', 'Novo Registro');
					this.modalService.dismissAll();
				},
				error => {
					this.toastr.error('Falha ao criar Registro!', 'Error');

					this.modalService.dismissAll();
				},
			);
		} else {
			this.ticketsService.updateTickets(tickets).subscribe(
				async (_: any) => {
					await this.getListTickets(0, this.pageSize);
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
	}

	// --> ação de deletar um item
	async confirmDeleteModalShow(content, tickets) {
		this.ticketsIdToDelete = tickets._id;
		this.modalService.open(content, { ariaLabelledBy: 'modal-delete-tickets', size: 'sm' }).result.then(
			result => {},
			reason => {},
		);
	}

	// --> envia a requisação para deletar
	async deleteTickets() {
		if (!this.ticketsIdToDelete) {
			this.toastr.error('Falha ao deletar ticket!', 'Remover');
			return;
		}
		await this.ticketsService.deleteTickets(this.ticketsIdToDelete).toPromise();
		this.toastr.success('Ticket deletado com sucesso!', 'Removido');

		this.ticketsIdToDelete = undefined;
		await this.getListTickets(0, this.pageSize);
	}

	// --> retorna classe conforme a posicao
	zebrarLine(count) {
		if (count % 2 === 0) {
			return (this.styleCurrent = 'bg-secondary');
		}
		return (this.styleCurrent = 'bg-light');
	}

	// --> obtem a cor conforme a prioridade
	getPriority(priority) {
		if (priority === 'LOW') return '';
		if (priority === 'MEDIUM') return 'text-warning';
		if (priority === 'HIGH') return 'text-danger';
	}
}
