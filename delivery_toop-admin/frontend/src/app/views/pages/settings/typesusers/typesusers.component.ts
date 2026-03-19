import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Alert } from './../../../../../models/alert';
import { TypesUsers } from './../../../../../models/typesUsers';
import { TypesUsersService } from './../../../../services/typesusers.service';

@Component({
  selector: 'kt-typesusers',
  templateUrl: './typesusers.component.html',
  styleUrls: ['./typesusers.component.scss']
})
export class TypesusersComponent implements OnInit {

  alert: Alert = undefined;
  alertError: string;
  alertSuccess: string;
  dataSource;
  typesUsersIdToDelete;
  displayedColumns = ['name', 'status', 'delete'];
  formData;
  formSubmitAttempt = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [ 20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private typesUsersService: TypesUsersService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.getListTypesUsers(0, this.pageSize);
    this.formData = new FormGroup({
      _id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      status: new FormControl(''),
    });
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListTypesUsers(event.pageIndex, event.pageSize);
  }

  async getListTypesUsers(pageIn, pageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.typesUsersService.getTypesUsersPaginator(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((typesUsers, index) => {
          ELEMENT_DATA.push({
            _id: typesUsers._id,
            position: (index + 1),
            name: typesUsers.name,
            status: typesUsers.status
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createTypesUsersModalShow(content) {
    this.formData.reset();
    this.formSubmitAttempt = false;
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-types-users', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

   // Cria o tipo de usuário.
   async createTypesUsers(typesusers: TypesUsers) {
      this.typesUsersService.createTypesUsers(typesusers).subscribe((data: any) => {
        const typesusers = data.data;
        this.alert = new Alert('Registro criado com sucesso!', 'success');

        this.dataSource.data.push({
          _id: typesusers._id,
          name: typesusers.name,
          status: typesusers.status
        });
        this.dataSource._updateChangeSubscription();
        this.changeDetectorRefs.detectChanges();
        this.formSubmitAttempt = false;
      }, error => {
        this.alert = new Alert('Falha ao criar Registro!', 'danger');
    });
  }

  async editTypesUsersModalShow(content, typesUsers: TypesUsers) {
    this.formSubmitAttempt = false;
    this.formData.reset();
    this.formData.patchValue({
      _id: typesUsers._id,
      name: typesUsers.name,
      status: typesUsers.status, 
    });

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-types-users', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }
  async updateTypesUsers(typesUsers: TypesUsers) {
    this.typesUsersService.updateTypesUsers(typesUsers).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(typesUsers._id);
      this.dataSource.data[index] = data.data;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.alert = new Alert('Registro alterado com sucesso!', 'success');
      this.formSubmitAttempt = false;
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Registro!', 'danger');
    });
  }

  async confirmDeleteModalShow(content, typesusers) {

    this.typesUsersIdToDelete = typesusers._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-types-users', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

   // Deleta Tipo de usuário
   async deleteTypesUsers() {
    if (!this.typesUsersIdToDelete) {
      this.alert = new Alert('Falha ao deletar Registro!', 'danger');
      return;
    }
    await this.typesUsersService.deleteTypesUsers(this.typesUsersIdToDelete).toPromise();
    this.alert = new Alert('Registro deletado com sucesso!', 'success');
    this.typesUsersIdToDelete = undefined;
    await this.getListTypesUsers(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

}