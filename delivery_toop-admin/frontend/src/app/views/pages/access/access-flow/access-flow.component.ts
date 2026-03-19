import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import moment from 'moment';

import { AccessFlowService } from './../../../../services/access/access-flow.service';

@Component({
  selector: 'kt-access-flow',
  templateUrl: './access-flow.component.html',
  styleUrls: ['./access-flow.component.scss']
})
export class AccessFlowComponent implements OnInit, AfterViewInit {

  childmessage = false;
  historyAtual;
  dataSource;
  displayedColumns = ['person', 'email', 'phone', 'updatedAt', 'view'];
  formData;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private accessFlowService: AccessFlowService
  ) { }

  async ngOnInit() {
    await this.getListAccess(0, this.pageSize);
  }

  async addNewFormData(access) {
    return new Promise(async (resolve, reject) => {

      const history = (access.history).replaceAll('\\\"','"');

      this.historyAtual = (typeof access.history === 'string') ? JSON.parse(history) : [];

      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        person: new FormControl(access.person && access.person.name),
        email: new FormControl(access.email),
        phone: new FormControl(access.phone),
        history: new FormControl(history),
        updatedAt: new FormControl(access.updatedAt),
      });
      resolve(true);
    });
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListAccess(event.pageIndex, event.pageSize);
  }

  async getListAccess(page, limit) {
    const self = this;
    const ELEMENT_DATA = [];

    this.accessFlowService.getAccessFlowPaginator(page, limit).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);

      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((access, index) => {

          const updated = moment(access.updatedAt, 'YYYY-MM-DD HH:mm').format('DD/MM/YY HH:mm');

          ELEMENT_DATA.push({
            _id: access._id,
            position: (index + 1),
            person: access.person,
            email: (access.customer && access.customer.email) ? access.customer.email : undefined,
            phone: (access.customer && access.customer.phone) ? access.customer.phone : undefined,
            history: access.history,
            updatedAt: updated,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async viewAccessModalShow(content, access) {
    this.historyAtual = undefined;

    await this.addNewFormData(access);

    this.modalService.open(content, { ariaLabelledBy: 'modal-view-customer', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async viewAccessFlow() {
    this.accessFlowService.getAccessFlowPaginator(0, this.pageSize).subscribe((data: any) => {
      const access = data.data;
      this.historyAtual = undefined;

      const updatedAt = moment(access.updatedAt, 'YYYY-MM-DD HH:mm').format('DD/MM/YY HH:mm');

      this.dataSource.data.push({
        _id: access._id,
        position: (this.dataSource.data.length + 2),
        person: (access.person),
        email: access.email,
        phone: access.phone,
        history: access.history,
        updatedAt,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
    }, error => {
    });
  }

  ngAfterViewInit() {
  }

}
