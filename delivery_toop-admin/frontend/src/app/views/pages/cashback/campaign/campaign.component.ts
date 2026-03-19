import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import {
	startWith,
	debounceTime,
	switchMap,
	distinctUntilChanged,
} from "rxjs/operators";

import moment from "moment";
import { ToastrService } from "ngx-toastr";

import { Alert } from "./../../../../../models/alert";
import { CashbackCampaign } from "./../../../../../models/cashback/cashbackCampaign";
import { Company } from "./../../../../../models/company/company";
import { CashbackCampaignService } from "./../../../../services/cashback/Campaign";
import { CompanyService } from "./../../../../services/company.service";
import { FranchiseService } from "./../../../../services/franchise.service";
/** Util */
import { formatMoney } from "../../../../util";
import { Franchise } from "./../../../../../models/franchise";

@Component({
	selector: "kt-campaign",
	templateUrl: "./campaign.component.html",
	styleUrls: ["./campaign.component.scss"],
})
export class CampaignComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = ["name", "amount", "balance", "status", "delete"];
	files: Set<File>;
	formData;
	formSubmit = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	idToDelete;
	isRoot = false;
	allApp = true;
	companies: Company[] = [];
	formDataCompanies = [];
	companiesList: Company[][] = [];

	franchises: Franchise[] = [];
	formDataFranchises = [];
	franchisesList: Franchise[][] = [];

	userIsAdmin = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private cashbackCampaignService: CashbackCampaignService,
		private companyService: CompanyService,
		private franchiseService: FranchiseService
	) {}

	ngOnInit() {
		let userInfo = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		//if (userInfo && userInfo.isRoot === true) {
		this.isRoot = userInfo.isRoot;
		//		this.changeDetectorRefs.detectChanges();
		//	}

		this.newForm();
		this.getList(0, this.pageSize);
		this.getCompanies();
		this.getFranchises();
	}

	newForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(""),
				franchise: new FormControl(""),
				company: new FormControl(""),
				name: new FormControl("", [Validators.required]),
				status: new FormControl(""),
				startDate: new FormControl(""),
				endDate: new FormControl(""),
				allApp: new FormControl(true),
				companies: new FormArray([]),
				franchises: new FormArray([]),
				percent: new FormControl("", [Validators.required]),
				amount: new FormControl("", [Validators.required]),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.cashbackCampaignService
			.getPaginator(pageIn, pageOut, "")
			.subscribe((data: any) => {
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((data, index) => {
						if (
							data.startDate &&
							moment(data.startDate, "YYYY-MM-DD").isValid()
						) {
							data.startDate = moment(data.startDate, "YYYY-MM-DD").format(
								"DD/MM/YYYY"
							);
						}

						if (data.endDate && moment(data.endDate, "YYYY-MM-DD").isValid()) {
							data.endDate = moment(data.endDate, "YYYY-MM-DD").format(
								"DD/MM/YYYY"
							);
						}

						ELEMENT_DATA.push({
							_id: data._id,
							position: index + 1,
							franchise: data.franchise,
							company: data.company,
							name: data.name,
							status: data.status,
							startDate: data.startDate,
							endDate: data.endDate,
							allApp: data.allApp,
							companies: data.companies,
							franchises: data.franchises,
							percent: data.percent,
							amount2: formatMoney(data.amount),
							balance2: formatMoney(data.balance),
							amount: data.amount,
							balance: data.balance,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async getCompanies() {
		await this.companyService.getCompanies().subscribe((data: any) => {
			this.companies = data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	async getFranchises() {
		await this.franchiseService.getfranchises().subscribe((data: any) => {
			this.franchises = data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	async upSertModalShow(content, data: CashbackCampaign, type = "create") {
		this.typeAction = type;
		this.formSubmit = false;
		await this.newForm();

		this.allApp = true;
		this.changeDetectorRefs.detectChanges();

		// Only edit
		this.formDataFranchises = [];
		this.formDataCompanies = [];

		if (data) {
			this.allApp = data.allApp;
			this.changeDetectorRefs.detectChanges();

			this.formData.patchValue({
				_id: data._id,
				franchise: data.franchise,
				company: data.company,
				name: data.name,
				status: data.status,
				startDate: data.startDate,
				endDate: data.endDate,
				allApp: data.allApp,
				companies: data.companies,
				franchises: data.franchises,
				percent: data.percent,
				amount: data.amount,
				balance: data.balance,
			});

			if (data.companies && Array.isArray(data.companies)) {
				for await (const comp of data.companies) {
					const indexCompany = this.formDataCompanies.length;
					this.formDataCompanies[indexCompany] = new FormGroup({
						companies: new FormControl(comp, [Validators.required]),
					});

					this.formData
						.get("companies")
						.push(this.formDataCompanies[indexCompany]);
				}
			}

			if (data.franchises && Array.isArray(data.franchises)) {
				for await (const fran of data.franchises) {
					const indexFranchise = this.formDataFranchises.length;
					this.formDataFranchises[indexFranchise] = new FormGroup({
						franchises: new FormControl(fran, [Validators.required]),
					});

					this.formData
						.get("franchises")
						.push(this.formDataFranchises[indexFranchise]);
				}
			}
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upSert(data: CashbackCampaign) {
		// Valida as datas

		if (data.startDate) {
			data.startDate = moment(data.startDate, "DDMMYYYY").format("YYYY-MM-DD");
		}

		if (data.endDate) {
			data.endDate = moment(data.endDate, "DDMMYYYY").format("YYYY-MM-DD");
		}

		if (this.typeAction === "create") {
			this.cashbackCampaignService
				.create({
					...data,
					companies: data.companies.map((i: any) => i.companies._id),
					franchises: data.franchises.map((i: any) => i.franchises._id),
				})
				.subscribe(
					async (_: any) => {
						await this.getList(0, this.pageSize);
						this.changeDetectorRefs.detectChanges();
						this.toastr.success("Campanha criada com sucesso!", "Sucesso!");
						this.modalService.dismissAll();
					},
					(error) => {
						if (error?.status === 402) {
							console.log(JSON.stringify(error));
							this.toastr.error(error?.error?.message, "Saldo insuficiente!");
						} else {
							this.toastr.error("Erro ao criar Campanha!", "Falha!");
						}
					}
				);
		} else {
			this.cashbackCampaignService
				.update({
					...data,
					companies: data.companies.map((i: any) => i.companies._id),
					franchises: data.franchises.map((i: any) => i.franchises._id),
				})
				.subscribe(
					async (_: any) => {
						await this.getList(0, this.pageSize);
						this.toastr.success("Campanha alterada com sucesso!", "Sucesso!");
						this.modalService.dismissAll();
					},
					(error) => {
						console.error(error);
						this.toastr.error("Erro ao alterar Campanha!", "Falha!");
						//this.modalService.dismissAll();
					}
				);
		}
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete",
				size: "sm",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async delete() {
		if (!this.idToDelete) {
			this.toastr.error("Erro ao deletar registro!", "Falha!");
			return;
		}
		await this.cashbackCampaignService.delete(this.idToDelete).toPromise();
		this.toastr.success("Registro deletado com sucesso!", "Sucesso!");
		this.idToDelete = undefined;
		await this.getList(0, this.pageSize);
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}

	onChange(event) {
		console.log(event);
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

	toggleAllApp(event) {
		this.allApp = event.checked;
		this.changeDetectorRefs.detectChanges();
	}

	displayFn(data: any) {
		if (data) {
			return `${data.name}`;
		}
	}

	async addNewCompany() {
		return new Promise(async (resolve, reject) => {
			const indexCompany = this.formDataCompanies.length;
			console.log(indexCompany);
			this.formDataCompanies[indexCompany] = new FormGroup({
				companies: new FormControl(undefined, [Validators.required]),
			});

			this.formDataCompanies[indexCompany]
				.get("companies")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					distinctUntilChanged(),
					switchMap((value) =>
						typeof value === "string" && value.length
							? this.companyService.getCompaniesNome(value)
							: []
					)
				)
				.subscribe((results) => {
					if (Array.isArray(results) && results.length > 0) {
						this.companiesList[indexCompany] = results;
					} else {
						this.companiesList[indexCompany] = [];
					}

					this.changeDetectorRefs.detectChanges();
				});

			this.formData.get("companies").push(this.formDataCompanies[indexCompany]);
			resolve(true);
		});
	}

	async addNewFranchise() {
		return new Promise(async (resolve, reject) => {
			const indexFranchise = this.formDataFranchises.length;

			this.formDataFranchises[indexFranchise] = new FormGroup({
				franchises: new FormControl(undefined, [Validators.required]),
			});

			this.formDataFranchises[indexFranchise]
				.get("franchises")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(100),
					distinctUntilChanged(),
					switchMap((value) =>
						typeof value === "string" && value.length > 0
							? this.franchiseService.getFranchisesNome(value)
							: []
					)
				)
				.subscribe((results) => {
					if (Array.isArray(results) && results.length > 0) {
						this.franchisesList[indexFranchise] = results;
					} else {
						this.franchisesList[indexFranchise] = [];
					}

					this.changeDetectorRefs.detectChanges();
				});

			this.formData
				.get("franchises")
				.push(this.formDataFranchises[indexFranchise]);

			resolve(true);
		});
	}

	async removeCompany(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("companies").removeAt(index);

			resolve(true);
		});
	}

	async removeFranchise(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("franchises").removeAt(index);

			resolve(true);
		});
	}

	displayFnFilter(company: Company) {
		if (company) {
			return company.name;
		}
	}

	displayFnFilterFrachise(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async onClickCompanyFilter() {
		await this.getCompanies();
	}
	async onClickFranchiseFilter() {
		await this.getFranchises();
	}
}
