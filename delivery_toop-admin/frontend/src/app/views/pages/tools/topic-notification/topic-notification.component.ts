import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

/** Service */
import { TopicNotificationService } from '../../../../services/Notification/Topic/topic.notification.service';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormBuilder } from '@angular/forms';
import { CustomerService } from '../../../../services/customer.service';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'kt-topic-notification',
  templateUrl: './topic-notification.component.html',
  styleUrls: ['./topic-notification.component.scss']
})
export class TopicNotificationComponent implements OnInit {

	customerList: any = [];
	customerSelected: any = null;
	totalLength;
	dataSource = new MatTableDataSource([]);
	displayedColumns = [
		'name',
		'topic',
		'topic_total',
		'detail',
	];

	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	filter: any = {};

	topicCurrent = null;
	load = false;

	topicForm = this.fb.group({
		title: ['', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(50)
		]],
		message: ['', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(50)
		]],
	});

	newTopicForm = this.fb.group({
		name: ['', [
			Validators.required,
			Validators.minLength(2),
		]]
	});

	customerTopicForm = this.fb.group({
		customer: ['', [
			Validators.required,
		]],
	});


  constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private fb: FormBuilder,
		private toastr: ToastrService,
		private topicNotificationService: TopicNotificationService,
		private customerService: CustomerService,
		private notificationService: NotificationService,
	) { }


  ngOnInit(): void {
		this.getTopic();
		this.searchCustomer();
  }


	async getTopic() {
		try {
			const self = this;
			const ELEMENT_DATA = [];

			let response: any = await this.topicNotificationService.getTopicTotal().toPromise();
			if (response) {
				response.forEach((item: any) => {
					ELEMENT_DATA.push({
						_id: item._id,
						name: item.name,
						topic: item.topic,
						total: (item.hasOwnProperty('total')) ? item.total.count : 0,
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		} catch (err) {}
	}

	changePage(event) {
		this.filter.limit = event.pageSize;
		this.filter.page = event.pageIndex + 1;
	}


	detailModalShow(content: any, item: any ) {
		this.topicCurrent = item;
		this.modalService.open(content, {size: 'lg' }).result.then((result) => {
    }, (reason) => {});
	}

	newTopicShow(content) {
		this.modalService.open(content, {size: 'lg' }).result.then((result) => {
    }, (reason) => {});
	}

	async sendTopic() {
		try {
			this.load = true;

			let title = this.topicForm.get('title').value;
			let message = this.topicForm.get('message').value

			if (this.topicCurrent === null) {
				this.toastr.warning('Não conseguimos identificar o Topico atual :(');
				this.load = false;
				return;
			}

			let strFirebase = environment.firebasePath || '';
    	strFirebase = strFirebase.replace(/[/]/g, "");

			if ( strFirebase === 'homolog' && this.topicCurrent.topic.search(`${strFirebase}_`) !== 0 ) {
				this.toastr.warning('Não é possível enviar mensagens de Produção em Homologação', 'Oops', {
					timeOut: 8000,
				});

				this.load = false;
				return;
			}

			await this.topicNotificationService.sendMessage(
				this.topicCurrent.topic,
				title,
				message
			).toPromise();

			await this.notificationService.createNotification({
				title: title,
				message: message,
			}).toPromise();

			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success('Mensagem Enviada com Sucesso!', 'Nova Mensagem');

			this.topicForm.get('title').setValue('');
			this.topicForm.get('message').setValue('');
		} catch (err) {
			this.toastr.warning('Não foi possível enviar por favor tente mais tarde', 'Nova Mensagem');
			this.load = false;
		}
	}

	async addNewTopic() {
		try {
			this.load = true;
			let name = this.newTopicForm.get('name').value;
			let response = await this.topicNotificationService.newTopic(name).toPromise();

			this.getTopic();
			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success('Mensagem Enviada com Sucesso!', 'Nova Mensagem');
		} catch (err) {
			this.load = false;
		}
	}

	async searchCustomer() {
		try {
			this.customerTopicForm
				.get('customer')
				.valueChanges
				.pipe(
					startWith(''),
					debounceTime(1000),
					switchMap((value) => {
						if (!value || value.length <= 4) {
							return [];
						} else {
							return this.customerService.getCustomerSearch({
								email: value,
								phone: value,
							})
						}
					})
				).subscribe(results => this.customerList = results);
		} catch (err) {}
	}

	displayFn(value) {
		if (!value) {
			return '';
		}

	 let str = value.email ? value.email : '';
	 str += `${str !== null ? ' |' : ''} ${value.phone? value.phone: ''}`;
	 return str;
  }

	selectCustomer(customerValue) {
		this.customerSelected = customerValue;
	}

	async addCustomerInTopic() {
		try {
			this.load = true;

			if (!this.customerSelected) {
				this.messageError('Informe um usuário');
				return;
			}

			if (!this.customerSelected.instanceIdToken) {
				this.messageError('Usuário informado não possui o Token para cadastro de notificação');
				return;
			}

			if (!this.topicCurrent || !this.topicCurrent._id || !this.topicCurrent.topic) {
				this.messageError('Não foi possível identificar o topico atual');
				return;
			}

			let response: any = await this.topicNotificationService.newCustomerTopic(
				this.customerSelected._id,
				this.topicCurrent._id,
			).toPromise();

			if (!response || !response._id) {
				this.messageError('Não foi possível Salvar informação');
				return;
			}

			this.getTopic();
			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success('Usuáro adicionado no topico com sucesso!!');
		} catch(err) {
			this.messageError('Não foi possível Salvar informação');
		}
	}


	messageError (message) {
		this.load = false;
		this.toastr.warning(message);
	}

}
