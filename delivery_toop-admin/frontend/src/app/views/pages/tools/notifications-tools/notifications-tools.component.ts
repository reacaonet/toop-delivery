import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { NotificationService } from './../../../../services/notification.service';
import { NotificationTools } from './../../../../../models/notificationTools';
import { Alert } from './../../../../../models/alert';
import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-notifications-tools',
  templateUrl: './notifications-tools.component.html',
  styleUrls: ['./notifications-tools.component.scss']
})
export class NotificationsToolsComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  companyValue: string;
  dataSource;
  displayedColumns = ['title', 'message', 'company', 'delete'];
  fileToUpload: File = null;
  formData;
  formSubmitAttempt = false;
  companies: Company[] = [];
  notificationToolsIdToDelete;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [ 20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    await this.getListNotificationTools(0, this.pageSize, undefined);
    this.getCompany();
    this.formData = new FormGroup({
      _id: new FormControl(''),
      title: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required]),
      company: new FormControl('', [Validators.required, checkObjectIdisValid]),
    });
    this.formData.get('company').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.companyService.getCompaniesNome(value):[])
    ).subscribe(results => this.companies = results);
  }

  displayFn(company: Company) {
    if (company) {
      return company.name;
    }
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

  async getListNotificationTools(pageIn, pageOut, name) {
    const self = this;
    const ELEMENT_DATA = [];

    this.notificationService.getNotificationPaginator(pageIn, pageOut, name).subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);

      if (data && data.list && Array.isArray(data.list)) {
        data.list.forEach((notificationTools, index) => {
					let companyName = '-';
					if (notificationTools.company && notificationTools.company.name) {
						companyName = notificationTools.company.name;
					}
          ELEMENT_DATA.push({
            _id: notificationTools._id,
            position: (index + 1),
            title: notificationTools.title,
            message: notificationTools.message,
            companyName: companyName,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.changeDetectorRefs.detectChanges();
      }
    });
  }

  createNotificationToolsModalShow(content) {
    this.formSubmitAttempt = false;
    this.formData.reset();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-notificationTools', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });
  }

  async createNotificationTools(notificationTools: NotificationTools) {
    this.notificationService.createNotificationTools(notificationTools).subscribe((data: any) => {
      const notificationTools = data.data;
      this.toastr.success('notification Tools criado com sucesso!', 'Sucesso!');
      this.dataSource.data.push({
        _id: notificationTools._id,
        position: (this.dataSource.data.length + 2),
        title: notificationTools.title,
        message: notificationTools.message,
        company: (notificationTools.company) ? notificationTools.company : '-',
      });
      this.dataSource._updateChangeSubscription();
      this.modalService.dismissAll();
      this.changeDetectorRefs.detectChanges();
    }, error => {
      this.toastr.error('Erro ao criar notification Tools!', 'Falha!');
      this.modalService.dismissAll();
    });
  }

  editNotificationToolsModalShow(content, notificationTools: NotificationTools) {
    this.formSubmitAttempt = false;

    this.formData.reset();
    this.formData.patchValue({
      _id: notificationTools._id,
      title: notificationTools.title,
      message: notificationTools.message,
      company: notificationTools.company,
    });

    this.myControl = new FormControl(notificationTools.company.name);
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-notificationTools', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });
  }

  async updateNotificationTools(notificationTools: NotificationTools) {
    this.notificationService.updateNotificationTools(notificationTools).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(notificationTools._id);
      this.dataSource.data[index] = data.data;

      this.dataSource.data[index].company = data.data.company;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.toastr.success('Notification Tools alterado com sucesso!', 'Sucesso!');
      this.modalService.dismissAll();
    }, error => {
      console.error(error);
      this.toastr.error('Erro ao alterar notification Tools!', 'Falha!');
      this.modalService.dismissAll();
    });
  }

  async confirmDeleteModalShow(content, notificationTools) {
    this.notificationToolsIdToDelete = notificationTools._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-notificationTools', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteNotificationTools() {
    if (!this.notificationToolsIdToDelete) {
      this.toastr.error('Erro ao deletar Notification!', 'Falha!');
      return;
    }
    await this.notificationService.deleteNotificationTools(this.notificationToolsIdToDelete).toPromise();
    this.toastr.success('Notification deletado com sucesso!', 'Sucesso!');
    this.notificationToolsIdToDelete = undefined;
    await this.getListNotificationTools(0, this.pageSize, undefined);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

  focusInCompany(event) {
    this.companyValue = event.target.value;
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListNotificationTools(event.pageIndex, event.pageSize, undefined);
  }

  focusOutCompany(event) {
    const companyValue = event.target.value;

    this.companies.forEach((company: Company, index) => {
      if (company.name === companyValue) {
        this.formData.controls.company.setValue(company._id);
        this.companyValue = company.name;
        return true;
      }
    });

    event.target.value = this.companyValue;
  }
}


