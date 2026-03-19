import { Component, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import { shuffle } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
// Services
// Widgets model
import { LayoutConfigService, SparklineChartOptions } from './../../../../core/_base/layout';
import { NocService } from './../../../../services/noc.service';
import { DeliveryManService } from './../../../../services/deliveryMan.service';
import { CustomerService } from './../../../../services/customer.service';
import { QueueDeliveryManService } from './../../../../services/queueDeliveryman.service';
import { AccessFlowService } from "./../../../../services/access-flow.service";
import { CompanyService } from "./../../../../services/company.service";

import { Widget4Data } from './../../../partials/content/widgets/widget4/widget4.component';
import { Timeline2Data } from './../../../partials/content/widgets/timeline2/timeline2.component';

import moment from 'moment';

import {
	ApexAxisChartSeries,
	ApexChart,
	ChartComponent,
	ApexDataLabels,
	ApexPlotOptions,
	ApexGrid,
	ApexYAxis,
	ApexTitleSubtitle,
	ApexLegend,
	ApexStroke,
	ApexXAxis,
	ApexFill,
	ApexTooltip,
} from "ng-apexcharts";

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	dataLabels: ApexDataLabels;
	grid: ApexGrid;
	stroke: ApexStroke;
	title: ApexTitleSubtitle;
};

export type ChartOptionsBar = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	plotOptions: ApexPlotOptions;
	yaxis: ApexYAxis;
	xaxis: ApexXAxis;
	fill: ApexFill;
	tooltip: ApexTooltip;
	stroke: ApexStroke;
	legend: ApexLegend;
	title: ApexTitleSubtitle;
};

@Component({
	selector: "kt-noc",
	templateUrl: "./noc.component.html",
	styleUrls: ["./noc.component.scss"],
})
export class NocComponent implements OnInit {
	@ViewChild("chart") chart: ChartComponent;
	public dailyAccess: Partial<ChartOptions>;
	public registeredCompanies: Partial<ChartOptionsBar>;

	widget4_2: Widget4Data;

	orderHours: Timeline2Data;

	dateSales;
	showLoadingDetail = false;

	orderIdSelected;

	timeLeftOrder: number = 30;
	timeLeftOrderDetail: number = 30;
	timeLeftAccessFlow: number = 7;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutConfigService: LayoutConfigService,
		private nocService: NocService,
		private translate: TranslateService,
		private DeliveryManService: DeliveryManService,
		private QueueDeliveryManService: QueueDeliveryManService,
		private CustomerService: CustomerService,
		private AccessFlowService: AccessFlowService,
		private CompanyService: CompanyService
	) {
		const setCategories = [];
		const setSeries = [];

		this.dailyAccess = {
			series: [{
				name: '',
				data: [],
			}],
			chart: {
				id: "realtime",
				height: 250,
				type: "line",
				zoom: {
					enabled: false,
				},
				toolbar: {
					show: false,
				},
				animations: {
					enabled: true,
					easing: "easeinout",
					dynamicAnimation: {
						speed: 1000,
					},
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: "straight",
			},
			title: {
				text: "Acessos diários",
				align: "left",
			},
			grid: {
				row: {
					colors: ["#f3f3f3", "transparent"],
					opacity: 0.5,
				},
			},
		};

		this.registeredCompanies = {
			series: [{
				name: '',
				data: [],
			}],
			chart: {
				type: "bar",
				height: 250,
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: "50%",
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				show: true,
				width: 2,
				colors: ["transparent"],
			},
			yaxis: {
				title: {
					text: "$ (thousands)",
				},
			},
			fill: {
				opacity: 1,
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands";
					},
				},
			},
		};

		this.CompanyService.getGraphicCompanies()
			.toPromise()
			.then(async (data: any) => {
				const categories = [];
				const totalCompanies = [];
				const totalCompaniesEnable = [];

				for await (const company of data) {
					categories.unshift(
						`${("0" + company._id.day).slice(-2)}/${(
							"0" + company._id.month
						).slice(-2)}`
					);
					totalCompanies.unshift(company.total);
					totalCompaniesEnable.unshift(company.enable);
				}

				this.registeredCompanies.xaxis = {
					categories,
				};

				// console.log(categories);
				// console.log(totalCompanies);
				// console.log(totalCompaniesEnable);
				this.registeredCompanies.series = [
					{
						name: "Total companies",
						data: totalCompanies,
					},
					{
						name: "Companies ativas",
						data: totalCompaniesEnable,
					},
				];
			});

		setInterval(() => {
			if (this.timeLeftAccessFlow > 0) {
				this.timeLeftAccessFlow--;
			} else {
				this.timeLeftAccessFlow = 60;
				this.AccessFlowService.getAccessFlow()
					.toPromise()
					.then(async (data: any) => {
						const updateSeries = setSeries;
						updateSeries[29] = data?.data[0]?.accessInfo?.length || 0;

						this.dailyAccess.series = [
							{
								name: "Acessos Diários",
								data: updateSeries,
							},
						];

						this.changeDetectorRefs.detectChanges();
					});
			}
		}, 1000);

		this.AccessFlowService.getAccessFlow()
			.toPromise()
			.then(async (data: any) => {
				for await (const access of data.data) {
					setSeries.unshift(access.accessInfo.length);
					setCategories.unshift(`${("0" + access._id.day).slice(-2)}`);
				}

				this.dailyAccess.xaxis = {
					categories: setCategories,
				};

				this.dailyAccess.series = [
					{
						name: "Acessos Diários",
						data: setSeries,
					},
				];
			});
	}

	async ngOnInit() {
		await this.analyzeOrders();
		await this.showDailySales();
	}

	ngAfterViewInit() {
		setInterval(() => {
			if (this.timeLeftOrder > 0) {
				this.timeLeftOrder--;
				const timerElement = document.getElementById("timer");
				if (timerElement) {
					timerElement.innerHTML = `${this.timeLeftOrder.toString()}`;
				}
			} else {
				this.timeLeftOrder = 30;
				this.refleshOrders();
			}
		}, 1000);

		setInterval(() => {
			if (this.timeLeftOrderDetail > 0) {
				this.timeLeftOrderDetail--;
				const timerDetailElement = document.getElementById("timerDetail");
				if (timerDetailElement) {
					timerDetailElement.innerHTML = `${this.timeLeftOrderDetail.toString()}`;
				}
			} else {
				this.timeLeftOrderDetail = 30;
				this.refleshToSee();
			}
		}, 1000);
	}

	// button  ver
	async toSee(id) {
		this.timeLeftOrderDetail = 30;
		this.orderIdSelected = id;
		this.showLoadingDetail = true;

		// ao clicar button da function, vai para cima do layout
		document.body.scrollTop = 0; // For Safari
		document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

		const see = await this.nocService.getListOrdersToSee(id).toPromise();

		const ordersShuffle = [];
		// Etapa 1
		const step1 = await this.showOrderStart(see);
		ordersShuffle.push(step1);

		// Etapa 2
		const step2 = await this.showOrderShopper(see);
		if (step2) {
			ordersShuffle.push(step2);
		}

		// Etapa 3
		const step3 = await this.showOrderdeliveriesMan(see);
		if (step3 && Array.isArray(step3)) {
			for await (const its of step3) {
				ordersShuffle.push(its);
			}
		}

		// Etapa 4
		const step4 = await this.showDeliveryMan(see);
		if (step4) {
			ordersShuffle.push(step4);
		}

		// @ts-ignore
		this.orderHours = ordersShuffle;
		this.showLoadingDetail = false;
		this.changeDetectorRefs.detectChanges();
	}

	// Etapa 1
	showOrderStart(item) {
		return new Promise(async (resolve, reject) => {
			const orderStartTime = moment(item.createdAt, "YYYY-MM-DD HH:mm")
				.subtract(3, "h")
				.format("HH:mm");
			let text = `Pedido realizado ás ${orderStartTime}`;

			const person =
				item.customer && item.customer.person && item.customer.person.name
					? item.customer.person.name
					: "Cliente não identificado";
			text += `, pelo cliente: ${person}`;

			const company =
				item.company && item.company.name
					? item.company.name
					: "Estabelecimento não identificado";
			text += `, no estabelecimento: ${company}`;

			const getAddress: any = await this.CustomerService.getCustomerAddress(
				item.customerDelivery
			).toPromise();
			const customerDelivery =
				getAddress && getAddress.address
					? getAddress.address
					: "Endereço não definido";
			text += `. Endereço de entrega: ${customerDelivery}`;

			const fd = {
				time: orderStartTime,
				icon: "fa fa-genderless kt-font-success",
				text,
			};

			resolve(fd);
		});
	}

	// Etapa 2
	showOrderShopper(item) {
		return new Promise(async (resolve, reject) => {
			if (!item.shopper || !item.shopper.person || !item.shopper.person.name) {
				resolve(false);
				return;
			}

			const orderStartTimeShopper = moment(item.createdAt, "YYYY-MM-DD HH:mm")
				.subtract(3, "h")
				.format("HH:mm");
			let text = `Pedido recebido às ${orderStartTimeShopper}`;

			const shopper =
				item.shopper && item.shopper.person && item.shopper.person.name
					? item.shopper.person.name
					: "Shopper não identificado";
			text += ` pelo shopper: ${shopper}`;

			const fd = {
				time: orderStartTimeShopper,
				icon: "fa fa-genderless kt-font-success",
				text,
			};

			resolve(fd);
		});
	}

	// Etapa 3
	showOrderdeliveriesMan(item) {
		return new Promise(async (resolve, reject) => {
			const deliveries = [];
			const data: any = await this.QueueDeliveryManService.getQueueDeliveryManWithOrder(
				item._id
			).toPromise();

			if (data && Array.isArray(data) && data[0]) {
				const { historicDeliveryMan } = data[0];
				for await (const deliverys of historicDeliveryMan) {
					const deliveryMan: any = await this.DeliveryManService.getDeliveryMan(
						deliverys._id
					).toPromise();

					const deliveryName =
						deliveryMan.person && deliveryMan.person.name
							? deliveryMan.person.name
							: "Entregador não identificado";

					const orderStartTimeShopper =
						moment(deliverys.data, "YYYY-MM-DD HH:mm")
							.subtract(3, "h")
							.format("HH:mm") || "--:--";

					const text = `Pedido enviado para o entregador: ${deliveryName}`;
					const fd = {
						time: orderStartTimeShopper,
						icon: "fa fa-genderless kt-font-danger",
						text,
					};

					deliveries.push(fd);
				}
			}

			resolve(deliveries);
		});
	}

	// Etapa 4
	showDeliveryMan(item) {
		return new Promise(async (resolve, reject) => {
			if (
				!item.deliveryMan ||
				!item.deliveryMan.person ||
				!item.deliveryMan.person.name
			) {
				resolve(false);
				return;
			}

			const data: any = await this.QueueDeliveryManService.getQueueDeliveryManWithOrder(
				item._id
			).toPromise();
			if (data && Array.isArray(data) && data[0]) {
				const { deliveryMan, lastData } = data[0];
				const orderDel =
					moment(lastData, "YYYY-MM-DD HH:mm")
						.subtract(3, "h")
						.format("HH:mm") || "--:--";
				let text = `Pedido aceito pelo `;

				const getDeliveryMan: any = await this.DeliveryManService.getDeliveryMan(
					deliveryMan
				).toPromise();

				const showDeliveryMan =
					getDeliveryMan && getDeliveryMan.person && getDeliveryMan.person.name
						? getDeliveryMan.person.name
						: "Entragador aceitou pedido";
				text += `entregador:  ${showDeliveryMan}`;

				const getAddress: any = await this.CustomerService.getCustomerAddress(
					item.customerDelivery
				).toPromise();
				const customerDelivery =
					getAddress && getAddress.address
						? getAddress.address
						: "Endereço não definido";
				text += ` Endereço: ${customerDelivery}`;

				const fd = {
					time: orderDel,
					icon: "fa fa-genderless kt-font-success",
					text,
				};

				resolve(fd);
			} else {
				resolve(false);
			}
		});
	}

	// Mostra 1° estapa trazendo a list com itens necessários do pedido.
	async analyzeOrders() {
		const nocList: any = await this.nocService.getActived("").toPromise();

		const ordersShuffle = [];

		for await (const item of nocList) {
			const person =
				item.customer && item.customer.person && item.customer.person[0]
					? item.customer.person[0]
					: undefined;
			const title =
				person && person.name ? person.name : "Cliente não localizado";

			const total =
				item.payment && item.payment.total
					? item.payment.total
					: "total do pagamento não definido";

			const status = item.status
				? this.translate.instant(item.status)
				: "Status off";

			const image =
				item.company && item.company.images
					? item.company.images
					: "Imagens não encontradas";

			let dateOrder;

			if (
				item.createdAt &&
				moment(item.createdAt, "YYYY-MM-DD HH:mm").isValid()
			) {
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

			ordersShuffle.push({
				title: String(`${item.order_number} - ` + title),
				desc: String(status),
				value: Number(total),
				pic: String(image),
				date: dateOrder,
				_id: item._id,
			});
		}

		// @ts-ignore
		this.widget4_2 = ordersShuffle;
		this.changeDetectorRefs.detectChanges();
	}

	async showDailySales() {
		const salesList: any = await this.nocService.getListChartNoc().toPromise();

		const labels = [];
		const dataFinished = [];
		const dataTotal = [];

		for await (const item of salesList) {
			const labelsSales = moment(item.start, "YYYY-MM-DD HH:mm")
				.subtract(3, "h")
				.format("DD/MM HH:mm");
			labels.push(labelsSales);

			dataFinished.push(item.finished);
			dataTotal.push(item.total);
		}

		const salesData = {
			labels,
			datasets: [
				{
					backgroundColor: "#00B0ED",
					data: dataFinished,
				},
				{
					backgroundColor: "#A3A3A3",
					data: dataTotal,
				},
			],
		};

		// @ts-ignore
		this.dateSales = salesData;
		this.changeDetectorRefs.detectChanges();
	}

	refleshOrders() {
		this.analyzeOrders();
	}

	refleshToSee() {
		if (!this.orderIdSelected) {
			return;
		}
		this.toSee(this.orderIdSelected);
	}

	clickRefleshOrders() {
		this.timeLeftOrder = 30;
		this.refleshOrders();
	}

	clickRefleshOrdersDetail() {
		this.timeLeftOrderDetail = 30;
		this.refleshToSee();
	}
}
