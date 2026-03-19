import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatTableDataSource } from "@angular/material/table";
import { FormGroup, FormControl, FormArray, Validators } from "@angular/forms";
import { startWith, debounceTime } from "rxjs/operators";
import { ImageCompressService } from "ng2-image-compress";
import { ToastrService } from "ngx-toastr";

import { Company } from "./../../../../../models/company";
import { CompanyService } from "./../../../../services/company.service";
import { FoodCategory } from "./../../../../../models/foodCategory";
import { FoodProduct } from "./../../../../../models/foodProduct";
import { FoodProductComplement } from "./../../../../../models/foodProductComplement";
import { FoodProductComplementItem } from "./../../../../../models/foodProductComplementItem";
import { FoodService } from "./../../../../services/food.service";

@Component({
	selector: "kt-menu",
	templateUrl: "./menu.component.html",
	styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit, AfterViewInit {
	categories: FoodCategory[];
	categoriesList: FoodCategory[];
	company: Company[] = [];
	companyValue: string;
	dataSource;
	files: Set<File>;
	foodProductComplement: FoodProductComplement[] = [];
	formData;
	formDataComplement;
	formDataItem;
	formDataProduct;
	itemIdToDelete;
	isDisplay = false;
	itensProduct: FoodProductComplementItem[];
	menuIdToDelete;
	myControl: FormControl = new FormControl();
	// Used to validation forms
	formSubmitAttempt = false;
	formSubmitProduct = false;
	totalLength;
	typeAction = "create";
	applyDiscount = false;

	categoryEdit: any = null;

	// menu
	typeCategorySelected;

	allComplete: boolean = false;

	daysOfWeek: any = {
		name: "Todos os Dias da Semana",
		completed: false,
		color: "primary",
		days: [
			{ name: "Domingo", key: "sunday", available: false },
			{ name: "Segunda", key: "monday", available: false },
			{ name: "Terça", key: "tuesday", available: false },
			{ name: "Quarta", key: "wednesday", available: false },
			{ name: "Quinta", key: "thursday", available: false },
			{ name: "Sexta", key: "friday", available: false },
			{ name: "Sábado", key: "saturday", available: false },
		],
	};

	availableHours: object[] = [
		{
			start: "00:00",
			end: "00:00",
		},
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private companyService: CompanyService,
		private foodService: FoodService,
		private imgCompressService: ImageCompressService
	) {}

	async ngOnInit() {}

	async ngAfterViewInit() {
		await this.getCategoryList();
		this.changeDetectorRefs.detectChanges();
	}

	async addNewCategoryForm(type) {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				type: new FormControl(type),
				position: new FormControl(1, [
					Validators.required,
					Validators.min(1),
					Validators.max(50),
				]),
				alwaysAvailable: new FormControl(false, []),
			});
			resolve(true);
		});
	}

	async drop(event: CdkDragDrop<any[]>, index) {
		if (this.categories[index].products) {
			await moveItemInArray(
				this.categories[index].products,
				event.previousIndex,
				event.currentIndex
			);
			if (
				event.container &&
				event.container.data &&
				Array.isArray(event.container.data)
			) {
				const updateListCategoryProducts = [];
				let countItemProduct = 0;
				for await (const item of event.container.data) {
					updateListCategoryProducts.push({
						_id: item._id,
						position: countItemProduct,
					});
					countItemProduct++;
				}

				if (updateListCategoryProducts.length > 0) {
					this.updateFoodProductsPosition(updateListCategoryProducts);
				}
			}
		}
	}

	// alert toastr informando posição salva ao trocar de lugar.
	async updateFoodProductsPosition(foodProducts) {
		const data = await this.foodService
			.updateFoodProductsPosition(foodProducts)
			.toPromise();
		if (data) {
			await this.getCategoryList();
			this.toastr.success(
				"Posição alterada com sucesso!",
				"Alteração da posição"
			);
		}
	}

	async addNewProductForm() {
		return new Promise(async (resolve, reject) => {
			this.formDataProduct = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				category: new FormControl(undefined),
				description: new FormControl(undefined),
				price: new FormControl(0, [Validators.required]),
				pricePromotion: new FormControl(undefined),
				pricesSizesPizzas: new FormArray([]),
				percentualDiscount: new FormControl(undefined),
				isPaused: new FormControl(undefined),
				codPdv: new FormControl(undefined),
				file: new FormControl(undefined, [Validators.required]),
				position: new FormControl(1, [Validators.min(0), Validators.max(100)]),
				complements: new FormArray([]),
			});

			this.formDataProduct
				.get("category")
				.valueChanges.pipe(startWith(""), debounceTime(1000))
				.subscribe(async (results) => {
					if (results) {
						await this.foodService.getCategoryNome(results);
						this.categoriesList = results;
					}
				});

			this.formDataProduct
				.get("pricePromotion")
				.valueChanges.pipe(
					startWith(""),
					debounceTime(1000)
					// switchMap(value => this.onChangePriceDiscount(this.formDataProduct.value))
				)
				.subscribe((results) => {
					if (results) {
						this.onChangePriceDiscount(this.formDataProduct.value);
					}
				});

			resolve(true);
		});
	}

	displayFn(category: FoodCategory) {
		if (category) {
			if (this.formDataProduct) {
				this.formDataProduct.patchValue({
					category: category,
				});
			}

			return category.name;
		}
	}

	async getListDeliveryMan(isPaused) {
		const self = this;
		const ELEMENT_DATA = [];

		this.foodService.getFilter(isPaused).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((food, index) => {
					ELEMENT_DATA.push({
						_id: food._id,
						position: index + 1,
						isOnline: food.isOnline,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	/**
	 * Upsert modal
	 */
	async upsertProductModal(
		content,
		category,
		foodProduct: FoodProduct | undefined,
		type = "create"
	) {
		this.typeAction = type;
		this.formSubmitProduct = false;

		await this.addNewProductForm();

		if (this.typeAction === "edit") {
			// Alter file permissions
			this.formDataProduct.get("file").clearValidators();
			this.formDataProduct.get("file").updateValueAndValidity();
		}

		this.formDataProduct.patchValue({
			category: {
				_id: category._id,
				name: category.name,
				type: category.type,
				sizes: category.sizes || [],
			},
		});

		if (Array.isArray(category.sizes) && category.sizes.length) {
			for await (const sz of category.sizes) {
				const sizeOne = new FormGroup({
					name: new FormControl(sz.name, [Validators.required]),
					price: new FormControl(0, [Validators.required]),
					status: new FormControl(true, [Validators.required]),
				});

				// Insert init sizes
				this.formDataProduct.get("pricesSizesPizzas").push(sizeOne);
			}
		}

		if (foodProduct) {
			// Fill products info
			this.formDataProduct.patchValue({
				_id: foodProduct._id,
				name: foodProduct.name,
				description: foodProduct.description,
				price: foodProduct.price,
				pricesSizesPizzas: foodProduct?.pricesSizesPizzas ?? [],
				pricePromotion: foodProduct.pricePromotion,
				percentualDiscount: foodProduct.percentualDiscount,
				isPaused: foodProduct.isPaused,
				position: foodProduct.position,
				codPdv: foodProduct.codPdv,
				file: "",
				complements: [],
			});

			if (type === "edit") {
				this.applyDiscount = foodProduct.pricePromotion > 0;
			}

			// Get complements
			const complementsList = await this.getComplementsByProductId(
				foodProduct._id
			);

			if (complementsList && Array.isArray(complementsList)) {
				// Products
				for await (const comp of complementsList) {
					this.formDataComplement = new FormGroup({
						_id: new FormControl(comp._id, [Validators.required]),
						name: new FormControl(comp.name, [Validators.required]),
						amountMin: new FormControl(comp.amountMin, [Validators.required]),
						amountMax: new FormControl(comp.amountMax, [Validators.required]),
						isRequired: new FormControl(comp.isRequired),
						isQuantified: new FormControl(comp.isQuantified),
						isPaused: new FormControl(comp.isPaused),
						product: new FormControl(comp.product, [Validators.required]),
						position: new FormControl(comp.position, [
							Validators.min(1),
							Validators.max(50),
						]),
						items: new FormArray([]),
					});

					// Items
					for await (const item of comp.items) {
						this.formDataItem = new FormGroup({
							_id: new FormControl(item._id, [Validators.required]),
							name: new FormControl(item.name, [Validators.required]),
							codPdv: new FormControl(item.codPdv),
							description: new FormControl(item.description),
							price: new FormControl(item.price, [Validators.required]),
							isPaused: new FormControl(item.isPaused),
							foodProductComplement: new FormControl(
								item.foodProductComplement
							),
						});

						this.formDataComplement.get("items").push(this.formDataItem);
					}

					this.formDataProduct.get("complements").push(this.formDataComplement);
				}
			}
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-product",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async getComplementsByProductId(productId) {
		return new Promise(async (resolve, reject) => {
			const complements = await this.foodService
				.getFoodProductComplement(productId)
				.toPromise();
			if (complements) {
				return resolve(complements);
			} else {
				return resolve(false);
			}
		});
	}

	async upsertProduct(foodProduct: FoodProduct) {
		const validPrice = await this.validPricePromotion(foodProduct);
		if (!validPrice) {
			return;
		}

		try {
			//  return;

			const productId =
				foodProduct && foodProduct._id ? foodProduct._id : undefined;

			const companyAtual = localStorage.getItem("@company-main")
				? JSON.parse(localStorage.getItem("@company-main"))
				: undefined;

			foodProduct.company =
				companyAtual && companyAtual._id ? companyAtual._id : undefined;

			console.log(foodProduct);

			if (this.typeAction === "create") {
				// Save product
				const data = await this.foodService
					.createFoodProduct(foodProduct)
					.toPromise();
			} else if (this.typeAction === "edit") {
				const data = await this.foodService
					.updateFoodProduct(foodProduct)
					.toPromise();
			} else {
				this.toastr.error(
					"Erro ao salvar registro! Tente novamente mais tarde",
					"Erro"
				);
				return;
			}

			this.toastr.success("Registro salvo com sucesso!", "Sucesso!");
			this.modalService.dismissAll();
			await this.getCategoryList();
			this.changeDetectorRefs.detectChanges();
			return;
		} catch (error) {
			this.toastr.error("Erro ao cadastrar produto", "Falha!");
			return;
		}
	}

	enabledPricePromotion(foodProduct: FoodProduct) {
		if (Number(foodProduct.price) > 0) {
			this.applyDiscount = true;
		}
	}

	disabledPricePromotion() {
		this.applyDiscount = false;

		this.formDataProduct.patchValue({
			percentualDiscount: 0,
			pricePromotion: 0,
		});
	}

	onChangePriceDiscount(foodProduct: FoodProduct) {
		if (foodProduct.price <= foodProduct.pricePromotion) {
			this.formDataProduct.patchValue({
				percentualDiscount: 0,
				pricePromotion: 0,
			});
			return;
		}
		const discount = foodProduct.price - foodProduct.pricePromotion;

		const fraction = discount / foodProduct.price;

		const result = (fraction * 100).toFixed(0);

		this.formDataProduct.patchValue({
			percentualDiscount: result,
		});
	}

	onChangePriceDiscountPercent(foodProduct: FoodProduct) {
		if (foodProduct.percentualDiscount > 100) {
			this.formDataProduct.patchValue({
				percentualDiscount: 0,
				pricePromotion: 0,
			});
			return;
		}

		const result =
			foodProduct.price -
			(foodProduct.percentualDiscount / 100) * foodProduct.price;

		this.formDataProduct.patchValue({
			pricePromotion: result,
		});
	}

	async validPricePromotion(foodProduct: FoodProduct) {
		return new Promise(async (resolve, reject) => {
			if (foodProduct.pricePromotion > 0) {
				if (Number(foodProduct.pricePromotion) >= Number(foodProduct.price)) {
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

	// Adicionar complemento ao produto
	addComplementForm() {
		this.formDataComplement = new FormGroup({
			name: new FormControl("", [Validators.required]),
			amountMin: new FormControl("", [Validators.required]),
			amountMax: new FormControl("", [Validators.required]),
			isRequired: new FormControl(""),
			isPaused: new FormControl(""),
			position: new FormControl(1, [Validators.min(1), Validators.max(50)]),
			items: new FormArray([]),
		});
		this.categoryEdit = {};
		this.formDataProduct.get("complements").push(this.formDataComplement);
	}

	async addComplement(boxId, complement) {
		this.formDataItem = new FormGroup({
			name: new FormControl("", [Validators.required]),
			codPdv: new FormControl(""),
			description: new FormControl(""),
			price: new FormControl(0, [Validators.required]),
			isPaused: new FormControl(""),
			// foodProductComplement: new FormControl('', [Validators.required]),
		});

		complement.get("items").push(this.formDataItem);
	}

	async removeFeeItem(indexComplement, indexItem) {
		return new Promise(async (resolve, reject) => {
			await this.formDataProduct
				.get("complements")
				.controls[indexComplement].get("items")
				.removeAt(indexItem);
			resolve(true);
		});
	}

	async removeItem(productId) {
		const self = this;
		return new Promise(async (resolve, reject) => {
			const remove = await self.foodService.deleteItem(productId).toPromise();
			self.getCategoryList();
			resolve(true);
		});
	}

	async removeFeeItemAddCadastro(categoryId) {
		const self = this;
		return new Promise(async (resolve, reject) => {
			const remove = await self.foodService
				.deleteFoodCategory(categoryId)
				.toPromise();
			self.getCategoryList();
			resolve(true);
		});
	}

	async getCategoryList() {
		const self = this;
		this.foodService.getFoodCategoryByCompany().subscribe((data: any) => {
			if (data) {
				self.categories = data;
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
				this.company = list;
			},
			(error) => {}
		);
	}

	async upSertCategoryModalShow(
		content,
		foodCategory: FoodCategory,
		type = "create"
	) {
		if (foodCategory?.type === "PIZZAS") this.typeCategorySelected = "PIZZAS";
		else if (
			foodCategory &&
			(foodCategory?.type === "ITEMS" || !foodCategory?.type)
		)
			this.typeCategorySelected = "ITEMS";

		this.typeAction = type;
		this.formSubmitAttempt = false;
		await this.addNewCategoryForm(this.typeCategorySelected);
		this.getCompany();

		if (foodCategory) {
			this.formData.patchValue({
				_id: foodCategory._id,
				name: foodCategory.name,
				position: foodCategory.position || 1,
				alwaysAvailable: foodCategory.alwaysAvailable || false,
			});
			this.categoryEdit = foodCategory;

			if (foodCategory.availableHours && foodCategory.availableHours.length > 0)
				this.availableHours = foodCategory.availableHours;
			if (foodCategory.daysOfWeek && foodCategory.daysOfWeek.length > 0)
				this.daysOfWeek.days = foodCategory.daysOfWeek;
		} else {
			this.categoryEdit = {};
		}

		this.changeDetectorRefs.detectChanges();
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-category",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async upsertCategory(foodCategory: FoodCategory) {
		// company
		foodCategory.company = localStorage.getItem("@company-main")
			? JSON.parse(localStorage.getItem("@company-main"))
			: undefined;
		foodCategory.availableHours = this.availableHours;
		foodCategory.daysOfWeek = this.daysOfWeek.days;
		foodCategory.type = this.typeCategorySelected;

		if (this.typeAction === "create") {
			this.foodService
				.createFoodCategory(foodCategory)
				.subscribe(async (data: any) => {
					this.toastr.success("Category criado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					await this.getCategoryList();
					this.changeDetectorRefs.detectChanges();
				});
		} else {
			this.foodService.updateCategory(foodCategory).subscribe(
				async (data: any) => {
					this.toastr.success("Category alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
					await this.getCategoryList();
					this.changeDetectorRefs.detectChanges();
				},
				(error) => {
					this.toastr.error("Erro ao alterar Category", "Falha!");
					this.changeDetectorRefs.detectChanges();
				}
			);
		}
	}

	async saveProduct(foodProduct: FoodProduct, productId) {
		return new Promise(async (resolve, reject) => {
			let productData;

			foodProduct.company = localStorage.getItem("@company-main")
				? JSON.parse(localStorage.getItem("@company-main"))
				: undefined;

			// Cadastra produto
			productData = new FoodProduct();
			productData = {
				// company: foodProduct.company,
				file: foodProduct.file,
				name: foodProduct.name,
				category: foodProduct.foodCategoryId,
				description: foodProduct.description,
				price: foodProduct.price,
				pricePromotion: foodProduct.pricePromotion,
				percentualDiscount: foodProduct.percentualDiscount,
				codPdv: foodProduct.codPdv,
			};

			let data;
			if (!productId) {
				data = await this.foodService
					.createFoodProduct(productData)
					.toPromise();
			} else {
				productData._id = productId;
				data = await this.foodService
					.updateFoodProduct(productData)
					.toPromise();
			}

			this.formSubmitProduct = false;
			resolve(data);
		});
	}

	async saveProductComplement(
		productId,
		foodProductComplement: FoodProductComplement[]
	) {
		return new Promise(async (resolve, reject) => {
			let productComplementData;
			const itemsData = [];

			for await (const compl of foodProductComplement) {
				// Cadastra produto

				productComplementData = new FoodProductComplement();
				productComplementData = {
					_id: compl._id,
					name: compl.name,
					// company: compl.company,
					amountMax: Number(compl.amountMax || 0),
					amountMin: Number(compl.amountMin || 0),
					isRequired: Boolean(compl.isRequired),
					position: Number(compl.position),
					foodproduct: productId,
					product: productId,
				};

				let complement: any;
				if (!compl._id) {
					complement = await this.foodService
						.createFoodProductComplement(productComplementData)
						.toPromise();
				} else {
					productComplementData._id = compl._id;
					complement = await this.foodService
						.updateFoodProductComplement(productComplementData)
						.toPromise();
				}

				if (complement) {
					itemsData.push({
						items: compl.items,
						complementId: complement.data._id,
						complementName: complement.data.name,
					});

					const productComplementItem: any =
						await this.saveProductComplementItem(
							complement.data._id,
							compl.items
						);

					if (!productComplementItem) {
						this.toastr.error(
							"Falha ao criar item no complemento do produto!",
							"Falha!"
						);
						reject(false);
					}
				} else {
					this.toastr.error("Falha ao criar Product!", "Falha!");
					reject(false);
				}
			}
			resolve(itemsData);
		});
	}

	async saveProductComplementItem(
		complementId,
		foodProductComplementItem: FoodProductComplementItem[]
	) {
		return new Promise(async (resolve, reject) => {
			let productComplementItemData;

			for await (const item of foodProductComplementItem) {
				// Cadastra item complemento do produto

				item.company = localStorage.getItem("@company-main")
					? JSON.parse(localStorage.getItem("@company-main"))
					: undefined;

				productComplementItemData = new FoodProductComplementItem();
				productComplementItemData = {
					_id: item._id,
					name: item.name,
					// company: item.company,
					codPdv: item.codPdv,
					description: item.description,
					price: item.price,
					isPaused: Boolean(item.isPaused),
					foodProductComplement: complementId,
				};

				let complementItem;
				if (!item._id) {
					complementItem = await this.foodService
						.createFoodProductComplementItem(productComplementItemData)
						.toPromise();
				} else {
					complementItem = await this.foodService
						.updateFoodProductComplementItem(productComplementItemData)
						.toPromise();
				}

				if (!complementItem) {
					this.toastr.error(
						"Falha ao criar item no complemento do produto!",
						"Falha!"
					);
					reject(false);
				}
			}
			resolve(true);
		});
	}

	async createFoodProduct(foodProduct: FoodProduct) {
		const validPrice = await this.validPricePromotion(foodProduct);

		if (!validPrice) {
			return;
		}

		try {
			let productId;

			// Cadastra os produtos
			const product: any = await this.saveProduct(foodProduct, undefined).catch(
				(error) => {
					this.toastr.error("Erro ao cadastrar produto!", "Falha!");
					return;
				}
			);

			if (!product) {
				this.toastr.error("Erro ao cadastrar produto!", "Falha!");
				return;
			}

			productId =
				product && product.data && product.data._id
					? product.data._id
					: undefined;

			// Cadastra os complementos do produtos
			const productComplement: any = await this.saveProductComplement(
				productId,
				foodProduct.complements || []
			).catch((error) => {
				this.toastr.error(
					"Erro ao cadastrar complementos do produto!",
					"Falha!"
				);
				return;
			});

			if (!productComplement) {
				this.toastr.error(
					"Erro ao cadastrar complemento(s) do produto!",
					"Falha!"
				);
				return;
			}

			await this.getCategoryList();
			this.changeDetectorRefs.detectChanges();
			this.toastr.success("Product criado com sucesso!", "Sucesso!");
			this.modalService.dismissAll();
			return;
		} catch (error) {
			this.toastr.error("Erro ao cadastrar produto!", "Falha!");
			return;
		}
	}

	createFoodProductComplement(foodProductComplement: FoodProductComplement) {
		this.foodService
			.createFoodProductComplement(foodProductComplement)
			.subscribe(
				async (data: any) => {
					this.toastr.success("Complemento criado com sucesso!", "Sucesso!");
					this.formDataComplement.reset();
				},
				(error) => {
					this.toastr.error("Falha ao criar Complemento!", "Falha!");
				}
			);
	}

	async confirmDeleteItemModalShow(content, product) {
		this.itemIdToDelete = product;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-product", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteItem() {
		if (!this.itemIdToDelete) {
			this.toastr.error("Falha ao deletar Produto!", "Falha!");
			return;
		}
		await this.foodService.deleteItem(this.itemIdToDelete).toPromise();
		this.toastr.success("Produto deletado com sucesso!", "Sucesso!");

		this.itemIdToDelete = undefined;
		await this.getCategoryList();
		this.modalService.dismissAll();
	}

	async deleteComplement(index) {
		await this.formDataProduct.get("complements").removeAt(index);
		this.toastr.error(
			'Complemento será removido após você clicar em "Salvar item"!',
			"ATENÇÃO:"
		);
	}

	async confirmDeleteCategoryModalShow(content, category) {
		this.menuIdToDelete = category;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete-category", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async deleteFoodCategory() {
		if (!this.menuIdToDelete) {
			this.toastr.error("Falha ao deletar categoria!", "Falha!");
			return;
		}
		await this.foodService.deleteFoodCategory(this.menuIdToDelete).toPromise();
		this.toastr.success("Categoria deletado com sucesso!", "Sucesso!");
		this.menuIdToDelete = undefined;
		await this.getCategoryList();
		this.modalService.dismissAll();
	}

	async clickOpenAndClosed(categoryId) {
		const element = document.getElementById("category_" + categoryId);
		const elementIcon = document.getElementById("icon_" + categoryId);
		if (element) {
			element.hidden = !element.hidden;
			if (elementIcon) {
				elementIcon.classList.toggle("flaticon2-down");
				elementIcon.classList.toggle("flaticon2-up");
			}
		}
	}

	async duplicateModal(
		content,
		category,
		foodProduct: FoodProduct | undefined,
		type = "create"
	) {
		this.typeAction = type;
		this.formSubmitProduct = false;

		await this.addNewProductForm();

		if (this.typeAction === "edit") {
			// Alter file permissions
			this.formDataProduct.get("file").clearValidators();
			this.formDataProduct.get("file").updateValueAndValidity();
		}

		this.formDataProduct.patchValue({
			category: {
				_id: category._id,
				name: category.name,
				type: category.type,
				sizes: category.sizes || [],
			},
		});

		if (Array.isArray(category.sizes) && category.sizes.length) {
			for await (const sz of category.sizes) {
				const sizeOne = new FormGroup({
					name: new FormControl(sz.name, [Validators.required]),
					price: new FormControl(0, [Validators.required]),
					status: new FormControl(true, [Validators.required]),
				});

				// Insert init sizes
				this.formDataProduct.get("pricesSizesPizzas").push(sizeOne);
			}
		}

		if (foodProduct) {
			// Fill products info
			this.formDataProduct.patchValue({
				_id: undefined,
				name: foodProduct.name + " duplicado",
				description: foodProduct.description,
				price: foodProduct.price,
				pricePromotion: foodProduct.pricePromotion,
				pricesSizesPizzas: foodProduct.pricesSizesPizzas ?? [],
				percentualDiscount: foodProduct.percentualDiscount,
				isPaused: foodProduct.isPaused,
				position:
					typeof foodProduct?.position === "number"
						? foodProduct.position + 1
						: 1,
				codPdv: foodProduct.codPdv,
				file: "",
				complements: [],
			});

			if (type === "edit") {
				this.applyDiscount = foodProduct.pricePromotion > 0;
			}

			// Get complements
			const complementsList = await this.getComplementsByProductId(
				foodProduct._id
			);

			if (complementsList && Array.isArray(complementsList)) {
				// Products

				for await (const comp of complementsList) {
					this.formDataComplement = new FormGroup({
						_id: new FormControl(undefined),
						name: new FormControl(comp.name, [Validators.required]),
						amountMin: new FormControl(comp.amountMin, [Validators.required]),
						amountMax: new FormControl(comp.amountMax, [Validators.required]),
						isRequired: new FormControl(comp.isRequired),
						isPaused: new FormControl(comp.isPaused),
						product: new FormControl(comp.product, [Validators.required]),
						position: new FormControl(comp.position, [
							Validators.min(1),
							Validators.max(50),
						]),
						items: new FormArray([]),
					});

					// Items
					for await (const item of comp.items) {
						this.formDataItem = new FormGroup({
							_id: new FormControl(undefined),
							name: new FormControl(item.name, [Validators.required]),
							codPdv: new FormControl(item.codPdv),
							description: new FormControl(item.description),
							price: new FormControl(item.price, [Validators.required]),
							isPaused: new FormControl(item.isPaused),
							foodProductComplement: new FormControl(
								item.foodProductComplement
							),
						});

						this.formDataComplement.get("items").push(this.formDataItem);
					}

					this.formDataProduct.get("complements").push(this.formDataComplement);
				}
			}
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-product",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async onChangetoggleHeader(event, foodCategory) {
		foodCategory.isPaused = event.checked;
		this.foodService.updateCategory(foodCategory).subscribe(
			async (data: any) => {
				await this.getCategoryList();
				this.changeDetectorRefs.detectChanges();
				this.modalService.dismissAll();
				this.toastr.success("Categoria criado com sucesso!", "Sucesso!");
			},
			(error) => {
				this.modalService.dismissAll();
				this.toastr.error("Falha ao criar Categoria!", "Falha");
			}
		);
	}

	async onChangetoggleForm(event, foodProduct) {
		foodProduct.isPaused = event.checked;
		this.foodService.updateFoodStatus(foodProduct).subscribe(
			async (data: any) => {
				await this.getCategoryList();
				this.changeDetectorRefs.detectChanges();
				this.modalService.dismissAll();
				this.toastr.success("isPaused criado com sucesso!", "Sucesso!");
			},
			(error) => {
				this.modalService.dismissAll();
				this.toastr.success("Falha ao criar isPaused!", "Falha!");
			}
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
							this.formDataProduct.patchValue({
								file: fileList,
							});

							count++;
						},
						() => {},
						() => {
							document.getElementById("customFileLabel").innerHTML =
								fileNames.join(", ");
						}
					);
				}
			);
		}
	}

	// alterCategorySelected() {
	// 	this.setCategorySelected.emit(undefined);
	// }

	updateAllComplete(index) {
		this.daysOfWeek.days[index].available =
			!this.daysOfWeek.days[index].available;

		this.allComplete =
			this.daysOfWeek.days != null &&
			this.daysOfWeek.days.every((t) => t.available);
	}

	someComplete(): boolean {
		if (this.daysOfWeek.days == null) {
			return false;
		}
		return (
			this.daysOfWeek.days.filter((t) => t.available).length > 0 &&
			!this.allComplete
		);
	}

	setAll(completed: boolean) {
		this.allComplete = completed;
		if (this.daysOfWeek.days == null) {
			return;
		}
		this.daysOfWeek.days.forEach((t) => (t.available = completed));
	}

	getHours() {
		var arr = [];
		var i;
		var j;
		for (i = 0; i < 24; i++) {
			for (j = 0; j < 4; j++) {
				arr.push(
					i.toString().padStart(2, "0") + ":" + (j === 0 ? "00" : 15 * j)
				);
			}
		}
		return arr;
	}

	changeAvailableHours(index, element, value) {
		this.availableHours[index][element] = value;
	}

	addAvailableHours() {
		this.availableHours.push({
			start: "00:00",
			end: "00:00",
		});
	}

	removeAvailableHours(index) {
		this.availableHours = this.availableHours.filter(
			(values, i) => i !== index
		);
	}
}
