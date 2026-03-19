import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatChipInputEvent } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

/** Service */
import { ProductBankService } from './../../../../services/product-bank.service';
import { DepartmentService } from './../../../../services/department.service';


@Component({
  selector: 'kt-product-bank',
  templateUrl: './product-bank.component.html',
  styleUrls: ['./product-bank.component.scss']
})
export class ProductBankComponent implements OnInit, AfterViewInit {

  dataSource;
  displayedColumns = ['images', 'name', 'barcode', 'copyright', 'departments', 'action'];
  formData;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
	totalLength;

	formSubmit = false;
	formFilter: FormGroup;
	removable = true;
	keywordsList: string[] = [];
	departments: any = [];

  constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private proBanckService: ProductBankService,
		private departmentService: DepartmentService,
  ) { }

  async ngOnInit() {
		// await this.getListProductBank(0, this.pageSize);

		this.formData = new FormGroup({
      _id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
			barcode: new FormControl('', [Validators.required]),
			description: new FormControl('', [Validators.required]),
			keywords: new FormControl(''),
			image: new FormControl('', [Validators.required]),
			department: new FormControl('', [Validators.required]),
			status: new FormControl(''),
		});

		await this.addFormFilter();
		this.getDepartments();
  }

	async addFormFilter() {
		let filter: any = {};

		this.formFilter = new FormGroup({
			name: new FormControl('', ),
		});


		await this.formFilter.get('name')	.valueChanges.pipe(
			startWith(''),
			debounceTime(1000),
			switchMap((value) => {
				if (typeof value === 'string' && value.length > 0) {
					filter.barcode = value;
					filter.name = value;
				}

				return this.getListProductBank(0, this.pageSize, filter);
			}
			)
		).toPromise();
	}

	async getDepartments () {
		try {
			this.departments = await this.departmentService.getDepartments().toPromise();
		} catch (err) {}
	}

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListProductBank(
      event.pageIndex,
      event.pageSize,
    );
  }

  async getListProductBank(page, limit, filter = {}) {
    const self = this;
    let ELEMENT_DATA = [];
    this.proBanckService.getPaginatorProductBank(page, limit, filter).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.response && Array.isArray(data.response)) {
        data.response.forEach((pro, index) => {

          const depts = [];
          if (pro.departments && Array.isArray(pro.departments)) {
            depts.push(pro.departments.map((item) => item.name));
          }

          const depList = depts.join(', ');

          ELEMENT_DATA.push({
            _id: pro._id,
            position: (index + 1),
            images: (pro.images && Array.isArray(pro.images)) ? pro.images[0] : undefined,
            name: pro.name,
            barcode: pro.barcode,
            copyright: pro.copyright,
            departments: depList,
          });
				});

        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data?.total?.documents || 0;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
  }

	createProductModalShow(content) {
		this.formData.reset();
		this.keywordsList = [];

    this.modalService.open(content, {
			ariaLabelledBy: 'modal-image-bank', size: 'lg' }).result.then((result) => {
    }, (reason) => {});
  }

	async createProduct(product: any) {
		try {
			product.keywords = this.keywordsList;
			product.departments = [ product.department ];
			product.images = [ product.image ];

			let response = await this.proBanckService.createImageProduct(product).toPromise();

			if (!response) {
				this.toastr.warning('Não foi possível salvar');
				return;
			}

			this.toastr.success('Cadastrado com sucesso!');
			this.formSubmit = false;
			await this.getListProductBank(0, this.pageSize);
		} catch (err) {
			if (err.error && err.error.message) {
				this.toastr.error(`${err.error.message}`);
				return;
			}

			this.toastr.error('Não foi possível Salvar');
		}
	}

	addKeyword(event: MatChipInputEvent): void {
		const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.keywordsList.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
	}

	removekeyword(keyword: string): void {
		let index = 0;
		index = this.keywordsList.findIndex(item => item === keyword);

		if (index > -1) {
			this.keywordsList.splice(index, 1);
		}
	}

	async generateCode() {
		try {
			let response: any = await this.proBanckService.generateCode().toPromise();

			if (response && response.sequence) {
				this.formData.get('barcode').setValue(response.sequence);
			}
		} catch (err) {
			this.toastr.error('Não conseguimos gerar um código válido');
		}
	}

	// Copiar Id
	copyId(id)  {
		let textArea = document.createElement("textarea");
		textArea.value = `${id}`;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		var successful = document.execCommand('copy');
		console.log('successful', successful);
		textArea.remove();

		this.toastr.success(`Identificador copiado com sucesso ${id}`);
	}

}
