import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Alert } from './../../../../../models/alert';
import { ModuleService } from './../../../../services/module.service';
import { Module } from './../../../../../models/module';

@Component({
  selector: 'kt-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent implements OnInit {
  alert: Alert = undefined;
  dataSource;
  moduleIdToDelete;
  displayedColumns = ['name', 'status', 'delete'];
  formData;
  formSubmitAttempt = false;
  pageSize = 20;
  pageLimit: number[] = [ 20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private moduleService: ModuleService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getListModule(0, this.pageSize);
    this.formData = new FormGroup({
      _id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      status: new FormControl(''),
    });
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListModule(event.pageIndex, event.pageSize);
  }

  async getListModule(pageIn, pageOut) {
    const self = this;
    let ELEMENT_DATA = [];

    this.moduleService.getModulePaginator(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((module, index) => {
          ELEMENT_DATA.push({
            _id: module._id,
            position: (index + 1),
            name: module.name,
            status: module.status,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createModuleModalShow(content) {
    this.formSubmitAttempt = false;
    this.formData.reset();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-module' }).result.then((result) => {
    }, (reason) => {

    });
  }

   // Cria module.
   async createModule(module: Module) {

    this.moduleService.createModule(module).subscribe((data: any) => {
      const moduleData = data.data;
      this.alert = new Alert('Registro criada com sucesso!', 'success');

      this.dataSource.data.push({
        _id: moduleData._id,
        name: moduleData.name,
        status: moduleData.status
      });

      this.dataSource._updateChangeSubscription();
      this.modalService.dismissAll();
      this.changeDetectorRefs.detectChanges();
    }, error => {
      this.alert = new Alert('Falha ao criar Registro!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async editModuleModalShow(content, module: Module) {
    this.formSubmitAttempt = false;
    this.formData.reset();
    this.formData.patchValue({
      _id: module._id,
      name: module.name,
      status: module.status,
    });

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-module' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updateModule(module: Module) {
    this.moduleService.updateModule(module).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(module._id); // Obtem o indice do item pelo atributo id do array
      this.dataSource.data[index] = data.data;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.alert = new Alert('Registro alterado com sucesso!', 'success');
      this.modalService.dismissAll();
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Registro!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async confirmDeleteModalShow(content, module) {
    this.moduleIdToDelete = module._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-module', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

   // Deleta o module
   async deleteModule() {
    if (!this.moduleIdToDelete) {
      this.alert = new Alert('Falha ao deletar Registro!', 'danger');
      return;
    }
    await this.moduleService.deleteModule(this.moduleIdToDelete).toPromise();
    this.alert = new Alert('Registro deletado com sucesso!', 'success');
    this.moduleIdToDelete = undefined;
    await this.getListModule(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

}
