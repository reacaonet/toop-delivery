import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, debounceTime, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { DocumentType } from '../../../../../models/mobility/documentType';
import { DocumentTypeService } from '../../../../services/mobility/documentType.service';

@Component({
	selector: 'kt-documentType',
	templateUrl: './documentType.component.html',
	styleUrls: ['./documentType.component.scss'],
})
export class DocumentTypeComponent implements OnInit, AfterViewInit {
	box = '';
	boxNome = '';
	idToDelete; // Save id to delete
	dataSource;
	displayedColumns = ['name', 'type', 'delete'];
	files: Set<File>;
	formData;
	formFilter: FormGroup;
	formSubmitAttempt = false;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;

	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;

	types = [
		{ value: 'VEHICLE', label: 'Revisão do Veículo' },
		{ value: 'DRIVER', label: 'Revisão do Motorista' },
	];

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private documentTypeService: DocumentTypeService,
		private modalService: NgbModal,
		private toastr: ToastrService,
	) {}

	async ngOnInit() {
		await this.addFormFilter();
		await this.getList(0, this.pageSize, undefined);
	}

	async addFormFilter() {
		return new Promise(async (resolve, reject) => {
			// Criando os campos do formulário
			this.formFilter = new FormGroup({
				name: new FormControl(''),
			});

			this.formFilter
				.get('name')
				.valueChanges.pipe(
					startWith(''),
					debounceTime(1000),
					switchMap((value) => (typeof value === 'string' && value.length > 0) ? this.getList(0, this.pageSize, value):[]),
				)
				.subscribe(results => {
					this.changeDetectorRefs.detectChanges();
				});

			return resolve(true);
		});
	}

	async newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),

				name: new FormControl('', [Validators.required]),
				type: new FormControl('', [Validators.required]),
				status: new FormControl(''),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize, undefined);
	}

	async getList(pageIn, pageOut, name) {
		const self = this;
		const ELEMENT_DATA = [];

		await this.documentTypeService.getPaginator(pageIn, pageOut, name).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((data, index) => {
					ELEMENT_DATA.push({
						_id: data._id,
						position: index + 1,
						name: data.name,
						type: data.type,
						status: data.status,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async createModalShow(content) {
		await this.newFormData();

		this.modalService
			.open(content, {
				ariaLabelledBy: 'modal-create-data',
				size: 'lg',
				backdrop: 'static',
			})
			.result.then(
				result => {},
				reason => {},
			);
	}

	async create(data: DocumentType) {
		this.documentTypeService.create(data).subscribe(
			async (data: any) => {
				this.modalService.dismissAll('');
				this.toastr.success('Registro cadastrado com sucesso!', 'Sucesso!');
				await this.getList(0, this.pageSize, undefined);
			},
			error => {
				this.toastr.error('Falha ao criar Motivo!', 'Falha!');
			},
		);
	}

	async editModalShow(content, data: DocumentType) {
		await this.newFormData();

		this.formData.patchValue({
			_id: data._id,

			status: data.status,
			name: data.name,
			type: data.type,
		});

		this.modalService
			.open(content, {
				ariaLabelledBy: 'modal-edit-data',
				size: 'lg',
				backdrop: 'static',
			})
			.result.then(
				result => {},
				reason => {},
			);
	}

	async edit(data: DocumentType) {
		this.documentTypeService.update(data).subscribe(
			async (data: any) => {
				this.toastr.success('Registro alterado com sucesso!', 'Sucesso!');
				await this.getList(0, this.pageSize, undefined);
				this.modalService.dismissAll();
			},
			error => {
				console.error(error);
				this.toastr.error('Falha ao alterar registro!', 'Falha!');
				this.modalService.dismissAll();
			},
		);
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: 'modal-delete-data',
				size: 'sm',
				backdrop: 'static',
			})
			.result.then(
				result => {},
				reason => {},
			);
	}

	async delete() {
		// caso não encotre o id dar error
		if (!this.idToDelete) {
			this.toastr.error('Falha ao deletar Registro!', 'Falha!');
			return;
		}
		// delete
		await this.documentTypeService.delete(this.idToDelete).toPromise();
		// sucesso ao excluir tela
		this.toastr.success('Registro deletado com sucesso!', 'Sucesso!');
		// trata o id pra indefinido
		this.idToDelete = undefined;
		// att a tela
		await this.getList(0, this.pageSize, undefined);
	}

	ngAfterViewInit() {}

	onChange(event) {
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
						file: fileList,
					});
				};
			}
		}
		document.getElementById('customFileLabel').innerHTML = fileNames.join(', ');
	}

	onEnter(value: string) {
		this.box = value;
		this.boxNome = '';
		this.getList(0, this.pageSize, undefined);
	}

	// --> obtem o status do registro
	getStatusColor(status) {
		if (status === true) {
			return 'bg-success';
		} else {
			return 'bg-warning';
		}
	}

	// --> obtem a cor da linha do registro
	getPositionColor(position) {
		if (position % 2 !== 0) {
			return 'bg-secondary';
		}
	}
}
