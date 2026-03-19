import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';

import { TabloidService } from './../../../../services/tabloid.service';
import { Tabloid } from './../../../../../models/tabloid';
import { Alert } from './../../../../../models/alert';

@Component({
  selector: 'kt-tabloid',
  templateUrl: './tabloid.component.html',
  styleUrls: ['./tabloid.component.scss']
})
export class TabloidComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  alertError: string;
  alertSuccess: string;
  dataSource;
  displayedColumns = ['image', 'name', 'description', 'status', 'groupCompany', 'delete'];
  files: Set<File>;
  formData;
  formDataEdit;
  tabloidIdToDelete;

  constructor(
    private tabloidService: TabloidService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.getListTabloid();
    this.formData = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      status: new FormControl(''),
      file: new FormControl(''),
      groupCompany: new FormControl(''),
    });
  }
  getListTabloid() {
    const self = this;
    let ELEMENT_DATA = [];

    this.tabloidService.getTabloids().subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data && Array.isArray(data)) {
        data.forEach((tabloid, index) => {
          ELEMENT_DATA.push({
            position: (index + 1),
            _id: tabloid._id,
            name: tabloid.name,
            image: (tabloid.images && tabloid.images[0]) ? tabloid.images[0] : undefined,
            description: tabloid.description,
            status: tabloid.status,
            groupCompany: tabloid.groupCompany
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      }
    });
  }

  createTabloidModalShow(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-tabloid', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });
  }

  async createTabloid(tabloid: Tabloid) {

    if (!this.files || this.files.size <= 0) {
      this.alert = new Alert('Falha ao criar Tabloid! Imagem é obrigatoria!', 'danger');
      return;
    }

    this.tabloidService.createTabloid(tabloid).subscribe((data: any) => {
      const tabloid = data.data;
      this.alert = new Alert('Company criado com sucesso!', 'success');

      if (tabloid && tabloid.images && tabloid.images[0]) {
        tabloid.image = tabloid.images[0];
      }

      this.dataSource.data.push({
        id: tabloid._id,
        position: (this.dataSource.data.length + 2),
        name: tabloid.name,
        description: tabloid.description,
        status: tabloid.status,
        image: tabloid.image,
        groupCompany: tabloid.groupCompany,
      });
      this.dataSource._updateChangeSubscription(); // <-- Refresh the datasource
    }, error => {
      this.alert = new Alert('Falha ao criar Company!', 'danger');
    });
  }

  editTabloidModalShow(content, tabloid: Tabloid) {

    this.formDataEdit = new FormGroup({
      _id: new FormControl(tabloid._id),
      name: new FormControl(tabloid.name),
      description: new FormControl(tabloid.description),
      status: new FormControl(tabloid.status),
      groupCompany: new FormControl(tabloid.groupCompany),
      file: new FormControl(''),
    });

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-tabloid', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });
  }

  async updateTabloid(tabloid: Tabloid) {

    if (!this.files || this.files.size <= 0) {
      this.alert = new Alert('Falha ao criar Tabloid! Imagem é obrigatoria!', 'danger');
      return;
    }

    this.tabloidService.updateTabloid(tabloid).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(tabloid._id); // Obtem o indice do item pelo atributo id do array
      this.dataSource.data[index] = data.data;

      if (data.data && data.data.images && data.data.images[0]) {
        this.dataSource.data[index].image = data.data.images[0];
      }

      this.dataSource._updateChangeSubscription(); // <-- Refresh the datasource
      this.alert = new Alert('Tabloid alterado com sucesso!', 'success');
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Tabloid!', 'danger');
    });
  }

  async confirmDeleteModalShow(content, tabloid) {
    this.tabloidIdToDelete = tabloid._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-tabloid', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteTabloid() {
    if (!this.tabloidIdToDelete) {
      this.alert = new Alert('Falha ao deletar Tabloid!', 'danger');
      return;
    }
    await this.tabloidService.deleteTabloid(this.tabloidIdToDelete).toPromise();
    this.alert = new Alert('Tabloid deletado com sucesso!', 'success');
    this.tabloidIdToDelete = undefined;
    await this.getListTabloid();
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

  onChange(event) {
    console.log(event);
    const selectedFiles = <FileList>event.srcElement.files;

    const fileNames = [];
    const fileList = [];
    if (event.target.files && event.target.files.length) {
      this.files = new Set();
      for (let i = 0; i < selectedFiles.length; i++) {
        fileNames.push(selectedFiles[i].name);
        this.files.add(selectedFiles[i]);

        const reader = new FileReader();
        // const [file] = event.target.files;
        reader.readAsDataURL(selectedFiles[i]);

        reader.onload = () => {
          fileList.push({ base64: reader.result });
          if (this.formDataEdit) {
            this.formDataEdit.patchValue({
              file: fileList
            });
          } else if (this.formData) {
            this.formData.patchValue({
              file: fileList
            });
          }
        }
      }
    }
    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');

  }

}
