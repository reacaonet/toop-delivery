import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { FormGroup, FormControl } from '@angular/forms';
import { startWith, debounceTime, switchMap, filter } from 'rxjs/operators';
import { DriverService } from '../../../../../services/mobility/driver.service';

@Component({
	selector: 'kt-general-map',
	templateUrl: './general-map.component.html',
	styleUrls: ['./general-map.component.scss'],
})
export class GeneralMapComponent implements OnInit, AfterViewInit {
	private map;
	formFilter: FormGroup;
	timeLeft: number = 60;
	private markersLayer = new L.LayerGroup();
	quantityDelivery: number = 0;
	dataDeliverysNoLocationList = [];

	constructor(private changeDetectorRefs: ChangeDetectorRef, private driverService: DriverService) {}

	ngOnInit() {
		this.formFilter = new FormGroup({
			statusDelivery: new FormControl(undefined),
		});

		this.getMarkersDelivery();
	}

	private getMarkersDelivery() {
		this.formFilter
			.get('statusDelivery')
			.valueChanges.pipe(
				startWith(''),
				debounceTime(1000),
				switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.updateMarkersDelivery(value):[]
				),
			)
			.subscribe(() => {
				this.changeDetectorRefs.detectChanges();
			});
	}

	// private getMarkersCompany() {
	// 	this.formFilter
	// 		.get("statusCompany")
	// 		.valueChanges.pipe(
	// 			startWith(""),
	// 			debounceTime(1000),
	// 			switchMap((value) => {
	// 				this.updateMarkersDelivery(
	// 					this.formFilter.controls.statusDelivery.value
	// 				);
	// 				return this.updateMarkersCompany(value);
	// 			})
	// 		)
	// 		.subscribe(() => {
	// 			this.changeDetectorRefs.detectChanges();
	// 		});
	// }

	private updateMarkersDelivery(statusDelivery) {
		this.makeMarkersDelivery(this.markersLayer, statusDelivery);
		return [statusDelivery];
	}

	// private updateMarkersCompany(statusCompany) {
	// 	this.makeMarkersCompany(this.markersLayer, statusCompany);
	// 	return statusCompany;
	// }

	ngAfterViewInit() {
		this.initMap();

		setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
				const timerElement = document.getElementById('timer');
				if (timerElement) {
					timerElement.innerHTML = `Atualizando em ${this.timeLeft.toString()} segundos`;
				}
				const quantityElement = document.getElementById('quantity');
				if (quantityElement) {
					quantityElement.innerHTML = `O filtro encontrou ${this.quantityDelivery} entregadores`;
				}
			} else {
				this.timeLeft = 60;
				this.refreshMarkers();
			}
		}, 1000);
	}

	private initMap(): void {
		this.map = L.map('map', {
			center: [-16.698196, -49.265285],
			zoom: 4,
		});

		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		});

		tiles.addTo(this.map);
		this.markersLayer.addTo(this.map);
	}

	refreshMarkers() {
		this.updateMarkersDelivery(this.formFilter.controls.statusDelivery.value);
		// this.updateMarkersCompany(this.formFilter.controls.statusCompany.value);
	}

	makeMarkersDelivery(markersLayer: L.LayerGroup, statusDelivery: string): void {
		markersLayer.clearLayers();
		const ELEMENT_DATA = [];

		console.log('statusDelivery', statusDelivery);

		const greenIcon = 'https://economizebr.sfo2.digitaloceanspaces.com/assets/maps/bike_on_36px.png';
		const blueIcon = 'https://economizebr.sfo2.digitaloceanspaces.com/assets/maps/bike_active_36px.png';
		const redIcon = 'https://economizebr.sfo2.digitaloceanspaces.com/assets/maps/bike_off_36px.png';

		let isOnline = '';
		let onRoute = '';

		if (statusDelivery === 'nothing') {
			this.dataDeliverysNoLocationList = ELEMENT_DATA;
			('');
			this.changeDetectorRefs.detectChanges();
			return;
		}

		if (statusDelivery !== '' && statusDelivery !== 'all') {
			if (statusDelivery === 'online' || statusDelivery === 'offline') {
				isOnline = statusDelivery === 'online' ? 'true' : 'false';
			}

			onRoute = statusDelivery === 'onRoute' ? 'true' : 'false';
		}

		this.driverService.getDriverStatus(isOnline, onRoute).subscribe((data: any) => {
			this.quantityDelivery = 0;
			data.forEach(async deliveryMan => {
				let icon;

				if (deliveryMan.online) {
					icon = greenIcon;
				} else {
					icon = redIcon;
				}

				if (deliveryMan.flag === 'ON_ROUTE') {
					icon = blueIcon;
				}

				if (deliveryMan.location) {
					this.quantityDelivery++;
					const markerOne = L.marker([deliveryMan.location.coordinates[1], deliveryMan.location.coordinates[0]], {
						icon: new L.Icon({
							iconUrl: icon,
							iconSize: [36, 36],
							iconAnchor: [12, 41],
							popupAnchor: [1, -34],
						}),
					}).bindPopup(this.makePopupDelivery(deliveryMan), {
						showOnMouseOver: true,
					});

					markersLayer.addLayer(markerOne);
				} else {
					ELEMENT_DATA.push({
						name: deliveryMan.name,
						phone: deliveryMan.phone ? deliveryMan.phone : '',
						statusDelivery:
							deliveryMan.activeRunStatus === 'race_accepted' || deliveryMan.activeRunStatus === 'race_in_progress'
								? 'Em rota'
								: deliveryMan.online
								? 'Online'
								: 'Offline',
					});

					this.dataDeliverysNoLocationList = ELEMENT_DATA;
					this.changeDetectorRefs.detectChanges();
				}
			});
		});
	}

	makePopupDelivery(data: any): string {
		const vehicle = `${data.vehicleModel || ''} ${data.vehicleNameplate || ''} ${data.vehicleColor || ''}`;

		return (
			`` +
			`<div>Nome: ${data.name}</div>` +
			`<div>Veículo: ${vehicle}</div>` +
			`<div>
				<a href="https://wa.me/+55${data.phone.replace(/[^\d]/g, '')}?text=Olá" target="_blank" >Telefone: ${data.phone}</a>
			</div>` +
			`<div>Status: ${data.online ? 'Online' : 'Offline'}</div>` +
			`<div>Situação: ${
				data.activeRunStatus === 'available'
					? 'Liberado'
					: data.activeRunStatus === 'race_accepted' || data.activeRunStatus === 'race_in_progress'
					? 'Em rota'
					: 'Indisponível'
			}</div>`
		);
	}
}
