import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { FoodService } from './../../../../services/food.service';
import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { Product } from './../../../../../models/product';
import { ProductService } from './../../../../services/product.service';
import { Slider } from './../../../../../models/slider';
import { SliderService } from './../../../../services/slider.service';
import { SegmentService } from './../../../../services/company/segment.service';
import { SegmentModel } from "../../../../../models/company/segment";
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, AfterViewInit {

  companies: Company[] = [];
  companyValue: string;
  dataSource;
  displayedColumns = ['image', 'name', 'company', 'status', 'type', 'category', 'priorities', 'delete'];
  files: Set<File>;
  formData;
  formSubmitSlider = false;
  sliderIdToDelete;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  products: Product[] = [];
	segments: SegmentModel[] = [];
  totalLength;
  typeAction = 'create';
	companyId: undefined;

	listCategory = [
		{
			key: 'delivery',
			name: 'Delivery'
		},
		{
			key: 'service',
			name: 'Serviços'
		}
	]

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private sliderService: SliderService,
    private productService: ProductService,
    private foodService: FoodService,
		private segmentService: SegmentService,
  ) { }

  ngOnInit() {
    this.getListSlider(0, this.pageSize, undefined);
  }

  async searchProductByType(value) {
    return new Promise(async (resolve, reject) => {
      if (typeof this.formData.get('company').value !== 'object' || this.formData.get('company').value === null) {
        return resolve([{ _id: undefined, name: 'PRIMEIRO SELECIONE UMA EMPRESA' }]);
      } else if (value) {
        const companySelected = this.formData.get('company').value;
        if (companySelected?.type === 'accessories') {
          this.toastr.error('Função disponível somente para Mercados e Restaurantes!', 'Não permitido!');
          return resolve([{ _id: undefined, name: 'DISPONÍVEL SOMENTE PARA MERCADOS' }]);
        } else if (companySelected?.type === 'supermarket') {
          const products = await this.productService.getProductNome(value, this.formData.get('company').value).toPromise()
          return resolve(products);
        } else if (companySelected?.type === 'restaurant') {
          const foods = await this.foodService.getFoodProductNome(value, this.formData.get('company').value).toPromise()
          return resolve(foods);
        }
      }
      return resolve(undefined);
    });
  }

  async validatorPromotionRelanpago(value) {
    return new Promise(async (resolve, reject) => {

      return resolve(undefined);
    });
  }

  async newFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl(undefined, [Validators.required]),
        company: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
        status: new FormControl(true),
        vizualizations: new FormControl(undefined),
        priorities: new FormControl(undefined, [Validators.required]),
        file: new FormControl(undefined, [Validators.required]),
        companyClick: new FormControl(undefined),
        productId: new FormControl(undefined, [checkObjectIdisValid]),
        foodId: new FormControl(undefined),
        type: new FormControl('slider', [Validators.required]),
				segment: new FormControl(undefined),
				category: new FormControl('delivery', [Validators.required]),
      });

      this.formData.get('company').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap(value => (value && typeof value === 'string') ? this.companyService.getCompaniesNome(value) : [])
      ).subscribe((results) => {
        this.formData.get('productId').setValue(undefined);
        this.products = [];
        if (results && Array.isArray(results)) {
          this.companies = results;
        }
        this.changeDetectorRefs.detectChanges();
      });

      this.formData.get('productId').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap(async (value) => (typeof value === 'string' && value.length > 0) ? await this.searchProductByType(value) : [])
      ).subscribe((results) => {
        this.products = [];
        if (results && Array.isArray(results)) {
          if ((results).length > 0) {
            this.products = results;
          } else {
            this.products = [{ _id: undefined, name: 'Nenhum produto encontrado' }];
          }
        }
        this.changeDetectorRefs.detectChanges();
      });

			this.formData
			.get("segment")
			.valueChanges.pipe(
				startWith(""),
				debounceTime(1000),
				switchMap((value) =>
					(typeof value === "string" && value.length > 0)
						? this.segmentService.get(value, this.formData.controls.company.value)
						: []
				)
			)
			.subscribe((results) => (this.segments = results));

      resolve(true);
    });
  }

  displayFn(product: Product) {
    if (product) {
      return product.name;
    }
  }

  displayFnCompany(company: Company) {
    if (company) {
      this.products = [];
      return company.name;
    }
  }

	displayFnSegment(segment: SegmentModel) {
		if (segment) {
			return segment.name;
		}
	}

	async companyCurrent() {
		this.segments = [];
		this.formData.patchValue({
			segment: undefined,
		});
	}

  async getListSlider(pageIn, pageOut, name) {
    const self = this;
    const ELEMENT_DATA = [];

    this.sliderService.getSliderPaginator(pageIn, pageOut, name).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data && data.list && Array.isArray(data.list)) {
        data.list.forEach((slider, index) => {
          ELEMENT_DATA.push({
            _id: slider._id,
            position: (index + 1),
            name: slider.name,
            company: (slider.company) ? slider.company : '-',
            image: (slider.images && slider.images[0]) ? slider.images[0] : undefined,
            status: slider.status,
            priorities: slider.priorities,
            vizualizations: slider.vizualizations,
            type: slider.type,
            companyClick: slider.companyClick,
            productId: slider.productId,
            foodId: slider.foodId,
						segment: slider?.segment,
						category: slider.category ? slider.category : 'delivery',
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async upSertSliderModalShow(content, slider: Slider, type = 'create') {
    this.typeAction = type;
    this.formSubmitSlider = false;
    await this.newFormData();

    if (this.typeAction === 'edit') {
      // Alter file permissions
      this.formData.get('file').clearValidators();
      this.formData.get('file').updateValueAndValidity();
    }

    if (slider) {
      this.formData.patchValue({
        _id: slider._id,
        position: (this.dataSource.data.length + 2),
        name: slider.name,
        company: slider.company,
        status: slider.status,
        priorities: slider.priorities,
        vizualizations: slider.vizualizations,
        type: slider.type,
        companyClick: slider.companyClick,
        productId: slider.productId || slider.foodId,
        file: '',
			  segment: slider.segment ? slider.segment : null,
				// segment: slider?.segment,
				category: slider.category ? slider.category : 'delivery',
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-slider', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upSertSlider(slider: Slider) {
		// console.log('slider', slider)
    // If restaurante, set foodId
    if (slider?.company?.type === 'restaurant') {
      slider.foodId = slider?.productId;
      slider.productId = undefined;
    }

		if (slider.segment === "") {
			delete slider.segment
		}

    if (this.typeAction === 'create') {
      this.sliderService.createSlider(slider).subscribe(async (_: any) => {
        await this.getListSlider(0, this.pageSize, undefined);
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('Slider atualizado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        this.toastr.error('Falha ao criar Slider!', 'Falha!');
        this.modalService.dismissAll();
      });
    } else {
      this.sliderService.updateSlider(slider).subscribe(async (_: any) => {
        await this.getListSlider(0, this.pageSize, undefined);
        this.toastr.success('Slider alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Falha ao alterar Slider!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, slider) {
    this.sliderIdToDelete = slider._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-slider', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  // Deleta o slider
  async deleteSlider() {
    if (!this.sliderIdToDelete) {
      this.toastr.error('Erro ao deletar Slider!', 'Falha!');
      return;
    }
    await this.sliderService.deleteSlider(this.sliderIdToDelete).toPromise();
    this.toastr.success('Slider deletado com sucesso!', 'sucesso!');
    this.sliderIdToDelete = undefined;
    await this.getListSlider(0, this.pageSize, undefined);
  }

  ngAfterViewInit() {
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListSlider(event.pageIndex, event.pageSize, undefined);
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
            file: fileList
          });
        };
      }
    }
    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');

  }

}
