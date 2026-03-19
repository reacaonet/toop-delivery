import { Component, OnInit, ViewChild } from '@angular/core';

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
import { CustomerService } from '../../../../../services/customer.service';

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
  selector: 'kt-noc-created-users',
  templateUrl: './noc-created-users.component.html',
  styleUrls: ['./noc-created-users.component.scss']
})
export class NocCreatedUsersComponent implements OnInit {
	@ViewChild("chart") chart: ChartComponent;
	public registeredCustomer: Partial<ChartOptionsBar>;

  constructor(
		private customerService: CustomerService
	) {
		this.registeredCustomer = {
			chart: {
				type: "bar",
				height: 250,
			},
			series: [{
				name: 'Cadastro',
				data: [],
			}],
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
			const totalCustomer = [];

			let response: any = await this.customerService.getGraphicCreated().toPromise();

			for await (const customer of response) {
				categories.unshift(
					`${("0" + customer.day).slice(-2)}`
				);

				totalCustomer.unshift(customer.total);
			}

			this.registeredCustomer.xaxis = {
				categories,
			};

			this.registeredCustomer.series = [
				{
					name: "Total Cadastro",
					data: totalCustomer,
				},
			];
		} catch (err) {
			console.log('fail graphic', err);
		}
	}

}
