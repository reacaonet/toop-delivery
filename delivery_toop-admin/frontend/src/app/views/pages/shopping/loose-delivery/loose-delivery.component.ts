import {
	Component,
	OnInit,
	AfterViewInit,
	ViewChild,
	ChangeDetectorRef,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";

import {
	Location,
	Appearance,
	GermanAddress,
} from "@angular-material-extensions/google-maps-autocomplete";
import PlaceResult = google.maps.places.PlaceResult;
import { AgmMap } from "@agm/core";

/** Service */
import { LooseDeliveryService } from "./../../../../services/shopping/loose-delivery.service";

@Component({
	selector: "kt-loose-delivery",
	templateUrl: "./loose-delivery.component.html",
	styleUrls: ["./loose-delivery.component.scss"],
})
export class LooseDeliveryComponent implements OnInit {
	formData;
	formSubmitAttempt = false;
	appearance = Appearance;

	zoom: number = 15;
	draggable: Boolean = true;
	latitude: number = 0;
	longitude: number = 0;
	address: string = null;
	typeVehicle: string = "MOTO";
	city: string = null;
	district: string = null;
	state: string = null;
	priceDelivery: number = 0;
	load: boolean = false;
	company: any = null;
	disabled = false;
	comeback = false;
	type = "supermarket";
	redirect = "";

	@ViewChild(AgmMap)
	public agmMap: AgmMap;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private route: ActivatedRoute,
		private looseDeliveryService: LooseDeliveryService,
		private toastr: ToastrService
	) {
		let type = this.route.snapshot.queryParamMap.get("type");
		if (type) {
			this.type = type;
		}

		this.redirect = `${window.location.protocol}//${window.location.host}/shopping-cart/${this.type}`;
		this.addFormData();
	}

	ngOnInit(): void {
		const companyStorage = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;

		this.company = companyStorage;
	}

	ngafterviewinit(): void {
		setTimeout(() => {
			this.agmMap.triggerResize();
		}, 500);
	}

	addFormData() {
		this.formData = new FormGroup({
			// city: new FormControl('', [Validators.required]),
			address: new FormControl(undefined, [Validators.required]),
			// latitude: new FormControl('', [Validators.required]),
			// longitude: new FormControl('', [Validators.required]),
			typeAddress: new FormControl("HOME", [Validators.required]),
			total: new FormControl("0", [Validators.required]),
			note: new FormControl(""),
			priceDelivery: new FormControl("0", [Validators.required]),

			typeVehicle: new FormControl("MOTO", [Validators.required]),
		});

		this.formData.get('address').valueChanges.subscribe(value => console.log('value changed ==>>>', value))

	}

	// private setCurrentPosition() {
	//   if ('geolocation' in navigator) {
	//     navigator.geolocation.getCurrentPosition((position) => {
	//       this.latitude = position.coords.latitude;
	//       this.longitude = position.coords.longitude;
	//       this.zoom = 12;
	//     });
	//   }
	// }

	async createDelivery(delivery: any) {
		try {
			const element: any = document.getElementById("addressGoogleMapsString");
			delivery.company = this.company?._id;
			delivery.city = this.city;
			// delivery.address = this.address;
			delivery.address = element ? element?.value : this.address;
			delivery.typeVehicle = this.typeVehicle;
			delivery.latitude = this.latitude;
			delivery.longitude = this.longitude;

			this.load = true;
			this.changeDetectorRefs.detectChanges();

			const resp: any = await this.looseDeliveryService
				.createDelivery(delivery)
				.toPromise();

			if (!resp || !resp._id) {
				this.load = false;
				this.changeDetectorRefs.detectChanges();
				return this.toastr.error("Error ao criar entrega", "Falha!");
			}

			this.toastr.success("Entrega adicionada com sucesso!!", "Sucesso!");
			this.load = false;
			this.changeDetectorRefs.detectChanges();
			window.location.href = this.redirect;

			// setTimeout(() => {
			// 	window.history.back();
			// }, 3000);
		} catch (err) {
			let message = "Error ao criar entrega";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.error(message, "Falha!");
			this.load = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	async markerDragEnd(m, $event) {
		try {
			let lat = $event.latLng.lat();
			let lng = $event.latLng.lng();

			// pesquisar endereço aqui
			const resp: any = await this.looseDeliveryService
				.googleSearchAddres(lat, lng)
				.toPromise();
			if (resp && resp.address) {
				this.address = resp.address;
				this.city = resp.city;
				this.district = resp.district;
				this.state = resp.state;
			}

			this.latitude = lat;
			this.longitude = lng;

			console.log("Bairro", this.district);
			console.log("Cidade Atual", this.city);
			console.log("Estado", this.state);
			console.log("Endereço Atual", this.address);
		} catch (er) {}
	}

	async onAutocompleteSelected(result: PlaceResult) {
		try {
			if (result && result.formatted_address) {
				this.address = result.formatted_address;
			}


			let latitude = 0;
			let longitude = 0;

			if (result.geometry && result.geometry.location) {
				latitude = result.geometry.location.lat();
				longitude = result.geometry.location.lng();
			}

			if (result.address_components) {
				for await (const component of result.address_components) {
					// City
					let indexCity = component.types.findIndex(
						(element) => element === "administrative_area_level_2"
					);

					if (indexCity > -1) {
						this.city = `${component.long_name}`;
					}

					// District
					let indexDistrict = component.types.findIndex(
						(element) => element === "sublocality_level_1"
					);

					if (indexDistrict > -1) {
						this.district = `${component.long_name}`;
					}

					// State
					let indexState = component.types.findIndex(
						(element) => element === "administrative_area_level_1"
					);

					if (indexState > -1) {
						this.state = `${component.short_name}`;
					}
				}
			}
		} catch (err) {}
	}

	async onLocationSelected(location: Location) {
		try {
			this.load = true;
			this.changeDetectorRefs.detectChanges();
			this.latitude = location.latitude;
			this.longitude = location.longitude;

			const resp: any = await this.looseDeliveryService
				.deliveryPrice(this.company?._id, this.latitude, this.longitude)
				.toPromise();

			if (resp && resp.price) {
				this.formData.get("priceDelivery").setValue(resp.price);
			}

			this.load = false;
			this.disabled = false;
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = "Não foi possível gerar preço da entrega";

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.warning(message, "Falhou!");
			this.load = false;
			this.disabled = true;
			this.changeDetectorRefs.detectChanges();
		}
	}
}
