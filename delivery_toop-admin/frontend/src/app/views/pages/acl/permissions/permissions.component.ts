import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { Alert } from '../../../../../models/alert';
import { Permissions } from './../../../../../models/acl/permissions';
import { PermissionsService } from './../../../../services/permissions.service';
import { Roles } from './../../../../../models/acl/roles';
import { RolesService } from './../../../../services/roles.service';
import { checkObjectIdisValid } from '../../../../util';

@Component({
  selector: 'kt-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  deleteIdToDelete;
  displayedColumns = ['name', 'roles', 'route', 'level', 'title', 'delete'];
  formData;
  formSubmitPermissions = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  permissionsIdToDelete;
  roles: Roles[] = [];
  rolesValue: string;
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private rolesService: RolesService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit() {
    this.getListPermissions(0, this.pageSize);
    this.getListRoles();
  }

  async addNewFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(undefined),
        name: new FormControl('', [Validators.required]),
        roles: new FormControl('', [Validators.required, checkObjectIdisValid]),
        route: new FormControl('', [Validators.required]),
        level: new FormControl('', [Validators.required]),
        title: new FormControl('', [Validators.required]),
      });
      this.formData.get('roles').valueChanges.pipe(
        startWith(''),
        debounceTime(1000),
        switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.rolesService.getRolesNome(value) : [])
      ).subscribe(results => this.roles = results);
      resolve(true);
    });
  }

  displayFn(roles: Roles) {
    if (roles) {
      return roles.name;
    }
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListPermissions(event.pageIndex, event.pageSize);
  }

  getListRoles() {
    this.rolesService.getRoles().subscribe((data: Roles[]) => {
      const list = Object.keys(data).map((index) => {
        const roles = data[index];
        return roles;
      });
      this.roles = list;
    },
      error => {

      });
  }


  async getListPermissions(pageIn, pageOut) {
    const self = this;
    let ELEMENT_DATA = [];

    this.permissionsService.getPaginatorPermissions(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((permissions, index) => {
          ELEMENT_DATA.push({
            _id: permissions._id,
            position: (index + 1),
            name: permissions.name,
            roles: (permissions.roles) ? permissions.roles : '-',
            route: permissions.route,
            level: permissions.level,
            title: permissions.title,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        self.changeDetectorRefs.detectChanges();
      }
    });
  }

  async  createPermissionsModalShow(content) {
    this.formSubmitPermissions = false;
    await this.addNewFormData();

    this.formData.reset();
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-permissions', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createPermissions(permissions: Permissions) {
    this.permissionsService.createPermissions(permissions).subscribe((data: any) => {
      const permissions = data.data;
      this.alert = new Alert('Permissions criado com sucesso!', 'success');

      this.dataSource.data.push({
        _id: data.data._id,
        position: (this.dataSource.data.length + 2),
        name: permissions.name,
        roles: permissions.roles,
        route: permissions.route,
        level: permissions.level,
        title: permissions.title,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.modalService.dismissAll();
    }, error => {
      this.alert = new Alert('Falha ao criar permissions!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async editPermissionsModalShow(content, permissions: Permissions) {
    this.formSubmitPermissions = false;
    await this.addNewFormData();

    this.formData.patchValue({
      _id: permissions._id,
      name: permissions.name,
      roles: permissions.roles,
      route: permissions.route,
      level: permissions.level,
      title: permissions.title,
    });
    this.myControl = new FormControl(permissions.roles.name);
    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-permissions', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updatePermissions(permissions: Permissions) {
    this.permissionsService.updatePermissions(permissions).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(permissions._id);

      this.dataSource.data[index] = data.data;

      this.dataSource.data[index].roles = data.data.roles;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.modalService.dismissAll();
      this.alert = new Alert('permissions alterado com sucesso!', 'success');
    }, error => {
      this.alert = new Alert('Falha ao alterar permissions!', 'danger');
      this.modalService.dismissAll();
    });
  }

  async confirmDeleteModalShow(content, permissions) {
    this.permissionsIdToDelete = permissions._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-permissions', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deletePermissions() {
    if (!this.permissionsIdToDelete) {
      this.alert = new Alert('Falha ao deletar permissions!', 'danger');
      return;
    }
    await this.permissionsService.deletePermissions(this.permissionsIdToDelete).toPromise();
    this.alert = new Alert('Permissions deletado com sucesso!', 'success');
    this.permissionsIdToDelete = undefined;
    await this.getListPermissions(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {

  }

  focusInRoles(roles) {
    this.rolesValue = roles.target.value;
  }

  focusOutRoles(roles, modalType) {
    const rolesValue = roles.target.value;

    this.roles.forEach((roles: Roles, index) => {
      if (roles.name === rolesValue) {
        this.formData.controls.roles.setValue(roles._id);
        this.rolesValue = roles.name;
        return true;
      }
    });

    roles.target.value = this.rolesValue;
  }

}
