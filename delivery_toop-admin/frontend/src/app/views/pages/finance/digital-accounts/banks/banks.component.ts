import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import {
	startWith,
	debounceTime,
	switchMap,
	distinctUntilChanged,
} from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

import { Alert } from "./../../../../../../models/alert";
import { Bank } from "./../../../../../../models/finance/DigitalAccounts/bank";
import { BankService } from "./../../../../../services/finance/DigitalAccounts/bank";

@Component({
	selector: "kt-banks",
	templateUrl: "./banks.component.html",
	styleUrls: ["./banks.component.scss"],
})
export class BanksComponent implements OnInit, AfterViewInit {
	alert: Alert = undefined;
	dataSource;
	displayedColumns = ["name", "description"];
	formData;
	formSubmitBanks = false;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	banksIdToDelete;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private banksService: BankService
	) {}

	ngOnInit() {
		this.getList(0, this.pageSize);
	}

	changePage(event) {
		console.log(event);
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.banksService.getAll().subscribe((data: any) => {
			if (data && Array.isArray(data)) {
				data.forEach((data, index) => {
					ELEMENT_DATA.push({
						_id: data._id,
						position: index + 1,
						name: data.name,
						description: data.description,
					});
				});
				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = 100;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	closeAlert() {
		this.alert = null;
	}

	ngAfterViewInit() {}
}
