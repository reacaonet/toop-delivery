import {
	Component,
	OnInit,
	OnDestroy,
	Output,
	EventEmitter,
	Input,
	SimpleChanges,
	ChangeDetectorRef,
	ViewChild,
	Directive,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";

import { OrderStatusService } from "../../../../../services/orderStatus/orderStatus.service";
import { nextOrderStatus } from "./order-next";
import {
	orderStatusUpdate,
	orderMessage,
} from "../../../../../../models/order/orderStatus.type";
import { Observable, Subscription } from "rxjs";

@Component({
	selector: "kt-order-update",
	templateUrl: "./order-update.component.html",
	styleUrls: ["./order-update.component.scss"],
})
export class OrderUpdateComponent implements OnInit, OnDestroy {
	@Input()
	order: any;

	private orderSubscription: Subscription = null;
	@Input() orderEvent: Observable<any>;

	@Output()
	changeStatus: EventEmitter<any> = new EventEmitter<any>();

	@Output()
	orderUpdateMessage: EventEmitter<orderMessage> = new EventEmitter<orderMessage>();

	@Output()
	modalDispach: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Output()
	btnLoad: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Output()
	modalFreight: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild("infoPriceDispt", { static: false })
	infoPriceDispt: Directive;

	@ViewChild("infoPriceDelivery", { static: false })
	infoPriceDelivery: Directive;

	titleBtn = "";
	companyStorage = null;
	userLogged = null;
	isUpdateStatus = null;
	ownDelivery = false;
	onlineDelivery = false;
	load = false;
	blockView = true;
	freight = null;
	isShopper = false;
	dataCurrent = moment().utc().subtract(3, "h").format("YYYY-MM-DD");
	tooltipScheduleMessage = null;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private orderStatusService: OrderStatusService
	) { }

	ngOnInit() {
		this.isUpdateStatus = null;

		this.userLogged = localStorage.getItem("@user-logged")
			? JSON.parse(localStorage.getItem("@user-logged"))
			: undefined;

		let userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (userInfo && userInfo.shopper) {
			this.isShopper = true;
		}

		this.orderSubscription = this.orderEvent.subscribe(async (item) => {
			this.order = item;
			await this.changeTxtBtn();
			this.changeDetectorRefs.detectChanges();
		});
	}

	ngOnDestroy() {
		if (this.orderSubscription) {
			this.orderSubscription.unsubscribe();
			this.orderSubscription = null;
		}
	}

	async changeTxtBtn() {
		this.blockView = true;
		this.freight = null;

		if (this.order && this.order.status) {
			this.titleBtn = this.titleStatus(this.order.status);

			if (this.order.status === "IN_PREPARATION") {
				await this.getOwnDelivery(this.order._id);
				await this.getOlineDelivery(this.order._id);
				await this.getCostFreight(this.order._id);
			}

			this.isUpdateStatus = await this.methodPaymentUpdateStatus();
		}

		this.blockView = false;
	}

	methodPaymentUpdateStatus() {
		try {
			if (
				this.order.status === "WAIT_DELIVERYMAN" ||
				this.order.status === "RELEASE_SHOPPER" ||
				this.order.status === "ACCEPT_DELIVERYMAN" ||
				this.order.status === "DELIVERY_ROUTE" ||
				this.order.status === "DISPATCH" ||
				this.order.status === "CANCELED" ||
				this.order.status === "FINISHED"
			) {
				return false;
			}

			if (
				this.order.isSchedule &&
				this.dataCurrent < this.order.scheduleCurrent
			) {
				this.tooltipScheduleMessage =
					"Pedidos Agendados podem ser aceitos apartir dia da entrega, aguarde liberação";
				return false;
			} else {
				this.tooltipScheduleMessage = null;
			}

			return true;
		} catch (err) {
			return false;
		}
	}

	nextStatusEmit(status) {
		this.changeStatus.emit({
			status: status,
			order: this.order,
		});
	}

	messageEmit(message: string, type: string) {
		this.orderUpdateMessage.emit({
			message,
			type,
		});
	}

	async confirmDeleteModalShow(content) {
		this.modalService
			.open(content, { ariaLabelledBy: "modal-liberation-order", size: "sm" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
		setTimeout(() => {
			this.changeDetectorRefs.detectChanges();
		}, 750);
	}

	cancelOrder() {
		try {
			if (this.order && this.order._id) {
				this.orderStatusService.cancelOrder(this.order._id).subscribe(
					(result: any) => {
						if (result && result.cancel === false) {
							this.messageEmit(
								"Pedido não pode ser cancelado, por favor contate o suporte",
								"danger"
							);
						} else {
							this.nextStatusEmit("CANCELED");
						}
					},
					(err) => {
						if (err.error && err.error.message) {
							this.messageEmit(`${err.error.message}`, "danger");
						} else {
							this.messageEmit("Não foi possível Cancelar Pedido", "danger");
						}
					}
				);
			}
		} catch (err) {
			this.messageEmit(
				"Não foi possível cancelar, por favor tente mais tarde",
				"danger"
			);
		}
	}

	clickChangeStatus() {
		try {
			this.load = true;
			if (this.order.status === "FINISHED") {
				this.messageEmit(
					"Não é possível Atualizar Pedido já finalizado",
					"danger"
				);
				this.load = false;
				this.modalService.dismissAll();
				return;
			}

			if (this.order.status === "CANCELED") {
				this.messageEmit(
					"Não é possível Atualizar Pedido já Cancelado",
					"danger"
				);
				this.load = false;
				this.modalService.dismissAll();
				return;
			}

			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.messageEmit(
					"Usuário não está cadastrado como shopper, verifique o cadastro",
					"danger"
				);
				this.load = false;
				this.modalService.dismissAll();
				return;
			}

			if (!this.userLogged || !this.userLogged.id) {
				this.messageEmit("Usuário não está logado ou sessão expirou", "danger");
				this.load = false;
				this.modalService.dismissAll();
				return;
			}

			const newStatus = nextOrderStatus(this.order.status);

			if (newStatus && newStatus !== "") {
				let params: orderStatusUpdate = {
					status: newStatus,
					shopper: this.userLogged.id,
				};

				this.orderStatusService.update(this.order._id, params).subscribe(
					(item) => {
						this.nextStatusEmit(newStatus);
						this.load = false;
						this.modalService.dismissAll();
					},
					(err) => {
						this.load = false;
						this.modalService.dismissAll();
						if (err.error && err.error.message) {
							this.messageEmit(`${err.error.message}`, "danger");
						} else {
							this.messageEmit("Não foi possível atualizar Status", "danger");
						}
					}
				);
			} else {
				this.messageEmit("Não foi possível atualizar status", "danger");
				this.load = false;
				this.modalService.dismissAll();
			}
		} catch (err) {
			this.messageEmit("Não foi possível atualizar Status", "danger");
			this.load = false;
			this.modalService.dismissAll();
		}
	}

	// abrir modal de frete ou segue o fluxo de chamar entregador
	clickDelivery() {
		if (this.freight === null) {
			this.messageEmit(
				"Não foi possível verificar status atual de entrega",
				"danger"
			);
			return;
		}

		if (this.freight.freight === true) {
			this.modalFreight.emit(this.freight);
			return;
		}

		// Fluxo Normal chamar entregador ECBR
		this.clickChangeStatus();
	}

	// Modal de Confirmação de Liberação
	async modalLiberationConfirm(content) {
		try {
			this.modalService
				.open(content, {
					ariaLabelledBy: "modal-liberation-order",
					backdrop: "static",
					keyboard: false,
					size: "md",
					windowClass: "modal-liberation-order",
				})
				.result.then(
					(result) => { },
					(reason) => { }
				);
			// setTimeout(() => {
			this.changeDetectorRefs.detectChanges();
			// }, 750);
		} catch (err) { }
	}

	titleStatus = (status) => {
		switch (status) {
			case "WAIT_COMPANY":
				return "Aceitar";
			case "ACCEPT_SHOPPER":
				return "Iniciar Separação";
			case "IN_PREPARATION":
				// return 'Finalizar Separação';
				return "Procurar Entregador";
			case "FINISH_PREPARATION":
				return "Procurar Entregador";
			case "WAIT_DELIVERYMAN":
				return "Buscando entregador";
			case "ACCEPT_DELIVERYMAN":
				return "Liberar entrega";
			case "RELEASE_SHOPPER":
				return "Encomenda com Entregador";
			case "DISPATCH":
				return "Entregador em rota";
			case "DELIVERY_ROUTE":
				return "Entregador em rota";
			case "FINISHED":
				return "Finalizado";
			case "CANCELED":
				return "Cancelado";
			default:
				return "";
		}
	};

	async getOwnDelivery(orderId: string) {
		this.orderStatusService.ownDelivery(orderId).subscribe(
			(result: any) => {
				this.ownDelivery = result.status;
				this.changeDetectorRefs.detectChanges();
			},
			(err) => {
				this.ownDelivery = false;
			}
		);
	}

	async getOlineDelivery(orderId: string) {
		this.orderStatusService.onlineDelivery(orderId).subscribe(
			(result: any) => {
				this.onlineDelivery = result.status;
				this.changeDetectorRefs.detectChanges();
			},
			(err) => {
				this.onlineDelivery = false;
			}
		);
	}

	async getCostFreight(orderId: string) {
		this.orderStatusService.costFreight(orderId).subscribe(
			(result: any) => {
				this.freight = result;
				this.changeDetectorRefs.detectChanges();
			},
			(err) => {
				this.freight = null;
			}
		);
	}

	modalDispachShow(modal) {
		setTimeout(() => {
			this.modalDispach.emit(true);
		}, 300);
	}

	// Utilizar Entregador próprio
	public async confirmDispatch() {
		try {
			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.messageEmit(
					"Usuário não está cadastrado como shopper, verifique o cadastro",
					"danger"
				);
				this.load = false;
				this.modalService.dismissAll();
				this.changeDetectorRefs.detectChanges();
				return;
			}

			if (!this.userLogged || !this.userLogged.id) {
				this.messageEmit("Usuário não está logado ou sessão expirou", "danger");
				this.load = false;
				this.modalService.dismissAll();
				this.changeDetectorRefs.detectChanges();
				return;
			}

			this.btnLoad.emit(true);

			this.orderStatusService
				.update(this.order._id, {
					shopper: this.userLogged.id,
					status: "DISPATCH",
				})
				.subscribe(
					(response) => {
						this.nextStatusEmit("DISPATCH");
						this.btnLoad.emit(false);
						this.modalService.dismissAll();
						this.changeDetectorRefs.detectChanges();
					},
					(err) => {
						if (err.error && err.error.message) {
							this.messageEmit(err.error.message, "danger");
						}
						this.btnLoad.emit(false);
						this.changeDetectorRefs.detectChanges();
					}
				);
		} catch (err) {
			this.messageEmit(
				"Não foi possível Despachar, por favor entre em contato com o suporte",
				"danger"
			);
			this.btnLoad.emit(false);
		}
	}

	// Confirma entrega do pedido para o cliente
	async confirmOrderDelivery() {
		try {
			this.load = true;

			this.orderStatusService
				.update(this.order._id, {
					status: "FINISHED",
				})
				.subscribe(
					(response) => {
						this.load = false;
						this.nextStatusEmit("FINISHED");
						this.changeDetectorRefs.detectChanges();
					},
					(err) => {
						this.load = false;
					}
				);
		} catch (err) {
			this.load = false;
		}
	}

	// Frete pago pela company
	public async freightCompany() {
		this.btnLoad.emit(true);
		const newStatus = nextOrderStatus(this.order.status);

		if (!newStatus || newStatus === "") {
			this.messageEmit("Não foi possível atualizar status", "danger");
			this.load = false;
			this.modalService.dismissAll();
			this.btnLoad.emit(false);
			return;
		}
		this.orderStatusService
			.costFreightService(this.order._id, {
				status: newStatus,
				shopper: this.userLogged.id,
			})
			.subscribe(
				(response) => {
					this.nextStatusEmit(newStatus);
					this.btnLoad.emit(false);
				},
				(err) => {
					this.messageEmit("Não foi possível atualizar status", "danger");
					this.btnLoad.emit(false);
				}
			);
	}

	public async modalPriceDispatch() {
		this.modalService.open(this.infoPriceDispt, {
			size: "md",
			backdrop: "static",
			keyboard: false,
		});

		setTimeout(() => {
			this.changeDetectorRefs.detectChanges();
			window.scroll(0, 200);
			window.scroll(0, 0);
		}, 300);
	}

	public async modalPriceDelivery() {
		this.modalService.open(this.infoPriceDelivery, {
			size: "md",
			backdrop: "static",
			keyboard: false,
		});
		this.changeDetectorRefs.detectChanges();
	}
}
