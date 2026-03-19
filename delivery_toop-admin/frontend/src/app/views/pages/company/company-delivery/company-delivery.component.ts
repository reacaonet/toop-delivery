import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { Company } from "../../../../../models/company/company";
import { CompanyDelivery } from "../../../../../models/company/companyDelivery";
import { CompanyService } from "../../../../services/company.service";
import { CompanyDeliveryService } from "../../../../services/companydelivery.service";
import { checkObjectIdisValid } from "../../../../util";

import { ToastrService } from "ngx-toastr";

@Component({
	selector: "kt-company-delivery",
	templateUrl: "./company-delivery.component.html",
	styleUrls: ["./company-delivery.component.scss"],
})
export class CompanyDeliveryComponent implements OnInit, AfterViewInit {
	companies: Company[] = [];
	companyValue: string;
	companyDeliveryIdToDelete;
	dataSource;
	displayedColumns = ["company", "mdr", "fee", "max_distance", "delete"];
	formData;
	formDataDeliveryFee;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	isRoot: boolean = false;
	isFranchise: boolean = false;
	isCompany: boolean = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private companyDeliveryService: CompanyDeliveryService,
		private companyService: CompanyService,
		private modalService: NgbModal,
		private toastr: ToastrService
	) {}

	ngOnInit() {
		this.checkProfile();

		this.formFilter = new FormGroup({
			company: new FormControl(""),
		});
		this.formFilter
			.get("company")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					value && typeof value === "string"  && value.length > 0
						? this.companyService.getCompaniesNome(value)
						: []
				)
			)
			.subscribe((results: Company[]) => {
				this.companies = results;
				this.changeDetectorRefs.detectChanges();
			});

		this.getCompany();
		this.getListCompaniesDelivery(0, this.pageSize, undefined);
	}

	async checkProfile() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		console.log(user);
		if (user) {
			if (user.isRoot) this.isRoot = true;
			else if (
				user.franchise &&
				user.franchise != "" &&
				user?.franchises?.length > 0
			)
				this.isFranchise = true;
			else this.isCompany = true;
		}

		this.changeDetectorRefs.detectChanges();
	}

	async addNewFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				company: new FormControl("", [Validators.required, checkObjectIdisValid]),
				cieloMerchantId: new FormControl(""),
				mdr: new FormControl("", [Validators.required]),
				fee: new FormControl("", [Validators.required]),
				isOpen: new FormControl(""),
				max_distance: new FormControl("", [Validators.required]),
				distance: new FormArray([]),
				min_purchase: new FormControl(0, [Validators.required]),
				max_amount_items: new FormControl(0, [Validators.required]),
				time_to_call_delivery: new FormControl(0, [Validators.required]),
				own_delivery: new FormControl(""),
				online_delivery: new FormControl(""),
				has_split: new FormControl(""),
				withdrawMarket: new FormControl(""),
				freeShipping: new FormControl(""),
				freeShippingAbove: new FormControl(""),
			});

			this.formData
				.get("company")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>  (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value): [])
				)
				.subscribe((results) => (this.companies = results));
			resolve(true);
		});
	}

	displayFnFilter(company: Company) {
		if (company) {
			return company.name;
		}
	}

	async onClickCompanyFilter(comp) {
		await this.getListCompaniesDelivery(0, this.pageSize, comp._id);
	}

	displayFn(company: Company) {
		if (company) {
			return company.name;
		}
	}

	async addNewDeliveryFee() {
		return new Promise(async (resolve, reject) => {
			this.formDataDeliveryFee = new FormGroup({
				min: new FormControl("", [Validators.required]),
				max: new FormControl("", [Validators.required]),
				price: new FormControl(0, [Validators.required]),
				delivery_time: new FormControl("", [Validators.required]),
			});

			this.formData.get("distance").push(this.formDataDeliveryFee);
			resolve(true);
		});
	}

	async removeFeeItem(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("distance").removeAt(index);

			resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListCompaniesDelivery(event.pageIndex, event.pageSize, undefined);
	}

	// listar api á colunas.
	async getListCompaniesDelivery(pageIn, pageOut, companyId) {
		const self = this;
		const ELEMENT_DATA = [];

		this.companyDeliveryService
			.getCompaniesDeliveryPaginator(pageIn, pageOut, companyId)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((companyDelivery, index) => {
						ELEMENT_DATA.push({
							_id: companyDelivery._id,
							position: index + 1,
							company: companyDelivery.company ? companyDelivery.company : "-",
							cieloMerchantId: companyDelivery.cieloMerchantId,
							mdr: companyDelivery.mdr,
							fee: companyDelivery.fee,
							isOpen: companyDelivery.isOpen,
							distance: companyDelivery.distance,
							max_distance: companyDelivery.max_distance,
							min_purchase: companyDelivery.min_purchase,
							max_amount_items: companyDelivery.max_amount_items,
							time_to_call_delivery: companyDelivery.time_to_call_delivery,
							own_delivery: companyDelivery.own_delivery,
							has_split: companyDelivery.has_split,
							online_delivery: companyDelivery.online_delivery,
							withdrawMarket: companyDelivery.withdrawMarket,

							freeShipping: companyDelivery?.shippingInfo?.freeShipping,
							freeShippingAbove:
								companyDelivery?.shippingInfo?.freeShippingAbove,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					self.changeDetectorRefs.detectChanges();
				}
			});
	}

	getCompany() {
		this.companyService.getCompanies().subscribe(
			(data: Company[]) => {
				const list = Object.keys(data).map((index) => {
					const company = data[index];
					return company;
				});
				this.companies = list;
			},
			(error) => {}
		);
	}

	async createCompanyDeliveryModalShow(content) {
		this.formSubmitAttempt = false;
		await this.addNewFormData();

		this.myControl = new FormControl();
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-company-delivery",
				size: "lg",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async createCompanyDelivery(companyDelivery: CompanyDelivery) {
		const objCompanyDelivery = {
			...companyDelivery,
			shippingInfo: {
				freeShipping: companyDelivery?.freeShipping,
				freeShippingAbove: !companyDelivery?.freeShipping
					? null
					: companyDelivery?.freeShippingAbove,
			},
		};

		this.companyDeliveryService
			.createCompanyDelivery(objCompanyDelivery)
			.subscribe(
				(data: any) => {
					const companydeliveryData = data.data;
					this.toastr.success("Registro criado com sucesso!", "Novo Registro");

					this.dataSource.data.push({
						_id: companydeliveryData._id,
						company: companydeliveryData.company
							? companydeliveryData.company
							: "-",
						cieloMerchantId: companydeliveryData.cieloMerchantId,
						mdr: companydeliveryData.mdr,
						fee: companydeliveryData.fee,
						isOpen: companyDelivery.isOpen,
						distance: companydeliveryData.distance,
						max_distance: companydeliveryData.max_distance,
						min_purchase: companyDelivery.min_purchase,
						max_amount_items: companyDelivery.max_amount_items,
						time_to_call_delivery: companyDelivery.time_to_call_delivery,
						withdrawMarket: companyDelivery.withdrawMarket,
						own_delivery: companyDelivery.own_delivery,
						has_split: companyDelivery.has_split,
						online_delivery: companyDelivery.online_delivery,

						freeShipping: companyDelivery?.freeShipping,
						freeShippingAbove: companyDelivery?.freeShippingAbove,
					});
					this.dataSource._updateChangeSubscription();
					this.changeDetectorRefs.detectChanges();
					this.modalService.dismissAll();
				},
				(error) => {
					this.toastr.warning("Falha ao criar Registro!", "Falhou");
					this.modalService.dismissAll();
				}
			);
	}

	async editCompanyDeliveryModalShow(
		content,
		companyDelivery: CompanyDelivery
	) {
		this.formSubmitAttempt = false;
		await this.addNewFormData();

		this.formData.patchValue({
			_id: companyDelivery._id,
			company: companyDelivery.company,
			cieloMerchantId: companyDelivery.cieloMerchantId,
			mdr: companyDelivery.mdr,
			fee: companyDelivery.fee,
			isOpen: companyDelivery.isOpen,
			max_distance: companyDelivery.max_distance,
			min_purchase: companyDelivery.min_purchase,
			max_amount_items: companyDelivery.max_amount_items,
			time_to_call_delivery: companyDelivery.time_to_call_delivery,
			withdrawMarket: companyDelivery.withdrawMarket,
			freeShipping: companyDelivery?.freeShipping,
			freeShippingAbove: companyDelivery?.freeShippingAbove,
			own_delivery: companyDelivery.own_delivery,
			has_split: companyDelivery.has_split,
			online_delivery: companyDelivery.online_delivery,
			distance: [],
		});

		// Distances
		for await (const dist of companyDelivery.distance) {
			this.formDataDeliveryFee = new FormGroup({
				min: new FormControl(dist.min, [Validators.required]),
				max: new FormControl(dist.max, [Validators.required]),
				price: new FormControl(dist.price, [Validators.required]),
				delivery_time: new FormControl(dist.delivery_time, [
					Validators.required,
				]),
			});

			this.formData.get("distance").push(this.formDataDeliveryFee);
		}

		this.myControl = new FormControl(companyDelivery.company.name);
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-company-delivery",
				size: "lg",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async updateCompanyDelivery(companyDelivery: CompanyDelivery) {
		const objCompanyDelivery = {
			...companyDelivery,
			shippingInfo: {
				freeShipping: companyDelivery?.freeShipping,
				freeShippingAbove: !companyDelivery?.freeShipping
					? null
					: companyDelivery?.freeShippingAbove,
			},
		};

		this.companyDeliveryService
			.updateCompanyDelivery(objCompanyDelivery)
			.subscribe(
				(data: any) => {
					const index = this.dataSource.data
						.map((e: any) => e._id)
						.indexOf(companyDelivery._id);
					this.dataSource.data[index] = data.data;

					(this.dataSource.data[index].company = data.data.company
						? data.data.company
						: "-"),
						this.dataSource._updateChangeSubscription();
					this.formData.reset();
					this.toastr.success("Registro alterado com sucesso!", "Alterado");

					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
					this.getListCompaniesDelivery(0, this.pageSize, undefined);
				},
				(error) => {
					console.error(error);
					this.toastr.error("Falha ao alterar REgistro!", "Error");
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
				}
			);
	}

	async confirmDeleteModalShow(content, companyDelivery) {
		this.companyDeliveryIdToDelete = companyDelivery.company._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-company-delivery",
				size: "sm",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteCompanyDelivery() {
		try {
			if (!this.companyDeliveryIdToDelete) {
				this.toastr.error("Falha ao deletar Registro!", "Remover");
				return;
			}

			await this.companyDeliveryService
				.deleteCompanyDelivery(this.companyDeliveryIdToDelete)
				.toPromise();
			this.toastr.success("Registro deletado com sucesso!", "Removido");

			this.companyDeliveryIdToDelete = undefined;
			await this.getListCompaniesDelivery(0, this.pageSize, undefined);
		} catch (err) {
			let message = "Não foi possível remover informação";
			if (err.error && err.error.message) {
				message = err.error.message;
			} else {
				console.error(err);
			}

			this.toastr.error(message);
		}
	}

	ngAfterViewInit() {}

	onChangeHeader(event) {
		this.getListCompaniesDelivery(event, undefined, undefined);
	}

	focusInCompany(company) {
		this.companyValue = company.target.value;
	}

	focusOutCompany(company, modalType) {
		const companyValue = company.target.value;

		this.companies.forEach((company: Company, index) => {
			if (company.name === companyValue) {
				this.formData.controls.company.setValue(company._id);
				this.companyValue = company.name;
				return true;
			}
		});

		company.target.value = this.companyValue;
	}
}
