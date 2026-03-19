import {
	Component,
	OnInit,
	OnDestroy,
	ChangeDetectorRef,
	ViewChild,
	Directive,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { filter, debounceTime } from "rxjs/operators";
import moment from "moment";
import "moment/locale/pt-br";
import { ToastrService } from "ngx-toastr";
import { NgxPermissionsService } from "ngx-permissions";

import { ShoppingService } from "./../../../../services/shopping/shopping.service";
import { OrderStatusService } from "./../../../../services/orderStatus/orderStatus.service";
import { DeliveryManService } from "./../../../../services/deliveryMan.service";
import { ChatService } from "./../../../../services/chat.service";
import { ShopperService } from "./../../../../services/shopper.service";
import { ShoppingCardService } from "./../../../../services/shopping/shopping-card.service";

import { Alert } from "./../../../../../models/alert";
import { Customer } from "./../../../../../models/customer";
import { AlertChat } from "./../../../../../models/alertChat";
import { Company } from "./../../../../../models/company/company";
import { Chat } from "./../../../../../models/chat";
import { orderMessage } from "./../../../../../models/order/orderStatus.type";
import databaseSync from "../../../../services/firebase/FirebaseDatabaseSync";
import { environment } from "./../../../../../environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

// components
import { OrderUpdateComponent } from "./order-update/order-update.component";

// utils
import { getProducts } from "../util/cardUtil";
import {
	getItemEdit,
	subTotalCart,
	totalDiscount,
	totalComplements,
	schedule,
	couponPrice,
	customer,
	priceDelivery,
	getFreeShippingBonus,
	totalOrder,
	customerId,
	phoneCustomer,
	address,
	number,
	addressComplement,
	formatPriceToDouble,
} from "../util/cardItens";
import { Subject } from "rxjs";

@Component({
	selector: "kt-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit, OnDestroy {
	alert: Alert = undefined;
	companies: Company[] = [];
	companyType;
	companyValue: string;
	customer: Customer[] = [];
	customerValue: string;
	typeAction = "create";
	formSubmitCartItem = false;
	formSubmitCart = false;
	dataSource;
	formData;
	formDataCart;
	dataSourceList = [];
	displayedColumns = [
		"status",
		"image",
		"numberOrder",
		"dateOrder",
		"company",
		"price",
		"customer",
		"action",
	];
	displayedColumnsModal = ["image", "product", "amount", "price"];
	files: Set<File>;
	pageSize = 20;
	pageCurrent = 1;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	cartItem;
	cartItemIdToDelete;
	includAlertChat = new Set();
	alertChat: AlertChat[] = [];

	formChat;
	formSubmitChat = false;
	showChat: boolean;
	loaderChat: boolean;
	chatConversation;
	chatTarget;
	sendLoaderMessage;

	companyStorage = null;
	firebaseUnsubscribe = null;
	firebaseInit = null;
	btnLoad = false;
	freight;
	isShopper = false;
	showCompanyName = true;
	userInfo = null;
	listCompanies: any;
	routerEvent: any;
	loading = false;

	@ViewChild("confirmDispatchModal", { static: true })
	confirmDispatchModal: Directive;
	@ViewChild("freightModal", { static: false })
	freightModal: OrderUpdateComponent;
	@ViewChild("orderChild", { static: false })
	orderUpdateComponent: OrderUpdateComponent;

	// Um Item do Carrinho
	oneCardItemCurrent = null;
	load = false;
	ELEMENT_DATA = [];
	eventCartItem: Subject<any> = new Subject<any>();
	firebase = null;

	constructor(
		private permissionsService: NgxPermissionsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private route: ActivatedRoute,
		private router: Router,
		private toastr: ToastrService,
		private modalService: NgbModal,
		private shoppingService: ShoppingService,
		private deliveryManService: DeliveryManService,
		private ChatService: ChatService,
		private ShopperService: ShopperService,
		private shoppingCardService: ShoppingCardService,
		private orderStatusService: OrderStatusService
	) {
		this.companyType = this.route.snapshot.params.type;
		// Filtra quais pedidos deve ser mostrado

		this.firebase = databaseSync();
	}

	async eventRouteType() {
		this.routerEvent = this.router.events
			.pipe(filter((e) => e instanceof NavigationEnd))
			.subscribe(async (e) => {
				this.cartItem = null;
				const atualPage = e["url"];

				switch (atualPage) {
					case "/shopping-cart/restaurant":
						this.companyType = "restaurant";
						this.clearList();
						await this.orders(1, this.pageSize, this.companyType);
						break;
					case "/shopping-cart/supermarket":
						this.companyType = "supermarket";
						this.clearList();
						await this.orders(1, this.pageSize, this.companyType);
						break;
					default:
						break;
				}
			});
	}

	async ngOnInit() {
		this.eventRouteType();
		this.cartItem = null;
		this.listCompanies = [];

		if (
			!this.companyType ||
			["restaurant", "supermarket", "accessories"].indexOf(this.companyType) < 0
		) {
			this.toastr.error("Rota inválida!", "Falha!");
			return;
		} else {
			this.clearList();
			this.orders(1, this.pageSize, this.companyType);
		}

		this.userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (this.userInfo && this.userInfo.shopper) {
			this.isShopper = true;
		}

		this.firebaseChat();

		this.orderEvent();
		// this.updateListInterval();
	}

	async ngOnDestroy() {
		try {
			if (this.routerEvent) {
				try {
					console.log("destruindo routerEvent");
					this.routerEvent.unsubscribe();
					this.routerEvent = null;
				} catch (err) {}
			}

			this.destroyFirebaseRef();
		} catch (err) {}
	}

	// updateListInterval() {
	// 	setInterval(async () => {
	// 		await this.orders(1, this.pageSize, this.companyType);
	// 	}, 300000);
	// }

	async orderEvent() {
		const permissions = this.permissionsService.getPermissions();

		if (permissions && !permissions["accessToFranchises"] && !permissions["accessToRoot"]) {
			if (
				this.userInfo &&
				this.userInfo.companies &&
				Array.isArray(this.userInfo.companies) &&
				this.userInfo.companies.length > 0
			) {
				this.listCompanies = this.userInfo.companies;
			} else if (this.userInfo && this.userInfo.company) {
				this.listCompanies = [this.userInfo.company];
			}

			if (this.listCompanies.length > 0) {
				let self = this;
				this.listCompanies.forEach((item: any) => {
					this.firebase
						.ref(`${environment.firebasePath}newOrder/${item._id}`)
						.on("value", async (snapshot) => {
							try {
								if (snapshot.val() !== null) {
									await self.clearList();
									await self.orders(1, self.pageSize, self.companyType);
								}
							} catch (err) {}
						});

					this.firebase
						.ref(`${environment.firebasePath}order/company/${item._id}`)
						.on("value", async (snapshot) => {
							try {
								if (snapshot && snapshot.val() !== null) {
									try {
										let val = snapshot.val();

										self.toastr.success(
											"Pedido",
											`O Pedido ${val.number} foi atualizado para ${val.txtStatus}`
										);
										await self.clearList();
										await self.orders(1, self.pageSize, self.companyType);
									} catch (err) {}
								}
							} catch (err) {}
						});
				});
			}
		}
	}

	/**
	 * Get data orders
	 */
	async orders(pageIn, pageOut, companyType, reloadCartParams = null) {
		if (this.dataSourceList && this.dataSourceList.length > 0 && pageIn === 1) {
			this.dataSourceList = [];
			this.ELEMENT_DATA = [];
			this.totalLength = 0;
			// this.cartItem = null;
			this.changeDetectorRefs.detectChanges();
		}

		this.loading = true;
		this.changeDetectorRefs.detectChanges();
		this.shoppingService
			.getOrders(pageIn, pageOut, companyType, "", "createdAt:-1")
			.subscribe(async (data: any) => {
				if (data && data.list && Array.isArray(data.list)) {
					if (data.list.length > 0) {
						data.list.forEach((item, index) => {
							// Validate date
							let dateOrder = "-";
							if (item.createdAt && moment(item.createdAt, "YYYY-MM-DD HH:mm").isValid()) {
								if (moment(item.createdAt).isSame(moment(), "day")) {
									dateOrder = moment(item.createdAt, "YYYY-MM-DD HH:mm")
										.subtract(3, "h")
										.format("HH:mm");
								} else {
									dateOrder = moment(item.createdAt, "YYYY-MM-DD HH:mm")
										.subtract(3, "h")
										.format("DD/MM HH:mm");
								}
							}

							// Valid customer name
							const customerName =
								item.customer &&
								item.customer.person &&
								Array.isArray(item.customer.person) &&
								item.customer.person[0] &&
								item.customer.person[0].name
									? item.customer.person[0].name
									: "-";

							const priceCompany =
								item.payment && item.payment.totalCompany
									? item.payment.totalCompany.toLocaleString("pt-br", {
											style: "currency",
											currency: "BRL",
									  })
									: "-";

							const halfAnHourAgo = moment().subtract(30, "minutes").toDate().getTime();

							let missing;

							let colorStatus = "badge-light";
							switch (item.status) {
								case "FINISHED":
									colorStatus = "badge-success";
									break;
								case "WAIT_COMPANY":
									colorStatus = "badge-warning";
									break;
								case "IN_PREPARATION":
								case "ACCEPT_SHOPPER":
									colorStatus = "badge-primary";
									break;
								case "CANCELED":
									colorStatus = "badge-danger";
									break;
								case "AWAIT_DELIVERYMAN":
									colorStatus = "badge-dark";
									break;
								default:
									colorStatus = "badge-light";
									break;
							}

							let addItem = {
								_id: item._id,
								position: index + 1,
								typePayment: item.typePayment ? item.typePayment : "BRASPAG",
								image:
									item.company && item.company.images && item.company.images[0]
										? item.company.images[0]
										: undefined,
								customer: customerName,
								dateOrder,
								colorStatus,
								price: priceCompany,
								cashChange: item.payment && item.payment.cashChange ? item.payment.cashChange : 0,
								company: item.company && item.company.name ? item.company.name : "-",
								numberOrder: item.order_number ? item.order_number : "-",
								status: item.status ? item.status : "-",
								missing: missing ? `${missing}:00` : undefined,
								shoppingCart: item.shoppingCart,
							};

							this.ELEMENT_DATA.push(addItem);

							this.dataSourceList = this.ELEMENT_DATA;
							this.totalLength = data.total || 0;
							this.loading = false;
							this.changeDetectorRefs.detectChanges();
						});
					} else {
						this.loading = false;
						this.changeDetectorRefs.detectChanges();
					}
				}
			});

		if (this.cartItem && this.cartItem._id) {
			await this.getListCartItem(this.cartItem);
		}
	}

	isReloadCartItem(item, params) {
		if (params === null || !params.cartItem || !params.cartItem._id) {
			return;
		}

		if (params.cartItem._id === item._id) {
			this.getListCartItem(item);
		}
	}

	// changePage(event) {
	// 	this.pageSize = event.pageSize;
	// 	this.orders(event.pageIndex + 1, event.pageSize, this.companyType);
	// }

	async getListCartItem(cart) {
		try {
			this.showChat = false;
			this.cartItem = { ...cart };

			const cartDetails: any = await this.shoppingService.getOrderById(cart._id).toPromise();

			if (cartDetails.cart && cartDetails.cart.length) {
				this.updateConversationChat(cartDetails.cart[0].shoppingCart);
			}

			if (cartDetails) {
				if (cartDetails.cart && Object.keys(cartDetails.cart).length > 0) {
					this.cartItem.products = await getProducts(cartDetails.cart);
					this.cartItem.shoppingCart = cartDetails.cart[0].shoppingCart;
				}

				this.cartItem.couponPrice = couponPrice(cartDetails);
				this.cartItem.priceDelivery = priceDelivery(cartDetails);
				this.cartItem.freeShippingBonus = getFreeShippingBonus(cartDetails);
				this.cartItem.customer = customer(cartDetails);

				if (cartDetails.order) {
					if (cartDetails.order.typeSchedule === "DELIVERY") {
						this.cartItem.typeSchedule = "Delivery";
					} else {
						this.cartItem.typeSchedule = "Cliente irá retirar no local";
					}

					if (cartDetails.order.company && cartDetails.order.company.location) {
						this.cartItem.companyLocation = cartDetails.order.company.location;
					}

					if (cartDetails.order.customerDelivery && cartDetails.order.customerDelivery.location) {
						this.cartItem.customerLocation = cartDetails.order.customerDelivery.location;
					}

					if (cartDetails.order.payment) {
						if (cartDetails.cart && cartDetails.cart.length > 0) {
							this.cartItem.subTotal = subTotalCart(cartDetails);
						} else {
							this.cartItem.subTotal = cartDetails?.order.payment?.totalCompany || 0;
						}

						this.cartItem.totalDiscount = totalDiscount(cartDetails);
						this.cartItem.totalComplements = totalComplements(cartDetails);
						this.cartItem.valueTip = 0;
						this.cartItem.serviceCharge = 0;

						if (cartDetails.order.payment && cartDetails.order.payment.fncTypePayment) {
							this.cartItem.fncTypePayment = cartDetails.order.payment.fncTypePayment;
						}

						if (cartDetails.order.payment && cartDetails.order.payment.cashChange) {
							this.cartItem.cashChange = cartDetails.order.payment.cashChange;
						}

						// Gorjeta
						if (cartDetails.order.payment.valueTip) {
							this.cartItem.valueTip = cartDetails.order.payment.valueTip;
						}

						// Taxa de serviço
						if (cartDetails.order.payment.serviceCharge) {
							this.cartItem.serviceCharge = cartDetails.order.payment.serviceCharge;
						}

						// Total
						this.cartItem.totalCompany = totalOrder(
							this.cartItem.subTotal,
							this.cartItem.totalComplements,
							this.cartItem.serviceCharge,
							this.cartItem.valueTip,
							this.cartItem.priceDelivery,
							this.cartItem.couponPrice,
							this.cartItem.totalDiscount,
							this.cartItem.freeShippingBonus
						);
					}

					this.cartItem.totalDiff = cartDetails.order.payment.total;
					this.cartItem.totalDiff = this.cartItem.totalCompany - this.cartItem.totalDiff;

					if (cartDetails.order.shoppingCart && cartDetails.order.shoppingCart.schedule) {
						this.cartItem.schedule = schedule(cartDetails);
						this.cartItem.isSchedule = true;

						this.cartItem.scheduleCurrent = moment(
							cartDetails.order.shoppingCart.schedule.deliveryDate
						)
							.utc()
							.subtract(3, "hours")
							.format("YYYY-MM-DD");
					} else {
						this.cartItem.isSchedule = false;
					}

					if (cartDetails.order.deliveryMan) {
						this.cartItem.deliveryMan = await this.deliveryManService
							.getDeliveryMan(cartDetails.order.deliveryMan)
							.toPromise();
					}
				}
			}

			this.cartItem.status = cartDetails.order.status;
			this.cartItem.customerId = customerId(cartDetails);
			this.cartItem.phoneCustomer = phoneCustomer(cartDetails);
			this.cartItem.address = address(cartDetails);
			this.cartItem.number = number(cartDetails);

			this.cartItem.complement = addressComplement(cartDetails);

			this.cartItem.referencePoint =
				cartDetails.order &&
				cartDetails.order.customerDelivery &&
				cartDetails.order.customerDelivery.referencePoint
					? cartDetails.order.customerDelivery.referencePoint
					: null;
			this.cartItem.note =
				cartDetails.order && cartDetails.order.note ? cartDetails.order.note : null;

			this.changeDetectorRefs.detectChanges();
			this.eventCartItem.next(this.cartItem);

			// console.log("order_number", this.cartItem.numberOrder);
		} catch (err) {}
	}

	closeAlert() {
		this.alert = null;
	}

	async updateConversationChat(shoppingCart: string, newMessage?: Chat) {
		this.chatConversation = undefined;

		if (shoppingCart) {
			this.loaderChat = true;

			if (newMessage) {
				this.chatConversation.push(newMessage);
			}

			const chatConversation = await this.ChatService.getChatConversation(shoppingCart).toPromise();

			this.chatConversation = chatConversation;
			this.loaderChat = false;
			this.sendLoaderMessage = false;
			this.changeDetectorRefs.detectChanges();

			const chatMessage = document.getElementsByClassName("chat-messages")[0];

			if (chatMessage) {
				chatMessage.scrollTo(0, chatMessage.scrollHeight);
			}
		}
	}

	async cancelOrder(cartItem: any) {
		const { _id } = cartItem;
		return new Promise((resolve, reject) => {
			try {
				if (confirm("Realmente deseja cancelar esse pedido?")) {
					this.orderStatusService
						.cancelOrder(_id)
						.toPromise()
						.then((response: any) => {
							const { status, message } = response;

							if (status === 403) {
								this.toastr.warning(message, "Falhou");
							}
							this.changeDetectorRefs.detectChanges();
							return resolve(null);
						})
						.catch((err) => {
							const msg = err?.error?.message || "Erro ao cancelar pedido";
							this.toastr.error(msg, "Falhou");
							return reject(null);
						});
				} else {
					return resolve(null);
				}
			} catch (error) {
				this.toastr.error("Erro ao cancelar pedido", "Falhou");
				return reject(null);
			}
		}).catch((err) => {
			this.toastr.error("Erro ao cancelar pedido", "Falhou");
		});
	}

	async openChat(item: string, numberOrder?: number) {
		return new Promise(async (resolve) => {
			this.formChat = new FormGroup({
				message: new FormControl("", [Validators.required]),
			});
			this.showChat = !this.showChat;
			this.changeDetectorRefs.detectChanges();

			if (this.showChat === false) {
				this.chatTarget = undefined;
			}

			if (item) {
				if (numberOrder) {
					this.chatTarget = numberOrder;
					this.alertChat.find((alert, index): any => {
						if (alert.order_number === numberOrder) {
							this.alertChat.splice(index);
						}
					});
				}
				await this.updateConversationChat(item);
			}

			resolve(true);
		});
	}

	async sendMessageChat({ message }) {
		try {
			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.toastr.warning("Usuário não está cadastrado como shopper, verifique o cadastro");
				return;
			}

			this.sendLoaderMessage = true;
			const { _id } = this.companyStorage;
			const { shoppingCart, customerId, numberOrder } = this.cartItem;

			const data: Chat = {
				message,
				type: "text",
				person: "shopper",
				personId: userInfo.shopper,
				personSend: "customer",
				personSendId: customerId,
				shoppingCart,
				read: false,
				readSend: true,
				order_number: numberOrder,
			};

			this.ChatService.sendChatConversation(data).toPromise();
			this.formChat.reset();
			await this.updateConversationChat(shoppingCart, data);
		} catch (err) {
			this.sendLoaderMessage = false;
		}
	}

	openPrintOrder(item) {
		try {
			if (item.status && item.status === "WAIT_COMPANY") {
				this.toastr.warning("Primeiro você deve aceitar o pedido!", "Novo pedido");
				return;
			} else {
				// console.log('Print Atual', item);
				localStorage.setItem("@print-order", JSON.stringify(item));
				let urlPrint = `/shopping-cart/${this.companyType}/print`;
				window.open(urlPrint, "_blank");
			}
		} catch (err) {}
	}

	orderUpdateMessageEvent(itemMessage: orderMessage) {
		try {
			if (itemMessage.type === "success") {
				this.toastr.success(itemMessage.message);
			} else {
				this.toastr.warning(itemMessage.message);
			}

			window.scrollTo(0, 0);
		} catch (err) {}
	}

	async changeStatusEvent(item: any) {
		try {
			let cartNew: any = { ...item };
			cartNew.order.status = cartNew.status;

			if (item && item.status && item.status === "CANCELED") {
				this.toastr.success("Pedido Cancelado com Sucesso!", "Sucesso!");
				window.scrollTo(0, 0);
				this.clearList();
				this.orders(1, this.pageSize, this.companyType);

				this.firebase
					.ref(`${environment.firebasePath}newOrder/${this.companyStorage._id}`)
					.remove();

				if (this.cartItem && this.cartItem._id === cartNew.order._id) {
					await this.getListCartItem(this.cartItem);
				}

				return;
			}

			if (item && item.status) {
				this.toastr.success("Pedido Atualizado");

				window.scrollTo(0, 0);
				this.clearList();
				await this.orders(1, this.pageSize, this.companyType, {
					cartItem: this.cartItem,
				});
			} else {
				this.toastr.warning("Não foi possível atualizar");
				window.scrollTo(0, 0);
			}
		} catch (err) {}
	}

	btnLoadEvent(event: boolean) {
		this.btnLoad = event;
		if (event === false) {
			this.modalService.dismissAll();
		}

		console.log("btnLoadEvent", event);
		this.changeDetectorRefs.detectChanges();
	}

	modalDispachEvent() {
		this.modalService.open(this.confirmDispatchModal, {
			ariaLabelledBy: "modal-dispath-order",
			size: "md",
			backdrop: "static",
			keyboard: false,
		});

		setTimeout(() => {
			this.changeDetectorRefs.detectChanges();
			window.scroll(0, 200);
			window.scroll(0, 0);
		}, 200);
	}

	confirmDispatch(modal) {
		try {
			modal.dismiss("Cross click");
			setTimeout(() => {
				this.orderUpdateComponent.confirmDispatch();
			}, 300);
		} catch (err) {}
	}

	modalFreightEvent(event: any) {
		this.freight = event;
		this.modalService.open(this.freightModal, {
			ariaLabelledBy: "modal-dispath-order",
			size: "md",
			backdrop: "static",
			keyboard: false,
		});

		this.changeDetectorRefs.detectChanges();
	}

	freightCompany() {
		try {
			this.orderUpdateComponent.freightCompany();
		} catch (err) {}
	}

	async newFormData() {
		return new Promise(async (resolve) => {
			this.formData = new FormGroup({
				_id: new FormControl(""),
				amount: new FormControl("", [Validators.required]),
				price: new FormControl("", [Validators.required]),
			});

			resolve(true);
		});
	}

	async newFormDataCart() {
		return new Promise(async (resolve) => {
			this.formDataCart = new FormGroup({
				_id: new FormControl(""),
				barCode: new FormControl("", [Validators.required]),
				name: new FormControl("", [Validators.required]),
				amount: new FormControl("", [Validators.required]),
				price: new FormControl("", [Validators.required]),
				note: new FormControl("", [Validators.required]),
			});

			resolve(true);
		});
	}

	// modal abrir edit/create
	async upSertCartItemModalShow(content, cartItem, type = "create") {
		this.typeAction = type;
		this.oneCardItemCurrent = cartItem;
		this.formSubmitCartItem = false;
		await this.newFormData();
		this.formData.reset();

		if (cartItem) {
			this.formData.patchValue({
				_id: cartItem._id,
				amount: cartItem.amount,
				price: cartItem.price,
			});
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-cartItem", size: "lg" })
			.result.then(
				() => {},
				() => {}
			);
	}

	async upSertCartItem() {
		try {
			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.toastr.warning("Usuário não está cadastrado como shopper, verifique o cadastro");
				return;
			}

			this.load = true;
			let cardId = this.oneCardItemCurrent._id;
			let itens = { ...this.formData.value };
			itens.product = this.oneCardItemCurrent.productId;
			let edit = getItemEdit(itens, this.companyType);

			await this.shoppingCardService.changeItem(userInfo.shopper, cardId, edit).toPromise();

			// Atualizar Lista
			this.clearList();
			this.orders(1, this.pageSize, this.companyType, {
				cartItem: this.cartItem,
			});

			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success("Editado com Sucesso");
		} catch (err) {
			this.load = false;
			this.toastr.error("Não foi possível alterar item");
		}
	}

	// Modal para deletar itens do carrinho
	async confirmDeleteModalShow(content, cartItem) {
		this.oneCardItemCurrent = cartItem;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-cartItem", size: "sm" })
			.result.then(
				() => {},
				() => {}
			);
	}

	async deleteCartItem() {
		try {
			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.toastr.warning("Usuário não está cadastrado como shopper, verifique o cadastro");
				return;
			}

			this.load = true;
			await this.shoppingCardService
				.deleteItem(userInfo.shopper, this.oneCardItemCurrent._id)
				.toPromise();

			// Atualizar Lista
			this.clearList();
			this.orders(1, this.pageSize, this.companyType, {
				cartItem: this.cartItem,
			});

			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success("Removido com Sucesso");
		} catch (err) {
			this.load = false;
			this.toastr.error("Não foi possível alterar item");
		}
	}

	// Modal de adicionar Item.
	async upSertCartAddModalShow(content, cart, type = "create") {
		this.typeAction = type;
		this.formSubmitCartItem = false;
		await this.newFormDataCart();
		this.formDataCart.reset();

		if (cart) {
			this.formDataCart.patchValue({
				_id: cart._id,
				barCode: cart.barCode,
				name: cart.name,
				amount: cart.amount,
				price: cart.price,
				note: cart.note,
			});
		}

		this.modalService.open(content, { ariaLabelledBy: "modal-cartItem", size: "lg" }).result.then(
			() => {},
			() => {}
		);
	}

	async upSertCartAdd(cartItem) {
		try {
			let userInfo = localStorage.getItem("@user-info")
				? JSON.parse(localStorage.getItem("@user-info"))
				: undefined;

			if (!userInfo || !userInfo.shopper) {
				this.toastr.warning("Usuário não está cadastrado como shopper, verifique o cadastro");
				return;
			}

			this.load = true;
			let cardId = this.cartItem.shoppingCart;

			await this.shoppingCardService
				.addItem(userInfo.shopper, cardId, {
					name: cartItem.name,
					barcode: cartItem.barCode,
					amount: cartItem.amount,
					price: cartItem.price,
					type: this.companyType,
				})
				.toPromise();

			// Atualizar Lista
			this.clearList();
			this.orders(1, this.pageSize, this.companyType, {
				cartItem: this.cartItem,
			});

			this.load = false;
			this.modalService.dismissAll();
			this.toastr.success("Adicionado com Sucesso");
		} catch (err) {
			this.load = false;
			this.toastr.error("Não foi possível alterar item");
		}
	}

	sendRouteInGoogleMap() {
		if (!this.cartItem.companyLocation || !this.cartItem.customerLocation) {
			this.toastr.warning("Não foi possível localizar coordenadas");
			return;
		}

		let origin = `${this.cartItem.companyLocation.coordinates[1]},${this.cartItem.companyLocation.coordinates[0]}`;
		let destination = `${this.cartItem.customerLocation.coordinates[1]},${this.cartItem.customerLocation.coordinates[0]}`;

		window.open(
			`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
		);
	}

	// new Firebase Chat
	async firebaseChat() {
		const permissions = this.permissionsService.getPermissions();

		if (permissions && !permissions["accessToFranchises"] && !permissions["accessToRoot"]) {
			if (
				this.userInfo &&
				this.userInfo.companies &&
				Array.isArray(this.userInfo.companies) &&
				this.userInfo.companies.length > 0
			) {
				this.listCompanies = this.userInfo.companies;
			} else if (this.userInfo && this.userInfo.company) {
				this.listCompanies = [this.userInfo.company];
			}

			if (this.listCompanies.length > 0) {
				this.listCompanies.forEach((item) => {
					this.firebase
						.ref(`${environment.firebasePath}chat/company/${item._id}`)
						.on("value", async (snapshot) => {
							try {
								if (snapshot.val() !== null) {
									const { order } = snapshot.val();
									if (order !== this.chatTarget) {
										this.alertChat.push({
											order_number: order,
										});
									}

									const data = this.cartItem;
									if (data) {
										await this.updateConversationChat(data.shoppingCart);
									}
									this.changeDetectorRefs.detectChanges();
								}
							} catch (err) {}
						});
				});
			}
		}
	}

	destroyFirebaseRef() {
		try {
			if (this.listCompanies.length > 0) {
				this.listCompanies.forEach((item) => {
					this.firebase.ref(`${environment.firebasePath}chat/company/${item._id}`).off();

					this.firebase.ref(`${environment.firebasePath}order/company/${item._id}`).off();
				});
			}
		} catch (err) {
			console.log("destroyFirebaseRef", err);
		}
	}

	onScroll() {
		if (this.loading) return false;
		this.pageCurrent = this.pageCurrent + 1;
		this.orders(this.pageCurrent, this.pageSize, this.companyType);
	}

	clearList() {
		this.dataSourceList = [];
		this.ELEMENT_DATA = [];
		this.totalLength = 0;
		this.changeDetectorRefs.detectChanges();
	}
}
