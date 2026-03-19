import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';

import { Packing } from './../../../../../models/packing';
import { PackingService } from './../../../../services/packing.service';
import { ImageBankService } from './../../../../services/imagebank.service';
import { ImageBank } from './../../../../../models/imageBank';
import { Alert } from './../../../../../models/alert';
import { Observable } from 'rxjs';
import { checkObjectIdisValid } from "../../../../util";

import * as jquery from 'jquery';
import { MatChipInputEvent } from '@angular/material/chips';
import { GroupService } from './../../../../services/group.service';
export interface OptionPacting {
  value: string;
  text: string;
}


@Component({
  selector: 'kt-image-bank',
  templateUrl: './image-bank.component.html',
  styleUrls: ['./image-bank.component.scss']
})
export class ImageBankComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  totalLength;
  displayedColumns = ['image', 'barcode', 'productName', 'productAccent', 'keywords',
    'packing', 'packingAmount', 'category', 'brand', 'delete'];
  files: Set<File>;
  formData;
  packing;
  packingValue: string;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  box = '';
  boxNome = '';
  boxCategory = '';
  startValue = '';
  filteredPacking: Observable<string[]>;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  imageBankIdToDelete;
  selectedImageBank;
  myControl: FormControl = new FormControl();

  packings: Packing[] = [];

  categoriaList: string[] = [];
  palavraChaveList: string[] = [];
  // public options: Select2Options;

  constructor(
    private imageBankService: ImageBankService,
    private modalService: NgbModal,
    private packingService: PackingService
  ) {
  }

  ngOnInit() {
    this.getListImageBank(0, this.pageSize);
    this.getPacking();
    this.formData = new FormGroup({
      barcode: new FormControl(''),
      productName: new FormControl(''),
      productAccent: new FormControl(''),
      keywords: new FormControl(''),
      packingAmount: new FormControl(''),
      category: new FormControl(''),
      description: new FormControl(''),
      brand: new FormControl(''),
      file: new FormControl(''),
      packing: new FormControl('', [checkObjectIdisValid]),
    });
    this.formData.get('packing').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.packingService.getPackingsNome(value) : [])
    ).subscribe(results => this.packings = results);

    this.dataSource = new MatTableDataSource([]);

  }

  displayFn(packing: Packing) {
    if (packing) {

      return packing.name;
    }
  }

  getPacking() {
    this.packingService.getPacking().subscribe((data: Packing[]) => {
      const list = Object.keys(data).map((index) => {
        const packing = data[index];
        return packing;
      });
      this.packings = list;
    },
      error => {

      });
  }

  addCategoria(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.categoriaList.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeCategoria(categoria: string): void {

    let index = 0;
    for (index = 0; index < this.categoriaList.length; index++) {
      if (this.categoriaList[index] === categoria) {
        break;
      }
    }

    if (index >= 0) {
      this.categoriaList.splice(index, 1);
    }
  }

  addPalavraChave(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.palavraChaveList.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removePalavraChave(palavraChave: string): void {

    let index = 0;
    for (index = 0; index < this.palavraChaveList.length; index++) {
      if (this.palavraChaveList[index] === palavraChave) {
        break;
      }
    }

    if (index >= 0) {
      this.palavraChaveList.splice(index, 1);
    }
  }

  public changed(e: any): void {
    this.packing = e.value;
  }

  changePage(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.getListImageBank(event.pageIndex, event.pageSize);
  }

  async getListImageBank(indexPage, pageSize) {
    this.imageBankService.getImageBank(this.box, indexPage, pageSize).subscribe((data: any) => {
      this.addItensList(data);
    });
  }

  addItensList(data) {
    const ELEMENT_DATA = [];
    if (data.lista && Array.isArray(data.lista)) {
      data.lista.forEach((imageBank, index) => {
        ELEMENT_DATA.push({
          _id: imageBank._id,
          position: (index + 1),
          barcode: imageBank.barcode,
          image: (imageBank.images && imageBank.images[0]) ? imageBank.images[0] : undefined,
          productName: imageBank.productName,
          productAccent: imageBank.productAccent,
          keywords: imageBank.keywords,
          description: imageBank.description,
          packing: (imageBank.packing) ? imageBank.packing : undefined,
          packingAmount: imageBank.packingAmount,
          category: imageBank.category,
          brand: imageBank.brand
        });
      });
      this.dataSource.data = ELEMENT_DATA;
      this.totalLength = data.numeroItens;
    }
  }

  async getListImageNome(indexPage, pageSize) {
    this.imageBankService.getImageBankNome(this.boxNome, indexPage, pageSize).subscribe((data: any) => {
      this.addItensList(data);
    });
  }

  async getListImageCategory(indexPage, pageSize) {
    this.imageBankService.getImageBankCategory(this.boxCategory, indexPage, pageSize).subscribe((data: any) => {
      this.addItensList(data);
    });
  }

  createImageBankModalShow(content) {

    this.categoriaList = [];
    this.palavraChaveList = [];

    this.modalService.open(content, { ariaLabelledBy: 'modal-create-imageBank', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });

    setInterval(() => {
      $('.select2-container').css('width', '465px');
    }, 500);
  }

  onEnter(value: string) {
    this.box = value;
    this.boxNome = '';
    this.boxCategory = '';
    this.getListImageBank(0, this.pageSize);
  }

  onEnterNome(value: string) {
    this.boxNome = value;
    this.box = '';
    this.boxCategory = '';
    this.getListImageNome(0, this.pageSize);
  }

  onEnterCategory(value: string) {
    this.boxCategory = value;
    this.boxNome = '';
    this.box = '';
    this.getListImageCategory(0, this.pageSize);
  }

  async createImageBank(imageBank: ImageBank) {
    if (!this.files || this.files.size <= 0) {
      this.alert = new Alert('Falha ao criar Banco de imagens! Imagem é obrigatoria!', 'danger');
      return;
    }

    imageBank.category = this.categoriaList;
    imageBank.keywords = this.palavraChaveList;
    if (imageBank.packing) {
      imageBank.packing = imageBank.packing;
    }

    this.imageBankService.createImageBank(imageBank).subscribe((data: any) => {
      const imageBankResult = data.data;
      this.alert = new Alert('Banco de imagens criado com sucesso!', 'success');

      if (imageBankResult && imageBankResult.images && imageBankResult.images[0]) {
        imageBankResult.image = imageBankResult.images[0];
      }
      this.formData.reset();
      this.getListImageBank(0, this.pageSize);
    }, error => {
      this.alert = new Alert('Falha ao criar Banco de imagens!', 'danger');
    });
  }

  editImageBankModalShow(content, imageBank: ImageBank) {
    this.categoriaList = [];
    this.palavraChaveList = [];
    this.startValue = imageBank.packing;
    imageBank.packing = this.packing;
    this.selectedImageBank = imageBank;
    this.formData = new FormGroup({
      _id: new FormControl(imageBank._id),
      barcode: new FormControl(imageBank.barcode),
      productName: new FormControl(imageBank.productName),
      productAccent: new FormControl(imageBank.productAccent),
      keywords: new FormControl(imageBank.keywords),
      packing: new FormControl(imageBank.packing),
      description: new FormControl(imageBank.description),
      packingAmount: new FormControl(imageBank.packingAmount),
      brand: new FormControl(imageBank.brand),
      file: new FormControl(''),
    });
    this.formData.get('packing').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.packingService.getPackingsNome(value): [])
    ).subscribe(results => this.packings = results);

    this.formData.get('packing').setValue(imageBank.packing);

    if (Array.isArray(imageBank.category)) {
      imageBank.category.forEach(x => {
        this.categoriaList.push(x);
      });
    } else {
      this.categoriaList.push(imageBank.category);
    }

    if (Array.isArray(imageBank.keywords)) {
      imageBank.keywords.forEach(x => {
        this.palavraChaveList.push(x);
      });
    } else {
      this.palavraChaveList.push(imageBank.keywords);
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-imageBank', size: 'lg' }).result.then((result) => {

    }, (reason) => {

    });

    setInterval(() => {
      $('.select2-container').css('width', '465px');
    }, 500);
  }

  async updateImageBank(imageBank: ImageBank) {
    imageBank.category = this.categoriaList;
    imageBank.keywords = this.palavraChaveList;
    if (imageBank.packing) {
      imageBank.packing = imageBank.packing;
    }
    this.imageBankService.updateImageBank(imageBank).subscribe((data: any) => {
      const index = this.dataSource.data.map((e: any) => e._id).indexOf(imageBank._id);
      this.formData.reset();
      this.getListImageBank(0, this.pageSize);
      this.alert = new Alert('Banco de imagens alterado com sucesso!', 'success');
    }, error => {
      console.error(error);
      this.alert = new Alert('Falha ao alterar Banco de imagens!', 'danger');
    });
  }

  async confirmDeleteModalShow(content, imageBank) {
    this.imageBankIdToDelete = imageBank._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-imageBank', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteImageBank() {
    if (!this.imageBankIdToDelete) {
      this.alert = new Alert('Falha ao deletar Image Bank!', 'danger');
      return;
    }
    await this.imageBankService.deleteImageBank(this.imageBankIdToDelete).toPromise();
    this.alert = new Alert('Image Bank deletado com sucesso!', 'success');
    this.imageBankIdToDelete = undefined;
    await this.getListImageBank(0, this.pageSize);
  }

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

  focusInPacking(packingLote) {
    this.packingValue = packingLote.target.value;
  }

  focusOutPacking(packingLote, modalType) {
    const packingValue = packingLote.target.value;

    this.packings.forEach((packingLote: Packing, index) => {
      if (packingLote.name === packingValue) {
        this.formData.controls.packingLote.setValue(packingLote._id);
        this.packingValue = packingLote.name;
        return true;
      }
    });

    packingLote.target.value = this.packingValue;
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
        }
      }
    }
    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');

  }

}
