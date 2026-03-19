import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { Alert } from './../../../../../models/alert';
import { Company } from './../../../../../models/company/company';
import { IntegrationsService } from './../../../../services/integrations.service';
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {

  alert: Alert = undefined;
  companies: Company[] = [];
  companyValue: string;
  companyIdSelected;
  dataSource;
  displayedColumns = ['_id', 'total', 'action'];
  formData;
  formFilter: FormGroup;
  listProductsDepartments = [{
    nome: 'Carregando dados...',
    preco: '-'
  }];
  departmentName;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private integrationsService: IntegrationsService,
  ) { }

  ngOnInit() {
    this.formFilter = new FormGroup({
      company: new FormControl('', [checkObjectIdisValid]),
    });
    this.formFilter.get('company').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.integrationsService.getIntegrations(value) : [])
    )
      .subscribe((results: any[]) => {
        if (results && Array.isArray(results) && results.length > 0) {
          this.companies = results.map(item => item.company);
        } else {
          this.companies = [];
        }
        this.changeDetectorRefs.detectChanges();
      });

    // this.getListIntegrations(0, this.pageSize, undefined, undefined);
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListIntegrations(event.pageIndex, event.pageSize, undefined, undefined);
  }

  displayFnFilter(company: Company) {
    if (company) {
      return company.name;
    }
  }

  async onClickCompanyFilter(company) {
    await this.getListIntegrations(0, this.pageSize, company._id, undefined);
  }

  async getListIntegrations(page, pageSize, companyId, department) {
    const self = this;
    const ELEMENT_DATA = [];

    this.companyIdSelected = companyId;
    console.log('thissss', this.companyIdSelected);

    this.integrationsService.getListIntegrationsCompany(pageSize, page, companyId, undefined).subscribe((data: any) => {
      if (data && Array.isArray(data)) {
        data.forEach((item, index) => {

          ELEMENT_DATA.push({
            position: (index + 1),
            _id: (item._id) ? item._id : '-',
            total: (item.total) ? item.total : '-',
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.changeDetectorRefs.detectChanges();
      }
    });
  }

  async getListDepartmentsModal(content, name, total) {
    // await this.addNewFormData();
    this.departmentName = name;

    this.modalService.open(content, { ariaLabelledBy: 'modal-list-department', size: 'lg' }).result.then((result) => {
    }, (reason) => {
      this.departmentName = undefined;
      this.listProductsDepartments = [{
        nome: 'Carregando dados...',
        preco: '-'
      }];
    });
    this.integrationsService.getListIntegrationsCompany(1, 1, this.companyIdSelected, name).subscribe((data: any) => {
      if (data && Array.isArray(data) && data[0].products && Array.isArray(data[0].products)) {
        this.listProductsDepartments = data[0].products;
      }
      this.changeDetectorRefs.detectChanges();
    });


  }

  closeAlert() {
    this.alert = null;
  }

}
