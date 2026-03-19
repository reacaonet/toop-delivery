import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";

import { ToastrService } from "ngx-toastr";

import { Voucher } from "./../../../../../models/finance/Voucher";
import { VoucherService } from "./../../../../services/finance/voucher";
import moment from "moment";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "kt-voucher",
	templateUrl: "./voucher.component.html",
	styleUrls: ["./voucher.component.scss"],
})
export class VoucherComponent implements OnInit, AfterViewInit {
	helpdeskUrl = '/helpdesk/faq/63a1f1eef0f5dbc1805e6aaf';
	dataSource;
	displayedColumns = [
		"name",
		"code",
		"value",
		"limit",
		"dateInit",
		"dateFinish",
		"status",
		"delete",
	];
	files: Set<File>;
	formData;
	formSubmit = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	idToDelete;
	currencyCountry = 'BRL';
	optionsCurrencyMask = { prefix: 'R$ ' };
	languageDefault = 'pt-BR';
	currencySymbol = "";

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private voucherService: VoucherService,
		private translate: TranslateService,
	) { }

	ngOnInit() {
		const userStorage = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		this.languageDefault = userStorage?.languageDefault || 'pt-BR';

		if (userStorage && userStorage.currencySymbol) {
			this.currencySymbol = userStorage.currencySymbol;
			this.optionsCurrencyMask = { prefix: `${this.currencySymbol} ` };
		}

		this.getList(0, this.pageSize);
	}

	async newForm() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				status: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				code: new FormControl(undefined, [Validators.required]),
				value: new FormControl(undefined, [Validators.required]),
				limit: new FormControl(undefined, [Validators.required]),
				dateInit: new FormControl(undefined, [Validators.required]),
				dateFinish: new FormControl(undefined, [Validators.required]),
			});
			return resolve(true);
		});
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.voucherService.getPaginator(pageIn, pageOut).subscribe((data: any) => {
			if (data.list && Array.isArray(data.list)) {
				data.list.forEach((voucher, index) => {
					const dateInitFormated = moment(
						voucher.dateInit,
						"YYYY-MM-DD HH:mm"
					).format("DD/MM/YYYY HH:mm");
					const dateFinishFormated = moment(
						voucher.dateFinish,
						"YYYY-MM-DD HH:mm"
					).format("DD/MM/YYYY HH:mm");

					const valueFormated = Number(voucher.value || 0).toFixed(2).replace('.', ',');

					ELEMENT_DATA.push({
						_id: voucher._id,
						position: index + 1,
						...voucher,
						valueFormated,
						dateInitFormated,
						dateFinishFormated,
						dateInit: moment(voucher.dateInit).format("YYYY-MM-DD HH:mm"),
						dateFinish: moment(voucher.dateFinish).format("YYYY-MM-DD HH:mm"),
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = data.total;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	async upSertModalShow(content, voucher: Voucher, type = "create") {
		this.typeAction = type;
		this.formSubmit = false;
		await this.newForm();

		// Only edit
		if (voucher) {
			this.formData.patchValue(voucher);
		}

		this.modalService
			.open(content, { ariaLabelledBy: "modal-edit", size: "lg" })
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async upSert(voucher: Voucher) {
		if (this.typeAction === "create") {
			this.voucherService.create(voucher).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.changeDetectorRefs.detectChanges();
					this.toastr.success("Voucher atualizado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					// console.log(error);
					this.toastr.error(
						error?.error?.message ?? "Erro ao criar Voucher!",
						"Falha!"
					);
				}
			);
		} else {
			// if (data.data && data.data.images && data.data.images[0]) {
			//   this.dataSource.data[index].image = data.data.images[0];
			// }

			this.voucherService.update(voucher).subscribe(
				async (_: any) => {
					await this.getList(0, this.pageSize);
					this.toastr.success("Voucher alterado com sucesso!", "Sucesso!");
					this.modalService.dismissAll();
				},
				(error) => {
					// console.error(error);
					this.toastr.error(
						error?.error?.message ?? "Erro ao criar Voucher!",
						"Falha!"
					);
				}
			);
		}
	}

	async confirmDeleteModalShow(content, voucher) {
		this.idToDelete = voucher._id;
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-delete-voucher",
				size: "sm"
			})
			.result.then(
				(result) => { },
				(reason) => { }
			);
	}

	async delete() {
		if (!this.idToDelete) {
			this.toastr.error("Erro ao deletar voucher!", "Falha!");
			return;
		}
		await this.voucherService.delete(this.idToDelete).toPromise();
		this.toastr.success("Voucher deletado com sucesso!", "Sucesso!");
		this.idToDelete = undefined;
		// this.modalService.dismissAll();
		await this.getList(0, this.pageSize);
	}

	ngAfterViewInit() { }

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
						file: fileList,
					});
				};
			}
		}
		document.getElementById("customFileLabel").innerHTML = fileNames.join(", ");
	}
}
