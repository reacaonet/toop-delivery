import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { AlertModal } from './../../../../../models/alertModal';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { Alert } from './../../../../../models/alert';
import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { Popup } from './../../../../../models/popup';
import { PopupService } from './../../../../services/popup.service';
import { checkObjectIdisValid } from "../../../../util";
import moment from 'moment';

@Component({
  selector: 'kt-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  companies: Company[] = [];
  companyValue: string;
  dataSource;
  alertModal: AlertModal = undefined;
  displayedColumns = ['image', 'name', 'company', 'status', 'priorities', 'vizualizations', 'message', 'delete'];
  displayedColumnsModal = ['startHour', 'endHour'];
  files: Set<File>;
  formData;
  formSubmitAttempt=false;
  popupIdToDelete;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private companyService: CompanyService,
    private modalService: NgbModal,
    private popupService: PopupService,
  ) { }

  async ngOnInit() {
    this.initFormData();
    this.getCompany();
    await this.getListPopup(0, this.pageSize, undefined);
  }

  initFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        company: new FormControl('', [Validators.required, checkObjectIdisValid]),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        startHour: new FormControl('', [Validators.required]),
        endHour: new FormControl('', [Validators.required]),
        url: new FormControl(''),
        redirectTo: new FormControl(''),
        message: new FormControl('', [Validators.required]),
        priorities: new FormControl('', [Validators.minLength(1), Validators.maxLength(2)]),
        vizualizations: new FormControl('', [Validators.minLength(1), Validators.maxLength(5)]),
        status: new FormControl(''),
        file: new FormControl('', [Validators.required]),
      });
      this.formData.get('company').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value):[])
      ).subscribe(results => this.companies = results);
      resolve(true);
    });
  }

  displayFn(company: Company) {
    if (company) {
      return company.name;
    }
  }

  getCompany() {
    this.companyService.getCompanies().subscribe((data: Company[]) => {
      // Transformar object em array para ser usado no ngFor
      const list = Object.keys(data).map((index) => {
        const company = data[index];
        return company;
      });
      this.companies = list;
    },
      error => {

      });
  }

  // listar api á colunas.
  async getListPopup(pageIn, pageOut, name) {
    const self = this;
    const ELEMENT_DATA = [];

    this.popupService.getPopupPaginator(pageIn, pageOut, name).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {

        data.list.forEach((popup, index) => {
          if (popup.startDate && moment(popup.endDate, 'YYYY-MM-DD').isValid()) {
            popup.startDate = moment(popup.startDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
          }

          if (popup.endDate && moment(popup.endDate, 'YYYY-MM-DD').isValid()) {
            popup.endDate = moment(popup.endDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
          }

          ELEMENT_DATA.push({
            _id: popup._id,
            position: (index + 1),
            name: popup.name,
            company: (popup.company) ? popup.company : '-',
            startDate: popup.startDate,
            endDate: popup.endDate,
            startHour: popup.startHour,
            endHour: popup.endHour,
            message: popup.message,
            url: popup.url,
            redirectTo: popup.redirectTo,
            priorities: popup.priorities,
            vizualizations: popup.vizualizations,
            status: popup.status,
            image: (popup.images && popup.images[0]) ? popup.images[0] : undefined,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createPopupModalShow(content) {
    this.formData.reset();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-popup', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async validDate(popup: Popup) {
    return new Promise(async (resolve, reject) => {

      const atualDate = moment().format('YYYY-MM-DD');
      const initialDate = moment(popup.startDate, 'YYYY-MM-DD').format('DD-MM-YYYY');

      if (initialDate < atualDate) {
        this.alertModal = new AlertModal('Data inicial deve ser maior ou igual à data atual', 'danger');
        setTimeout(() => { this.closeAlertModal() }, 5000);
        resolve(false);
        return;
      }

      resolve(true);
    });
  }

  // Cria o popup.
  async createPopup(popup: Popup) {
    if (!this.files || this.files.size <= 0) {
      this.alert = new Alert('Falha ao criar Popup! Imagem é obrigatoria!', 'danger');
      return;
    }

    // Valida as datas
    if (popup.startDate) {
      popup.startDate = moment(popup.startDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    if (popup.endDate) {
      popup.endDate = moment(popup.endDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    this.popupService.createPopup(popup).subscribe(async (data: any) => {
      this.alert = new Alert('Popup criado com sucesso!', 'success');
      await this.getListPopup(0, this.pageSize, undefined);
      this.modalService.dismissAll();
    }, error => {
      this.alert = new Alert('Falha ao criar Popup!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async editPopupModalShow(content, popup: Popup) {
    await this.initFormData();

    // Alter file permissions
    this.formData.get('file').clearValidators();
    this.formData.get('file').updateValueAndValidity();

    this.formData.get('url').clearValidators();
    this.formData.get('url').updateValueAndValidity();

    this.formData.patchValue({
      _id: popup._id,
      name: popup.name,
      company: popup.company,
      startDate: popup.startDate,
      endDate: popup.endDate,
      startHour: ('0000' + popup.startHour).slice(-4),
      endHour: ('0000' + popup.endHour).slice(-4),
      message: popup.message,
      url: popup.url,
      redirectTo: popup.redirectTo,
      priorities: popup.priorities,
      vizualizations: popup.vizualizations,
      status: popup.status,
      file: '',
    });
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-popup', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updatePopup(popup: Popup) {
    // Valida as datas
    if (popup.startDate) {
      popup.startDate = moment(popup.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    if (popup.endDate) {
      popup.endDate = moment(popup.endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    this.popupService.updatePopup(popup).subscribe((data: any) => {
      this.alert = new Alert('Popup alterado com sucesso!', 'success');
      this.getListPopup(0, this.pageSize, undefined);
      this.modalService.dismissAll();
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Popup!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async confirmDeleteModalShow(content, popup) {
    this.popupIdToDelete = popup._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-popup', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  // Deleta o popup
  async deletePopup() {
    if (!this.popupIdToDelete) {
      this.alert = new Alert('Falha ao deletar Popup!', 'danger');
      return;
    }
    await this.popupService.deletePopup(this.popupIdToDelete).toPromise();
    this.alert = new Alert('Popup deletado com sucesso!', 'success');
    this.popupIdToDelete = undefined;
    await this.getListPopup(0, this.pageSize, undefined);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }


  closeAlertModal() {
    this.alertModal = null;
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListPopup(event.pageIndex, event.pageSize, undefined);
  }

  onChangeUrl(event) {
    if (event === 'URL') {
      this.formData.get('url').setValidators([Validators.required]);
      this.formData.get('url').updateValueAndValidity();
    } else {
      this.formData.get('url').clearValidators();
      this.formData.get('url').updateValueAndValidity();
    }

    // this.createPopup = event;
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
