import {
	Component,
	AfterViewInit,
	OnInit,
	ChangeDetectorRef,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormGroup, FormControl } from "@angular/forms";
import { Observable, of } from "rxjs";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import moment from "moment";

/** Service */
import { BookingService } from "../../../../../services/mobility/booking.service";

import { environment } from "../../../../../../environments/environment";

@Component({
	selector: "kt-heatmap",
	templateUrl: "./heatmap.component.html",
	styleUrls: ["./heatmap.component.scss"],
})
export class HeatmapComponent implements OnInit, AfterViewInit {
	private map;
	private heatmap: google.maps.visualization.HeatmapLayer = null;

	formFilter: FormGroup;
	filter: any = {
		startDate: moment().subtract(4, "days").format("YYYY-MM-DD"),
		endDate: moment().format("YYYY-MM-DD"),
	};

	apiLoaded: Observable<boolean>;
	apiKey = environment.GOOGLE_MAPS;
	mapWidth = window.innerWidth;
	urlMap: any = false;

	center = { lat: -16.739228, lng: -49.269136 };
	zoom = 5;

	heatmapOptions = { radius: 11 };
	heatmapData: any = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		httpClient: HttpClient,
		private bookingService: BookingService
	) {}

	async ngOnInit() {
		await this.addFormFilter();
	}

	async getList(params = {}) {
		try {
			const list = await this.bookingService.getHeatMap(params).toPromise();
			this.heatmapData = [];

			if (list && Array.isArray(list) && list.length > 0) {
				list.forEach((item, index) => {
					if (item.origin && item.origin.coordinates) {
						this.heatmapData.push(
							new google.maps.LatLng(
								item.origin.coordinates[1],
								item.origin.coordinates[0]
							)
						);
					}
				});
			}

			if (this.heatmap) {
				this.heatmap.setMap(null);
			}

			this.heatmap = new google.maps.visualization.HeatmapLayer({
				data: this.heatmapData,
			});

			this.heatmap.setMap(this.map);
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			console.log("oops fail", err);
		}
	}

	ngAfterViewInit() {
		// this.getList(this.filter);
	}

	async addFormFilter() {
		this.formFilter = new FormGroup({
			dateInit: new FormControl(
				moment(this.filter.startDate).format("DD/MM/YYYY")
			),
			dateFinal: new FormControl(
				moment(this.filter.endDate).format("DD/MM/YYYY")
			),
		});

		this.formFilter
			.get("dateInit")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (
						typeof value === "string" &&
						value.length > 0 &&
						value !== this.filter.startDate &&
						moment(value, "DD/MM/YYYY").isValid()
					) {
						this.filter.startDate = moment(value, "DD/MM/YYYY").format(
							"YYYY-MM-DD"
						);
						return this.getList(this.filter);
					}

					return [];
				})
			)
			.toPromise();

		this.formFilter
			.get("dateFinal")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (
						typeof value === "string" &&
						value.length > 0 &&
						value !== this.filter.endDate &&
						moment(value, "DD/MM/YYYY").isValid()
					) {
						this.filter.endDate = moment(value, "DD/MM/YYYY").format(
							"YYYY-MM-DD"
						);
						return this.getList(this.filter);
					}

					return [];
				})
			)
			.toPromise();
	}

	async onMapLoad(mapInstance) {
		// console.log("mapInstance", mapInstance);
		this.map = mapInstance;
		await this.getList(this.filter);
	}
}
