import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from '@angular/router';

/** Model */
import { SegmentModel } from "../../../../../models/company/segment";
import { Company } from "../../../../../models/company/company";

/** Service */
import { CompanyService } from "./../../../../services/company.service";
import { SegmentService } from "./../../../../services/company/segment.service";
import { FranchiseService } from './../../../../services/franchise.service';
import { checkObjectIdisValid } from "../../../../util";

@Component({
	selector: "kt-company",
	templateUrl: "./company.component.html",
	styleUrls: ["./company.component.scss"],
})

export class CompanyComponent implements OnInit, AfterViewInit {
	franchise = null;
	formSubmitAttempt = false;
	formData: any;
	segments: SegmentModel[] = [];
	categoriaList: string[] = [];
	files: Set<File>;
	load: Boolean = false;
	registration = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private toastr: ToastrService,
		private route: ActivatedRoute,
		private companyService: CompanyService,
		private segmentService: SegmentService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		const id = this.route.snapshot.paramMap.get('id');

		this.franchiseService.getOneFranchises(id).subscribe((result: any) => {
			if (result && result._id) {
				this.franchise = result
				this.addFormData()
			}
		})
	}

	ngAfterViewInit() {}

	async addFormData() {
		this.formData = new FormGroup({
			_id: new FormControl(undefined),
			name: new FormControl('', [Validators.required]),
			description: new FormControl(''),
			status: new FormControl(false),
			isHighlighted: new FormControl(false),
			lat: new FormControl("", [Validators.required]),
			lng: new FormControl("", [Validators.required]),
			address: new FormControl("", [Validators.required]),
			phone: new FormControl('', [Validators.required]),
			shoppingFlow: new FormControl("MENU", [Validators.required]),
			groups: new FormControl(''),
			file: new FormControl("", [Validators.required]),
			category: new FormControl(""),
			segment: new FormControl(undefined, [Validators.required, checkObjectIdisValid]),
			cnpj: new FormControl('', [Validators.required]),
			keywords: new FormControl(""),
			typePayments: new FormArray([]),
		})

		const resp: any = await this.segmentService
			.listFranchiseSegment(this.franchise._id)
			.toPromise()

		if (resp) {
			this.segments = resp
		 	this.changeDetectorRefs.detectChanges();
		}
	}

	async createCompany(company: Company) {
		try {
			if (!this.files || this.files.size <= 0) {
				this.toastr.error(
					"Erro ao criar Empresa! Imagem é obrigatoria!",
					"Falha!"
				);
				return;
			}

			company.typePayments = [];
			company.franchise = this.franchise._id;

			// console.log('Dados enviados', company);
			this.load = true;
			const resp = await this.companyService.createPublicCompany(company).toPromise()

			this.load = false;
			this.registration = true
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			let message = 'Erro ao criar Empresa! Verifique as informações enviadas'

			if (err.error && err.error.message) {
				message = err.error.message
			}

			// console.log('Falhou ao cadastrar', err)
			this.toastr.error(message, 'Falha!');
			this.load = false;
		}
	}

	addCategoria(event: MatChipInputEvent): void {
		const input = event.input;
		const value = event.value;

		if ((value || "").trim()) {
			this.categoriaList.push(value.toLowerCase().trim());
		}

		if (input) {
			input.value = "";
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

	displayFnSegment(segment: SegmentModel) {
		if (segment) {
			return segment.name;
		}
	}

	// Image
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
