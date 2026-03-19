import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { Alert } from '../../../../../models/alert';
import { Roles } from './../../../../../models/acl/roles';
import { RolesService } from '../../../../services/roles.service';

@Component({
  selector: 'kt-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  deleteIdToDelete;
  displayedColumns = ['name', 'status', 'delete'];
  formData;
  formSubmitRoles = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  rolesIdToDelete;
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private rolesService: RolesService,
  ) { }

  ngOnInit() {
    this.getListRoles(0, this.pageSize);
  }

  async addNewFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl('', [Validators.required]),
        status: new FormControl(''),
      });
      resolve(true);
    });
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListRoles(event.pageIndex, event.pageSize);
  }

  async getListRoles(pageIn, pageOut) {
    await this.addNewFormData();

    const self = this;
    let ELEMENT_DATA = [];

    this.rolesService.getRolesPaginator(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((department, index) => {
          ELEMENT_DATA.push({
            _id: department._id,
            position: (index + 1),
            name: department.name,
            status: department.status,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        self.changeDetectorRefs.detectChanges();
      }
    });
  }

  async  createRolesModalShow(content) {
    this.formSubmitRoles = false;
    await this.addNewFormData();

    this.formData.reset();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-roles', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createRoles(roles: Roles) {
    this.rolesService.createRoles(roles).subscribe((data: any) => {
      this.alert = new Alert('Roles criado com sucesso!', 'success');

      this.dataSource.data.push({
        _id: data.data._id,
        position: (this.dataSource.data.length + 2),
        name: data.data.name,
        status: data.data.status,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.modalService.dismissAll();
    }, error => {
      this.alert = new Alert('Falha ao criar roles!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async editRolesModalShow(content, roles: Roles) {
    this.formSubmitRoles = false;
    await this.addNewFormData();

    this.formData.patchValue({
      _id: roles._id,
      name: roles.name,
      status: roles.status,
    });
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-roles', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updateRoles(roles: Roles) {
    this.rolesService.updateRoles(roles).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(roles._id);

      this.dataSource.data[index] = data.data;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.modalService.dismissAll();
      this.alert = new Alert('Roles alterado com sucesso!', 'success');
    }, error => {
      this.alert = new Alert('Falha ao alterar roles!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async confirmDeleteModalShow(content, roles) {
    this.rolesIdToDelete = roles._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-roles', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteRoles() {
    if (!this.rolesIdToDelete) {
      this.alert = new Alert('Falha ao deletar roles!', 'danger');
      return;
    }
    await this.rolesService.deleteRoles(this.rolesIdToDelete).toPromise();
    this.alert = new Alert('Roles deletado com sucesso!', 'success');
    this.rolesIdToDelete = undefined;
    await this.getListRoles(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {

  }

}
