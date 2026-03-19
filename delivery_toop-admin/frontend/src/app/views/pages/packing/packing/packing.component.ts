import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Alert } from './../../../../../models/alert';
import { Packing } from './../../../../../models/packing';
import { PackingService } from './../../../../services/packing.service';

@Component({
  selector: 'kt-packing',
  templateUrl: './packing.component.html',
  styleUrls: ['./packing.component.scss']
})
export class PackingComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  alertError: string;
  alertSuccess: string;
  dataSource;
  displayedColumns = ['name', 'status', 'delete'];
  formData;
  formSubmitPacking = false;
  myControl: FormControl = new FormControl();
  packingIdToDelete;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private packingService: PackingService
  ) { }

  ngOnInit() {
    this.getListPacking(0, this.pageSize);
    this.formData = new FormGroup({
      _id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      status: new FormControl(''),
    });
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListPacking(event.pageIndex, event.pageSize);
  }

  async getListPacking(pageIn, pageOut) {
    const self = this;
    const ELEMENT_DATA = [];

    this.packingService.getPackingPaginator(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((packing, index) => {
          ELEMENT_DATA.push({
            _id: packing._id,
            position: (index + 1),
            name: packing.name,
            status: packing.status
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  createPackingModalShow(content) {
    this.formData.reset();
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-packing', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async createPacking(packing: Packing) {
    this.packingService.createPacking(packing).subscribe((data: any) => {
      const packing = data.data;
      this.alert = new Alert('Packing criado com sucesso!', 'success');

      this.dataSource.data.push({
        _id: packing._id,
        position: (this.dataSource.data.length + 2),
        name: packing.name,
        status: packing.status,
      });
      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
    }, error => {
      this.alert = new Alert('Falha ao criar Packing!', 'danger');
    });
  }

  async editPackingModalShow(content, packing: Packing) {
    this.formData.reset();
    this.formData.patchValue({
      _id: packing._id,
      name: packing.name,
      status: packing.status,
    });

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-packing', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async updatePacking(packing: Packing) {

    this.packingService.updatePacking(packing).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(packing._id);
      this.dataSource.data[index] = data.data;

      this.dataSource._updateChangeSubscription();
      this.changeDetectorRefs.detectChanges();
      this.formData.reset();
      this.alert = new Alert('Packing alterado com sucesso!', 'success');
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Packing!', 'danger');
    });
  }

  async confirmDeleteModalShow(content, packing) {
    this.packingIdToDelete = packing._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-packing', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deletePacking() {
    if (!this.packingIdToDelete) {
      this.alert = new Alert('Falha ao deletar Packing!', 'danger');
      return;
    }
    await this.packingService.deletePacking(this.packingIdToDelete).toPromise();
    this.alert = new Alert('Packing deletado com sucesso!', 'success');
    this.packingIdToDelete = undefined;
    await this.getListPacking(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

}
