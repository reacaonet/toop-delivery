import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { FormGroup, FormControl } from '@angular/forms';
import { startWith, debounceTime, switchMap, filter } from 'rxjs/operators';
import {DeliveryManService} from '../../../../services/deliveryMan.service';

@Component({
  selector: 'kt-deliveryman-live',
  templateUrl: './deliveryman-live.component.html',
  styleUrls: ['./deliveryman-live.component.scss']
})

export class DeliverymanLiveComponent implements OnInit, AfterViewInit {

	private map;
	formFilter: FormGroup;
	timeLeft: number = 60;
	private markersLayer = new L.LayerGroup();
	quantityDelivery: number = 0;
	dataDeliverysNoLocationList = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private deliveryManService: DeliveryManService) {
  }

	ngOnInit() {
		this.formFilter = new FormGroup({
      statusDelivery: new FormControl(undefined),
      statusCompany: new FormControl(undefined)
		});
		this.getMarkersDelivery();
		this.getMarkersCompany();
	}

	private getMarkersDelivery()  {
		this.formFilter.get('statusDelivery').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => {
					this.updateMarkersCompany(this.formFilter.controls.statusCompany.value);
					return this.updateMarkersDelivery(value);
				}
			)
    )
      .subscribe(() => {
        this.changeDetectorRefs.detectChanges();
      });
	}

	private getMarkersCompany()  {
		this.formFilter.get('statusCompany').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap(value => {
					this.updateMarkersDelivery(this.formFilter.controls.statusDelivery.value);
					return this.updateMarkersCompany(value);
				}
			)
    )
      .subscribe(() => {
        this.changeDetectorRefs.detectChanges();
      });
	}

	private updateMarkersDelivery(statusDelivery) {
		this.makeMarkersDelivery(this.markersLayer, statusDelivery );
		return statusDelivery;
	}

	private updateMarkersCompany(statusCompany) {
		this.makeMarkersCompany(this.markersLayer, statusCompany );
		return statusCompany;
	}

	 ngAfterViewInit() {
		this.initMap();

		setInterval(() => {
			if(this.timeLeft > 0) {
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
		}, 1000)
	}

	private initMap(): void {
		this.map = L.map('map', {
			center: [-16.698196, -49.265285],
			zoom: 11
		});

		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		tiles.addTo(this.map);

		this.markersLayer.addTo(this.map);
	}

	refreshMarkers() {
		this.updateMarkersDelivery(this.formFilter.controls.statusDelivery.value)
		this.updateMarkersCompany(this.formFilter.controls.statusCompany.value)
	}

	makeMarkersDelivery(markersLayer: L.LayerGroup, statusDelivery: string): void {
		markersLayer.clearLayers();
		const ELEMENT_DATA = [];

		const greenIcon = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/assets/maps/bike_on_36px.png';
		const blueIcon = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/assets/maps/bike_active_36px.png';
		const redIcon = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/assets/maps/bike_off_36px.png';

		let isOnline = "";
		let onRoute = "";

		if(statusDelivery === 'nothing'){
			this.dataDeliverysNoLocationList = ELEMENT_DATA;
			this.changeDetectorRefs.detectChanges();
			return;
		}

		if (statusDelivery !== '' && statusDelivery !== 'all') {
			if (statusDelivery === 'online' || statusDelivery === 'offline') {
				isOnline = statusDelivery === 'online' ? 'true' : 'false';
			}

			onRoute = statusDelivery === 'onRoute' ? 'true' : 'false';
		}

    this.deliveryManService.getDeliveryManStatus(isOnline, onRoute).subscribe((data: any) => {
			this.quantityDelivery = 0;
			data.forEach(async (deliveryMan) => {
					let icon;

					if (deliveryMan.isOnline) {
						icon = greenIcon;
					} else {
						icon = redIcon;
					}

					if (deliveryMan.flag === 'ON_ROUTE') {
						icon = blueIcon;
					}

					if(deliveryMan.location){
						this.quantityDelivery++;
						const markerOne = L.marker([ deliveryMan.location.coordinates[1], deliveryMan.location.coordinates[0] ], {icon: new L.Icon({
							iconUrl: icon,
							iconSize: [36, 36],
							iconAnchor: [12, 41],
							popupAnchor: [1, -34],
						})}).bindPopup(this.makePopupDelivery(deliveryMan), {showOnMouseOver:true});

						markersLayer.addLayer(markerOne);
					}else{
						ELEMENT_DATA.push({
							name: deliveryMan.person ? deliveryMan.person.name : '',
							phone: deliveryMan.person ? deliveryMan.person.phone : '',
							statusDelivery: deliveryMan.flag === 'ON_ROUTE' ? 'Em rota' : deliveryMan.isOnline ? 'Online' : 'Offline',
						});

						this.dataDeliverysNoLocationList = ELEMENT_DATA;
						this.changeDetectorRefs.detectChanges();
					}
				});
		});
	}

	makeMarkersCompany(markersLayer: L.LayerGroup, statusCompany: string): void {
		markersLayer.clearLayers();
		const ELEMENT_DATA = [];

		const supermarketOn = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/assets/maps/store_on_36px.png';
		const supermarketOff = 'https://economizebr.sfo2.cdn.digitaloceanspaces.com/assets/maps/store_off_36px.png';

		let isOpen = "";

		if(statusCompany === 'nothing'){
			this.dataDeliverysNoLocationList = ELEMENT_DATA;
			this.changeDetectorRefs.detectChanges();
			return;
		}

		if (statusCompany === 'online' || statusCompany === 'offline') {
			isOpen = statusCompany === 'online' ? 'true' : 'false';
		}

    this.deliveryManService.getCompanyStatus(isOpen).subscribe((data: any) => {
			this.quantityDelivery = 0;
			data.forEach(async (company) => {
					let icon;

					if (company.companyDelivery.isOpen) {
						icon = supermarketOn;
					} else {
						icon = supermarketOff;
					}

					if(company.location){
						this.quantityDelivery++;
						const markerOne = L.marker([ company.location.coordinates[1], company.location.coordinates[0] ], {icon: new L.Icon({
							iconUrl: icon,
							iconSize: [36, 36],
							iconAnchor: [12, 41],
							popupAnchor: [1, -34],
						})}).bindPopup(this.makePopupCompany(company), {showOnMouseOver:true});

						markersLayer.addLayer(markerOne);
					}else{
						ELEMENT_DATA.push({
							name: company.name ,
							phone: company.phone ,
							statusCompany: company.companyDelivery.isOnline ? 'Online' : 'Offline',
						});

						this.dataDeliverysNoLocationList = ELEMENT_DATA;
						this.changeDetectorRefs.detectChanges();
					}
				});
		});
	}

	makePopupDelivery(data: any): string {
		if (!data.person){
			return 'Person não encontrado';
		}

		return `` +
		`<div>Nome: ${data.person.name}</div>` +
		`<div>Veículo: ${data.typeOfVehicle}</div>` +
		`<div>Status: ${data.isOnline ? 'Online' : 'Offline'}</div>` +
		`<div>Situação: ${data.flag === 'FREE' ? 'Liberado' : data.flag === 'ON_ROUTE' ? 'Em rota' : 'Indisponível'}</div>` +
		`${data.flag === 'ON_ROUTE' ? `<div>Pedido: ${data.orderStatus ? data.orderStatus.order_number : ""}</div>` : ''}`
	}

	makePopupCompany(data: any): string {
		return `` +
		`<div>Nome: ${data.name}</div>` +
		`<div>Descrição: ${data.description}</div>` +
		`<div>Status: ${data.companyDelivery.isOpen ? 'Online' : 'Offline'}</div>` +
		`<div>Endereço: ${data.address}</div>` +
		`<div>Telefone: ${data.phone}</div>`
	}
}
