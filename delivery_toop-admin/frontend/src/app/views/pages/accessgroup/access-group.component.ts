import { Controller } from '../../../../models/controller';
import { Module } from '../../../../models/module';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

import { Alert } from '../../../../models/alert';
import { AccessGroup } from '../../../../models/accessGroup';
import { AccessGroupService } from '../../../services/access-group.service';
import { ControllerService } from '../../../services/controller.service';
import { ModuleService } from '../../../services/module.service';

@Component({
  selector: 'kt-access-group',
  templateUrl: './access-group.component.html',
  styleUrls: ['./access-group.component.scss']
})
export class AccessGroupComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  displayedColumns = ['name', 'modules', 'status', 'delete'];
  files: Set<File>;
  formData;
  formDataTree;
  myControl: FormControl = new FormControl();
  children: AccessGroup[];
  item: string;
  pageSize = 20;

  formSubmitAttempt = false;

  constructor(
    private accessGroupService: AccessGroupService,
    private modalService: NgbModal,
    private moduleService: ModuleService,
  ) { }

  ngOnInit() {
    // this.getTreeAccessGroup();
  }

  async addNewFormData() {
    return new Promise(async (resolve, reject) => {
      this.formData = new FormGroup({
        _id: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        status: new FormControl(''),
        modules: new FormArray([]),
      });

      const treeModules: any = await this.moduleService.getModuleTree().toPromise();

      for await (const module of treeModules) {
        await this.addNewFormModules(module);
      }

      resolve(true);
    });
  }

  async addNewFormModules(module) {
    console.log('recebido', module);
    return new Promise(async (resolve, reject) => {
      this.formDataTree = new FormGroup({
        name: new FormControl(module.name, [Validators.required]),
        controllers: new FormArray([]),
      });

      for await (const item of module.controllers) {
        const formDataTreeController = new FormGroup({
          _id: new FormControl(item._id),
          name: new FormControl(item.name),
        });
        await this.formDataTree.get('controllers').push(formDataTreeController);
      }

      this.formData.get('modules').push(this.formDataTree);
      resolve(true);
    });
  }

  async getTreeAccessGroup() {
    const self = this;
    const ELEMENT_DATA = [];

    this.accessGroupService.getAccessGroup().subscribe((data: any) => {
      self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      if (data && Array.isArray(data)) {
        data.forEach((accessGroup, index) => {
          ELEMENT_DATA.push({
            _id: accessGroup._id,
            position: (index + 1),
            name: accessGroup.name,
            modules: (accessGroup.modules && accessGroup.modules.name) ? accessGroup.modules.name : '-',
            status: accessGroup.status,
          });
        });
        self.dataSource = new MatTableDataSource(ELEMENT_DATA);
      }
    });
  }

  async createAccessGroupModalShow(content) {
    if (this.formData) {
      this.formData.reset();
    }

    await this.addNewFormData();
    this.myControl = new FormControl();
    this.modalService.open(content, { ariaLabelledBy: 'modal-create-accessGroup', size: 'lg' }).result.then((result) => {
    }, async (reason) => {
    });
  }

  async createAccessGroup(accessGroup: any) {
  // async createAccessGroup(accessGroup: AccessGroup) {

    console.log('veioo', accessGroup);
    return;

    this.accessGroupService.createAccessGroup(accessGroup).subscribe((data: any) => {
      const accessGroup = data.data;
      this.alert = new Alert('Access Group criado com sucesso!', 'success');

      this.dataSource.data.push({
        _id: accessGroup._id,
        position: (this.dataSource.data.length + 2),
        name: accessGroup.name,
        modules: accessGroup.modules.name,
        status: accessGroup.status,
      });
      this.dataSource._updateChangeSubscription();
    }, error => {
      this.alert = new Alert('Falha ao criar Access Group!', 'danger');
    });
  }

  buildFileTree(obj: object, level: number): AccessGroup[] {
    return Object.keys(obj).reduce<AccessGroup[]>((accumulator, key) => {
      const value = obj[key];
      const accessGroup = new AccessGroup();
      accessGroup.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          accessGroup.children = this.buildFileTree(value, level + 1);
        } else {
          accessGroup.item = value;
        }
      }

      return accumulator.concat(accessGroup);
    }, []);
  }

  /*
  transformer = (accessGroup: AccessGroup, level: number) => {
    const existingNode = this.nestedNodeMap.get(accessGroup);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = accessGroup.item;
    flatNode.level = level;
    flatNode.expandable = !!accessGroup.children;
    this.flatNodeMap.set(flatNode, accessGroup);
    this.nestedNodeMap.set(accessGroup, flatNode);
    return flatNode;
  }
*/


  ngAfterViewInit() {
  }

  closeAlert() {
    this.alert = null;
  }

}
