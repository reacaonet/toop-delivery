import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import "@ckeditor/ckeditor5-angular";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
// import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
// import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
// import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
// import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
// import EasyImage from "@ckeditor/ckeditor5-easy-image/src/easyimage";
// import Heading from "@ckeditor/ckeditor5-heading/src/heading";
// import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize";
// import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
// import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
// import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
// import Link from "@ckeditor/ckeditor5-link/src/link";
// import List from "@ckeditor/ckeditor5-list/src/list";
// import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
// import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";

import ImageResizeEditing from "@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting";
import ImageResizeHandles from "@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles";

import { MyUploadAdapter } from "./../../../../util/ckUploadAdapter";

import { Alert } from "./../../../../../models/alert";
import { Template } from "./../../../../../models/email/template";
import { Type } from "./../../../../../models/email/type";
import { TemplateService } from "./../../../../services/email/template.service";
import { TypeService } from "./../../../../services/email/type.service";

@Component({
	selector: "kt-template",
	templateUrl: "./template.component.html",
	styleUrls: ["./template.component.scss"],
})
export class TemplateComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	stateValue: string;
	dataSource;
	idToDelete;
	displayedColumns = ["type", "subject", "delete"];
	formData;
	formSubmitAttempt = false;
	myControl: FormControl = new FormControl();

	types: Type[] = [];

	type = "";
	html: "";
	variables = [];

	public Editor = ClassicEditor;
	public EditorConfig = {
		resizeOptions: [
			{
				name: "resizeImage:original",
				value: null,
				label: "Original",
			},
			{
				name: "resizeImage:40",
				value: "40",
				label: "40%",
			},
			{
				name: "resizeImage:60",
				value: "60",
				label: "60%",
			},
		],
		toolbar: [
			"selectAll",
			"undo",
			"redo",
			"blockQuote",
			"heading",
			"bold",
			"italic",
			"link",
			"numberedList",
			"bulletedList",
			"|",
			"insertTable",
			"tableColumn",
			"tableRow",
			"mergeTableCells",
			"|",
			"imageUpload",
			"resizeImage",
			"imageStyle:full",
			"imageStyle:side",
			"imageStyleRight",
			"imageStyleLeft",
		],
	};

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private templateService: TemplateService,
		private typeService: TypeService,
		private modalService: NgbModal
	) {}

	public onReady(editor) {
		editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
			return new MyUploadAdapter(loader);
		};

		// editor.ui
		// 	.getEditableElement()
		// 	.parentElement.insertBefore(
		// 		editor.ui.view.toolbar.element,
		// 		editor.ui.getEditableElement()
		// 	);
	}

	ngOnInit() {
		this.getVariables();
		this.getTypes();
		this.getList();
		this.formData = new FormGroup({
			_id: new FormControl(""),
			subject: new FormControl("", [Validators.required]),
			type: new FormControl("", [Validators.required]),
			status: new FormControl("", [Validators.required]),
			body: new FormControl("", [Validators.required]),
		});
	}

	ngOnDestroy(): void {}

	async getList() {
		const self = this;
		let ELEMENT_DATA = [];

		this.templateService.get().subscribe((data: any) => {
			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			if (data && Array.isArray(data)) {
				data.forEach((data: any, index) => {
					ELEMENT_DATA.push({
						_id: data._id,
						position: index + 1,
						subject: data.subject,
						type: data.type,
						status: data.status,
						body: data.body,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async getTypes() {
		const self = this;
		this.typeService.get().subscribe((data: any) => {
			if (data && Array.isArray(data)) {
				self.types = data;
				this.changeDetectorRefs.detectChanges();
			} else {
				self.types = [];
			}
		});
	}

	async getVariables() {
		const self = this;
		this.templateService.getVariables().subscribe((data: any) => {
			if (data && Array.isArray(data)) {
				self.variables = data;
				this.changeDetectorRefs.detectChanges();
			} else {
				self.variables = [];
			}
		});
	}

	createModalShow(content) {
		this.formData.reset();
		this.myControl = new FormControl();
		this.modalService
			.open(content, { ariaLabelledBy: "modal-create", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async create(data: any) {
		this.templateService.create(data).subscribe(
			(data: any) => {
				const item = data.data;
				this.alert = new Alert("Template criado com sucesso!", "success");

				this.getList();

				this.dataSource._updateChangeSubscription();
				this.changeDetectorRefs.detectChanges();
			},
			(error) => {
				if (error?.error?.message) {
					this.alert = new Alert(error?.error?.message, "danger");
				} else {
					this.alert = new Alert("Falha ao criar template!", "danger");
				}
			}
		);
	}

	async editModalShow(content, data: any) {
		this.formSubmitAttempt = false;

		this.formData.reset();
		this.formData.patchValue({
			_id: data._id,
			subject: data.subject,
			type: data.type?._id,
			status: data.status,
			body: data.body,
		});

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
		this.changeDetectorRefs.detectChanges();
	}

	async update(data: any) {
		data.html = this.html;

		this.templateService.update(data).subscribe(
			(data: any) => {
				this.getList();
				this.alert = new Alert(
					"Template de e-mail alterada com sucesso!",
					"success"
				);
			},
			(error) => {
				console.error(error);
				this.alert = new Alert("Falha ao alterar Template!", "danger");
			}
		);
	}

	async confirmDeleteModalShow(content, data) {
		this.idToDelete = data._id;
		this.modalService
			.open(content, { ariaLabelledBy: "modal-delete", size: "sm" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	async delete() {
		if (!this.idToDelete) {
			this.alert = new Alert("Falha ao deletar Template!", "danger");
			return;
		}
		await this.templateService.delete(this.idToDelete).toPromise();
		this.alert = new Alert(
			"Template de e-mail deletada com sucesso!",
			"success"
		);
		this.idToDelete = undefined;
		await this.getList();
	}

	closeAlert() {
		this.alert = null;
	}

	changeType(event: any) {
		this.type = event.target.value;

		this.changeDetectorRefs.detectChanges();
	}

	ngAfterViewInit() {}
}
