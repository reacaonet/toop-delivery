import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import moment from "moment";

/** Service */
import { SendUploadsService } from "./../../../../../services/upload/sendUpload.service";
import { FranchiseService } from "./../../../../../services/franchise.service";
import { DiscountService } from "./../../../../../services/mobility/discount.service";
import { ServiceService } from "./../../../../../services/mobility/service.service";

/** Model */
import { Franchise } from "../../../../../../models/franchise";

/** Util */
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-voucher",
	templateUrl: "./discount.component.html",
	styleUrls: ["./discount.component.scss"],
})
export class DiscountComponent implements OnInit, AfterViewInit {
	helpdeskUrl = "/helpdesk/faq/63a1d0f3f0f5dbc1805e62f7";
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	dataSource: any;
	formFilter: any;
	formData: any;
	formSubmitAttempt = false;
	formLogo: any;
	formImage: any;
	displayedColumns = ["franchise", "name", "active", "amountUsed", "action"];
	urlLogo = null;
	urlImage = null;
	franchises: Franchise[] = [];
	services: any = [];
	load: Boolean = false;
	totalLength;
	languageDefault: string = "pt-BR";
	optionsCurrencyMask = { prefix: "R$ " };

	constructor(private changeDetectorRefs: ChangeDetectorRef, private modalService: NgbModal, private toastr: ToastrService, private sendUploadsService: SendUploadsService, private franchiseService: FranchiseService, private discountService: DiscountService, private serviceService: ServiceService) {}

	async ngOnInit() {
		const userStorage = localStorage.getItem("@user-info") ? JSON.parse(localStorage.getItem("@user-info")) : undefined;

		this.languageDefault = userStorage?.languageDefault || "pt-BR";

		if (userStorage?.currencySymbol) {
			this.optionsCurrencyMask = { prefix: `${userStorage?.currencySymbol} ` };
		}

		await this.addFormFilter();
		await this.getList(0, this.pageSize);
	}

	ngAfterViewInit() {}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			this.formFilter = new FormGroup({
				searchDriver: new FormControl("", []),
			});

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				franchise: new FormControl(undefined, [checkObjectIdisValid]),
				passenger: new FormControl(undefined),
				service: new FormControl(undefined),
				name: new FormControl(""),
				price: new FormControl(undefined),
				percent: new FormControl(undefined),
				startDate: new FormControl(""),
				endDate: new FormControl(""),
				type: new FormControl(""),
				amountAvailable: new FormControl(undefined),
				active: new FormControl(true),
			});

			this.formData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === "string" && value.length > 0 ? this.franchiseService.getFranchisesNome(value) : []))
				)
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formData
				.get("service")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (typeof value === "string" && value.length > 0) {
							return this.serviceService.getNome(value);
						}

						return [];
					})
				)
				.subscribe((results) => {
					this.services = results;
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.discountService
			.paginator({
				pageIn: pageIn,
				pageOut: pageOut,
			})
			.subscribe((data: any) => {
				if (data && data.list && Array.isArray(data.list)) {
					data.list.forEach((item, index) => {
						ELEMENT_DATA.push({
							_id: item._id,
							franchise: item.franchise,
							passenger: item.passenger || null,
							service: item.service || null,
							name: item.name,
							price: item.price || null,
							percent: item.percent || null,
							startDate: item.startDate ? moment(item.startDate).utc(false).format("YYYY-MM-DD") : "",
							endDate: item.endDate ? moment(item.endDate).utc(false).format("YYYY-MM-DD") : "",
							type: item.type || "single",
							amountAvailable: item.amountAvailable || null,
							amountUsed: item.amountUsed || 0,
							active: item.active ? item.active : false,
						});
					});
				}

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			});
	}

	async createModalShow(content) {
		await this.newFormData();

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-insert-edit",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async editModalShow(content, data: any) {
		await this.newFormData();

		this.formData.patchValue(data);

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-data",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async sendForm(data: any) {
		try {
			const payload: any = {
				...data,
				franchise: data.franchise?._id,
			};

			if (data?.service && data?.service._id) {
				payload.service = data?.service._id;
			}

			if (payload.amountAvailable === null) {
				delete payload.amountAvailable;
			}

			if (data._id) {
				// edit
				this.load = true;

				await this.discountService.update(data._id, payload).toPromise();

				this.getList(0, this.pageLimit);
				this.toastr.success("Atualizado com sucesso", "Salvar");
			} else {
				// save
				this.load = true;
				console.log("Criar ...");

				await this.discountService.create(payload).toPromise();
				this.getList(0, this.pageLimit);
				this.toastr.success("Enviado com sucesso", "Salvar");
			}

			this.load = false;
			this.modalService.dismissAll("");
		} catch (error) {
			this.load = false;

			let messageError = "Error ao salvar";
			if (error?.error?.message) {
				messageError = error?.error?.message;
			}

			this.changeDetectorRefs.detectChanges();
			this.toastr.error(messageError, "Falha!");
		}
	}

	displayFn(item: any) {
		if (item) {
			return item.name;
		}
	}
}
