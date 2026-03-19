import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import moment from 'moment';

import { Customer } from './../../../../../models/customer';

import { ReportsCustomerService } from './../../../../services/reports-customer.service';

@Component({
  selector: 'kt-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, AfterViewInit {

  childmessage = false;
  dataSource;
  displayedColumns = ['name', 'phone', 'email', 'appVersion', 'view'];
  formData;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private reportsService: ReportsCustomerService,
  ) { }

  ngOnInit() {
    this.getListReports(0, this.pageSize);
  }

  async addNewFormData(report) {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl(report.name),
        phone: new FormControl(report.phone),
        email: new FormControl(report.email),
        appVersion: new FormControl(report.appVersion),
        createdAt: new FormControl(report.createdAt),
        updatedAt: new FormControl(report.updatedAt),
      });
      resolve(true);
    });
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListReports(event.pageIndex, event.pageSize);
  }


  async getListReports(page, limit) {
    const self = this;
    const ELEMENT_DATA = [];

    this.reportsService.getReportsCustomer(page, limit).subscribe((data: any) => {
			// console.log('data', data)

      self.dataSource = new MatTableDataSource(ELEMENT_DATA);

      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((reports, index) => {

          const created = moment(reports.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YY HH:mm:ss');
          const updated = moment(reports.updatedAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YY HH:mm:ss');

          ELEMENT_DATA.push({
            _id: reports._id,
            position: (index + 1),
            name: (reports.person && reports.person.name) ? reports.person.name : '-',
            phone: reports.phone,
            email: reports.email,
            appVersion: (reports.appVersion) ? reports.appVersion : '-',
            createdAt: created,
            updatedAt: updated,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async viewCustomerModalShow(content, report) {

    this.addNewFormData(report);

    this.modalService.open(content, { ariaLabelledBy: 'modal-view-customer', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async viewReportsCustomer() {
    this.reportsService.getReportsCustomer(0, this.pageSize).subscribe((data: any) => {
      const reports = data.data;

      const created = moment(reports.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YY HH:mm:ss');

      this.dataSource.data.push({
        _id: reports._id,
        position: (this.dataSource.data.length + 2),
        name: reports.name,
        phone: reports.phone,
        email: reports.email,
        appVersion: reports.appVersion,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
    }, error => {
    });
  }

  ngAfterViewInit() {
  }


}
