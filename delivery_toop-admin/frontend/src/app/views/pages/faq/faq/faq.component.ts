import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipInputEvent } from '@angular/material/chips';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Alert } from './../../../../../models/alert';
import { Faq } from './../../../../../models/support/faq';
import { FaqService } from './../../../../services/faq.service';

@Component({
  selector: 'kt-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  companyValue: string;
  dataSource;
  displayedColumns = ['title', 'caption', 'description', 'status', 'delete'];
  faqIdToDelete;
  formData;
  formFilter: FormGroup;
  formSubmitFaq = false;
  myControl: FormControl = new FormControl();
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
  typeAction = 'create';

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private faqService: FaqService,
  ) { }

  async ngOnInit() {
    await this.getListFaq(0, this.pageSize);
  }

  async newFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(''),
        title: new FormControl('', [Validators.required]),
        caption: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        status: new FormControl('', [Validators.required]),
      });

      resolve(true);
    });
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListFaq(
      event.pageIndex,
      event.pageSize,
    );
  }

  async getListFaq(pageIn, pageOut) {
    const self = this;
    let ELEMENT_DATA = [];
    this.faqService.getPaginatorFaq(pageIn, pageOut).subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((faq, index) => {
          ELEMENT_DATA.push({
            _id: faq._id,
            position: (index + 1),
            title: faq.title,
            caption: faq.caption,
            description: faq.description,
            status: faq.status
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async upSertFaqModalShow(content, faq: Faq, type = 'create') {
    this.typeAction = type;
    this.formSubmitFaq = false;
    await this.newFormData();
    this.formData.reset();

    if (faq) {
      this.formData.patchValue({
        _id: faq._id,
        position: (this.dataSource.data.length + 2),
        title: faq.title,
        caption: faq.caption,
        description: faq.description,
        status: faq.status
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-faq', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upSertFaq(faq: Faq) {
    if (this.typeAction === 'create') {

      this.faqService.createFaq(faq).subscribe(async (_: any) => {
        await this.getListFaq(0, this.pageSize);
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('FAQ criado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        this.toastr.error('Erro ao criar FAQ!', 'Falha!');
        this.modalService.dismissAll();
      });
    } else {
      this.faqService.updateFaq(faq).subscribe(async (_: any) => {
        await this.getListFaq(0, this.pageSize);
        this.toastr.success('FAQ alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Erro ao alterar FAQ!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, faq) {
    this.faqIdToDelete = faq._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-faq', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteFaq() {
    if (!this.faqIdToDelete) {
      this.toastr.error('Erro ao deletar FAQ!', 'Falha!');
      return;
    }
    await this.faqService.deleteFaq(this.faqIdToDelete).toPromise();
    this.toastr.success('FAQ deletado com sucesso!', 'Sucesso!');
    this.faqIdToDelete = undefined;
    await this.getListFaq(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

}
