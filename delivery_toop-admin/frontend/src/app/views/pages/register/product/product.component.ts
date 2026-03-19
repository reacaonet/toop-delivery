import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
	ViewChild,
	Directive,
	ElementRef,
} from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

import { startWith, debounceTime, switchMap, map } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { MatChipInputEvent } from "@angular/material/chips";
import {
	MatAutocomplete,
	MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import moment from "moment";
import { ImageCompressService } from "ng2-image-compress";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { checkObjectIdisValid } from "../../../../util";

/** Service */
import { ProductBankService } from "./../../../../services/product-bank.service";
import { DepartmentService } from "./../../../../services/department.service";

import { ImageBank } from "./../../../../../models/imageBank";
import { ProductService } from "./../../../../services/product.service";
import { Product } from "./../../../../../models/product";
import { User, Company } from "../../../../core/auth";
import { COMMA, ENTER, SPACE } from "@angular/cdk/keycodes";

import { CustomResponse } from "../../../../../models/CustomResponse";

@Component({
	selector: "kt-product",
	templateUrl: "./product.component.html",
	styleUrls: ["./product.component.scss"],
})
export class ProductComponent implements OnInit, AfterViewInit {
	userLogged: User;
	userCompany: Company;

	dataSource;
	displayedColumns = ["image", "name", "price", "department", "delete"];
	displayedColumnsGraphic = ["position", "image", "name", "price", "delete"];
	dataSourceGraphic;

	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitProduct = false;
	formQuickEdit: FormGroup;
	formSubmitQuickEdit = false;
	showFormQuickEdit = false;
	updatedTabloidGenerate = false;
	productIdToDelete;
	typeAction = "create";
	imagesbank: ImageBank[] = [];
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	restoreDepartments;
	listSort = [];

	elementToEdit = {
		name: "",
		price: null,
		_id: "",
	};
	content: any;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	tabloid = "";
	tabloid_url = "";

	separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
	filteredDepartments: Observable<string[]>;
	TabloidStatus = "SELECIONE OS ITEM";
	keywordsList: string[] = [];
	department: any[] = [];
	allDepartments: any = [];
	productDepartments;

	productSelected: Product;
	barcodeAlreadyExist: boolean;
	productList: Product[];
	productChoosed;
	indexEdit = null;
	VOForm;

	@ViewChild("modalInfo", { static: true })
	modalInfoProduct: Directive;

	@ViewChild("departInput") departInput: ElementRef<HTMLInputElement>;
	@ViewChild("auto") matAutocomplete: MatAutocomplete;

	constructor(
		private modalService: NgbModal,
		private changeDetectorRefs: ChangeDetectorRef,
		private toastr: ToastrService,
		private productService: ProductService,
		private productBankService: ProductBankService,
		private departmentService: DepartmentService
	) {}

	async ngOnInit() {
		this.getDepartments();
		await this.addFormFilter();

		this.userCompany = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;

		this.listSortDepartment();

		this.VOForm = new FormGroup({
			price: new FormControl(0, [Validators.required]),
			pricePromotion: new FormControl(0),
		});
	}

	async getDepartments() {
		try {
			this.productDepartments = await this.departmentService
				.getDepartments()
				.toPromise();
			this.allDepartments = this.productDepartments.map(({ name }) => name);
			this.restoreDepartments = this.allDepartments;
		} catch (err) {}
	}

	removeDepartment(department: string): void {
		const index = this.department.indexOf(department);
		if (index >= 0) {
			this.department.splice(index, 1);
			this.allDepartments.push(department);
			this.formData.patchValue({
				department: this.department,
			});
		}
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		const departmentSelected = event.option.viewValue;
		this.department.push(departmentSelected);
		this.formData.patchValue({
			department: this.department,
		});
		this.allDepartments = this.allDepartments.filter(
			(department: any) => department !== departmentSelected
		);
		this.departmentSelected.setValue(null);
	}

	addDepartment(event: MatChipInputEvent): void {
		const input = event.input;
		if (input) {
			input.value = "";
		}
	}

	startFilterDepartments() {
		this.filteredDepartments = this.departmentSelected.valueChanges.pipe(
			startWith(""),
			map((depart: string | null) =>
				depart ? this._filter(depart) : this.allDepartments.slice()
			)
		);
	}

	private _filter(value: string): string[] {
		const filterValue = value.toLowerCase();
		return this.allDepartments.filter(
			(department) => department.toLowerCase().indexOf(filterValue) === 0
		);
	}

	async ngAfterViewInit() {
		await this.getListProduct(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.images.value,
			this.formFilter.controls.link.value,
			this.formFilter.controls.startPrice.value,
			this.formFilter.controls.endPrice.value
		);
	}

	async addFormFilter() {
		return new Promise(async (resolve, _) => {
			this.formFilter = new FormGroup({
				name: new FormControl(undefined),
				images: new FormControl("withimages"),
				link: new FormControl("all"),
				startPrice: new FormControl(undefined),
				endPrice: new FormControl(undefined),
				productSelected: new FormControl("", [checkObjectIdisValid]),
			});
			this.formFilter
				.get("name")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ?
						this.getListProduct(
							0,
							this.pageSize,
							value,
							this.formFilter.controls.images.value,
							this.formFilter.controls.link.value,
							this.formFilter.controls.startPrice.value,
							this.formFilter.controls.endPrice.value
						):[]
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("images")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ?
						this.getListProduct(
							0,
							this.pageSize,
							this.formFilter.controls.name.value,
							value,
							this.formFilter.controls.link.value,
							this.formFilter.controls.startPrice.value,
							this.formFilter.controls.endPrice.value
						):[]
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("link")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						this.getListProduct(
							0,
							this.pageSize,
							this.formFilter.controls.name.value,
							this.formFilter.controls.images.value,
							value,
							this.formFilter.controls.startPrice.value,
							this.formFilter.controls.endPrice.value
						)
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("startPrice")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						this.getListProduct(
							0,
							this.pageSize,
							this.formFilter.controls.name.value,
							this.formFilter.controls.images.value,
							this.formFilter.controls.link.value,
							value,
							this.formFilter.controls.endPrice.value
						)
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			this.formFilter
				.get("endPrice")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000),
					switchMap((value) =>
						this.getListProduct(
							0,
							this.pageSize,
							this.formFilter.controls.name.value,
							this.formFilter.controls.images.value,
							this.formFilter.controls.link.value,
							this.formFilter.controls.startPrice.value,
							value
						)
					)
				)
				.subscribe(() => {
					this.changeDetectorRefs.detectChanges();
				});

			resolve(true);
		});
	}

	async addNewFormData() {
		return new Promise(async (resolve) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				description: new FormControl(undefined),
				unity: new FormControl("unidade", [Validators.required]),
				barcode: new FormControl(undefined),
				price: new FormControl(0, [Validators.required]),
				barcodeBox: new FormControl(undefined),
				pricePromotion: new FormControl(0),
				maximumAmount: new FormControl(0, [Validators.required]),
				dateInitPricePromotion: new FormControl(undefined),
				dateFinishPricePromotion: new FormControl(undefined),
				file: new FormControl(undefined, [Validators.required]),
				keywords: new FormControl(undefined),
				tabloid: new FormControl(undefined),
				departmentSelected: new FormControl("", [checkObjectIdisValid]),
				department: new FormControl([], [Validators.required]),
			});

			resolve(true);
		});
	}

	get departmentSelected(): FormControl {
		return this.formData.get("departmentSelected") as FormControl;
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

	async upsertProductModalShow(content, product: Product, type = "create") {
		await this.addNewFormData();
		this.startFilterDepartments();

		this.typeAction = type;
		this.formSubmitProduct = false;
		this.keywordsList = [];
		this.department = [];

		// Only edit
		if (product) {
			this.formData.get("file").clearValidators();
			this.formData.get("file").updateValueAndValidity();

			// Tenho que editar antes
			if (product.dateInitPricePromotion) {
				product.dateInitPricePromotion = moment(
					product.dateInitPricePromotion,
					"YYYY-MM-DD"
				).format("DD/MM/YYYY");
			}

			if (product.dateFinishPricePromotion) {
				product.dateFinishPricePromotion = moment(
					product.dateFinishPricePromotion,
					"YYYY-MM-DD"
				).format("DD/MM/YYYY");
			}

			if (Array.isArray(product.keywords)) {
				product.keywords.forEach((x) => {
					this.keywordsList.push(x);
				});
			}

			if (Array.isArray(product.department)) {
				this.department = [];
				product.department.forEach((x) => {
					this.department.push(x);
				});
				const tempAllDepts = this.allDepartments.filter(
					(x) => !this.department.includes(x)
				);
				this.allDepartments = tempAllDepts;
			}

			// Seta os dados no form
			this.formData.patchValue({
				_id: product._id,
				name: product.name,
				description: product.description,
				unity: product.unity,
				barcode: product.barcode,
				price: product.price,
				barcodeBox: product.barcodeBox,
				maximumAmount: product.maximumAmount || 0,
				pricePromotion: product.pricePromotion,
				dateInitPricePromotion: product.dateInitPricePromotion,
				dateFinishPricePromotion: product.dateFinishPricePromotion,
				file: "",
				keywords: product.keywords,
				company: product.company,
				department: product.department,
				tabloid: null,
			});
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-product",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				() => {},
				() => {}
			);
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListProduct(
			event.pageIndex,
			event.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.images.value,
			this.formFilter.controls.link.value,
			this.formFilter.controls.startPrice.value,
			this.formFilter.controls.endPrice.value
		);
	}

	onSelectionChanged(event: MatAutocompleteSelectedEvent) {
		this.formData.get("description").setValue(event.option.value.description);
		this.formData.get("name").setValue(event.option.value.productName);
	}

	onSelectionEditChanged(event: MatAutocompleteSelectedEvent) {
		this.formData.get("description").setValue(event.option.value.description);
		this.formData.get("name").setValue(event.option.value.productName);
	}

	displayFn(imagebank: ImageBank) {
		if (imagebank) {
			return imagebank.barcode;
		}
	}

	async getListProduct(
		pageIn,
		pageOut,
		name,
		images,
		link,
		startPrice,
		endPrice
	) {
		const self = this;
		const ELEMENT_DATA = [];

		this.productService
			.getPaginatorProduct(
				pageIn,
				pageOut,
				name,
				images,
				link,
				startPrice,
				endPrice
			)
			.subscribe((data: any) => {
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				if (data.list && Array.isArray(data.list)) {
					data.list.forEach(async (product, index) => {
						// Format department
						let depts = [];
						if (product.department && Array.isArray(product.department)) {
							depts = product.department.map((item) => item.name);
						}

						let imageSelected;
						if (
							product.images &&
							product.images[0] &&
							typeof product.images[0] === "string"
						) {
							imageSelected = product.images[0].replace("/x1/", "/x2/");
						}

						ELEMENT_DATA.push({
							_id: product._id,
							checked: product.productChecked,
							position: index + 1,
							name: product.name,
							image: imageSelected,
							description: product.description,
							unity: product.unity,
							price: product.price,
							department: depts || "",
							barcode: product.barcode,
							maximumAmount: product.maximumAmount,
							barcodeBox: product.barcodeBox,
							pricePromotion: product.pricePromotion,
							keywords: product.keywords,
							dateInitPricePromotion: product.dateInitPricePromotion,
							dateFinishPricePromotion: product.dateFinishPricePromotion,
							company: product.company,
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async validPricePromotion(product: Product) {
		return new Promise(async (resolve) => {
			if (product.pricePromotion > 0) {
				if (Number(product.pricePromotion) >= Number(product.price)) {
					this.toastr.error(
						"Valor promocional precisa ser menor que valor do preço!",
						"Falha!"
					);
					resolve(false);
				}
			}
			resolve(true);
		});
	}

	async validDateFinish(product: Product) {
		return new Promise(async (resolve) => {
			if (
				!product.pricePromotion &&
				(product.dateFinishPricePromotion || product.dateInitPricePromotion)
			) {
				this.toastr.error(
					"Ao informar data da promoção, deve-se informar o preço promocional!",
					"Falha!"
				);
				resolve(false);
				return;
			}

			if (
				product.pricePromotion &&
				(!product.dateFinishPricePromotion || !product.dateInitPricePromotion)
			) {
				this.toastr.error("Obrigatório data inicial e final!", "Falha!");
				resolve(false);
				return;
			}

			if (
				product.pricePromotion &&
				product.dateFinishPricePromotion < product.dateInitPricePromotion
			) {
				this.toastr.error(
					"Data final deve ser maior ou igual à Data inicial!",
					"Falha!"
				);
				resolve(false);
				return;
			}
			const atualDate = moment().format("YYYY-MM-DD");
			const initialDate = moment(
				product.dateInitPricePromotion,
				"DDMMYYYY"
			).format("YYYY-MM-DD");

			if (initialDate < atualDate) {
				this.toastr.error(
					"Data inicial deve ser maior ou igual à data atual!",
					"Falha!"
				);
				resolve(false);
				return;
			}

			resolve(true);
		});
	}

	// async updateProduct(product: Product) {
	async upsertProduct(productForm: any) {
		const { department, departmentSelected, ...product } = productForm;
		product.department = this.productDepartments.filter((x) =>
			department.includes(x.name)
		);

		const validPrice = await this.validPricePromotion(product);

		if (!validPrice) {
			return;
		}

		const validDate = await this.validDateFinish(product);

		if (!validDate) {
			return;
		}

		product.keywords = this.keywordsList;

		if (product.dateInitPricePromotion) {
			product.dateInitPricePromotion = moment(
				product.dateInitPricePromotion,
				"DD/MM/YYYY"
			).format("YYYY-MM-DD");
		}

		if (product.dateFinishPricePromotion) {
			product.dateFinishPricePromotion = moment(
				product.dateFinishPricePromotion,
				"DD/MM/YYYY"
			).format("YYYY-MM-DD");
		}

		if (product.barcode) {
			product.barcode = product.barcode;
		}

		if (this.typeAction === "create") {
			if (!this.files || this.files.size <= 0) {
				this.toastr.error(
					"Erro ao criar Produto! Imagem é obrigatoria!",
					"Falha!"
				);
				return;
			}

			this.productService.createProduct(product).subscribe(
				() => {
					this.toastr.success("Produto criado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					this.getListProduct(
						0,
						this.pageSize,
						this.formFilter.controls.name.value,
						this.formFilter.controls.images.value,
						this.formFilter.controls.link.value,
						this.formFilter.controls.startPrice.value,
						this.formFilter.controls.endPrice.value
					);

					this.listSortDepartment();
				},
				() => {
					this.toastr.error("Erro ao criar Produto!", "Falha!");
				},
				() => {
					this.allDepartments = this.restoreDepartments;
				}
			);
		} else {
			this.productService.updateProduct(product).subscribe(
				() => {
					this.toastr.success("Produto alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					this.getListProduct(
						0,
						this.pageSize,
						this.formFilter.controls.name.value,
						this.formFilter.controls.images.value,
						this.formFilter.controls.link.value,
						this.formFilter.controls.startPrice.value,
						this.formFilter.controls.endPrice.value
					);

					this.listSortDepartment();
				},
				() => {
					this.toastr.error("Erro ao alterar Produto!", "Falha!");
				},
				() => {
					this.allDepartments = this.restoreDepartments;
				}
			);
		}
	}

	// Fechar
	btnSair() {
		if (this.modalService) {
			this.modalService.dismissAll();
		}
	}

	async confirmDeleteModalShow(content, product) {
		this.productIdToDelete = product._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-product", size: "sm" })
			.result.then(
				() => {},
				() => {}
			);
	}

	async deleteProduct() {
		if (!this.productIdToDelete) {
			this.toastr.error("Erro ao deletar Produto!", "Falha!");
			return;
		}
		await this.productService.deleteProduct(this.productIdToDelete).toPromise();
		this.toastr.success("Produto deletado com sucesso!", "Sucesso!");
		this.productIdToDelete = undefined;
		await this.getListProduct(
			0,
			this.pageSize,
			this.formFilter.controls.name.value,
			this.formFilter.controls.images.value,
			this.formFilter.controls.link.value,
			this.formFilter.controls.startPrice.value,
			this.formFilter.controls.endPrice.value
		);
	}

	onChange(event) {
		const selectedFiles = <FileList>event.srcElement.files;
		const fileNames = [];
		const fileList = [];

		if (event.target.files && event.target.files.length) {
			let count = 0;
			this.files = new Set();

			ImageCompressService.filesToCompressedImageSource(selectedFiles).then(
				(observableImages) => {
					observableImages.subscribe(
						(image) => {
							fileNames.push(image.compressedImage.fileName);
							this.files.add(image.compressedImage[count]);

							fileList.push({ base64: image.compressedImage.imageDataUrl });
							this.formData.patchValue({
								file: fileList,
							});
							count++;
						},
						() => {
							console.log("Error while converting image");
						},
						() => {
							document.getElementById("customFileLabel").innerHTML =
								fileNames.join(", ");
						}
					);
				}
			);
		}
	}

	async initSyncProduct(content, element: Product) {
		this.formFilter.patchValue({
			productSelected: "",
		});

		this.barcodeAlreadyExist = false;
		this.productChoosed = "";
		this.productSelected = element;

		const response = (await this.productBankService
			.listByBarcode(element.barcode)
			.toPromise()) as CustomResponse;

		if (response.status === 200) {
			this.barcodeAlreadyExist = true;
			this.productChoosed = response.data;
			this.modalService
				.open(content, {
					ariaLabelledBy: "modal-create-product",
					size: "lg",
					backdrop: "static",
				})
				.result.then(
					() => {},
					() => {}
				);
			return;
		}

		let filter: any = {
			name: "",
		};

		this.formFilter
			.get("productSelected")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) => {
					if (value) {
						filter.barcode = value;
						filter.name = value;
					}

					// filter.audited = true
					return this.productBankService.getPaginatorProductBank(0, 10, filter);
				})
			)
			.subscribe(
				(result: CustomResponse) => {
					if (result?.response && Array.isArray(result.response)) {
						if (result.response.length > 0) {
							this.productList = result?.response as Product[];
						} else {
							this.productList = [
								{ _id: undefined, name: "Nenhum produto encontrado" },
							];
						}
					}

					this.changeDetectorRefs.detectChanges();
				},
				(err) => {
					console.log("Erro ao buscar produto", err);
				}
			);

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-create-product",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				() => {},
				() => {}
			);
	}

	productChossed(product) {
		if (!product || !product._id) {
			this.formFilter.patchValue({
				productSelected: "",
			});
			return;
		}
		this.productChoosed = product;
		this.formFilter.patchValue({
			productSelected: product.name,
		});
	}

	async linkProduct() {
		const payload = {
			productId: this.productSelected._id,
			ecbrBankId: this.productChoosed,
		};

		try {
			const response = (await this.productService
				.linkProduct(payload)
				.toPromise()) as CustomResponse;
			const elementIndex = this.dataSource.filteredData.findIndex(
				(obj: any) => obj._id === response.data.novoRegistro._id
			);
			this.dataSource.filteredData[elementIndex].name =
				response.data.novoRegistro.name;
			this.dataSource.filteredData[elementIndex].department =
				response.data.names;
			this.dataSource.filteredData[elementIndex].image =
				response.data.novoRegistro.images[0];

			this.modalService.dismissAll();
			this.toastr.success("Produto vinculado com sucesso!", "Vinculado!");
			this.formFilter.patchValue({
				productSelected: "",
			});
			this.productList = [];
		} catch (error) {
			this.toastr.error("Erroa o vincular produto!", "Falha!");
		}
	}

	async listSortDepartment() {
		try {
			if (this.userCompany && this.userCompany._id) {
				const respose = await this.departmentService
					.verifySortDepartment(this.userCompany._id)
					.toPromise();

				if (respose && Array.isArray(respose) && respose.length > 0) {
					this.listSort = respose;
					this.changeDetectorRefs.detectChanges();
				} else {
					this.listSort = null;
					this.changeDetectorRefs.detectChanges();
				}
			} else {
				this.listSort = null;
			}
		} catch (err) {
			console.log("err", err);
		}
	}

	async modalSortDepartment(content) {
		this.modalService
			.open(content, { ariaLabelledBy: "modal-sort-department", size: "lg" })
			.result.then(
				() => {},
				() => {}
			);
	}

	async drop(event: CdkDragDrop<any[]>, index) {
		await moveItemInArray(
			this.listSort,
			event.previousIndex,
			event.currentIndex
		);

		if (
			event.container &&
			event.container.data &&
			Array.isArray(event.container.data)
		) {
			let countItemProduct = 1;
			for await (const item of event.container.data) {
				await this.departmentService
					.updateSortDepartment(item._id, countItemProduct)
					.toPromise();
				countItemProduct++;
			}

			this.listSortDepartment();
		}
	}

	editRow(item) {
		this.indexEdit = item.position;
		this.VOForm.controls.price.setValue(item.price);
		this.VOForm.controls.pricePromotion.setValue(item.pricePromotion);
		this.changeDetectorRefs.detectChanges();
	}

	async confirmEditRow(itemForm, element) {
		try {
			let payload: any = {};
			console.log("itemForm", itemForm);

			payload._id = element._id;
			payload.price = itemForm.price;
			payload.pricePromotion = itemForm.pricePromotion;

			element.price = payload.price;
			element.pricePromotion = payload.pricePromotion;

			const resp = await this.productService.updateProduct(payload).toPromise();
			// console.log("resp", resp);
			this.indexEdit = null;
			this.changeDetectorRefs.detectChanges();

			await this.getListProduct(
				0,
				this.pageSize,
				this.formFilter.controls.name.value,
				this.formFilter.controls.images.value,
				this.formFilter.controls.link.value,
				this.formFilter.controls.startPrice.value,
				this.formFilter.controls.endPrice.value
			);
		} catch (err) {
			this.indexEdit = null;
			this.changeDetectorRefs.detectChanges();
			console.log("fail edit line", err);
		}
	}
}
