import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { startWith, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Alert } from './../../../../../models/alert';
import { TypePayments } from './../../../../../models/typePayments';
import { TypePaymentsService } from './../../../../services/typepayments.service';

@Component({
  selector: 'kt-type-payments',
  templateUrl: './type-payments.component.html',
  styleUrls: ['./type-payments.component.scss']
})
export class TypePaymentsComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  displayedColumns = ['type', 'name', 'image', 'brand', 'status', 'delete'];
  files: Set<File>;
  formData;
  formSubmitTypePayments = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
  typeAction = 'create';
  typePaymentsIdToDelete;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private typePaymentsService: TypePaymentsService,
  ) { }

  ngOnInit() {
    this.newFormTypePayments();
    this.getListTypePayments(0, this.pageSize);
  }

  newFormTypePayments() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(''),
        type: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required]),
        brand: new FormControl('', [Validators.required]),
        file: new FormControl('', [Validators.required]),
        status: new FormControl(''),
      });
      return resolve(true);
    });
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListTypePayments(event.pageIndex, event.pageSize);
  }

  async getListTypePayments(pageIn, pageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.typePaymentsService.getPaginatorTypePayments(pageIn, pageOut).subscribe((data: any) => {
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((typePayments, index) => {
          ELEMENT_DATA.push({
            _id: typePayments._id,
            position: (index + 1),
            name: typePayments.name,
            type: typePayments.type,
            brand: typePayments.brand,
            image: (typePayments.image && typePayments.image[0]) ? typePayments.image[0] : undefined,
            status: typePayments.status,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async upSertTypePaymentsModalShow(content, typePayments: TypePayments, type = 'create') {
    this.typeAction = type;
    this.formSubmitTypePayments = false;
    await this.newFormTypePayments();

    if (this.typeAction === 'edit') {
      // Alter file permissions
      this.formData.get('file').clearValidators();
      this.formData.get('file').updateValueAndValidity();
    }

    // Only edit
    if (typePayments) {
      this.formData.patchValue({
        _id: typePayments._id,
        name: typePayments.name,
        type: typePayments.type,
        brand: typePayments.brand,
        image: typePayments.image,
        status: typePayments.status,
        file: '',
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-typePayments', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upSertTypePayments(typePayments: TypePayments) {
    if (this.typeAction === 'create') {

      this.typePaymentsService.createTypePayments(typePayments).subscribe(async (_: any) => {
        await this.getListTypePayments(0, this.pageSize);
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('Tipos de pagamentos atualizado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        this.toastr.error('Erro ao criar tipos de pagamentos!', 'Falha!');
        this.modalService.dismissAll();
      });
    } else {

      // if (data.data && data.data.images && data.data.images[0]) {
      //   this.dataSource.data[index].image = data.data.images[0];
      // }


      this.typePaymentsService.updateTypePayments(typePayments).subscribe(async (_: any) => {
        await this.getListTypePayments(0, this.pageSize);
        this.toastr.success('Tipos de pagamentos alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Erro ao alterar tipos de pagamentos!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, typePayments) {
    this.typePaymentsIdToDelete = typePayments._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-typePayments', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteTypePayments() {
    if (!this.typePaymentsIdToDelete) {
      this.toastr.error('Erro ao deletar tipos de pagamentos!', 'Falha!');
      return;
    }
    await this.typePaymentsService.deleteTypePayments(this.typePaymentsIdToDelete).toPromise();
    this.toastr.success('Tipos de pagamentos deletado com sucesso!', 'Sucesso!');
    this.typePaymentsIdToDelete = undefined;
    await this.getListTypePayments(0, this.pageSize);
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
          this.formData.patchValue({
            file: fileList
          });
        };
      }
    }
    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');
  }

}
