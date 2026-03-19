import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { Alert } from './../../../../../models/alert';
import { Controller } from './../../../../../models/controller';
import { ControllerService } from './../../../../services/controller.service';
import { Module } from './../../../../../models/module';
import { ModuleService } from './../../../../services/module.service';

@Component({
  selector: 'kt-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  alertError: string;
  alertSuccess: string;
  module: Module[] = [];
  moduleValue: string;
  dataSource;
  controllerIdToDelete;
  displayedColumns = ['name', 'module', 'route', 'status', 'delete'];
  formData;
  formSubmitAttempt = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private controllerService: ControllerService,
    private moduleService: ModuleService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.getListController(0, this.pageSize);
    this.getModule();
    this.formData = new FormGroup({
      _id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      module: new FormControl(''),
      route: new FormControl('', [Validators.required]),
      status: new FormControl(''),
    });
    this.formData.get('module').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.moduleService.getModulesNome(value):[])
    ).subscribe(results => this.module = results);
  }

  displayFn(module: Module) {
    if (module) {
      return module.name;
    }
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListController(event.pageIndex, event.pageSize);
  }

  getModule() {
    this.moduleService.getModule().subscribe((data: Module[]) => {
      const list = Object.keys(data).map((index) => {
        const module = data[index];
        return module;
      });
      this.module = list;
    },
      error => {

      });
  }

  async getListController(pageIn, pageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.controllerService.getControllerPaginator(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((controller, index) => {
          ELEMENT_DATA.push({
            _id: controller._id,
            position: (index + 1),
            name: controller.name,
            route: controller.route,
            status: controller.status,
            module: (controller.module) ? controller.module : '-'
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createControllerModalShow(content) {
    this.formSubmitAttempt = false;

    this.formData.reset();
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-controller', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createController(controller: Controller) {
    this.controllerService.createController(controller).subscribe((data: any) => {
      const controller = data.data;
      this.alert = new Alert('Registro criado com sucesso!', 'success');

      this.dataSource.data.push({
        _id: controller._id,
        position: (this.dataSource.data.length + 2),
        name: controller.name,
        module: (controller.module) ? controller.module : '-',
        route: controller.route,
        status: controller.status
      });

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
    }, error => {
      this.alert = new Alert('Falha ao criar Registro!', 'danger');
    });
  }

  async editControllerModalShow(content, controller: Controller) {
    this.formSubmitAttempt = false;

    this.formData.reset();
    this.formData.patchValue({
      _id: controller._id,
      name: controller.name,
      module: controller.module,
      route: controller.route,
      status: controller.status
    });

    this.myControl = new FormControl(controller.module.name);
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-controller', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updateController(controller: Controller) {
    this.controllerService.updateController(controller).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(controller._id);
      this.dataSource.data[index] = data.data;

      this.dataSource.data[index].module = data.data.module;
      this.dataSource.data[index]._id = (data.data._id) ? data.data._id : undefined;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.alert = new Alert('Registro alterado com sucesso!', 'success');
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Registro!', 'danger');
    });
  }
  async confirmDeleteModalShow(content, controller) {
    this.controllerIdToDelete = controller._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-controller', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteController() {
    if (!this.controllerIdToDelete) {
      this.alert = new Alert('Falha ao deletar Registro!', 'danger');
      return;
    }

    await this.controllerService.deleteController(this.controllerIdToDelete).toPromise();
    this.alert = new Alert('Registro deletado com sucesso!', 'success');
    this.controllerIdToDelete = undefined;
    await this.getListController(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

  focusInModule(module) {
    this.moduleValue = module.target.value;
  }

  focusOutModule(module) {
    const moduleValue = module.target.value;

    this.module.forEach((module: Module, index) => {
      if (module.name === moduleValue) {
        this.formData.controls.module.setValue(module._id);
        this.moduleValue = module.name;
        return true;
      }
    });

    module.target.value = this.moduleValue;
  }

}
