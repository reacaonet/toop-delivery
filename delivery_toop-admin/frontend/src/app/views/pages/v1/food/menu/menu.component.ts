import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Alert } from './../../../../../../models/alert';
import { AlertModal } from './../../../../../../models/alertModal';
import { Company } from './../../../../../../models/company/company';
import { CompanyService } from './../../../../../services/company.service';
import { FoodCategory } from './../../../../../../models/foodCategory';
import { FoodService } from './../../../../../services/food.service';
import { FoodProduct } from './../../../../../../models/foodProduct';
import { FoodProductComplement } from './../../../../../../models/foodProductComplement';
import { FoodProductComplementItem } from './../../../../../../models/foodProductComplementItem';
import { checkObjectIdisValid } from "../../../../../util";

@Component({
  selector: 'kt-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  alert: Alert = undefined;
  alertModal: AlertModal = undefined;
  categories: FoodCategory[];
  company: Company[] = [];
  companyValue: string;
  files: Set<File>;
  foodProductComplement: FoodProductComplement[] = [];
  formData;
  formSubmitAttempt = false;
  formSubmitProduct = false;
  formDataProduct;
  formDataItem;
  formDataComplement;
  itensProduct: FoodProductComplementItem[];
  myControl: FormControl = new FormControl();

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private foodService: FoodService,
    private companyService: CompanyService,
    private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    this.formData = new FormGroup({
      _id: new FormControl(undefined),
      name: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required, checkObjectIdisValid]),
    });
  }

  async addNewProduct() {
    return new Promise(async (resolve, reject) => {
      this.formDataProduct = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl('', [Validators.required]),
        foodCategory: new FormControl('', [Validators.required]),
        foodCategoryId: new FormControl(''),
        description: new FormControl(''),
        price: new FormControl('', [Validators.required]),
        pricePromotion: new FormControl(''),
        codPdv: new FormControl(''),
        file: new FormControl('', [Validators.required]),
        complements: new FormArray([])
      });
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
      // product: new FormControl('', [Validators.required]),
      isPaused: new FormControl(''),
      // foodProductComplement: new FormControl('', [Validators.required]),
      items: new FormArray([])
    });

    this.formDataProduct.get('complements').push(this.formDataComplement);
  }

  async addComplement(boxId, complement) {
    this.formDataItem = new FormGroup({
      name: new FormControl('', [Validators.required]),
      codPdv: new FormControl(''),
      description: new FormControl(''),
      price: new FormControl(0, [Validators.required]),
      isPaused: new FormControl(''),
      // foodProductComplement: new FormControl('', [Validators.required]),
    });

    complement.get('items').push(this.formDataItem);
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

  async ngAfterViewInit() {
    await this.getCategoryList();
    this.changeDetectorRefs.detectChanges();
  }

  closeAlert() {
    this.alert = null;
  }

  closeAlertModal() {
    this.alertModal = null;
  }

  focusInCompany(company) {
    this.companyValue = company.target.value;
  }

  async addCategory(content) {
    this.formSubmitAttempt = false;
    this.formData.reset();
    this.getCompany();
    this.modalService.open(content, { ariaLabelledBy: 'modal-category' }).result.then((result) => {
    }, (reason) => {

    });

  }

  getCompany() {
    this.companyService.getCompanies().subscribe((data: Company[]) => {
      const list = Object.keys(data).map((index) => {
        const company = data[index];
        return company;
      });
      this.company = list;
    },
      error => {

      });
  }

  createFoodCategoryModalShow(content) {
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-foodCategory', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createFoodCategory(foodCategory: FoodCategory) {
    this.foodService.createFoodCategory(foodCategory).subscribe(async (data: any) => {
      await this.getCategoryList();
      this.changeDetectorRefs.detectChanges();
      this.alert = new Alert('Categoria criado com sucesso!', 'success');
    }, error => {
      this.alert = new Alert('Falha ao criar Categoria!', 'danger');
      //this.formDataProduct.reset();
    });
  }

  async addProduct(content, categoryId, categoryName) {
    this.formSubmitProduct = false;

    await this.addNewProduct();

    this.formDataProduct.patchValue({
      foodCategory: categoryName,
      foodCategoryId: categoryId,
    });

    this.modalService.open(content, { ariaLabelledBy: 'modal-product', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  focusOutCompany(company) {
    const companyValue = company.target.value;

    this.company.forEach((company: Company, index) => {
      if (company.name === companyValue) {
        this.formData.controls.company.setValue(company._id);
        this.companyValue = company.name;
        return true; // break foreach
      }
    });

    // Se não econtrar, retornar ao valor anterior
    company.target.value = this.companyValue;
  }

  async editFoodProductModalShow(content, foodProduct: FoodProduct, categoryId, categoryName) {
    await this.addNewProduct();

    // Alter file permissions
    this.formDataProduct.get('file').clearValidators();
    this.formDataProduct.get('file').updateValueAndValidity();

    // Preenche produto
    this.formDataProduct.patchValue({
      _id: foodProduct._id,
      name: foodProduct.name,
      foodCategory: categoryName,
      foodCategoryId: categoryId,
      description: foodProduct.description,
      price: foodProduct.price,
      pricePromotion: foodProduct.pricePromotion,
      codPdv: foodProduct.codPdv,
      file: '',
      complements: []
    });

    // Products
    for await (const comp of foodProduct.complements) {
      this.formDataComplement = new FormGroup({
        _id: new FormControl(comp._id, [Validators.required]),
        name: new FormControl(comp.name, [Validators.required]),
        amountMin: new FormControl(comp.amountMin, [Validators.required]),
        amountMax: new FormControl(comp.amountMax, [Validators.required]),
        isRequired: new FormControl(comp.isRequired),
        product: new FormControl(comp.product, [Validators.required]),
        items: new FormArray([])
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
          foodProductComplement: new FormControl(item.foodProductComplement),
        });

        this.formDataComplement.get('items').push(this.formDataItem);
      }

      this.formDataProduct.get('complements').push(this.formDataComplement);
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-foodProduct', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async saveProduct(foodProduct: FoodProduct, productId) {

    return new Promise(async (resolve, reject) => {
      let productData;

      // Cadastra produto
      productData = new FoodProduct();
      productData = {
        file: foodProduct.file,
        name: foodProduct.name,
        category: foodProduct.foodCategoryId,
        description: foodProduct.description,
        price: foodProduct.price,
        pricePromotion: foodProduct.pricePromotion,
        codPdv: foodProduct.codPdv,
      };

      let data;
      if (!productId) {
        data = await this.foodService.createFoodProduct(productData).toPromise();
      } else {
        productData._id = productId;
        data = await this.foodService.updateFoodProduct(productData).toPromise();
      }

      this.formSubmitProduct = false;
      resolve(data);
    });
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
          if (this.formDataProduct) {
            this.formDataProduct.patchValue({
              file: fileList
            });
          }
        };
      }
    }
    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');

  }

  async validPricePromotion(foodProduct: FoodProduct) {
    return new Promise(async (resolve, reject) => {
      if (foodProduct.pricePromotion > 0) {
        if (Number(foodProduct.pricePromotion) >= Number(foodProduct.price)) {
          this.alertModal = new AlertModal('Valor promocional precisa ser menor que valor do preço!', 'danger');
          setTimeout(() => { this.closeAlertModal() }, 5000);
          resolve(false);
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
      const product: any = await this.saveProduct(foodProduct, undefined)
        .catch((error) => {
          this.alert = new Alert('Erro ao cadastrar produto!', 'danger');
          return;
        });

      if (!product) {
        this.alert = new Alert('Erro ao cadastrar produto!', 'danger');
        return;
      }

      productId = (product && product.data && product.data._id) ? product.data._id : undefined;

      // Cadastra os complementos do produtos
      const productComplement: any = await this.saveProductComplement(productId, foodProduct.complements || [])
        .catch((error) => {
          this.alert = new Alert('Erro ao cadastrar complementos do produto!', 'danger');
          return;
        });

      if (!productComplement) {
        this.alert = new Alert('Erro ao cadastrar complemento(s) do produto!', 'danger');
        return;
      }

      await this.getCategoryList();
      this.changeDetectorRefs.detectChanges();
      this.alert = new Alert('Product criado com sucesso!', 'success');
      this.modalService.dismissAll();
      return;
    } catch (error) {
      this.alert = new Alert('Erro ao cadastrar produto!', 'danger');
      return;
    }
  }

  async saveProductComplementItem(complementId, foodProductComplementItem: FoodProductComplementItem[]) {
    return new Promise(async (resolve, reject) => {
      let productComplementItemData;

      for await (const item of foodProductComplementItem) {
        // Cadastra item complemento do produto
        productComplementItemData = new FoodProductComplementItem();
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
          complementItem = await this.foodService.createFoodProductComplementItem(productComplementItemData).toPromise();
        } else {
          complementItem = await this.foodService.updateFoodProductComplementItem(productComplementItemData).toPromise();
        }

        if (!complementItem) {
          this.alert = new Alert('Falha ao criar item no complemento do produto!', 'danger');
          reject(false);
        }
      }
      resolve(true);
    });
  }

  async saveProductComplement(productId, foodProductComplement: FoodProductComplement[]) {
    return new Promise(async (resolve, reject) => {
      let productComplementData;
      const itemsData = [];

      for await (const compl of foodProductComplement) {
        // Cadastra produto
        productComplementData = new FoodProductComplement();
        productComplementData = {
          _id: compl._id,
          name: compl.name,
          amountMax: Number(compl.amountMax || 0),
          amountMin: Number(compl.amountMin || 0),
          isRequired: Boolean(compl.isRequired),
          foodproduct: productId,
          product: productId,
        };

        let complement: any;
        if (!compl._id) {
          complement = await this.foodService.createFoodProductComplement(productComplementData).toPromise();
        } else {
          productComplementData._id = compl._id;
          complement = await this.foodService.updateFoodProductComplement(productComplementData).toPromise();
        }

        if (complement) {
          itemsData.push({
            items: compl.items,
            complementId: complement.data._id,
            complementName: complement.data.name,
          });

          const productComplementItem: any = await this.saveProductComplementItem(complement.data._id, compl.items);

          if (!productComplementItem) {
            this.alert = new Alert('Falha ao criar item no complemento do produto!', 'danger');
            reject(false);
          }
        } else {
          this.alert = new Alert('Falha ao criar Product!', 'danger');
          reject(false);
        }
      }
      resolve(itemsData);
    });
  }

  async updateFoodProduct(foodProduct: FoodProduct) {
    const ValidPriceEdit = await this.validPricePromotion(foodProduct);

    if (!ValidPriceEdit) {
      return;
    }

    try {
      const productId = foodProduct._id;
      const product: any = await this.saveProduct(foodProduct, foodProduct._id);

      if (!product) {
        this.alert = new Alert('Erro ao editar produto!', 'danger');
        return;
      }

      // Edita os complementos do produtos
      const productComplement: any = await this.saveProductComplement(productId, foodProduct.complements || [])
        .catch((error) => {
          this.alert = new Alert('Erro ao editar complementos do produto!', 'danger');
          return;
        });

      if (!productComplement) {
        this.alert = new Alert('Erro ao editar complemento(s) do produto!', 'danger');
        return;
      }

      await this.getCategoryList();
      this.changeDetectorRefs.detectChanges();
      this.alert = new Alert('Produto alterado com sucesso!', 'success');
      this.modalService.dismissAll();
      return;
    } catch (error) {
      this.alert = new Alert('Erro ao editar produto!', 'danger');
      return;
    }
  }

}
