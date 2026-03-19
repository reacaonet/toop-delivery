import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
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
import { AlertModal } from "./../../../../../models/alertModal";
import { Company } from "./../../../../../models/company/company";
import { CompanyService } from "./../../../../services/company.service";
import { Coupon } from "./../../../../../models/coupon/coupon";
import { CouponService } from "./../../../../services/shopping/coupon.service";
import { Franchise } from "./../../../../../models/franchise";
import { FranchiseService } from "./../../../../services/franchise.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-coupon",
	templateUrl: "./coupon.component.html",
	styleUrls: ["./coupon.component.scss"],
})
export class CouponComponent implements OnInit {
	alert: Alert = undefined;
	alertModal: AlertModal = undefined;
	companyValue: string;
	couponIdToDelete;
	companies: Company[][] = [];
	dataSource;
	displayedColumns = [
		"name",
		"pricedescmax",
		"dateInit",
		"dateFinish",
		"status",
		"delete",
	];
	formData;
	formDataCompanies = [];
	formSubmitCoupon = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	franchises: Franchise[] = [];
	franchise = "";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private companyService: CompanyService,
		private couponService: CouponService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		await this.getListCoupons(0, this.pageSize);
		this.getListFranchises();
		this.createNewForm();
	}

	createNewForm() {
		this.companies = [];
		this.formDataCompanies = [];
		this.formData = new FormGroup({
			_id: new FormControl(""),
			franchise: new FormControl("", [Validators.required, checkObjectIdisValid]),
			name: new FormControl("", [Validators.required]),
			description: new FormControl("", [Validators.required]),
			rules: new FormControl("", [Validators.required]),
			price: new FormControl("", [Validators.required]),
			discountPercentage: new FormControl("", [Validators.required]),
			dateInit: new FormControl("", [Validators.required]),
			dateFinish: new FormControl("", [Validators.required]),
			companies: new FormArray([]),
			status: new FormControl(""),
			allCompanies: new FormControl(""),
			minPriceDelivery: new FormControl("", [Validators.required]),
			onlyFirstPurchase: new FormControl(""),
			limit: new FormControl(1, [
				Validators.required,
				Validators.min(1),
				Validators.max(1000),
			]),
		});

		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.formData
			.get("franchise")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value: any) => {
					if (!value) {
						return [];
					}

					let valueStr: string = value;
					if (typeof value === "object") {
						valueStr = value.name;
					}

					return this.franchiseService.getfranchises({
						limit: 20,
						name: valueStr,
						sortName: 1,
					});
				})
			)
			.subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListCoupons(event.pageIndex, event.pageSize);
	}

	displayFn(company: Company) {
		if (company) {
			return company.name;
		}
	}

	displayFranchise(franchise: any) {
		if (franchise) {
			this.franchise = franchise._id;
			return franchise.name;
		}
	}

	async addNewCompany() {
		return new Promise(async (resolve, reject) => {
			const indexCompany = this.formDataCompanies.length;

			this.formDataCompanies[indexCompany] = new FormGroup({
				companies: new FormControl("", [Validators.required]),
			});

			this.formDataCompanies[indexCompany]
				.get("companies")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					distinctUntilChanged(),
					switchMap((value) => {
						if (this.formData.get("franchise")?.value?._id) {
							return this.companyService.getCompaniesNome(
								value,
								this.formData.get("franchise")?.value?._id
							);
						} else {
							this.toastr.warning("Escolha uma franquia", "Franquia!");
							return [];
						}
					})
				)
				.subscribe((results) => (this.companies[indexCompany] = results));

			this.formData.get("companies").push(this.formDataCompanies[indexCompany]);
			resolve(true);
		});
	}

	async removeCompany(index) {
		return new Promise(async (resolve, reject) => {
			await this.formData.get("companies").removeAt(index);

			resolve(true);
		});
	}

	async getListCoupons(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.couponService
			.getCouponsPaginator(pageIn, pageOut)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((coupon, index) => {
						const dateInit = moment(coupon.dateInit, "YYYY-MM-DD HH:mm").format(
							"DD/MM/YY HH:mm"
						);
						const dateFinish = moment(
							coupon.dateFinish,
							"YYYY-MM-DD HH:mm"
						).format("DD/MM/YY HH:mm");
						ELEMENT_DATA.push({
							_id: coupon._id,
							position: index + 1,
							name: coupon.name,
							description: coupon.description,
							rules: coupon.rules,
							price: coupon.price,
							discountPercentage: coupon.discountPercentage,
							companies: coupon.companies,
							franchise: coupon.franchise,
							dateInit,
							dateFinish,
							status: coupon.status,
							allCompanies: coupon.allCompanies,
							minPriceDelivery: coupon.minPriceDelivery,
							onlyFirstPurchase: coupon.onlyFirstPurchase,
							limit: coupon.limit,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async validDateFinish(coupon: Coupon) {
		return new Promise(async (resolve, reject) => {
			if (
				moment(coupon.dateInit, "YYYY-MM-DD").format("YYYY-MM-DD") >
				moment(coupon.dateFinish, "YYYY-MM-DD").format("YYYY-MM-DD")
			) {
				this.toastr.error(
					"Data Final precisa ser maior que a inicial",
					"Falha!"
				);
				setTimeout(() => {
					this.closeAlertModal();
				}, 5000);
				resolve(false);
				return;
			}

			const atualDate = moment().format("YYYY-MM-DD");
			const initialDate = moment(coupon.dateInit, "YYYY-MM-DD").format(
				"YYYY-MM-DD"
			);

			// if (initialDate < atualDate) {
			//   this.toastr.error('Data inicial deve ser maior ou igual à data atual', 'Falha!');
			//   setTimeout(() => { this.closeAlertModal() }, 5000);
			//   resolve(false);
			//   return;
			// }

			resolve(true);
		});
	}

	async upsertCouponModalShow(content, coupon: Coupon, type = "create") {
		this.typeAction = type;
		this.formSubmitCoupon = false;
		await this.createNewForm();
		this.formData.reset();

		// Only edit
		if (coupon) {
			this.formData.patchValue({
				_id: coupon._id,
				name: coupon.name,
				description: coupon.description,
				rules: coupon.rules,
				price: coupon.price,
				discountPercentage: coupon.discountPercentage,
				franchise: coupon.franchise,
				dateInit: moment(coupon.dateInit, "DD/MM/YY")
					.format("DD/MM/YYYY")
					.toString(),
				dateFinish: moment(coupon.dateFinish, "DD/MM/YY")
					.format("DD/MM/YYYY")
					.toString(),
				status: coupon.status,
				allCompanies: coupon.allCompanies,
				minPriceDelivery: coupon.minPriceDelivery,
				onlyFirstPurchase: coupon.onlyFirstPurchase,
				limit: coupon.limit,
				companies: [],
			});
		}

		if (coupon && coupon.companies && Array.isArray(coupon.companies)) {
			for await (const comp of coupon.companies) {
				const indexCompany = this.formDataCompanies.length;
				this.formDataCompanies[indexCompany] = new FormGroup({
					companies: new FormControl(comp, [Validators.required]),
				});
				this.formData
					.get("companies")
					.push(this.formDataCompanies[indexCompany]);
			}
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit-coupon", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsertCoupon(coupon: Coupon) {
		const sendCoupon = { ...coupon };

		if (!coupon.franchise || !coupon.franchise._id) {
			return this.toastr.warning(
				"Informe a Franquia para este cupom",
				"Franquia"
			);
		}

		sendCoupon.franchise = coupon.franchise._id;

		if (coupon.dateInit && moment(coupon.dateInit, "DDMMYYYY").isValid()) {
			sendCoupon.dateInit = moment(coupon.dateInit, "DDMMYYYY").format(
				"YYYY-MM-DD"
			);
		}

		if (coupon.dateFinish && moment(coupon.dateFinish, "DDMMYYYY").isValid()) {
			sendCoupon.dateFinish = moment(coupon.dateFinish, "DDMMYYYY").format(
				"YYYY-MM-DD"
			);
		}

		const validDate = await this.validDateFinish(coupon);

		if (!validDate) {
			return;
		}

		// check list companies
		const newsCompanies = [];
		if (coupon.companies && Array.isArray(coupon.companies)) {
			for await (const item of coupon.companies) {
				if (item.companies && item.companies._id) {
					newsCompanies.push(item.companies._id);
				}
			}
		}

		sendCoupon.companies = newsCompanies;

		if (this.typeAction === "create") {
			this.couponService.createCoupon(sendCoupon).subscribe(
				async (_: any) => {
					await this.getListCoupons(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Coupon atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();

					this.getListCoupons(0, this.pageSize);
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao criar cupom!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		} else {
			this.couponService.updateCoupon(sendCoupon).subscribe(
				async (_: any) => {
					await this.getListCoupons(0, this.pageSize);
					this.toastr.success("Coupon alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					this.changeDetectorRefs.detectChanges();
					this.getListCoupons(0, this.pageSize);
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar Coupon!", "Falha!");
					this.modalService.dismissAll();
				}
			);
		}
	}

	async confirmDeleteModalShow(content, coupon) {
		this.couponIdToDelete = coupon._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-coupon", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteCoupon() {
		if (!this.couponIdToDelete) {
			this.toastr.error("Erro ao deletar Coupon!", "Falha!");
			return;
		}
		await this.couponService.deleteCoupon(this.couponIdToDelete).toPromise();
		this.toastr.success("Coupon deletado com sucesso!", "Sucesso!");
		this.couponIdToDelete = undefined;
		await this.getListCoupons(0, this.pageSize);
	}

	closeAlert() {
		this.alert = null;
	}

	closeAlertModal() {
		this.alertModal = null;
	}

	async getFranchises(userId: string = "") {
		if (!userId) {
			await this.franchiseService
				.getfranchises({
					limit: 20,
					sortName: 1,
				})
				.subscribe((data: any) => {
					this.franchises = data;
					this.changeDetectorRefs.detectChanges();
				});
		} else {
			await this.franchiseService.getByUser(userId, undefined).subscribe((data: any) => {
				this.franchises = data;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	async getListFranchises() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (user && user._id) {
			if (user.isRoot === "true") {
				this.getFranchises();
			} else {
				this.getFranchises(user._id);
			}
		}
	}
}
