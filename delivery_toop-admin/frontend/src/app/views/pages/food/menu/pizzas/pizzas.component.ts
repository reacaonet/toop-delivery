import {
	Component,
	OnDestroy,
	OnInit,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormControl, FormArray, Validators } from "@angular/forms";

@Component({
	selector: "kt-menu-pizza",
	templateUrl: "./pizzas.component.html",
	styleUrls: ["./pizzas.component.scss"],
})
export class PizzasComponent implements OnInit, OnDestroy {
	@Input() typeCategorySelected: any;
	@Input() values: any;
	@Output() setCategorySelected = new EventEmitter<string>();
	@Output() category = new EventEmitter<any>();

	stepOneFormGroup: FormGroup;
	stepTwoFormGroup;
	stepThreeFormGroup;
	stepFourFormGroup;
	formSubmitOne = false;
	formSubmitTwo = false;
	formSubmitThree = false;
	formSubmitFour = false;
	allComplete: boolean = false;

	daysOfWeek = {
		name: "Todos os Dias da Semana",
		completed: false,
		color: "primary",
		days: [
			{ name: "Domingo", key: "sunday", available: false },
			{ name: "Segunda", key: "monday", available: false },
			{ name: "Terça", key: "tuesday", available: false },
			{ name: "Quarta", key: "wednesday", available: false },
			{ name: "Quinta", key: "thursday", available: false },
			{ name: "Sexta", key: "friday", available: false },
			{ name: "Sábado", key: "saturday", available: false },
		],
	};

	availableHours = [
		{
			start: "00:00",
			end: "00:00",
		},
	];

	constructor(private changeDetectorRefs: ChangeDetectorRef) {}

	async ngOnInit() {
		await this.addNewFormsSteps();
	}

	async saveCategory() {
		const payload = {
			_id: this.values?._id ?? "",
			type: "PIZZAS",
			name: this.stepOneFormGroup?.value?.name,
			alwaysAvailable: this.stepOneFormGroup?.value?.alwaysAvailable ?? false,
			billing_mode:
				this.stepOneFormGroup?.value?.billing_mode ?? "PROPORTIONAL_VALUE",
			sizes: this.stepTwoFormGroup?.value?.sizes,
			dough: this.stepThreeFormGroup?.value?.dough,
			edges: this.stepFourFormGroup?.value?.edges,
			daysOfWeek: this.daysOfWeek.days,
			availableHours: this.availableHours,
		};

		this.category.emit(payload);
	}

	async addNewFormsSteps() {
		return new Promise(async (resolve, reject) => {
			this.stepOneFormGroup = new FormGroup({
				_id: new FormControl(this.values?._id ?? undefined),
				name: new FormControl(this.values?.name ?? undefined, [
					Validators.required,
				]),
				billing_mode: new FormControl(this.values?.billing_mode ?? undefined, [
					Validators.required,
				]),
				alwaysAvailable: new FormControl(
					this.values?.alwaysAvailable ?? false,
					[]
				),
			});

			this.stepTwoFormGroup = new FormGroup({
				_id: new FormControl(undefined),
				sizes: new FormArray([]),
			});

			this.stepThreeFormGroup = new FormGroup({
				_id: new FormControl(undefined),
				dough: new FormArray([]),
			});

			this.stepFourFormGroup = new FormGroup({
				_id: new FormControl(undefined),
				edges: new FormArray([]),
			});

			if (this.values?.daysOfWeek && this.values?.daysOfWeek.length > 0)
				this.daysOfWeek.days = this.values?.daysOfWeek;
			if (this.values?.availableHours && this.values?.availableHours.length > 0)
				this.availableHours = this.values?.availableHours;

			await this.insertInitSizesPizzas(this.values?.sizes ?? []);
			await this.insertInitDoughPizzas(this.values?.dough ?? []);
			await this.insertInitEdgesPizzas(this.values?.edges ?? []);

			resolve(true);
		});
	}

	async insertInitEdgesPizzas(edges = []) {
		return new Promise(async (resolve, reject) => {
			const edgesDefaults = edges.length
				? edges
				: [{ _id: undefined, name: "Tradicional", price: 0, status: true }];

			for await (const edg of edgesDefaults) {
				const edgeNew = new FormGroup({
					_id: new FormControl(edg._id),
					name: new FormControl(edg.name, [Validators.required]),
					price: new FormControl(edg.price, [Validators.required]),
					status: new FormControl(edg.status, [Validators.required]),
				});

				// Insert init sizes
				this.stepFourFormGroup.get("edges").push(edgeNew);
			}
			resolve(true);
		});
	}

	async insertInitDoughPizzas(doughs = []) {
		return new Promise(async (resolve, reject) => {
			const doughDefaults = doughs.length
				? doughs
				: [
						{
							_id: undefined,
							name: "Tradicional",
							price: 0,
							status: true,
							codPdv: undefined,
						},
				  ];

			for await (const dg of doughDefaults) {
				const dough = new FormGroup({
					_id: new FormControl(dg._id),
					name: new FormControl(dg.name, [Validators.required]),
					price: new FormControl(dg.price, [Validators.required]),
					status: new FormControl(dg.status, [Validators.required]),
					codPdv: new FormControl(dg.codPdv),
				});

				// Insert init sizes
				this.stepThreeFormGroup.get("dough").push(dough);
			}
			resolve(true);
		});
	}

	async insertInitSizesPizzas(sizes = []) {
		return new Promise(async (resolve, reject) => {
			const sizesDefaults =
				sizes.length > 0
					? sizes
					: [
							{
								_id: undefined,
								name: "Pequena",
								pieces: 1,
								flavors: 1,
								codPdv: undefined,
							},
							{
								_id: undefined,
								name: "Média",
								pieces: 1,
								flavors: 1,
								codPdv: undefined,
							},
							{
								_id: undefined,
								name: "Grande",
								pieces: 1,
								flavors: 1,
								codPdv: undefined,
							},
					  ];

			for await (const sz of sizesDefaults) {
				const sizeOne = new FormGroup({
					_id: new FormControl(sz._id),
					name: new FormControl(sz.name, [Validators.required]),
					pieces: new FormControl(sz.pieces, [Validators.required]),
					flavors: new FormControl(sz.flavors, [Validators.required]),
					codPdv: new FormControl(sz.codPdv),
				});

				// Insert init sizes
				this.stepTwoFormGroup.get("sizes").push(sizeOne);
			}
			resolve(true);
		});
	}

	async addNewEdge() {
		return new Promise(async (resolve, reject) => {
			const edgeOne = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				price: new FormControl(0, [Validators.required]),
				status: new FormControl(true, [Validators.required]),
			});

			// Insert init sizes
			this.stepFourFormGroup.get("edges").push(edgeOne);
			resolve(true);
		});
	}

	async addNewDough() {
		return new Promise(async (resolve, reject) => {
			const doughOne = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				price: new FormControl(0, [Validators.required]),
				status: new FormControl(true, [Validators.required]),
				codPdv: new FormControl(undefined),
			});
			// Insert init sizes
			this.stepThreeFormGroup.get("dough").push(doughOne);
			resolve(true);
		});
	}

	async addNewSize() {
		return new Promise(async (resolve, reject) => {
			const sizeOne = new FormGroup({
				_id: new FormControl(undefined),
				name: new FormControl(undefined, [Validators.required]),
				pieces: new FormControl(undefined, [Validators.required]),
				flavors: new FormControl(undefined, [Validators.required]),
				codPdv: new FormControl(undefined),
			});
			// Insert init sizes
			this.stepTwoFormGroup.get("sizes").push(sizeOne);
			resolve(true);
		});
	}

	async removeDough(index) {
		return new Promise(async (resolve, reject) => {
			await this.stepThreeFormGroup.get("dough").removeAt(index);

			resolve(true);
		});
	}

	async removeSize(index) {
		return new Promise(async (resolve, reject) => {
			await this.stepTwoFormGroup.get("sizes").removeAt(index);

			resolve(true);
		});
	}

	async removeEdge(index) {
		return new Promise(async (resolve, reject) => {
			await this.stepFourFormGroup.get("edges").removeAt(index);

			resolve(true);
		});
	}

	alterCategorySelected() {
		this.setCategorySelected.emit(undefined);
	}
	updateAllComplete(index) {
		this.daysOfWeek.days[index].available =
			!this.daysOfWeek.days[index].available;

		this.allComplete =
			this.daysOfWeek.days != null &&
			this.daysOfWeek.days.every((t) => t.available);
	}

	someComplete(): boolean {
		if (this.daysOfWeek.days == null) {
			return false;
		}
		return (
			this.daysOfWeek.days.filter((t) => t.available).length > 0 &&
			!this.allComplete
		);
	}

	setAll(completed: boolean) {
		this.allComplete = completed;
		if (this.daysOfWeek.days == null) {
			return;
		}
		this.daysOfWeek.days.forEach((t) => (t.available = completed));
	}

	getHours() {
		var arr = [];
		var i;
		var j;
		for (i = 0; i < 24; i++) {
			for (j = 0; j < 4; j++) {
				arr.push(
					i.toString().padStart(2, "0") + ":" + (j === 0 ? "00" : 15 * j)
				);
			}
		}
		return arr;
	}

	changeAvailableHours(index, element, value) {
		this.availableHours[index][element] = value;
	}

	addAvailableHours() {
		this.availableHours.push({
			start: "00:00",
			end: "00:00",
		});
	}

	removeAvailableHours(index) {
		this.availableHours = this.availableHours.filter(
			(values, i) => i !== index
		);
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {}
}
