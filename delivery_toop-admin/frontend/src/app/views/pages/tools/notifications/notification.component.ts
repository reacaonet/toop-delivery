import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

/** Service */
import { TopicNotificationService } from "../../../../services/Notification/Topic/topic.notification.service";
import { ToastrService } from "ngx-toastr";
import { Validators, FormBuilder } from "@angular/forms";
import { CustomerService } from "../../../../services/customer.service";
import { debounceTime, switchMap, startWith } from "rxjs/operators";
import { NotificationService } from "../../../../services/notification.service";

@Component({
	selector: "kt-notification",
	templateUrl: "./notification.component.html",
	styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnInit {
	customerList: any = [];
	customerSelected: any = null;
	totalLength;
	dataSource = new MatTableDataSource([]);
	displayedColumns = ["title", "message", "total", "detail"];

	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	filter: any = {
		page: 0,
		limit: 20,
	};

	topicCurrent = null;
	token = "";
	load = false;
	users: [];
	listUsers = [];
	allUser = false;

	notificationForm = this.fb.group({
		title: [
			"",
			[Validators.required, Validators.minLength(4), Validators.maxLength(50)],
		],
		message: [
			"",
			[Validators.required, Validators.minLength(4), Validators.maxLength(50)],
		],
		user: [""],
	});

	newTopicForm = this.fb.group({
		name: ["", [Validators.required, Validators.minLength(2)]],
	});

	customerTopicForm = this.fb.group({
		customer: ["", [Validators.required]],
	});

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private fb: FormBuilder,
		private toastr: ToastrService,
		private topicNotificationService: TopicNotificationService,
		private customerService: CustomerService,
		private notificationService: NotificationService
	) {}

	ngOnInit(): void {
		this.addSearchUser();
		this.getNotificaton();
		this.searchCustomer();
	}

	addSearchUser() {
		this.notificationForm
			.get("user")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.customerService.getSearchPersonCustomer(value):[])
			).subscribe((results) => {
				this.users = results;
			});
	}

	async getNotificaton(pageIn = 0, pageOut = 20) {
		try {
			const self = this;
			const ELEMENT_DATA = [];

			let response: any = await this.notificationService
				.getNotificationCustomer(pageIn, pageOut)
				.toPromise();
			if (response && response.list) {
				response.list.forEach((item: any) => {
					ELEMENT_DATA.push({
						_id: item._id,
						title: item.title,
						message: item.message,
						total: item.totalUsers ? item.totalUsers : 0,
					});
				});

				this.totalLength = response.total;
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		} catch (err) {
			console.log("err", err);
		}
	}

	changePage(event) {
		this.filter.limit = event.pageSize;
		this.filter.page = event.pageIndex + 1;

		this.getNotificaton(this.filter.page, 20);
	}

	detailModalShow(content: any, item: any) {
		this.topicCurrent = item;
		this.modalService.open(content, { size: "lg" }).result.then(
			(result) => {},
			(reason) => {}
		);
	}

	newNotificationShow(content) {
		this.modalService.open(content, { size: "lg" }).result.then(
			(result) => {},
			(reason) => {}
		);
	}

	async sendNotification() {
		try {
			let title = this.notificationForm.get("title").value;
			let message = this.notificationForm.get("message").value;

			if (this.allUser === false && this.listUsers.length <= 0) {
				return this.toastr.warning(
					"Informe uma lista de usuários para serem enviados"
				);
			}

			this.load = true;

			const response = await this.notificationService
				.sendNotificationCustomer({
					token: this.token,
					title,
					message,
					allUser: this.allUser,
					listUser: this.listUsers,
				})
				.toPromise();

			if (!response) {
				this.changeDetectorRefs.detectChanges();
				return this.toastr.warning("Não foi possível enviar informações");
			}

			this.load = false;
			this.allUser = false;
			this.modalService.dismissAll();
			this.toastr.success("Mensagem Enviada com Sucesso!", "Nova Mensagem");

			this.notificationForm.get("title").setValue("");
			this.notificationForm.get("message").setValue("");

			this.getNotificaton();
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível enviar por favor tente mais tarde";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.warning(message);
			this.load = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async searchCustomer() {
		try {
			this.customerTopicForm
				.get("customer")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.customerService.getCustomerSearch({
						email: value,
						phone: value,
					}):[]
				))
				.subscribe((results) => (this.customerList = results))
		} catch (err) {}
	}

	displayFn(value: any) {
		if (value) {
			return value.name;
		}
	}

	selectCustomer(customerValue) {
		this.customerSelected = customerValue;
	}

	messageError(message) {
		this.load = false;
		this.toastr.warning(message);
	}

	addUserInList(event) {
		const user = event.option.value;

		if (user && user.customer && user.customer._id) {
			let name = "";

			if (user.name) {
				name += user.name;
			}

			if (user.email) {
				name += ` - ${user.email}`;
			}

			if (user.phone) {
				name += ` - ${user.phone}`;
			}

			this.listUsers.push({
				_id: user.customer._id,
				name: name,
			});

			this.changeDetectorRefs.detectChanges();
		}
	}

	removeUserList(user) {
		if (this.listUsers && this.listUsers.length <= 0) {
			return;
		}

		this.listUsers = this.listUsers.filter((item) => {
			return item._id !== user._id;
		});

		this.changeDetectorRefs.detectChanges();
	}

	checkAllUser(event) {
		this.allUser = event.target.checked;
	}
}
