import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Alert } from './../../../../../models/alert';
import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { Person } from './../../../../../models/person';
import { PersonService } from './../../../../services/person.service';
import { ShopperService } from './../../../../services/shopper.service';
import { Shopper } from './../../../../../models/shopper';
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-shopper',
  templateUrl: './shopper.component.html',
  styleUrls: ['./shopper.component.scss']
})
export class ShopperComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  person: Person[] = [];
  companies: Company[] = [];
  companyValue: string;
  personValue: string;
  dataSource;
  displayedColumns = ['isOnline', 'person', 'company', 'status', 'appVersion', 'delete'];
  formData;
  formFilter: FormGroup;
  formSubmitShopper = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
  shopperIdToDelete;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private shopperService: ShopperService,
    private companyService: CompanyService,
    private personService: PersonService,
  ) { }

  ngOnInit() {
    this.getListShopper(0, this.pageSize, undefined, undefined, undefined);
    this.getListPerson();
    this.getCompany();

    this.formFilter = new FormGroup({
      person: new FormControl('', [checkObjectIdisValid]),
      company: new FormControl('', [checkObjectIdisValid]),
      isOnline: new FormControl(''),
    });
    this.formFilter.get('company').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value): [])
    )
      .subscribe((results: Company[]) => {
        this.companies = results;
        this.changeDetectorRefs.detectChanges();
      });

    this.formFilter.get('person').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.personService.getPersonNome(value):[])
    )
      .subscribe((results: Person[]) => {
        this.person = results;
        this.changeDetectorRefs.detectChanges();
      });

    this.formFilter.get('isOnline').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ?
        this.getListShopper(
          0,
          this.pageSize,
          this.formFilter.controls.company.value,
          this.formFilter.controls.person.value,
          value,
        ):[])
    )
      .subscribe(() => {
        this.changeDetectorRefs.detectChanges();
      });


    this.formData = new FormGroup({
      _id: new FormControl(''),
      person: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required]),
      status: new FormControl(''),
      isOnline: new FormControl(''),
    });
    this.formData.get('company').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value):[])
    ).subscribe(results => this.companies = results);

    this.formData.get('person').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.personService.getPersonNome(value):[])
    ).subscribe(results => this.person = results);

    this.formData.get('isOnline').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ?
        this.getListShopper(
          0,
          this.pageSize,
          this.formFilter.controls.company.value,
          this.formFilter.controls.person.value,
          value,
        ):[])
    )
      .subscribe(() => {
        this.changeDetectorRefs.detectChanges();
      });

  }

  displayFnFilter(company: Company) {
    if (company) {
      return company.name;
    }
  }

  displayFnFilterTwo(person: Person) {
    if (person) {
      return person.name;
    }
  }

  async onClickCompanyFilter(company) {
    await this.getListShopper(0, this.pageSize, company._id, undefined, undefined);
  }

  async onClickPersonFilter(person) {
    await this.getListShopper(0, this.pageSize, undefined, person._id, undefined);
  }

  displayFn(company: Company) {
    if (company) {
      return company.name;
    }
  }

  displayFnPerson(person: Person) {
    if (person) {
      return person.name;
    }
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListShopper(event.pageIndex, event.pageSize, undefined, undefined, undefined);
  }

  getListPerson() {
    this.personService.getPerson().subscribe((data: Person[]) => {
      const list = Object.keys(data).map((index) => {
        const person = data[index];
        return person;
      });
      this.person = list;
    },
      error => {

      });
  }

  getCompany() {
    this.companyService.getCompanies().subscribe((data: Company[]) => {
      const list = Object.keys(data).map((index) => {
        const company = data[index];
        return company;
      });
      this.companies = list;
    },
      error => {

      });
  }


  async getListShopper(pageIn, pageOut, companyId, personId, isOnline) {
    const self = this;
    const ELEMENT_DATA = [];

    this.shopperService.getShopperPaginator(pageIn, pageOut, companyId, personId, isOnline).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((shopper, index) => {
          ELEMENT_DATA.push({
            _id: shopper._id,
            position: (index + 1),
            person: (shopper.person) ? shopper.person : '-',
            company: (shopper.company) ? shopper.company : '-',
            status: shopper.status,
            isOnline: shopper.isOnline,
            appVersion: (shopper.appVersion) ? shopper.appVersion : '-',
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createShopperModalShow(content) {
    this.formSubmitShopper = false;

    this.formData.reset();
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-shopper', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createShopper(shopper: Shopper) {
    this.shopperService.createShopper(shopper).subscribe((data: any) => {
      const shopper = data.data;
      this.toastr.success('Shopper criado com sucesso!', 'Sucesso!');

      this.dataSource.data.push({
        _id: shopper._id,
        position: (this.dataSource.data.length + 2),
        person: shopper.person,
        company: shopper.company,
        status: shopper.status,
        isOnline: shopper.isOnline,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
    }, error => {
      this.toastr.error('Erro ao criar Shopper!', 'Falha!');
    });
  }

  async editShopperModalShow(content, shopper: Shopper) {
    this.formSubmitShopper = false;

    this.formData.reset();
    this.formData.patchValue({
      _id: shopper._id,
      person: shopper.person,
      company: shopper.company,
      status: shopper.status,
      isOnline: shopper.isOnline,
    });

    this.myControl = new FormControl(shopper.person.name);
    this.myControl = new FormControl(shopper.company.name);
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-shopper', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updateShopper(shopper: Shopper) {
    this.shopperService.updateShopper(shopper).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(shopper._id);
      this.dataSource.data[index] = data.data;

      this.dataSource.data[index].company = data.data.company;
      this.dataSource.data[index].person = data.data.person;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.toastr.success('Shopper alterado com sucesso!', 'Sucesso!');
    }, error => {
      console.error(error);
      this.toastr.error('Erro ao alterar Shopper!', 'Falha!');
    });
  }

  async confirmDeleteModalShow(content, shopper) {
    this.shopperIdToDelete = shopper._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-shopper', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteShopper() {
    if (!this.shopperIdToDelete) {
      this.toastr.error('Erro ao deletar Shopper!', 'Falha!');
      return;
    }
    await this.shopperService.deleteShopper(this.shopperIdToDelete).toPromise();
    this.toastr.success('Shopper deletado com sucesso!', 'Sucesso!');
    this.shopperIdToDelete = undefined;
    await this.getListShopper(0, this.pageSize, undefined, undefined, undefined);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

  focusInPerson(person) {
    this.personValue = person.target.value;
  }

  focusOutPerson(person, modalType) {
    const personValue = person.target.value;

    this.person.forEach((person: Person, index) => {
      if (person.name === personValue) {
        this.formData.controls.person.setValue(person._id);
        this.personValue = person.name;
        return true;
      }
    });

    person.target.value = this.personValue;
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
