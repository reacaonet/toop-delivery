import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { startWith, debounceTime, switchMap } from "rxjs/operators";

import { Franchise } from "./../../../../../../models/franchise";
import { FranchiseService } from "./../../../../../services/franchise.service";
import { checkObjectIdisValid, validateNumberInteger } from "../../../../util";

@Component({
	selector: "kt-driver",
	templateUrl: "./driver.component.html",
	styleUrls: ["./driver.component.scss"],
})
export class DriverComponent implements OnInit, AfterViewInit {
	formData: any;
	formSubmitAttempt: boolean;
	formDynamic: FormGroup;
	userLogged: any = null;
	optionsCurrencyMask = { prefix: "R$ " };

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private franchiseService: FranchiseService,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private translate: TranslateService
	) {}

	async ngOnInit() {
		this.toastr.toastrConfig.timeOut = 20000;
		this.userLogged = localStorage.getItem("@user-info")
			? JSON.parse(localStorage.getItem("@user-info"))
			: undefined;

		if (this.userLogged?.currencySymbol) {
			this.optionsCurrencyMask = { prefix: `${this.userLogged?.currencySymbol} ` };
		}
	}

	ngAfterViewInit() {}

	async upsertSettingsRaces(franchise: any) {
		try {
			let hasError = false;

			franchise.dynamics.map((dynamic, index) => {
				if (
					franchise.dynamics
						.filter((i, ind) => ind !== index)
						.find((i) => i.amoutStart >= dynamic.amoutStart && i.amoutEnd <= dynamic.amoutEnd)
				) {
					hasError = true;
				}
			});

			if (hasError) {
				return this.toastr.warning("Suas regras de preço dinamico são conflitantes", "Conflito");
			}

			if (
				franchise.recalculate?.status === true &&
				(franchise.recalculate?.distanceBelow < 400 || franchise.recalculate?.distanceAbove < 400)
			) {
				return this.toastr.warning("Distância mínima deve ser de 400 metros", "Conflito");
			}

			const payload: any = {
				_id: this.userLogged?.franchise,
				settingsRace: {
					expiresNewRaceTime: franchise.expiresNewRaceTime,
					dynamics: franchise.dynamics,
					recalculate: franchise.recalculate,
				},
			};

			await this.franchiseService.updateFranchise(payload).toPromise();

			this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
			this.modalService.dismissAll();
		} catch (error) {
			const messageError =
				error && error.error && error?.error?.message
					? error.error.message
					: "Não foi possível salvar";
			this.toastr.error(messageError, "Falhou!");
		}
	}

	newFormData() {
		return new Promise(async (resolve, reject) => {
			this.formData = new FormGroup({
				_id: new FormControl(undefined),
				activePercentService: new FormControl(false),
				// creditEnableMode: new FormControl(false),
				// allowAcceptRacesNegativeBalance: new FormControl("false"),
				// balanceLimit: new FormControl(0),
				creditPrice: new FormControl(1),
				creditAmountPerRice: new FormControl(0),
				creditAmountPerAdditionalStop: new FormControl(0),
				passAdditionalStopsToPassenger: new FormControl(false),
				expiresNewRaceTime: new FormControl(20),
				dynamics: new FormArray([]),
				recalculate: new FormGroup({
					status: new FormControl(false, [Validators.required]),
					timeAbove: new FormControl(2, [Validators.required, validateNumberInteger]),
					timeBelow: new FormControl(2, [Validators.required, validateNumberInteger]),
					distanceAbove: new FormControl(400, [Validators.required, validateNumberInteger]),
					distanceBelow: new FormControl(400, [Validators.required, validateNumberInteger]),
				}),
			});
			return resolve(true);
		});
	}

	async addDynamic() {
		return new Promise(async (resolve, reject) => {
			this.formDynamic = new FormGroup({
				timeRange: new FormControl(0, [Validators.required]),
				amoutStart: new FormControl(0, [Validators.required]),
				amoutEnd: new FormControl(0, [Validators.required]),
				ray: new FormControl(0, [Validators.required]),
				percent: new FormControl(0, [Validators.required]),
			});

			this.formData.get("dynamics").push(this.formDynamic);
			resolve(true);
		});
	}

	async upSertRacesModalShow(content) {
		if (!this.userLogged || this.userLogged?.isRoot === true || !this.userLogged?.franchise) {
			return this.toastr.warning(
				"Entre com uma credencial de uma franquia para acessar este Item",
				"Não permitido"
			);
		}

		await this.newFormData();
		this.formSubmitAttempt = false;

		const resp: any = await this.franchiseService
			.getOneFranchises(this.userLogged?.franchise)
			.toPromise();

		if (resp && resp?.settingsRace) {
			this.formData.patchValue({
				id: resp?._id,
				expiresNewRaceTime: resp?.settingsRace?.expiresNewRaceTime,
				dynamics: resp?.settingsRace?.dynamics ? resp?.settingsRace?.dynamics : [],
				recalculate: resp?.settingsRace?.recalculate ? resp?.settingsRace?.recalculate : {},
			});

			if (
				resp?.settingsRace?.dynamics &&
				Array.isArray(resp?.settingsRace?.dynamics) &&
				resp?.settingsRace?.dynamics.length > 0
			) {
				for await (const dynamic of resp?.settingsRace?.dynamics) {
					this.formDynamic = new FormGroup({
						timeRange: new FormControl(dynamic.timeRange, [Validators.required]),
						amoutStart: new FormControl(dynamic.amoutStart, [Validators.required]),
						amoutEnd: new FormControl(dynamic.amoutEnd, [Validators.required]),
						percent: new FormControl(dynamic.percent, [Validators.required]),
						ray: new FormControl(dynamic.ray, [Validators.required]),
					});

					this.formData.get("dynamics").push(this.formDynamic);
				}
			}

			this.changeDetectorRefs.detectChanges();
		}

		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-settingsDriver",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {
					this.changeDetectorRefs.detectChanges();
				},
				(reason) => {}
			);
	}

	async upsertModalShow(content) {
		if (!this.userLogged || this.userLogged?.isRoot === true || !this.userLogged?.franchise) {
			return this.toastr.warning(
				"Entre com uma credencial de uma franquia para acessar este Item",
				"Não permitido"
			);
		}

		await this.newFormData();
		this.formSubmitAttempt = false;

		this.franchiseService
			.getOneFranchises(this.userLogged?.franchise)
			.subscribe(async (franchise: any) => {
				this.formData.patchValue({
					_id: content?._id,
					// creditEnableMode: franchise?.settingsDriver?.creditEnableMode,
					// allowAcceptRacesNegativeBalance: (!!franchise?.settingsDriver?.allowAcceptRacesNegativeBalance).toString(),
					// balanceLimit: franchise?.settingsDriver?.balanceLimit ?? 0,
					activePercentService: franchise?.settingsDriver?.activePercentService || false,
					creditPrice: franchise?.settingsDriver?.creditPrice,
					creditAmountPerRice: franchise?.settingsDriver?.creditAmountPerRice || 0,
					creditAmountPerAdditionalStop: franchise?.settingsDriver?.creditAmountPerAdditionalStop,
					passAdditionalStopsToPassenger: franchise?.settingsDriver?.passAdditionalStopsToPassenger,
				});
			});

		this.changeDetectorRefs.detectChanges();
		this.modalService
			.open(content, {
				ariaLabelledBy: "modal-edit-settingsDriver",
				size: "lg",
				backdrop: "static",
			})
			.result.then(
				(result) => {
					this.changeDetectorRefs.detectChanges();
				},
				(reason) => {}
			);
	}

	async upsertSettingsDriver(franchise: any) {
		if (this.userLogged && this.userLogged.franchise) {
			const payload = {
				_id: this.userLogged.franchise,
				settingsDriver: {
					creditEnableMode: franchise.creditEnableMode,
					// allowAcceptRacesNegativeBalance: franchise.allowAcceptRacesNegativeBalance || "false",
					// balanceLimit: franchise.balanceLimit ?? 0,
					activePercentService: franchise.activePercentService,
					creditPrice: franchise.creditPrice,
					creditAmountPerRice: franchise.creditAmountPerRice,
					creditAmountPerAdditionalStop: franchise.creditAmountPerAdditionalStop,
					passAdditionalStopsToPassenger: franchise.passAdditionalStopsToPassenger,
				},
			};

			this.franchiseService.updateFranchise(payload).subscribe(
				async () => {
					this.toastr.success("Registro alterado com sucesso!", "Sucesso!");
				},
				(error) => {
					console.error(error);
					this.toastr.error("Erro ao alterar Registro!", "Falha!");
				}
			);
		}
	}
}
