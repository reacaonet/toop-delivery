import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { startWith, debounceTime } from 'rxjs/operators';
import { ImageCompressService } from 'ng2-image-compress';
import { ToastrService } from 'ngx-toastr';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { AccessoriesService } from './../../../../services/company/accessories/accessories.service';

/** */
import { AccessoriesCategory } from './../../../../../models/Accessories/acessoriesCategory';
import { AccessoriesProduct } from './../../../../../models/Accessories/accessoriesProduct';
import { AccessoriesProductComplement } from './../../../../../models/Accessories/accessoriesProductComplement';
import { AccessoriesProductComplementItem } from './../../../../../models/Accessories/accessoriesProductComplementItem';
import { checkObjectIdisValid } from './../../../../util';

@Component({
  selector: 'kt-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, AfterViewInit {
  categories: AccessoriesCategory[];
  categoriesList: AccessoriesCategory[];
  company: Company[] = [];
  companyValue: string;
  dataSource;
  files: Set<File>;
  foodProductComplement: AccessoriesProductComplement[] = [];
  formData;
  formDataComplement;
  formDataItem;
  formDataProduct;
  itemIdToDelete;
  isDisplay = false;
  itensProduct: AccessoriesProductComplementItem[];
  menuIdToDelete;
  myControl: FormControl = new FormControl();
  // Used to validation forms
  formSubmitAttempt = false;
  formSubmitProduct = false;
  totalLength;
  typeAction = 'create';
  applyDiscount = false;
	public Editor = ClassicEditor;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private companyService: CompanyService,
		private accessoriesService: AccessoriesService
  ) { }

  async ngOnInit() { }

  async addNewCategoryForm() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl('', [Validators.required]),
        position: new FormControl('', [Validators.min(1), Validators.max(100)]),
      });
      resolve(true);
    });
  }

  async drop(event: CdkDragDrop<any[]>, index) {
    if (this.categories[index].products) {
      await moveItemInArray(this.categories[index].products, event.previousIndex, event.currentIndex);
      if (event.container && event.container.data && Array.isArray(event.container.data)) {
        const updateListCategoryProducts = [];
        let countItemProduct = 0;
        for await (const item of event.container.data) {
          updateListCategoryProducts.push({
            _id: item._id,
            position: countItemProduct
          })
          countItemProduct++;
        }

        if (updateListCategoryProducts.length > 0) {
          this.updateFoodProductsPosition(updateListCategoryProducts);
        }
      }
    }
  }

  // alert toastr informando posição salva ao trocar de lugar.
  async updateFoodProductsPosition(accessoriesProducts) {
    const data = await this.accessoriesService.updateFoodProductsPosition(accessoriesProducts).toPromise();
    if (data) {
      await this.getCategoryList();
      this.toastr.success('Posição alterada com sucesso!', 'Alteração da posição');
    }
  }

  async ngAfterViewInit() {
    await this.getCategoryList();
    this.changeDetectorRefs.detectChanges();
  }

  async addNewProductForm() {
    return new Promise(async (resolve, reject) => {
      this.formDataProduct = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl('', [Validators.required]),
        category: new FormControl('', [checkObjectIdisValid]),
        description: new FormControl(''),
        shortDescription: new FormControl(''),
        price: new FormControl('', [Validators.required]),
        pricePromotion: new FormControl(''),
        percentualDiscount: new FormControl(''),
        isPaused: new FormControl(''),
        codPdv: new FormControl(''),
        file: new FormControl('', [Validators.required]),
        amountPeople: new FormControl('', [Validators.required]),
        position: new FormControl(1, [Validators.min(1), Validators.max(10)]),
        complements: new FormArray([]),
      });

      this.formDataProduct.get('category').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
      ).subscribe(async (results) => {
        if (results) {
          await this.accessoriesService.getCategoryNome(results);
          this.categoriesList = results;
        }
      });

      this.formDataProduct.get('pricePromotion').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
      )
        .subscribe(results => {
          if (results) {
            this.onChangePriceDiscount(this.formDataProduct.value);
          }
        });

      resolve(true);
    });
  }

  displayFn(category: AccessoriesCategory) {
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

    this.accessoriesService.getFilter(isPaused).subscribe((data: any) => {
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
    categoryId,
    categoryName,
    accessoriesProduct: AccessoriesProduct | undefined,
    type = 'create'
  ) {
    this.typeAction = type;
    this.formSubmitProduct = false;

    await this.addNewProductForm();

    if (this.typeAction === 'edit') {
      // Alter file permissions
      this.formDataProduct.get('file').clearValidators();
      this.formDataProduct.get('file').updateValueAndValidity();
    }

    this.formDataProduct.patchValue({
      category: {
        _id: categoryId,
        name: categoryName,
      }
    });

    if (accessoriesProduct) {
      // Fill products info
      this.formDataProduct.patchValue({
        _id: accessoriesProduct._id,
        name: accessoriesProduct.name,
        description: accessoriesProduct.description,
        shortDescription: accessoriesProduct.shortDescription,
        price: accessoriesProduct.price,
        pricePromotion: accessoriesProduct.pricePromotion,
        percentualDiscount: accessoriesProduct.percentualDiscount,
        isPaused: accessoriesProduct.isPaused,
        amountPeople: accessoriesProduct.amountPeople,
        position: accessoriesProduct.position,
        codPdv: accessoriesProduct.codPdv,
        file: '',
        complements: [],
      });

      if (type === 'edit') {
        this.applyDiscount = accessoriesProduct.pricePromotion > 0;
      }

      // Get complements
      const complementsList = await this.getComplementsByProductId(
        accessoriesProduct._id
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
            isPaused: new FormControl(comp.isPaused),
            product: new FormControl(comp.product, [Validators.required]),
            position: new FormControl(comp.position, [Validators.min(1), Validators.max(10)]),
            items: new FormArray([]),
          });

          // Items
          for await (const item of comp.items) {
            this.formDataItem = new FormGroup({
              _id: new FormControl(item._id, [Validators.required]),
              name: new FormControl(item.name, [Validators.required]),
              codPdv: new FormControl(item.codPdv),
              description: new FormControl(item.description),
              shortDescription: new FormControl(item.shortDescription),
              price: new FormControl(item.price, [Validators.required]),
              isPaused: new FormControl(item.isPaused),
              accessoriesProductComplement: new FormControl(
                item.foodProductComplement
              ),
            });

            this.formDataComplement.get('items').push(this.formDataItem);
          }

          this.formDataProduct.get('complements').push(this.formDataComplement);
        }
      }
    }

    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-product',
        size: 'lg',
        backdrop: 'static',
      })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }

  async getComplementsByProductId(productId) {
    return new Promise(async (resolve, reject) => {
      const complements = await this.accessoriesService
        .getFoodProductComplement(productId)
        .toPromise();
      if (complements) {
        return resolve(complements);
      } else {
        return resolve(false);
      }
    });
  }

  async upsertProduct(accessoriesProduct: AccessoriesProduct) {
    const validPrice = await this.validPricePromotion(accessoriesProduct);
    if (!validPrice) {
      return;
    }

    try {
//      return;

      const productId =
        accessoriesProduct && accessoriesProduct._id ? accessoriesProduct._id : undefined;

      const companyAtual = localStorage.getItem('@company-main')
        ? JSON.parse(localStorage.getItem('@company-main'))
        : undefined;

      accessoriesProduct.company = (companyAtual && companyAtual._id) ?
        companyAtual._id : undefined;

      if (this.typeAction === 'create') {
        // Save product
        const data = await this.accessoriesService
          .createFoodProduct(accessoriesProduct)
          .toPromise();
      } else if (this.typeAction === 'edit') {
        const data = await this.accessoriesService
          .updateFoodProduct(accessoriesProduct)
          .toPromise();

      } else {
        this.toastr.error('Erro ao salvar registro! Tente novamente mais tarde', 'Erro');
        return;
			}

      this.toastr.success('Registro salvo com sucesso!', 'Sucesso!');
      this.modalService.dismissAll();
      await this.getCategoryList();
      this.changeDetectorRefs.detectChanges();
      return;
    } catch (error) {
      this.toastr.error('Erro ao cadastrar produto', 'Falha!');
      return;
    }
  }

  enabledPricePromotion(accessoriesProduct: AccessoriesProduct) {
    if (Number(accessoriesProduct.price) > 0) {
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

  onChangePriceDiscount(accessoriesProduct: AccessoriesProduct) {
    if (accessoriesProduct.price <= accessoriesProduct.pricePromotion) {
      this.formDataProduct.patchValue({
        percentualDiscount: 0,
        pricePromotion: 0,
      });
      return;
    }
    const discount = accessoriesProduct.price - accessoriesProduct.pricePromotion;

    const fraction = discount / accessoriesProduct.price;

    const result = (fraction * 100).toFixed(0);

    this.formDataProduct.patchValue({
      percentualDiscount: result,
    });
  }

  onChangePriceDiscountPercent(accessoriesProduct: AccessoriesProduct) {
    if (accessoriesProduct.percentualDiscount > 100) {
      this.formDataProduct.patchValue({
        percentualDiscount: 0,
        pricePromotion: 0,
      });
      return;
    }

    const result = accessoriesProduct.price - (accessoriesProduct.percentualDiscount / 100 * accessoriesProduct.price);

    this.formDataProduct.patchValue({
      pricePromotion: result,
    });
  }

  async validPricePromotion(accessoriesProduct: AccessoriesProduct) {
    return new Promise(async (resolve, reject) => {
      if (accessoriesProduct.pricePromotion > 0) {
        if (Number(accessoriesProduct.pricePromotion) >= Number(accessoriesProduct.price)) {
          this.toastr.error('Valor promocional precisa ser menor que valor do preço!', 'Falha!');
          resolve(false);
        }
      }
      resolve(true);
    });
  }

  // Adicionar complemento ao produto
  addComplementForm() {
    this.formDataComplement = new FormGroup({
      name: new FormControl('', [Validators.required]),
      amountMin: new FormControl('', [Validators.required]),
      amountMax: new FormControl('', [Validators.required]),
      isRequired: new FormControl(''),
      isPaused: new FormControl(''),
      position: new FormControl(1, [Validators.min(1), Validators.max(10)]),
      items: new FormArray([]),
    });

    this.formDataProduct.get('complements').push(this.formDataComplement);
  }

  async addComplement(boxId, complement) {
    this.formDataItem = new FormGroup({
      name: new FormControl('', [Validators.required]),
      codPdv: new FormControl(''),
      description: new FormControl(''),
      shortDescription: new FormControl(''),
      price: new FormControl(0, [Validators.required]),
      isPaused: new FormControl(''),
    });

    complement.get('items').push(this.formDataItem);
  }

  async removeFeeItem(indexComplement, indexItem) {
    return new Promise(async (resolve, reject) => {
      await this.formDataProduct
        .get('complements')
        .controls[indexComplement].get('items')
        .removeAt(indexItem);
      resolve(true);
    });
  }

  async getCategoryList() {
    const self = this;
    this.accessoriesService.getFoodCategoryByCompany().subscribe((data: any) => {
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
      (error) => { }
    );
  }

  async upSertCategoryModalShow(content, foodCategory: AccessoriesCategory, type = 'create') {
    this.typeAction = type;
    this.formSubmitAttempt = false;
    await this.addNewCategoryForm();
    this.getCompany();

    if (foodCategory) {
      this.formData.patchValue({
        _id: foodCategory._id,
        name: foodCategory.name,
        position: foodCategory.position || 1,
      });
    }
    this.changeDetectorRefs.detectChanges();
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-category', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upsertCategory(foodCategory: AccessoriesCategory) {

    // company
    foodCategory.company = localStorage.getItem('@company-main')
      ? JSON.parse(localStorage.getItem('@company-main'))
      : undefined;

    if (this.typeAction === 'create') {
      this.accessoriesService.createFoodCategory(foodCategory).subscribe(async (data: any) => {
        this.toastr.success('Category criado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
        await this.getCategoryList();
        this.changeDetectorRefs.detectChanges();
      });
    } else {
      this.accessoriesService.updateCategory(foodCategory).subscribe(async (data: any) => {
        this.toastr.success('Category alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
        await this.getCategoryList();
        this.changeDetectorRefs.detectChanges();
      }, error => {
        this.toastr.error('Erro ao alterar Category', 'Falha!');
        this.modalService.dismissAll();
        this.changeDetectorRefs.detectChanges();
      });
    }
  }

  async saveProduct(accessoriesProduct: AccessoriesProduct, productId) {
    return new Promise(async (resolve, reject) => {
      let productData;

      accessoriesProduct.company = localStorage.getItem('@company-main')
        ? JSON.parse(localStorage.getItem('@company-main'))
        : undefined;

      // Cadastra produto
      productData = new AccessoriesProduct();
      productData = {
        // company: accessoriesProduct.company,
        file: accessoriesProduct.file,
        name: accessoriesProduct.name,
        category: accessoriesProduct.accessoriesCategoryId,
        description: accessoriesProduct.description,
        shortDescription: accessoriesProduct.shortDescription,
        price: accessoriesProduct.price,
        pricePromotion: accessoriesProduct.pricePromotion,
        amountPeople: accessoriesProduct.amountPeople,
        percentualDiscount: accessoriesProduct.percentualDiscount,
        codPdv: accessoriesProduct.codPdv,
      };

      let data;
      if (!productId) {
        data = await this.accessoriesService
          .createFoodProduct(productData)
          .toPromise();
      } else {
        productData._id = productId;
        data = await this.accessoriesService
          .updateFoodProduct(productData)
          .toPromise();
      }

      this.formSubmitProduct = false;
      resolve(data);
    });
  }

  async saveProductComplement(
    productId,
    foodProductComplement: AccessoriesProductComplement[]
  ) {
    return new Promise(async (resolve, reject) => {
      let productComplementData;
      const itemsData = [];

      for await (const compl of foodProductComplement) {
        // Cadastra produto

        productComplementData = new  AccessoriesProductComplement();
        productComplementData = {
          _id: compl._id,
          name: compl.name,
          // company: compl.company,
          amountMax: Number(compl.amountMax || 0),
          amountMin: Number(compl.amountMin || 0),
          isRequired: Boolean(compl.isRequired),
          position: Number(compl.position),
          accessoriesproduct: productId,
          product: productId,
        };

        let complement: any;
        if (!compl._id) {
          complement = await this.accessoriesService
            .createFoodProductComplement(productComplementData)
            .toPromise();
        } else {
          productComplementData._id = compl._id;
          complement = await this.accessoriesService
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
            this.toastr.error('Falha ao criar item no complemento do produto!', 'Falha!');
            reject(false);
          }
        } else {
          this.toastr.error('Falha ao criar Product!', 'Falha!');
          reject(false);
        }
      }
      resolve(itemsData);
    });
  }

  async saveProductComplementItem(
    complementId,
    foodProductComplementItem:  AccessoriesProductComplementItem[]
  ) {
    return new Promise(async (resolve, reject) => {
      let productComplementItemData;

      for await (const item of foodProductComplementItem) {
        // Cadastra item complemento do produto

        item.company = localStorage.getItem('@company-main')
          ? JSON.parse(localStorage.getItem('@company-main'))
          : undefined;

        productComplementItemData = new  AccessoriesProductComplementItem();
        productComplementItemData = {
          _id: item._id,
          name: item.name,
          codPdv: item.codPdv,
          description: item.description,
          price: item.price,
          isPaused: Boolean(item.isPaused),
          foodProductComplement: complementId,
        };

        let complementItem;
        if (!item._id) {
          complementItem = await this.accessoriesService
            .createFoodProductComplementItem(productComplementItemData)
            .toPromise();
        } else {
          complementItem = await this.accessoriesService
            .updateFoodProductComplementItem(productComplementItemData)
            .toPromise();
        }

        if (!complementItem) {
          this.toastr.error('Falha ao criar item no complemento do produto!', 'Falha!');
          reject(false);
        }
      }
      resolve(true);
    });
  }

  async createFoodProduct(accessoriesProduct:  AccessoriesProduct) {
    const validPrice = await this.validPricePromotion(accessoriesProduct);

    if (!validPrice) {
      return;
    }

    try {
      let productId;

      // Cadastra os produtos
      const product: any = await this.saveProduct(accessoriesProduct, undefined).catch(
        (error) => {
          this.toastr.error('Erro ao cadastrar produto!', 'Falha!');
          return;
        }
      );

      if (!product) {
        this.toastr.error('Erro ao cadastrar produto!', 'Falha!');
        return;
      }

      productId =
        product && product.data && product.data._id
          ? product.data._id
          : undefined;

      // Cadastra os complementos do produtos
      const productComplement: any = await this.saveProductComplement(
        productId,
        accessoriesProduct.complements || []
      ).catch((error) => {
        this.toastr.error('Erro ao cadastrar complementos do produto!', 'Falha!');
        return;
      });

      if (!productComplement) {
        this.toastr.error('Erro ao cadastrar complemento(s) do produto!', 'Falha!');
        return;
      }

      await this.getCategoryList();
      this.changeDetectorRefs.detectChanges();
      this.toastr.success('Product criado com sucesso!', 'Sucesso!');
      this.modalService.dismissAll();
      return;
    } catch (error) {
      this.toastr.error('Erro ao cadastrar produto!', 'Falha!');
      return;
    }
  }

  createFoodProductComplement(foodProductComplement: AccessoriesProductComplement) {
    this.accessoriesService
      .createFoodProductComplement(foodProductComplement)
      .subscribe(
        async (data: any) => {
          this.toastr.success('Complemento criado com sucesso!', 'Sucesso!');
          this.formDataComplement.reset();
        },
        (error) => {
          this.toastr.error('Falha ao criar Complemento!', 'Falha!');
        }
      );
  }

  async confirmDeleteItemModalShow(content, product) {
    this.itemIdToDelete = product;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-delete-product', size: 'sm' })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }

  async deleteItem() {
    if (!this.itemIdToDelete) {
      this.toastr.error('Falha ao deletar Produto!', 'Falha!');
      return;
    }
    await this.accessoriesService.deleteItem(this.itemIdToDelete).toPromise();
    this.toastr.success('Produto deletado com sucesso!', 'Sucesso!');

    this.itemIdToDelete = undefined;
    await this.getCategoryList();
    this.modalService.dismissAll();
  }

  async deleteComplement(index) {
    await this.formDataProduct.get('complements').removeAt(index);
    this.toastr.error('Complemento será removido após você clicar em "Salvar item"!', 'ATENÇÃO:');
  }

  async confirmDeleteCategoryModalShow(content, category) {
    this.menuIdToDelete = category;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-delete-category', size: 'sm' })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }

  async deleteFoodCategory() {
    if (!this.menuIdToDelete) {

      this.toastr.error('Falha ao deletar categoria!', 'Falha!');
      return;
    }
    await this.accessoriesService.deleteFoodCategory(this.menuIdToDelete).toPromise();
    this.toastr.success('Categoria deletado com sucesso!', 'Sucesso!');
    this.menuIdToDelete = undefined;
    await this.getCategoryList();
    this.modalService.dismissAll();
  }

  async clickOpenAndClosed(categoryId) {
    const element = document.getElementById('category_' + categoryId);
    const elementIcon = document.getElementById('icon_' + categoryId);
    if (element) {
      element.hidden = !element.hidden
      if (elementIcon) {
        elementIcon.classList.toggle('flaticon2-down');
        elementIcon.classList.toggle('flaticon2-up');
      }
    }
  }

  async duplicateModal(
    content,
    categoryId,
    categoryName,
    accessoriesProduct: AccessoriesProduct | undefined,
    type = 'create'
  ) {
    this.typeAction = type;
    this.formSubmitProduct = false;

    await this.addNewProductForm();

    if (this.typeAction === 'edit') {
      // Alter file permissions
      this.formDataProduct.get('file').clearValidators();
      this.formDataProduct.get('file').updateValueAndValidity();
    }

    this.formDataProduct.patchValue({
      category: {
        _id: categoryId,
        name: categoryName,
      }
    });

    if (accessoriesProduct) {
      // Fill products info
      this.formDataProduct.patchValue({
        _id: undefined,
        name: (accessoriesProduct.name) + ' duplicado',
        description: accessoriesProduct.description,
        descriptishortDescriptionon: accessoriesProduct.shortDescription,
        price: accessoriesProduct.price,
        pricePromotion: accessoriesProduct.pricePromotion,
        percentualDiscount: accessoriesProduct.percentualDiscount,
        isPaused: accessoriesProduct.isPaused,
        amountPeople: accessoriesProduct.amountPeople,
        position: accessoriesProduct.position,
        codPdv: accessoriesProduct.codPdv,
        file: '',
        complements: [],
      });

      if (type === 'edit') {
        this.applyDiscount = accessoriesProduct.pricePromotion > 0;
      }

      // Get complements
      const complementsList = await this.getComplementsByProductId(
        accessoriesProduct._id
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
            position: new FormControl(comp.position, [Validators.min(1), Validators.max(10)]),
            items: new FormArray([]),
          });

          // Items
          for await (const item of comp.items) {
            this.formDataItem = new FormGroup({
              _id: new FormControl(undefined),
              name: new FormControl(item.name, [Validators.required]),
              codPdv: new FormControl(item.codPdv),
              description: new FormControl(item.description),
              shortDescription: new FormControl(item.shortDescription),
              price: new FormControl(item.price, [Validators.required]),
              isPaused: new FormControl(item.isPaused),
              accessoriesProductComplement: new FormControl(
                item.foodProductComplement
              ),
            });

            this.formDataComplement.get('items').push(this.formDataItem);
          }

          this.formDataProduct.get('complements').push(this.formDataComplement);
        }
      }
    }

    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-product',
        size: 'lg',
        backdrop: 'static',
      })
      .result.then(
        (result) => { },
        (reason) => { }
      );
  }

  async onChangetoggleHeader(event, foodCategory) {
    foodCategory.isPaused = event.checked;
    this.accessoriesService.updateCategory(foodCategory).subscribe(
      async (data: any) => {
        await this.getCategoryList();
        this.changeDetectorRefs.detectChanges();
        this.modalService.dismissAll();
        this.toastr.success('Categoria criado com sucesso!', 'Sucesso!');
      },
      (error) => {
        this.modalService.dismissAll();
        this.toastr.error('Falha ao criar Categoria!', 'Falha');
      }
    );
  }

  async onChangetoggleForm(event, accessoriesProduct) {
    accessoriesProduct.isPaused = event.checked;
    this.accessoriesService.updateFoodStatus(accessoriesProduct).subscribe(
      async (data: any) => {
        await this.getCategoryList();
        this.changeDetectorRefs.detectChanges();
        this.modalService.dismissAll();
        this.toastr.success('isPaused criado com sucesso!', 'Sucesso!');
      },
      (error) => {
        this.modalService.dismissAll();
        this.toastr.success('Falha ao criar isPaused!', 'Falha!');
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
            () => { },
            () => {
              document.getElementById(
                'customFileLabel'
              ).innerHTML = fileNames.join(', ');
            }
          );
        }
      );
    }
  }
}
