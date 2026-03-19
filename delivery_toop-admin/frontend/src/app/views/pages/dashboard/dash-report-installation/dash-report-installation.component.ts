import { Component, OnInit, ViewChild } from '@angular/core';

import {
  ChartComponent,
  // ApexAxisChartSeries,
  // ApexChart,
  // ApexXAxis,
  // ApexTitleSubtitle
} from "ng-apexcharts";

@Component({
  selector: 'kt-dash-report-installation',
  templateUrl: './dash-report-installation.component.html',
  styleUrls: ['./dash-report-installation.component.scss']
})
export class DashReportInstallationComponent implements OnInit {
	@ViewChild("chart", { static: false }) chart: ChartComponent;
	public chartOptions: any;

  constructor() {
		this.chartOptions = {
			series: [
        {
          name: "Instalações",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
				},
				{
          name: "Desistações",
          data: [4, 7, 20, 22, 15, 30, 21, 25, 40]
        }
			],
			colors: ['#0066cc', '#ff0000'],
			chart: {
        height: 300,
        type: "area"
			},
			dataLabels: {
				enabled: true,
				enabledOnSeries: true,
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.7,
					opacityTo: 0.9,
					stops: [0, 90, 100]
				}
			},
			xaxis: {
				categories: [
					"1", "2", "3", "4", "5", "6",
					"7", "8", "9",
				],
			}
		};
	}

  ngOnInit(): void {}

}
