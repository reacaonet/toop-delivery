import { Person } from './../../../../../models/person';
import { Company } from './../../../../../models/company/company';
import { State } from './../../../../../models/state';
import { City } from './../../../../../models/city';
import { Address } from './../../../../core/auth/_models/address.model';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import moment from 'moment';

import { CityService } from './../../../../services/city.service';
import { CompanyService } from './../../../../services/company.service';
import { PersonService } from './../../../../services/person.service';
import { StateService } from './../../../../services/state.service';
import { Subordinate } from './../../../../../models/finance/subordinate';
import { SubordinateService } from './../../../../services/subordinate.service';
import { TypePaymentsService } from './../../../../services/typepayments.service';
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-subordinate',
  templateUrl: './subordinate.component.html',
  styleUrls: ['./subordinate.component.scss']
})
export class SubordinateComponent implements OnInit, AfterViewInit {

  companies: Company[] = [];
  dataSource;
  displayedColumns = ['physicalPerson', 'legalPerson', 'delete'];
  formData;
  formDataAddress;
  formDataFees;
  formDatalegalPerson;
  formDataPhysicalPerson;
  formFilter: FormGroup;
  formSubmitSubordinate = false;
  listCity: City[] = [];
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  person: Person[] = [];
  stateList: State[] = [];
  subordinateIdToDelete;
  totalLength;
  typeAction = 'create';

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cityService: CityService,
    private companyService: CompanyService,
    private personService: PersonService,
    private stateService: StateService,
    private subordinateService: SubordinateService,
    private typePaymentsService: TypePaymentsService,
  ) { }

  async ngOnInit() {
    this.getListSubordinates();
    await this.newFormData();
    // await   this.newFormDataPhysicalPerson();
    // await   this.newFormDataLegalPerson();
  }

  async newFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        legal: new FormArray([]),
        physical: new FormArray([]),
        address: new FormArray([]),
        feesTypes: new FormArray([]),
      });

      await this.newFormDataAddress();
      await this.newFormDataFees();
      resolve(true);
    });
  }

  async newFormDataLegalPerson() {
    return new Promise(async (resolve, reject) => {
      await this.clearFormLegalOrPhysical();
      this.formDatalegalPerson = new FormGroup({
        _id: new FormControl(undefined),
        legalPerson: new FormControl('', [Validators.required, checkObjectIdisValid]),
        socialReason: new FormControl('', [Validators.required]),
        fantasyName: new FormControl('', [Validators.required]),
        cnpj: new FormControl('', [Validators.required]),
        representativesName: new FormControl('', [Validators.required]),
        representativeEmail: new FormControl('', [Validators.required]),
        representativePhone: new FormControl('', [Validators.required]),
      });

      this.formDatalegalPerson.get('legalPerson').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value) : [])
      ).subscribe(results => this.companies = results);

      this.formData.get('legal').push(this.formDatalegalPerson);
      resolve(true);
    });
  }

  async newFormDataPhysicalPerson() {
    return new Promise(async (resolve, reject) => {
      await this.clearFormLegalOrPhysical();
      this.formDataPhysicalPerson = new FormGroup({
        _id: new FormControl(undefined),
        physicalPerson: new FormControl('', [Validators.required, checkObjectIdisValid]),
        name: new FormControl('', [Validators.required]),
        cpf: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required]),
        phone: new FormControl('', [Validators.required]),
        dateOfBirth: new FormControl('', [Validators.required]),
      });

      this.formDataPhysicalPerson.get('physicalPerson').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.personService.getPersonNome(value): [])
      ).subscribe(results => this.person = results);

      this.formData.get('physical').push(this.formDataPhysicalPerson);
      resolve(true);
    });
  }

  async newFormDataAddress() {
    return new Promise(async (resolve, reject) => {
      this.formDataAddress = new FormGroup({
        _id: new FormControl(undefined),
        cep: new FormControl('', [Validators.required]),
        publicPlace: new FormControl('', [Validators.required]),
        number: new FormControl('', [Validators.required]),
        complement: new FormControl('', [Validators.required]),
        neighborhood: new FormControl('', [Validators.required]),
        uf: new FormControl('', [Validators.required, checkObjectIdisValid]),
        city: new FormControl('', [Validators.required, checkObjectIdisValid]),
      });

      this.formDataAddress.get('city').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value)  => (typeof value === 'string' && value.length > 0) ? this.cityService.getCityName(value): [])
      )
        .subscribe((results: City[]) => {
          this.listCity = results;
          this.changeDetectorRefs.detectChanges();
        });

      this.formDataAddress.get('uf').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.stateService.getStatesNome(value): [])
      ).subscribe(results => {
        this.stateList = results
        this.changeDetectorRefs.detectChanges();
      });

      if (this.formData.get('address').length > 0) {
        this.formData.get('address').clear();
      }

      this.formData.get('address').push(this.formDataAddress);
      resolve(true);
    });
  }

  async newFormDataFees() {
    return new Promise(async (resolve, reject) => {
      this.formDataFees = new FormGroup({
        _id: new FormControl(undefined),
        bank: new FormControl('', [Validators.required]),
        accountType: new FormControl('', [Validators.required]),
        agency: new FormControl('', [Validators.required]),
        agencyDigit: new FormControl('', [Validators.required]),
        account: new FormControl('', [Validators.required]),
        accountDigit: new FormControl('', [Validators.required]),
        fees: new FormControl('', [Validators.required]),
        tariff: new FormControl('', [Validators.required]),
        percentage: new FormControl('', [Validators.required]),
      });

      if (this.formData.get('feesTypes').length > 0) {
        this.formData.get('feesTypes').clear();
      }

      this.formData.get('feesTypes').push(this.formDataFees);
      resolve(true);
    });
  }

  async clearFormLegalOrPhysical() {
    return new Promise(async (resolve, reject) => {
      if (this.formData.get('physical').length > 0) {
        this.formData.get('physical').clear();
      }

      if (this.formData.get('legal').length > 0) {
        this.formData.get('legal').clear();
      }

      resolve(true);
    });
  }

  displayFnCity(city: City) {
    if (city) {

      return city.name;
    }
  }

  displayFnState(state: State) {
    if (state) {
      return state.name;
    }
  }

  displayFnFilter(company: Company) {
    if (company) {
      return company.name;
    }
  }

  displayFnPerson(person: Person) {
    if (person) {
      return person.name;
    }
  }

  async getListSubordinates() {
    const self = this;
    const ELEMENT_DATA = [];

    this.subordinateService.getSubordinate().subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data && Array.isArray(data)) {

        data.forEach((subordinate, index) => {

          const date = moment(subordinate.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY');

          ELEMENT_DATA.push({
            _id: subordinate._id,
            position: (index + 1),
            legalPerson: (subordinate.legalPerson) ? subordinate.legalPerson : undefined,
            physicalPerson: (subordinate.physicalPerson) ? subordinate.physicalPerson : undefined,
            address: (subordinate.address) ? subordinate.address : '-',
            uf: (subordinate.state) ? subordinate.state : '-',
            city: (subordinate.city) ? subordinate.city : '-',
            socialReason: subordinate.socialReason,
            cnpj: subordinate.cnpj,
            fantasyName: subordinate.fantasyName,
            representativesName: subordinate.representativesName,
            representativeEmail: subordinate.representativeEmail,
            representativePhone: subordinate.representativePhone,
            name: subordinate.name,
            cpf: subordinate.cpf,
            email: subordinate.email,
            phone: subordinate.phone,
            dateOfBirth: date,
            cep: subordinate.cep,
            publicPlace: subordinate.publicPlace,
            number: subordinate.number,
            complement: subordinate.complement,
            neighborhood: subordinate.neighborhood,
            accountType: subordinate.accountType,
            bank: subordinate.bank,
            agency: subordinate.agency,
            agencyDigit: subordinate.agencyDigit,
            account: subordinate.account,
            accountDigit: subordinate.accountDigit,
            fees: subordinate.fees,
            tariff: subordinate.tariff,
            percentage: subordinate.percentage,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.changeDetectorRefs.detectChanges();
      }
    });
  }

  async upSertSubordinateModalShow(content, subordinate: Subordinate, type = 'create') {

    this.typeAction = type;
    this.formSubmitSubordinate = false;
    await this.newFormData();
    this.formData.reset();
    // await this.newFormDataLegalPerson();
    // await this.newFormDataPhysicalPerson();
    // this.formDatalegalPerson.reset();
    // this.formDataPhysicalPerson.reset();

    if (subordinate) {
      this.formData.patchValue({
        _id: subordinate._id,
      });

      if (subordinate.legalPerson) {
        await this.newFormDataLegalPerson();
        this.formDatalegalPerson.patchValue({
          legalPerson: subordinate.legalPerson,
          socialReason: subordinate.socialReason,
          cnpj: subordinate.cnpj,
          fantasyName: subordinate.fantasyName,
          representativesName: subordinate.representativesName,
          representativeEmail: subordinate.representativeEmail,
          representativePhone: subordinate.representativePhone,
        })
      }

      if (subordinate.physicalPerson) {
        await this.newFormDataPhysicalPerson();
        this.formDataPhysicalPerson.patchValue({
          physicalPerson: subordinate.physicalPerson,
          name: subordinate.name,
          cpf: subordinate.cpf,
          email: subordinate.email,
          phone: subordinate.phone,
          dateOfBirth: subordinate.dateOfBirth,
        })
      }

      await this.newFormDataAddress();
      this.formDataAddress.patchValue({
        uf: subordinate.uf,
        city: subordinate.city,
        cep: subordinate.cep,
        publicPlace: subordinate.publicPlace,
        number: subordinate.number,
        complement: subordinate.complement,
        neighborhood: subordinate.neighborhood,
      })

      await this.newFormDataFees();
      this.formDataFees.patchValue({
        accountType: subordinate.accountType,
        bank: subordinate.bank,
        agency: subordinate.agency,
        agencyDigit: subordinate.agencyDigit,
        account: subordinate.account,
        accountDigit: subordinate.accountDigit,
        fees: subordinate.fees,
        tariff: subordinate.tariff,
        percentage: subordinate.percentage,
      })

      if (subordinate && subordinate.legal && Array.isArray(subordinate.legal)) {
        for await (const sub of subordinate.legal) {
          const subordinateLegal = this.formDatalegalPerson.length;
          this.formDatalegalPerson = new FormGroup({
            legalPerson: new FormControl(sub, [Validators.required]),
            socialReason: new FormControl(sub, [Validators.required]),
            fantasyName: new FormControl(sub, [Validators.required]),
            cnpj: new FormControl(sub, [Validators.required]),
            representativesName: new FormControl(sub, [Validators.required]),
            representativeEmail: new FormControl(sub, [Validators.required]),
            representativePhone: new FormControl(sub, [Validators.required]),
          });
          this.formData.get('legal').push(this.formDatalegalPerson);
        }
      }

      if (subordinate && subordinate.physical && Array.isArray(subordinate.physical)) {
        for await (const subo of subordinate.physical) {
          const subordinatePhysical = this.formDataPhysicalPerson.length;
          this.formDataPhysicalPerson = new FormGroup({
            physicalPerson: new FormControl(subo, [Validators.required]),
            name: new FormControl(subo, [Validators.required]),
            cpf: new FormControl(subo, [Validators.required]),
            email: new FormControl(subo, [Validators.required]),
            phone: new FormControl(subo, [Validators.required]),
            dateOfBirth: new FormControl(subo, [Validators.required]),
          });
          this.formData.get('physical').push(this.formDataPhysicalPerson);
        }
      }

      if (subordinate && subordinate.address && Array.isArray(subordinate.address)) {
        for await (const add of subordinate.address) {
          const subordinateAddress = this.formDataAddress.length;
          this.formDataAddress = new FormGroup({
            cep: new FormControl(add, [Validators.required]),
            publicPlace: new FormControl(add, [Validators.required]),
            number: new FormControl(add, [Validators.required]),
            complement: new FormControl(add, [Validators.required]),
            neighborhood: new FormControl(add, [Validators.required]),
            uf: new FormControl(add, [Validators.required]),
            city: new FormControl(add, [Validators.required]),
          });
          this.formData.get('address').push(this.formDataAddress);
        }
      }

      if (subordinate && subordinate.feesTypes && Array.isArray(subordinate.feesTypes)) {
        for await (const fe of subordinate.feesTypes) {
          const subordinatefeesTypes = this.formDataFees.length;
          this.formDataFees = new FormGroup({
            bank: new FormControl(fe, [Validators.required]),
            accountType: new FormControl(fe, [Validators.required]),
            agency: new FormControl(fe, [Validators.required]),
            agencyDigit: new FormControl(fe, [Validators.required]),
            account: new FormControl(fe, [Validators.required]),
            accountDigit: new FormControl(fe, [Validators.required]),
            fees: new FormControl(fe, [Validators.required]),
            tariff: new FormControl(fe, [Validators.required]),
            percentage: new FormControl(fe, [Validators.required]),
          });
          this.formData.get('feesTypes').push(this.formDataFees);
        }
      }

    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-subordinate', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });


  }

  async upSertSubordinate(subordinate: Subordinate) {

    const subordinateModel: any = {
      legalPerson: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].legalPerson) ? subordinate.legal[0].legalPerson : undefined,
      socialReason: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].socialReason) ? subordinate.legal[0].socialReason : undefined,
      fantasyName: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].fantasyName) ? subordinate.legal[0].fantasyName : undefined,
      cnpj: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].cnpj) ? subordinate.legal[0].cnpj : undefined,
      representativesName: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].representativesName) ? subordinate.legal[0].representativesName : undefined,
      representativeEmail: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].representativeEmail) ? subordinate.legal[0].representativeEmail : undefined,
      representativePhone: (subordinate?.legal && subordinate.legal[0] && subordinate.legal[0].representativePhone) ? subordinate.legal[0].representativePhone : undefined,
      physicalPerson: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].physicalPerson) ? subordinate.physical[0].physicalPerson : undefined,
      name: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].name) ? subordinate.physical[0].name : undefined,
      cpf: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].cpf) ? subordinate.physical[0].cpf : undefined,
      email: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].email) ? subordinate.physical[0].email : undefined,
      phone: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].phone) ? subordinate.physical[0].phone : undefined,
      dateOfBirth: (subordinate?.physical && subordinate.physical[0] && subordinate.physical[0].dateOfBirth) ? subordinate.physical[0].dateOfBirth : undefined,
      cep: (subordinate.address[0].cep) ? subordinate.address[0].cep : undefined,
      publicPlace: (subordinate.address[0].publicPlace) ? subordinate.address[0].publicPlace : undefined,
      number: (subordinate.address[0].number) ? subordinate.address[0].number : undefined,
      complement: (subordinate.address[0].complement) ? subordinate.address[0].complement : undefined,
      neighborhood: (subordinate.address[0].neighborhood) ? subordinate.address[0].neighborhood : undefined,
      uf: (subordinate.address[0].uf && subordinate.address[0].uf) ? subordinate.address[0].uf : undefined,
      city: (subordinate.address[0].city && subordinate.address[0].city) ? subordinate.address[0].city : undefined,
      bank: (subordinate.feesTypes[0].bank) ? subordinate.feesTypes[0].bank : undefined,
      accountType: (subordinate.feesTypes[0].accountType) ? subordinate.feesTypes[0].accountType : undefined,
      agency: (subordinate.feesTypes[0].agency) ? subordinate.feesTypes[0].agency : undefined,
      agencyDigit: (subordinate.feesTypes[0].agencyDigit) ? subordinate.feesTypes[0].agencyDigit : undefined,
      account: (subordinate.feesTypes[0].account) ? subordinate.feesTypes[0].account : undefined,
      accountDigit: (subordinate.feesTypes[0].accountDigit) ? subordinate.feesTypes[0].accountDigit : undefined,
      fees: (subordinate.feesTypes[0].fees) ? subordinate.feesTypes[0].fees : undefined,
      tariff: (subordinate.feesTypes[0].tariff) ? subordinate.feesTypes[0].tariff : undefined,
      percentage: (subordinate.feesTypes[0].percentage) ? subordinate.feesTypes[0].percentage : undefined,
    }

    if (this.typeAction === 'create') {

      this.subordinateService.createSubordinate(subordinateModel).subscribe(async (_: any) => {
        await this.getListSubordinates();
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('Subordinate atualizado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();

      }, error => {
        this.toastr.error('Erro ao criar subordinado!', 'Falha!');
        this.modalService.dismissAll();

      });
    } else {
      this.subordinateService.updateSubordinate(subordinateModel).subscribe(async (_: any) => {
        await this.getListSubordinates();
        this.toastr.success('Subordinate alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Erro ao alterar subordinado!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, subordinate) {
    this.subordinateIdToDelete = subordinate._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-subordinate', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteSubordinate() {
    if (!this.subordinateIdToDelete) {
      this.toastr.error('Erro ao deletar subordinado!', 'Falha!');
      return;
    }
    await this.subordinateService.deleteSubordinate(this.subordinateIdToDelete).toPromise();
    this.toastr.success('Subordinate deletado com sucesso!', 'Sucesso!');
    this.subordinateIdToDelete = undefined;
    await this.getListSubordinates();
  }

  ngAfterViewInit() {
  }


}
