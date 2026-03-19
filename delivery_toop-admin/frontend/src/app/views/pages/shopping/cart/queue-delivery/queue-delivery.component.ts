import {
	Component,
	OnInit,
	OnChanges,
	SimpleChanges,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { QueueDeliveryService } from "../../../../../services/orderStatus/queueDelivery.service";
import { orderMessage } from "../../../../../../models/order/orderStatus.type";
import { DeliveryManService } from "../../../../../services/deliveryMan.service";
import { checkObjectIdisValid } from "../../../../../util";

@Component({
	selector: "kt-queue-delivery",
	templateUrl: "./queue-delivery.component.html",
	styleUrls: ["./queue-delivery.component.scss"],
})
export class QueueDeliveryComponent implements OnInit, OnChanges {
	@Input()
	order: any;

	@Output()
	changeStatus: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	orderUpdateMessage: EventEmitter<orderMessage> = new EventEmitter<orderMessage>();

	load = false;
	companyStorage;
	formData;
	deliverymanList = [];
	deliverySelected = null;
	formSubmitAttempt = false;
	isRoot = false;
	messageQueue = null;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private deliverymanService: DeliveryManService,
		private modalService: NgbModal,
		private queue: QueueDeliveryService
	) {}

	ngOnInit() {
		this.messageQueue = null;
		this.companyStorage = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;

		let userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (
			userInfo &&
			userInfo._id &&
			userInfo.isRoot &&
			`${userInfo.isRoot}` === "true"
		) {
			this.isRoot = true;
		}

		this.searchLimitReached();
	}

	async createDeliveryManForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				deliveryman: new FormControl("", [Validators.required, checkObjectIdisValid]),
			});

			this.formData
				.get("deliveryman")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ?
						this.deliverymanService.getDeliveryManFilter(
							"true",
							undefined,
							value
						):[]
					)
				)
				.subscribe((results) => (this.deliverymanList = results));
			return resolve(true);
		});
	}

	displayFn(deliveryman) {
		if (deliveryman && deliveryman.person) {
			return deliveryman.person.name;
		}
	}

	async selectDeliveryMan() {
		await this.createDeliveryManForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes.order &&
			changes.order.previousValue &&
			changes.order.previousValue !== undefined
		) {
			this.order = changes.order.currentValue;
			this.messageQueue = null;
			this.searchLimitReached();
		}
	}

	changeQueueModal(content) {
		this.modalService.open(content, { size: "md" });
	}

	public changeQueue(deliveryMan: any) {
		try {
			this.load = true;
			this.messageQueue = null;

			this.queue
				.update({
					order: this.order._id,
					deliveryMan,
				})
				.subscribe(
					(response: any) => {
						// console.log('Processado', response);
						this.orderUpdateMessage.emit({
							message: "Status Alterado com Sucesso!!",
							type: "success",
						});

						this.changeStatus.emit({
							status: this.order.status,
							order: this.order,
						});

						this.modalService.dismissAll();
						this.load = false;
						this.searchLimitReached();
					},
					(err) => {
						let message = "Não foi possível alterar Status";
						if (err.error && err.error.message) {
							message = err.error.message;
						}

						this.orderUpdateMessage.emit({
							message: message,
							type: "danger",
						});

						this.modalService.dismissAll();
						this.load = false;
					}
				);
		} catch (err) {
			// console.log('err', err);
			this.modalService.dismissAll();
			this.load = false;
		}
	}

	selectedDelivery(item: any) {
		this.deliverySelected = item;
	}

	sendOrderToDelivery() {
		if (this.deliverySelected && this.deliverySelected._id) {
			this.changeQueue(this.deliverySelected._id);
		}
	}

	async searchLimitReached() {
		try {
			if (this.order && this.order._id) {
				const response: any = await this.queue
					.limitReached(this.order._id)
					.toPromise();

				if (response && response.notFound === true) {
					this.messageQueue =
						"Limite de tentativas de encontrar entregador atingido, por favor volte o pedido novamente para a fila";
					this.changeDetectorRefs.detectChanges();
				}
			}
		} catch (err) {}
	}
}
