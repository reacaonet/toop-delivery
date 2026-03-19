import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';

import moment from "moment";
import { ToastrService } from "ngx-toastr";

import { Alert } from "../../../../../models/alert";
import { CashbackCampaign } from "../../../../../models/cashback/cashbackCampaign";
import { Company } from "../../../../../models/company/company";
import { CashbackCampaignService } from "../../../../services/cashback/Campaign";
import { CompanyService } from "../../../../services/company.service";

/** Util */
import { formatMoney } from '../../../../util'

@Component({
	selector: "kt-received",
	templateUrl: "./received.component.html",
	styleUrls: ["./received.component.scss"],
})
export class CampaignReceivedComponent implements OnInit, AfterViewInit {
	id = null;
	alert: Alert = undefined;
	dataSource;
	displayedColumns = ["data", "person", "order_number", "percent", "cashback", "total"];
	files: Set<File>;
	myControl: FormControl = new FormControl();
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	typeAction = "create";
	idToDelete;
	allApp = true;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private toastr: ToastrService,
		private route: ActivatedRoute,
		private cashbackCampaignService: CashbackCampaignService,
		private companyService: CompanyService
	) {}

	ngOnInit() {
		this.id = this.route.snapshot.paramMap.get('id');
		this.getList(0, this.pageSize);
	}

	ngAfterViewInit() {}


	changePage(event) {
		this.pageSize = event.pageSize;
		this.getList(event.pageIndex, event.pageSize);
	}

	async getList(pageIn, pageOut) {
		const self = this;
		const ELEMENT_DATA = [];

		this.cashbackCampaignService
			.historicCashRegister(pageIn, pageOut, this.id)
			.subscribe((result: any) => {
				console.log('result', result)
				result.list.forEach(item => {
					ELEMENT_DATA.push({
						_id: item._id,
						data: moment(item.order.createdAt).format('DD/MM/ YYYY'),
						person: item.customer.person,
						order_number: item.order.order_number,
						percent: item.percent,
						cashback: formatMoney(item.cash),
						total: formatMoney(item.payment.total),
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = result.total;
				this.changeDetectorRefs.detectChanges();
			});
	}
}
