import { Integrations } from './../../../../../models/integrations';
import { IntegrationsService } from './../../../../services/integrations.service';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { startWith, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Alert } from './../../../../../models/alert';
import { Company } from './../../../../../models/company/company';
import { CompanyService } from './../../../../services/company.service';
import { checkObjectIdisValid } from "../../../../util";

@Component({
  selector: 'kt-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  companies: Company[] = [];
  companyValue: string;
  dataSource;
  displayedColumns = ['company', 'system', 'status', 'delete'];
  formData;
  formSubmitIntegrations = false;
  integrationsIdToDelete;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
	typeAction = 'create';

	loadCompany = null;
	load = false;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private integrationsService: IntegrationsService,
  ) { }

  ngOnInit() {
    this.getListIntegrations(0, this.pageSize);
    this.newFormIntegrations();
  }

  newFormIntegrations() {
    this.formData = new FormGroup({
      _id: new FormControl(''),
      company: new FormControl('', [Validators.required, checkObjectIdisValid]),
      system: new FormControl('', [Validators.required]),
      status: new FormControl(''),
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

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListIntegrations(
      event.pageIndex,
      event.pageSize,
    );
  }

  async getListIntegrations(pageIn, PageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.integrationsService.getPaginatorIntegrations(pageIn, PageOut).subscribe((data: any) => {
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((integrations, index) => {
          ELEMENT_DATA.push({
            _id: integrations._id,
            position: (index + 1),
            company: integrations.company,
            system: integrations.system,
            status: integrations.status,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async upSertIntegrationsModalShow(content, integrations: Integrations, type = 'create') {
    this.typeAction = type;
    this.formSubmitIntegrations = false;
    await this.newFormIntegrations();
    this.formData.reset();

    // Only edit
    if (integrations) {
      this.formData.patchValue({
        _id: integrations._id,
        company: integrations.company,
        system: integrations.system,
        status: integrations.status,
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-integrations', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upSertIntegrations(integrations: Integrations) {
    if (this.typeAction === 'create') {

      this.integrationsService.createIntegrations(integrations).subscribe(async (_: any) => {
        await this.getListIntegrations(0, this.pageSize);
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('Integrations atualizado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        this.toastr.error('Erro ao criar integrations', 'Falha!');
        this.modalService.dismissAll();
      });
    } else {
      this.integrationsService.updateIntegrations(integrations).subscribe(async (_: any) => {
        await this.getListIntegrations(0, this.pageSize);
        this.toastr.success('Integrations alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Erro ao alterar integrations!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, integrations) {
    this.integrationsIdToDelete = integrations._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-integrations', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteIntegrations() {
    if (!this.integrationsIdToDelete) {
      this.toastr.error('Erro ao deletar integrations!', 'Falha!');
      return;
    }
    await this.integrationsService.deleteIntegrations(this.integrationsIdToDelete).toPromise();
    this.toastr.success('Integrations deletado com sucesso!', 'Sucesso!');
    this.integrationsIdToDelete = undefined;
    await this.getListIntegrations(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
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

	async syncImage (company) {
		try {
			this.loadCompany = company._id;
			this.load = true;

			await this.integrationsService.syncImage(company._id).toPromise();

			this.loadCompany = null;
			this.load = false;
			this.toastr .success('Sincronização realizada com sucesso!!');
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = 'Não foi possível sincronizar imagens';
			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.loadCompany = null;
			this.load = false;
			this.toastr.error(message);
			this.changeDetectorRefs.detectChanges();
		}
	}

}
