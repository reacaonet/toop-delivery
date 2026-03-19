import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Franchise } from "../../../../models/franchise";
import { FranchiseService } from "../../../services/franchise.service";

import { BrazilianBanks } from "../../../../models/setting/brazilianBanks";
import { BrazilianBankService } from "../../../services/settings/brazilian-bank.service";

import { CityService } from "../../../services/city.service";
import { StateService } from "../../../services/state.service";
import { isArray } from "jquery";
import { checkObjectIdisValid } from "../../../util";

@Component({
	selector: "kt-franchise",
	templateUrl: "./franchise.component.html",
	styleUrls: ["./franchise.component.scss"],
})
export class FranchiseComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	franchiseIdToDelete; // Save franchise id to delete
	dataSource;
	displayedColumns = ["image", "name", "company", "city", "phone", "delete"];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	brBanks: BrazilianBanks[] = [];

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;

	createAccountFranchise = true;

	states = [];
	cities = [];

	constructor(private changeDetectorRefs: ChangeDetectorRef, private franchiseService: FranchiseService, private stateService: StateService, private cityService: CityService, private brazilianBankService: BrazilianBankService, private modalService: NgbModal, private toastr: ToastrService) { }

	async ngOnInit() {
		await this.addFormFilter();
		await this.getListFranchise(0, this.pageSize, undefined);
		this.loadStates();
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				name: new FormControl(""),
			});

			this.formFilter
				.get("name")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === "string" && value.length > 0 ? this.getListFranchise(0, this.pageSize, value) : []))
				)
				.subscribe((results) => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				file: new FormControl(undefined),
				state: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
				city: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
				name: new FormControl(undefined, [Validators.required]),
				companyName: new FormControl(undefined, [Validators.required]),
				phone: new FormControl(undefined, [Validators.required]),
				coin: new FormControl("REAL", [Validators.required]),
				languageDefault: new FormControl("pt-BR", [Validators.required]),
				percentService: new FormControl(0, [Validators.required]),
				email: new FormControl(undefined, [Validators.required]),
				cep: new FormControl(undefined, [Validators.required]),
				status: new FormControl(""),
				recipient_id: new FormControl(undefined),
				pagar_me_bank_id: new FormControl(undefined),
				onlyMultiplesOf50: new FormControl(false, [Validators.required]),
				emergencyPhone: new FormControl("190"),
				bankData: new FormGroup({
					brazilianBank: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
					favoredName: new FormControl(undefined),
					bankName: new FormControl(undefined),
					agency: new FormControl(undefined),
					agencyDigit: new FormControl(undefined),
					account: new FormControl(undefined),
					accountDigit: new FormControl(undefined),
					typeAccount: new FormControl("CURRENT"),
					document: new FormControl(undefined),
					documentType: new FormControl("CNPJ"),
					pixKey: new FormControl(undefined),
					pixType: new FormControl("RANDOMKEY"),
				}),
				showPhonePassenger: new FormControl(false),
				showPhoneDriver: new FormControl(false),
				routeSettings: new FormGroup({
					showReportCardTravel: new FormControl(false),
				}),
			});

			this.formData
				.get("bankData")
				.get("brazilianBank")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (value && typeof value === "string" && value.length > 0 ? this.brazilianBankService.get(value) : []))
				)
				.subscribe((results) => (this.brBanks = results));

			return resolve(true);
		});
	}

	displayFnBrazilianBank(bank: BrazilianBanks) {
		if (bank) {
			return `${bank.compe} - ${bank.short_name}`;
		}
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListFranchise(event.pageIndex, event.pageSize, undefined);
	}

	async getListFranchise(pageIn, pageOut, name) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.franchiseService.getFranchisesPaginator(pageIn, pageOut, name).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((franchise, index) => {
					ELEMENT_DATA.push({
						_id: franchise._id,
						position: index + 1,
						name: franchise.name,
						companyName: franchise.companyName,
						city: franchise.city,
						status: franchise.status,
						state: franchise.state,
						email: franchise.email,
						coin: franchise.coin,
						onlyMultiplesOf50: franchise.onlyMultiplesOf50,
						emergencyPhone: franchise.emergencyPhone,
						languageDefault: franchise.languageDefault,
						image: franchise.images && franchise.images[0] ? franchise.images[0] : undefined,
						phone: franchise.phone,
						percentService: franchise.percentService ? franchise.percentService : 0,
						bankData: franchise.bankData ? franchise.bankData : {},
						cep: franchise.cep,
						recipient_id: franchise.recipient_id,
						pagar_me_bank_id: franchise.pagar_me_bank_id,
						showPhoneDriver: franchise?.showPhoneRace?.driver || false,
						showPhonePassenger: franchise?.showPhoneRace?.passenger || false,
						routeSettings: franchise?.routeSettings || {},
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async createFranchiseModalShow(content) {
		await this.newFormData();
		// this.formData.reset();

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-franchise",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async createFranchise(franchise: Franchise, content, save = false) {
		if (!save) {
			this.modalService
				.open(content, {
					ariaLabelledBy: "modal-create-account-franchise",
					size: "md",
					backdrop: "static",
				})
				.result.then(
					(result) => { },
					(reason) => { }
				);
		} else {
			if (franchise.bankData.pixType === null) {
				delete franchise.bankData.pixType;
			}

			franchise.createAccount = false;
			this.franchiseService.createFranchise(franchise).subscribe(
				async (data: any) => {
					this.modalService.dismissAll("");
					this.toastr.success("Registro cadastrado com sucesso!", "Sucesso!");
					await this.getListFranchise(0, this.pageSize, undefined);
				},
				(error) => {
					let message = "Falha ao criar Franquia!";
					if (error.error && error.error.message) {
						message = error.error.message;
					}

					this.toastr.error(message, "Falha!");
				}
			);
		}
	}

	async editFranchiseModalShow(content, franchise: Franchise) {
		await this.newFormData();
		this.formData.reset();

		// Alter file permissions
		this.formData.get("file").clearValidators();
		this.formData.get("file").updateValueAndValidity();

		this.onClickState(franchise.state);

		// Valid Brazilian Bank
		if (franchise.bankData && isArray(franchise.bankData.brazilianBank) && franchise.bankData.brazilianBank) {
			franchise.bankData.brazilianBank = franchise.bankData.brazilianBank[0];
		}

		this.formData.patchValue({
			_id: franchise._id,
			file: "",
			status: franchise.status,
			state: franchise.state,
			city: franchise.city,
			name: franchise.name,
			coin: franchise.coin,
			languageDefault: franchise.languageDefault,
			companyName: franchise.companyName,
			phone: franchise.phone,
			percentService: franchise.percentService ? franchise.percentService : 0,
			email: franchise.email,
			bankData: franchise.bankData ? franchise.bankData : {},
			cep: franchise.cep,
			recipient_id: franchise.recipient_id,
			pagar_me_bank_id: franchise.pagar_me_bank_id,
			onlyMultiplesOf50: franchise.onlyMultiplesOf50,
			emergencyPhone: franchise.emergencyPhone ? franchise.emergencyPhone : "",
			showPhoneDriver: franchise?.showPhoneDriver || false,
			showPhonePassenger: franchise?.showPhonePassenger || false,
			routeSettings: franchise?.routeSettings || {},
		});

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-franchise",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async editFranchise(franchise: Franchise & Required<Pick<Franchise, '_id'>>) {
		this.franchiseService.updateFranchise(franchise).subscribe(
			async (data: any) => {
				this.toastr.success("Franquia alterada com sucesso!", "Sucesso!");
				await this.getListFranchise(0, this.pageSize, undefined);
				this.modalService.dismissAll();
			},
			(error) => {
				const message = error.error && error.error.message ? error.error.message : "Falha ao alterar Fraquia!";
				this.toastr.error(message, "Falha!");
			}
		);
	}

	async confirmDeleteModalShow(content, franchise) {
		this.franchiseIdToDelete = franchise._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-franchise",
				size: "sm",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async deleteFranchise() {
		// caso não encotre o id dar error
		if (!this.franchiseIdToDelete) {
			this.toastr.error("Falha ao deletar Franquia!", "Falha!");
			return;
		}
		// delete
		await this.franchiseService.deleteFranchise(this.franchiseIdToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Franquia deletada com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.franchiseIdToDelete = undefined;
		// att a tela
		await this.getListFranchise(0, this.pageSize, undefined);
	}

	ngAfterViewInit() { }

	onChange(event) {
		const selectedFiles = <FileList>event.srcElement.files;

		const fileNames = [];
		const fileList = [];
		if (event.target.files && event.target.files.length) {
			this.files = new Set();
			for (let i = 0; i < selectedFiles.length; i++) {
				fileNames.push(selectedFiles[i].name);
				this.files.add(selectedFiles[i]);

				const reader = new FileReader();
				// const [file] = event.target.files;
				reader.readAsDataURL(selectedFiles[i]);

				reader.onload = () => {
					fileList.push({ base64: reader.result });
					this.formData.patchValue({
						file: fileList,
					});
				};
			}
		}
		document.getElementById("customFileLabel").innerHTML = fileNames.join(", ");
	}

	onEnter(value: string) {
		this.box = value;
		this.boxNome = "";
		this.getListFranchise(0, this.pageSize, undefined);
	}

	// --> obtem o status do registro
	getStatusColor(status) {
		if (status === true) {
			return "bg-success";
		} else {
			return "bg-warning";
		}
	}

	// --> obtem a cor da linha do registro
	getPositionColor(position) {
		if (position % 2 !== 0) {
			return "bg-secondary";
		}
	}

	// --> obtem a cidade pelo estado
	async onClickState(state) {
		await this.cityService.getCity(state._id).subscribe((data: any) => {
			this.cities = data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	async loadStates() {
		await this.stateService.getState().subscribe((data: any) => {
			this.states = data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	displayFn(element) {
		if (element) {
			return element.name;
		}
	}
}
