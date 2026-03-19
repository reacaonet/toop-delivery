import {
	Component,
	OnInit,
	ViewChild,
	ChangeDetectorRef,
	Input,
} from "@angular/core";

import {
	ApexAxisChartSeries,
	ApexChart,
	ChartComponent,
	ApexDataLabels,
	ApexPlotOptions,
	ApexYAxis,
	ApexTitleSubtitle,
	ApexLegend,
	ApexStroke,
	ApexXAxis,
	ApexFill,
	ApexTooltip,
} from "ng-apexcharts";
import { ShoppingService } from "../../../../services/shopping/shopping.service";

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
	selector: "kt-dash-report-company-cart",
	templateUrl: "./dash-report-company-cart.component.html",
	styleUrls: ["./dash-report-company-cart.component.scss"],
})
export class DashReportCompanyCartComponent implements OnInit {
	@Input() data: any[];

	@ViewChild("chart") chart: ChartComponent;
	public cartSales: Partial<ChartOptionsBar>;

	constructor(
		private shoppingService: ShoppingService,
		private changeDetectorRefs: ChangeDetectorRef
	) {
		this.cartSales = {
			chart: {
				type: "bar",
				height: 250,
			},
			series: [
				{
					name: "Carrinho",
					data: [0],
				},
				{
					name: "Pedidos",
					data: [0],
				},
			],
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
	}

	ngOnInit(): void {
		this.getGraphic();
	}

	async getGraphic() {
		try {
			const categories = [];
			const totalCart = [];
			const totalOrder = [];
			const average = [];

			for await (const item of this.data) {
				categories.unshift(`${("0" + item.day).slice(-2)}`);

				totalCart.unshift(item.total);
				totalOrder.unshift(item.totalOrder);
				// average.unshift(item.average);
			}

			this.cartSales.xaxis = {
				categories,
			};

			this.cartSales.series = [
				{
					name: "Carrinhos",
					data: totalCart,
				},
				{
					name: "Pedidos",
					data: totalOrder,
				},
				// {
				// 	name: 'Média Compra',
				// 	data: average,
				// },
			];

			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			console.log("Fail List", err);
		}
	}
}
