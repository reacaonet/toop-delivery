import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { AlertModal } from './../../../../../models/alertModal';
import { Campaign } from './../../../../../models/marketing/campaign';
import { CampaignService } from './../../../../services/marketing/campaign.service';

@Component({
  selector: 'kt-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit, AfterViewInit {

  alertModal: AlertModal = undefined;
  campaignIdToDelete;
  dataSource;
  displayedColumns = ['image', 'name', 'disseminationVehicle', 'initialDate', 'finalDate',
    'note', 'dowloadAndroid', 'dowloadIos', 'delete'];
  files: NgxFileDropEntry[] = [];
  filesBase64: any[] = [];
  formData;
  formSubmitCampaign = false;
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;
  typeAction = 'create';


  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private campaignService: CampaignService,
  ) { }

  async ngOnInit() {
    await this.getListCampaign(0, this.pageSize);
  }

  async newFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        disseminationVehicle: new FormControl('', [Validators.required]),
        initialDate: new FormControl('', [Validators.required]),
        finalDate: new FormControl('', [Validators.required]),
        note: new FormControl('', [Validators.required]),
        dowloadAndroid: new FormControl('', [Validators.required]),
        dowloadIos: new FormControl('', [Validators.required]),
        image: new FormControl('', [Validators.required]),
      });

      resolve(true);
    });
  }

  changePage(event) {
    this.pageSize = event.pageSize;
    this.getListCampaign(
      event.pageIndex,
      event.pageSize,
    );
  }

  async getListCampaign(page, limit) {
    const self = this;
    let ELEMENT_DATA = [];
    this.campaignService.getPaginatorCampaign(page, limit).subscribe((data: any) => {

      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach((campaign, index) => {

          const initialDate = moment(campaign.initialDate, 'YYYY-MM-DD').format('DD/MM/YYYY');
          const finalDate = moment(campaign.finalDate, 'YYYY-MM-DD').format('DD/MM/YYYY');

          ELEMENT_DATA.push({
            _id: campaign._id,
            position: (index + 1),
            name: campaign.name,
            disseminationVehicle: campaign.disseminationVehicle,
            initialDate,
            finalDate,
            note: campaign.note,
            dowloadAndroid: campaign.dowloadAndroid,
            dowloadIos: campaign.dowloadIos,
            image: (campaign.image && campaign.image[0]) ? campaign.image[0] : undefined,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
        self.totalLength = data.total;
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  async validDate(campaign: Campaign) {
    return new Promise(async (resolve, reject) => {

      if (campaign.initialDate > campaign.finalDate) {
        this.toastr.error('Data Final precisa ser maior que a inicial', 'Falha!');
        setTimeout(() => { this.closeAlertModal() }, 5000);
        resolve(false);
        return;
      }

      const atualDate = moment().format('YYYY-MM-DD');
      const startDate = moment(campaign.initialDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

      if (startDate < atualDate) {
        this.toastr.error('Data inicial deve ser maior ou igual à data atual', 'Falha!');
        setTimeout(() => { this.closeAlertModal() }, 5000);
        resolve(false);
        return;
      }

      resolve(true);
    });
  }

  async upSertCampaignModalShow(content, campaign: Campaign, type = 'create') {
    this.typeAction = type;
    this.formSubmitCampaign = false;
    await this.newFormData();
    this.formData.reset();

    if (campaign) {
      this.formData.patchValue({
        _id: campaign._id,
        position: (this.dataSource.data.length + 2),
        name: campaign.name,
        disseminationVehicle: campaign.disseminationVehicle,
        initialDate: campaign.initialDate,
        finalDate: campaign.finalDate,
        note: campaign.note,
        dowloadAndroid: campaign.dowloadAndroid,
        dowloadIos: campaign.dowloadIos,
        image: campaign.image,
      });
    }

    this.modalService.open(content, { ariaLabelledBy: 'modal-edit-campaign', size: 'lg' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async upSertCampaign(campaign: Campaign) {

    if (campaign.initialDate && moment(campaign.initialDate, 'DDMMYYYY').isValid()) {
      campaign.initialDate = moment(campaign.initialDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    if (campaign.finalDate && moment(campaign.finalDate, 'DDMMYYYY').isValid()) {
      campaign.finalDate = moment(campaign.finalDate, 'DDMMYYYY').format('YYYY-MM-DD');
    }

    const valid = await this.validDate(campaign);

    if (!valid) {
      return;
    }

    if (this.typeAction === 'create') {

      this.campaignService.createCampaign(campaign).subscribe(async (_: any) => {
        await this.getListCampaign(0, this.pageSize);
        this.changeDetectorRefs.detectChanges();
        this.toastr.success('Campanha criado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        this.toastr.error('Erro ao criar campanha!', 'Falha!');
        this.modalService.dismissAll();
      });
    } else {
      this.campaignService.updateCampaign(campaign).subscribe(async (_: any) => {
        await this.getListCampaign(0, this.pageSize);
        this.toastr.success('Campanha alterado com sucesso!', 'Sucesso!');
        this.modalService.dismissAll();
      }, error => {
        console.error(error);
        this.toastr.error('Erro ao alterar campanha!', 'Falha!');
        this.modalService.dismissAll();
      });
    }
  }

  async confirmDeleteModalShow(content, campaign) {
    this.campaignIdToDelete = campaign._id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-campaign', size: 'sm' }).result.then((result) => {
    }, (reason) => {

    });
  }

  async deleteCampaign() {
    if (!this.campaignIdToDelete) {
      this.toastr.error('Erro ao deletar campanha!', 'Falha!');
      return;
    }
    await this.campaignService.deleteCampaign(this.campaignIdToDelete).toPromise();
    this.toastr.success('Campanha deletado com sucesso!', 'Sucesso!');
    this.campaignIdToDelete = undefined;
    await this.getListCampaign(0, this.pageSize);
  }

  ngAfterViewInit() {
  }

  closeAlertModal() {
    this.alertModal = null;
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;

    const fileList = [];
    // const selectedFiles = <FileList>event.srcElement.files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            this.filesBase64.push({
              relativePath: droppedFile.relativePath,
              base64: reader.result
            });

            fileList.push(reader.result);
            this.formData.patchValue({
              image: fileList
            });
          }
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  async drop(event: CdkDragDrop<string[]>) {
    await moveItemInArray(this.filesBase64, event.previousIndex, event.currentIndex);

    const fileList = [];
    for await (const item of this.filesBase64) {
      fileList.push(item.base64);
      this.formData.patchValue({
        image: fileList
      });
    }
  }

}
