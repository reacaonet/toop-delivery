import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Company } from "../../../../../models/company/company";
import { CompanyService } from "../../../../services/company.service";
import { Franchise } from "../../../../../models/franchise";
import { FranchiseService } from "../../../../services/franchise.service";
import { Group } from "../../../../../models/group";
import { GroupService } from "../../../../services/group.service";
import { SegmentModel } from "../../../../../models/company/segment";
import { SegmentService } from "./../../../../services/company/segment.service";
import { TypePaymentsService } from "./../../../../services/typepayments.service";
import { BrazilianBanks } from "../../../../../models/setting/brazilianBanks";
import { BrazilianBankService } from "../../../../services/settings/brazilian-bank.service";
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-company",
	templateUrl: "./company.component.html",
	styleUrls: ["./company.component.scss"],
})
export class CompanyComponent implements OnInit, AfterViewInit {
	box = "";
	boxNome = "";
	companyIdToDelete; // Save company id to delete
	dataSource;
	displayedColumns = [
		"image",
		"franchise",
		"name",
		"status",
		"approved",
		"category",
		"groups",
		"segment",
		"companyCategory",
		"imageHeader",
		// "type",
		"delete",
	];
	files: Set<File>;
	imageHeader: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	groups: Group[] = [];
	segments: SegmentModel[] = [];
	companies: Company[] = [];
	groupValue: string;
	name: Group[] = [];
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	createDigitalAccount = false;

	brBanks: BrazilianBanks[] = [];

	categoriaList: string[] = [];
	keywordsList: string[] = [];

	franchises: Franchise[] = [];
	isApproved = true;
	filter: any = {
		companyId: undefined,
		groupId: undefined,
	};

	listCategory = [
		{
			key: "delivery",
			name: "Delivery",
		},
		{
			key: "service",
			name: "Serviços",
		},
	];

	constructor(private changeDetectorRefs: ChangeDetectorRef, private companyService: CompanyService, private franchiseService: FranchiseService, private groupService: GroupService, private modalService: NgbModal, private segmentService: SegmentService, private toastr: ToastrService, private typePaymentService: TypePaymentsService, private brazilianBankService: BrazilianBankService) { }

	async ngOnInit() {
		this.getListFranchises();

		await this.addFormFilter();
		await this.getListCompanies(0, this.pageSize, undefined, undefined);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				company: new FormControl(""),
				group: new FormControl(""),
			});

			this.formFilter
				.get("group")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string" && value.length > 0) {
							return this.groupService.getGroupsNome(value);
						} else if (!value && this.filter.groupId) {
							this.filter.groupId = undefined;
							this.getListCompanies(0, this.pageSize, undefined, this.filter.companyId);
						}

						return [];
					})
				)
				.subscribe((results) => {
					if (results && results["lista"]) {
						this.groups = results["lista"];
						this.changeDetectorRefs.detectChanges();
					}
				});

			this.formFilter
				.get("company")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => {
						if (value && typeof value === "string" && value.length > 0) {
							return this.companyService.getCompaniesNome(value);
						} else if (!value && this.filter.companyId) {
							this.filter.companyId = undefined;
							this.getListCompanies(0, this.pageSize, this.filter.groupId, undefined);
						}

						return [];
					})
				)
				.subscribe((results: Company[]) => {
					if (results && results.length > 0) {
						this.companies = results;
						this.changeDetectorRefs.detectChanges();
					}
				});

			return resolve(true);
		});
	}

	async addFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl("", [Validators.required]),
				description: new FormControl(""),
				status: new FormControl(""),
				isHighlighted: new FormControl(false),
				lat: new FormControl("", [Validators.required]),
				lng: new FormControl("", [Validators.required]),
				address: new FormControl("", [Validators.required]),
				complement: new FormControl(""),
				phone: new FormControl(""),
				type: new FormControl("restaurant"),
				shoppingFlow: new FormControl("MENU", [Validators.required]),
				groups: new FormControl("", [Validators.required, checkObjectIdisValid]),
				file: new FormControl("", [Validators.required]),
				imageHeader: new FormControl(""),
				category: new FormControl(""),
				segment: new FormControl(undefined, [Validators.required]),
				cnpj: new FormControl(undefined, [Validators.required]),
				keywords: new FormControl(""),
				typePayments: new FormArray([]),
				franchise: new FormControl("", [Validators.required]),
				companyCategory: new FormControl("delivery", [Validators.required]),
				recipient_id: new FormControl(undefined),
				pagar_me_bank_id: new FormControl(undefined),
				bankData: new FormGroup({
					brazilianBank: new FormControl(undefined, [checkObjectIdisValid]),
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
				socialNetwork: new FormGroup({
					whatsapp: new FormControl(undefined),
					instagram: new FormControl(undefined),
					facebook: new FormControl(undefined),
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

			this.formData
				.get("groups")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === "string" && value.length > 0 ? this.groupService.getGroupsNome(value) : []))
				)
				.subscribe((results) => (this.groups = results["lista"]));

			this.formData
				.get("franchise")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (value && typeof value === "string" && value.length > 0 ? this.getListFranchises() : []))
				)
				.subscribe((results) => {
					this.franchises = results;
					this.changeDetectorRefs.detectChanges();
				});

			this.formData
				.get("segment")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (value && typeof value === "string" && value.length > 0 ? this.segmentService.get(value) : []))
				)
				.subscribe((results) => (this.segments = results));

			return resolve(true);
		});
	}

	displayFnBrazilianBank(bank: BrazilianBanks) {
		if (bank) {
			return `${bank.compe} - ${bank.short_name}`;
		}
	}

	displayFnFilter(group: Group) {
		if (group) {
			return group.name;
		}
	}

	async onClickGroupFilter(group) {
		this.filter.groupId = group._id ? group._id : undefined;
		await this.getListCompanies(0, this.pageSize, group._id, undefined);
	}

	async onClickCompanyFilter(company) {
		this.filter.companyId = company._id ? company._id : undefined;
		await this.getListCompanies(0, this.pageSize, undefined, company._id);
	}

	displayFn(group: Group) {
		if (group) {
			return group.name;
		}
	}

	displayFnSegment(segment: SegmentModel) {
		if (segment) {
			return segment.name;
		}
	}

	addCategoria(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if ((value || "").trim()) {
			this.categoriaList.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = "";
		}
	}

	removeCategoria(categoria: string): void {
		let index = 0;
		for (index = 0; index < this.categoriaList.length; index++) {
			if (this.categoriaList[index] === categoria) {
				break;
			}
		}

		if (index >= 0) {
			this.categoriaList.splice(index, 1);
		}
	}

	addKeyword(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		// Add our fruit
		if ((value || "").trim()) {
			this.keywordsList.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = "";
		}
	}

	removeKeyword(categoria: string): void {
		let index = 0;
		for (index = 0; index < this.keywordsList.length; index++) {
			if (this.keywordsList[index] === categoria) {
				break;
			}
		}

		if (index >= 0) {
			this.keywordsList.splice(index, 1);
		}
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListCompanies(event.pageIndex, event.pageSize, this.filter.companyId, this.filter.groupId);
	}

	async getListCompanies(pageIn, pageOut, groupId, companyId) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.companyService.getCompaniesPaginator(pageIn, pageOut, groupId, companyId).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((company, index) => {
					ELEMENT_DATA.push({
						_id: company._id,
						position: index + 1,
						name: company.name,
						description: company.description,
						status: company.status,
						isHighlighted: company.isHighlighted,
						lat: company.lat,
						image: company.images && company.images[0] ? company.images[0] : undefined,
						imageHeader: company.imageAppHeader && company.imageAppHeader[0] ? company.imageAppHeader[0] : undefined,
						lng: company.lng,
						address: company.address,
						complement: company.complement,
						typePayments: company.companyDelivery && company.companyDelivery.typePayments ? company.companyDelivery.typePayments : [],
						phone: company.phone,
						type: company.type ? company.type : "restaurant",
						shoppingFlow: company.shoppingFlow,
						location: company.location,
						groups: company.groups ? company.groups : undefined,
						franchise: company?.franchise ? company?.franchise : undefined,
						category: company.category,
						segment: company.segment,
						keywords: company.keywords,
						cnpj: company.cnpj ? company.cnpj : undefined,
						approved: company.approved === false ? false : true,
						companyCategory: company.companyCategory ? company.companyCategory : "delivery",
						bankData: company.bankData ? company.bankData : {},

						recipient_id: company.recipient_id,
						pagar_me_bank_id: company.pagar_me_bank_id,
						socialNetwork: company.socialNetwork ? company.socialNetwork : {},
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	getListPayments(list = []) {
		return new Promise(async (resolve, reject) => {
			const payments = await this.typePaymentService.getTypePayments().toPromise();

			if (payments && Array.isArray(payments)) {
				for await (const item of payments) {
					const paymentsItem = list.filter((id) => {
						if (item._id === id) {
							return id;
						}
					});

					const formTypePaymentItem = new FormGroup({
						_id: new FormControl(item._id),
						image: new FormControl(item.image[0]),
						name: new FormControl(item.name),
						brand: new FormControl(item.brand),
						status: new FormControl(paymentsItem.length ? true : false),
						type: new FormControl(item.type),
						shoppingFlow: new FormControl(item.shoppingFlow),
					});

					this.formData.get("typePayments").push(formTypePaymentItem);
				}
				this.changeDetectorRefs.detectChanges();
			}
			resolve(true);
		});
	}

	async getFranchises(userId: string = "") {
		if (!userId) {
			await this.franchiseService.getfranchises({ limit: 9999 }).subscribe((data: any) => {
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
		const user = localStorage.getItem("@user-info") ? JSON.parse(localStorage.getItem("@user-info")) : undefined;

		if (user && user._id) {
			if (user.company === "5eb311b4161dd2f719517d62") {
				this.getFranchises();
			} else {
				this.getFranchises(user._id);
			}
		}
	}

	async createCompanyModalShow(content) {
		await this.addFormData();
		this.categoriaList = [];
		this.keywordsList = [];
		await this.getListPayments(content.typePayments);

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-company",
				size: "xl",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async createCompany(company: Company, content, save = false) {
		company.createDigitalAccount = this.createDigitalAccount;

		if (company?.shoppingFlow === "PRODUCT" && company?.companyCategory === "service") {
			return this.toastr.warning("Tipo de Empresa Serviço pode ser apenas selecionado o fluxo de compra Cardárpio");
		}

		if (!this.files || this.files.size <= 0) {
			this.toastr.error("Erro ao criar Empresa! Imagem é obrigatoria!", "Falha!");
			return;
		}

		if (company.typePayments && Array.isArray(company.typePayments)) {
			const payments = company.typePayments.filter((item) => {
				if (item.status === true) {
					return item._id;
				}
			});

			company.typePayments = payments.map((item) => item._id);
		} else {
			company.typePayments = [];
		}

		company.category = this.categoriaList;
		company.keywords = this.keywordsList;

		if (company.bankData.pixType === null) {
			delete company.bankData.pixType;
		}

		this.companyService.createCompany(company).subscribe(
			async (data: any) => {
				this.modalService.dismissAll("");
				this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
				await this.getListCompanies(0, this.pageSize, undefined, undefined);
			},
			(error) => {
				let message = "Falha ao criar Company";
				if (error.error && error.error.message) {
					message = error.error.message;
				}

				this.toastr.error(message, "Falha!");
			}
		);
	}

	async editCompanyModalShow(content, company: Company) {
		await this.addFormData();
		await this.getListPayments(company.typePayments);

		// Alter file permissions
		this.formData.get("file").clearValidators();
		this.formData.get("file").updateValueAndValidity();

		const longitude = company.location && company.location.coordinates && company.location.coordinates[0] ? company.location.coordinates[0] : undefined;
		const latitude = company.location && company.location.coordinates && company.location.coordinates[1] ? company.location.coordinates[1] : undefined;
		this.categoriaList = [];
		this.keywordsList = [];

		this.formData.patchValue({
			_id: company._id,
			name: company.name,
			description: company.description,
			status: company.status,
			isHighlighted: company.isHighlighted,
			lat: latitude,
			lng: longitude,
			address: company.address,
			complement: company.complement,
			phone: company.phone,
			type: company.type ? company.type : "restaurant",
			shoppingFlow: company.shoppingFlow,
			segment: company.segment,
			groups: company.groups,
			franchise: company?.franchise?._id,
			cnpj: company.cnpj,
			file: "",
			imageHeader: "",
			bankData: company.bankData ? company.bankData : {},
			recipient_id: company.recipient_id,
			pagar_me_bank_id: company.pagar_me_bank_id,
			socialNetwork: company.socialNetwork ? company.socialNetwork : {},
			companyCategory: company.companyCategory ? company.companyCategory : "delivery",
		});

		if (Array.isArray(company.category)) {
			company.category.forEach((x) => {
				this.categoriaList.push(x);
			});
		}

		if (Array.isArray(company.keywords)) {
			company.keywords.forEach((x) => {
				this.keywordsList.push(x);
			});
		}

		if (`${company.approved}` === "false") {
			this.isApproved = false;
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-company",
				size: "xl",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async updateCompany(company: Company) {
		company.category = this.categoriaList;
		company.keywords = this.keywordsList;

		if (company?.shoppingFlow === "PRODUCT" && company?.companyCategory === "service") {
			return this.toastr.warning("Tipo de Empresa Serviço pode ser apenas selecionado o fluxo de compra Cardárpio");
		}

		if (company.typePayments && Array.isArray(company.typePayments)) {
			const payments = company.typePayments.filter((item) => {
				if (item.status === true) {
					return item._id;
				}
			});

			company.typePayments = payments.map((item) => item._id);
		} else {
			company.typePayments = [];
		}

		if (company.status && `${company.status}` === "true") {
			company.approved = true;
		}

		if (!company.companyCategory) {
			return this.toastr.warning("Formulário", "Informe o Tipo da Empresa");
		}

		this.companyService.updateCompany(company).subscribe(
			async (data: any) => {
				this.toastr.success("Company alterado com sucesso!", "Sucesso!");
				await this.getListCompanies(0, this.pageSize, undefined, undefined);
				this.modalService.dismissAll();
			},
			(error) => {
				this.toastr.error("Falha ao alterar Company!", "Falha!");
				this.modalService.dismissAll();
			}
		);
	}

	displayFnFranchise(franchise: Franchise) {
		if (franchise) {
			return franchise.name;
		}
	}

	async confirmDeleteModalShow(content, company) {
		this.companyIdToDelete = company._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-company",
				size: "sm",
				backdrop: "static",
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async deleteCompany() {
		// caso não encotre o id dar error
		if (!this.companyIdToDelete) {
			this.toastr.error("Falha ao deletar Company!", "Falha!");
			return;
		}
		// delete
		await this.companyService.deleteCompany(this.companyIdToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success("Company deletado com sucesso!", "Sucesso!");
		// trata o id pra indefinido
		this.companyIdToDelete = undefined;
		// att a tela
		await this.getListCompanies(0, this.pageSize, undefined, undefined);
	}

	ngAfterViewInit() { }

	focusInGroup(group) {
		this.groupValue = group.target.value;
	}

	focusOutGroup(group, modalType) {
		const groupValue = group.target.value;

		this.groups.forEach((group: Group, index) => {
			if (group.name === groupValue) {
				this.formData.controls.groups.setValue(group._id);
				this.groupValue = group.name;
				return true; // break foreach
			}
		});

		// Se não econtrar, retornar ao valor anterior
		group.target.value = this.groupValue;
	}

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

	onChangeImageHeader(event) {
		const selectedFiles = <FileList>event.srcElement.files;

		const fileNames = [];
		const fileList = [];
		if (event.target.files && event.target.files.length) {
			this.imageHeader = new Set();
			for (let i = 0; i < selectedFiles.length; i++) {
				fileNames.push(selectedFiles[i].name);
				this.imageHeader.add(selectedFiles[i]);

				const reader = new FileReader();
				// const [file] = event.target.files;
				reader.readAsDataURL(selectedFiles[i]);

				reader.onload = () => {
					fileList.push({ base64: reader.result });
					this.formData.patchValue({
						imageHeader: fileList,
					});
				};
			}
		}
		document.getElementById("imageHeaderLabel").innerHTML = fileNames.join(", ");
	}

	onEnter(value: string) {
		this.box = value;
		this.boxNome = "";
		this.getListCompanies(0, this.pageSize, undefined, undefined);
	}
}
