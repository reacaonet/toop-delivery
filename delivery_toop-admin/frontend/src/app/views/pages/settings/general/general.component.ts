import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { startWith, debounceTime, switchMap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

/** Model */

/** Service */
import { FranchiseService } from './../../../../services/franchise.service'

@Component({
	selector: "kt-general",
	templateUrl: "./general.component.html",
	styleUrls: ["./general.component.scss"],
})

export class GeneralComponent implements OnInit, AfterViewInit {
	franchises = null;
	franchise = null;
	formSubmitAttempt = false;
	formData: any;
	load: Boolean = false;
	registration = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private toastr: ToastrService,
		private franchiseService: FranchiseService
	) {}

	async ngOnInit() {
		await this.addFormData()
		await this.getFranchise()
	}

	ngAfterViewInit() {}

	async addFormData() {
		this.formData = new FormGroup({
			_id: new FormControl(undefined),
			franchise: new FormControl('', [Validators.required]),
			activateTip: new FormControl(false, [Validators.required]),
		})

		this.formData
			.get("franchise")
			.valueChanges.subscribe(result => {
				if (typeof result === 'object') {
					this.franchise = result
					this.formData.patchValue({
						activateTip: result.activateTip ? true : false
					});
				}
			})
	}

	async getFranchise() {
		const user = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

			if (!user || !user._id) {
				return
			}

			this.franchises = await this.franchiseService.getByUser(user._id, undefined).toPromise()
	}

	async createGeneral(general: any) {
		try {
			if (!this.franchise || !this.franchise._id) {
				this.toastr.warning('Selecione uma Franquia válida', 'Validação Formulário')
				return;
			}

			const payload: any = {
				_id: general.franchise._id,
				status: general.franchise.status,
				activateTip: general.activateTip
			}

			this.load = true
			await this.franchiseService.updateFranchise(payload).toPromise();

			this.load = false;
			this.registration = true
			this.changeDetectorRefs.detectChanges();
			this.toastr.success('Informações salva com sucesso!!')
			this.getFranchise()
		} catch (err) {
			let message = 'Erro ao adicionar configurações gerais'

			if (err.error && err.error.message) {
				message = err.error.message
			}

			this.toastr.error(message, 'Falha!');
			this.load = false;
		}
	}

	displayFn(date: any) {
		if (date) {
			return date.name;
		}
	}

}
