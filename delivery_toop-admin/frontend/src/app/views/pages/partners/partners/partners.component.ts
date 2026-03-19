import { take } from "rxjs/operators";
import { CityService } from "./../../../../services/city.service";
import { ToastrService } from "ngx-toastr";
import { UserService } from "./../../../../services/user.service";
import { User } from "./../../../../../models/user";
import { DeliveryMan } from "./../../../../../models/deliveryMan";
// import { CustomResponse } from './../../../../../models/customResponse';
import { DeliveryManService } from "./../../../../services/deliveryMan.service";
import { Person } from "./../../../../../models/person";
import { PersonService } from "./../../../../services/person.service";
import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, FormArray } from "@angular/forms";
import moment from "moment";

import { PartnersService } from "./../../../../services/partners.service";
import { FranchiseService } from "./../../../../services/franchise.service";

@Component({
	selector: "kt-partners",
	templateUrl: "./partners.component.html",
	styleUrls: ["./partners.component.scss"],
})
export class PartnersComponent implements OnInit, AfterViewInit {
	childmessage = false;
	dataSource;
	displayedColumns = ["name", "cpf", "phone", "status", "view"];
	formData;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	imagesSelfies = [];
	imagesCnh = [];
	citiesList;
	imagesDocs = [];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private cityService: CityService,
		private modalService: NgbModal,
		private partnersService: PartnersService,
		private personServies: PersonService,
		private deliveryManService: DeliveryManService,
		private userService: UserService,
		private franchiseService: FranchiseService,
		private toastr: ToastrService
	) {}

	ngOnInit() {
		this.citiesList = this.cityService
			.getCity()
			.pipe(take(1))
			.subscribe(
				(response) => {
					this.citiesList = response;
				},
				(error) => {
					this.toastr.error(`${error.message}`, "Falha!");
				}
			);
		this.getListPartners(0, this.pageSize);
	}

	async addNewFormData(del) {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(del._id),
				name: new FormControl(del.name),
				cpf: new FormControl(del.cpf),
				phone: new FormControl(del.phone),
				status: new FormControl(del.status),
				password: new FormControl(del.password),
				email: new FormControl(del.email),
				location: new FormControl(del.location ? del.location : undefined),
				message: new FormControl(del.message),
				city: new FormControl(del.city),
				typeOfVehicle: new FormControl(del.typeOfVehicle),
				createdAt: new FormControl(del.createdAt),
			});

			this.imagesSelfies = del.imageSelfie || [];
			this.imagesCnh = del.imagesCnh || [];
			this.imagesDocs = del.imagesDocuments || [];
			resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListPartners(event.pageIndex, event.pageSize);
	}

	async getListPartners(page, limit) {
		const self = this;
		const ELEMENT_DATA = [];

		this.partnersService
			.getPartnersPartners(page, limit)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);

				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((delivery, index) => {
						if (!this.citiesList) {
							location.reload();
							return;
						}
				
						const city = this.citiesList.find((x) => x._id === delivery.city);

						// if (city) {
						// delivery.city = delivery?.city_id;
						// }

						switch (delivery.status) {
							case "PENDING":
								delivery.status = "PENDENTE";
								break;

							case "ANALYZE":
								delivery.status = "ANALISANDO";
								break;

							case "DECLINED":
								delivery.status = "RECUSADO";
								break;

							case "APPROVED":
								delivery.status = "APROVADO";
								break;

							case "WAITING":
								delivery.status = "AGUARDANDO";
								break;

							default:
								delivery.status = "PENDENTE";
								break;
						}

						const created = moment(
							delivery.createdAt,
							"YYYY-MM-DD HH:mm:ss"
						).format("DD/MM/YY HH:mm:ss");

						ELEMENT_DATA.push({
							_id: delivery._id,
							position: index + 1,
							name: delivery.name,
							cpf: delivery.cpf,
							password: delivery.password,
							phone: delivery.celphone,
							status: delivery.status,
							email: delivery.email,
							typeOfVehicle: delivery.vehicleType,
							city: delivery?.city_id?.name ?? delivery?.city,
							location: delivery.location ? delivery.location : undefined,
							message: delivery.message,
							imageSelfie:
								delivery.imageSelfie && Array.isArray(delivery.imageSelfie)
									? delivery.imageSelfie
									: [],
							imagesCnh:
								delivery.imagesCnh && Array.isArray(delivery.imagesCnh)
									? delivery.imagesCnh
									: [],
							imagesDocuments:
								delivery.imagesDocuments &&
								Array.isArray(delivery.imagesDocuments)
									? delivery.imagesDocuments
									: [],
							createdAt: created,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async viewPartnersModalShow(content, del) {
		this.imagesSelfies = [];
		this.imagesCnh = [];
		this.imagesDocs = [];

		if (del.status === "PENDENTE") {
			const payload = {
				status: "ANALYZE",
			};

			const response: any = await this.partnersService
				.updateStatus(payload, del._id)
				.toPromise();

			if (response.data.status === "ANALYZE") {
				del.status = "ANALISANDO";
			}
		}

		await this.addNewFormData(del);

		this.modalService
			.open(content, { ariaLabelledBy: "modal-view-partners", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async viewPartners() {
		this.partnersService.getPartners().subscribe(
			(data: any) => {
				const delivery = data.data;

				const created = moment(
					delivery.createdAt,
					"YYYY-MM-DD HH:mm:ss"
				).format("DD/MM/YY HH:mm:ss");

				this.dataSource.data.push({
					_id: delivery._id,
					position: this.dataSource.data.length + 2,
					name: delivery.name,
					cpf: delivery.cpf,
					phone: delivery.phone,
					status: delivery.status,
					email: delivery.email,
					typeOfVehicle: delivery.vehicleType,
					city: delivery.city,
					location: delivery.location ? delivery.location : undefined,
					imageSelfie:
						delivery.imageSelfie && Array.isArray(delivery.imageSelfie)
							? delivery.imageSelfie
							: [],
					imagesCnh:
						delivery.imagesCnh && Array.isArray(delivery.imagesCnh)
							? delivery.imagesCnh
							: [],
					imagesDocuments:
						delivery.imagesDocuments && Array.isArray(delivery.imagesDocuments)
							? delivery.imagesDocuments
							: [],
					createdAt: created,
				});
				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
			},
			(error) => {}
		);
	}

	ngAfterViewInit() {}

	async acceptDeliveryman(element) {
		let {
			city,
			cpf,
			email,
			name,
			phone,
			status,
			password,
			typeOfVehicle,
			_id,
			location,
		} = element;

		if (!this.citiesList) {
			location.reload();
			return;
		}

		city = this.citiesList.find((x) => {
			if (`${x.name}`.trim() === `${city}`.trim()) {
				return true;
			}
			return false;
		});

		// if (!city || !city._id) {
		// 	return this.toastr.warning('Cidade', 'Cidade não encontrada');
		// }

		// const latitude =
		// 	location && location.coordinates ? location.coordinates[1] : null;
		// const longitude =
		// 	location && location.coordinates ? location.coordinates[0] : null;

		// if (!latitude || !longitude) {
		// 	return this.toastr.warning(
		// 		"Localização",
		// 		"Não conseguimos identificar a localização deste cadastro"
		// 	);
		// }

		const userInfo: any = await JSON.parse(localStorage.getItem("@user-info"));

		let idFranchise;

		// if (userInfo.isRoot === "true" || userInfo.isRoot === true) {
		// 	idFranchise = await this.franchiseService
		// 		.getLocFranchise(latitude, longitude)
		// 		.toPromise();
		// } else {
		idFranchise = userInfo.franchise;
		// }

		if (!idFranchise) {
			return this.toastr.warning(
				"Franquia",
				"Não conseguimos localizar a franquia"
			);
		}

		try {
			switch (typeOfVehicle) {
				case "CAR":
					typeOfVehicle = "CARRO";
					break;

				case "MOTORCYCLE":
					typeOfVehicle = "MOTO";
					break;

				case "BIKE":
					typeOfVehicle = "BICICLETA";
					break;
			}

			const person: any = {
				shopper: "",
				deliveryMan: "",
				name,
				cpf,
				city: city && city._id ? city : undefined,
				// city_id: city._id ?  city._id : null,
				franchise: idFranchise,
				phone: phone,
				cellphone: phone,
				birthdate: "",
				status: true,
			};

			const personResoponse: any = await this.personServies
				.createPerson(person)
				.toPromise();

			const deliveryMan: DeliveryMan = {
				isOnline: false,
				phone,
				// company,
				typeOfVehicle,
				showFreightValue: false,
				board: "",
				model: "",
				manufacturer: "",
				color: "",
				merchantId: "",
				year: null,
				person: personResoponse.data,
				status: true,
				appVersion: "",
				franchise: idFranchise,
				// latitude:
				// 	location && location.coordinates ? location.coordinates[1] : null,
				// longitude:
				// 	location && location.coordinates ? location.coordinates[0] : null,
			};

			await this.deliveryManService.createDeliveryMan(deliveryMan).toPromise();

			const user: User = {
				person: personResoponse.data,
				name: name,
				email: email,
				status: true,
				password: password ? password : "mudar1234",
				confirmPassword: password ? password : "mudar1234",
				franchise: idFranchise,
				// company,
			};

			await this.userService.createUser(user).toPromise();
			this.toastr.success("User criado com sucesso!", "Sucesso!");

			if (status !== "APROVADO") {
				const payload = {
					status: "APPROVED",
				};
				const response: any = await this.partnersService
					.updateStatus(payload, _id)
					.toPromise();
				if (response) {
					this.getListPartners(0, this.pageSize);
				}
			}
		} catch ({ error }) {
			console.log("error", error);
			this.toastr.error(`${error.message}`, "Falha!");
		}
	}

	createMessage(content, deliveryman) {
		// console.log(content, deliveryman);

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-message-deliveryman",
				size: "lg",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async sendMessage(formData) {
		const { message, _id } = formData;
		const payload = {
			message,
			status: "WAITING",
		};
		const response: any = await this.partnersService
			.updateStatus(payload, _id)
			.toPromise();
		if (response.status === 200) {
			this.modalService.dismissAll();
			this.getListPartners(0, this.pageSize);
		}
	}

	async cancelDeliveryman(formData: any) {
		const { _id } = formData;
		const payload = {
			message: "O seu cadastro não foi aprovado!",
			status: "DECLINED",
		};
		const response: any = await this.partnersService
			.updateStatus(payload, _id)
			.toPromise();
		if (response.status === 200) {
			this.modalService.dismissAll();
			this.getListPartners(0, this.pageSize);
		}
	}
}
