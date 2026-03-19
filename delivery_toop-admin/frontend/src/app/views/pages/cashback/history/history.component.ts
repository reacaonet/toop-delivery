import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import moment from "moment";
import { ToastrService } from "ngx-toastr";

import { Alert } from "../../../../../models/alert";
import { CashbackCampaignService } from "../../../../services/cashback/Campaign";
import { CompanyService } from "../../../../services/company.service";

/** Util */
import { formatMoney } from "../../../../util";

@Component({
	selector: "kt-history",
	templateUrl: "./history.component.html",
	styleUrls: ["./history.component.scss"],
})
export class CampaignHistoryComponent implements OnInit, AfterViewInit {
	id = null;
	alert: Alert = undefined;
	dataSource;
	displayedColumns = [
		"data",
		"campaign",
		"person",
		"order_number",
		"percent",
		"cashback",
		"total",
	];
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
		private route: ActivatedRoute,
		private cashbackCampaignService: CashbackCampaignService
	) {}

	ngOnInit() {
		this.id = this.route.snapshot.paramMap.get("id");
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
			.historicCashRegister(pageIn, pageOut)
			.subscribe((result: any) => {
				console.log("result", result);
				result.list.forEach((item) => {
					ELEMENT_DATA.push({
						_id: item._id,
						data: moment(item.order.createdAt).format("DD/MM/YYYY"),
						campaign: item.campaign,
						person: item.customer.person,
						order_number: item.order.order_number,
						percent: item.percent,
						cashback: formatMoney(item.cash),
						total: formatMoney(item.payment.total),
						isUsed: item.cash < 0,
					});
				});

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);
				self.totalLength = result.total;
				this.changeDetectorRefs.detectChanges();
			});
	}
}
