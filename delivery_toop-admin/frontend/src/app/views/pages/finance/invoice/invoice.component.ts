import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import moment from 'moment';

import { Alert } from '../../../../../models/alert';
import { InvoiceService } from '../../../../services/invoice.service';

import { Company } from '../../../../core/auth';

@Component({
  selector: 'kt-type-payments',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {

  alert: Alert = undefined;
  dataSource;
  displayedColumns = [
		'status',
		// 'type',
		'date',
		'owner',
		'destiny',
		'amount',
		'detail',
	];
  pageSize = 20;
  pageLimit: number[] = [20, 50, 100];
  totalLength;

	detail = {};
	userCompany: Company;
	filterInvoice : any = {
		page: 1,
		limitPage: this.pageSize,
		type: 'ALL'
	};

	removeColumns: any = {};
	orderCurrent = null;
	styleCurrent = 'bg-light';

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private invoiceService: InvoiceService,
		private permissionsService: NgxPermissionsService,
  ) { }

  ngOnInit() {
		this.userCompany = (localStorage.getItem('@company-main')) ? JSON.parse(localStorage.getItem('@company-main')) : undefined;
		const permissions = this.permissionsService.getPermissions();
		if (!permissions || !permissions.accessToGlobal) {
			this.createColumns(false);
			this.filterInvoice.owner = true;
		}

		if (this.userCompany && this.userCompany._id) {
			this.filterInvoice.company = this.userCompany._id;
			this.getInvoices(this.filterInvoice);
		}
	}

	createColumns(isAdmin) {
		try {
			if (!isAdmin) {
				this.removeColumns.owner = true;

				this.displayedColumns = [
					'status',
					'date',
					'destiny',
					'amount',
					'detail',
				];
			}
		} catch (err) {}
	}

  changePage(event) {
		this.filterInvoice.limitPage = event.pageSize;
		this.filterInvoice.page = event.pageIndex + 1;
		this.getInvoices(this.filterInvoice);
	}

	async getInvoices(filter) {
		const self = this;
		const ELEMENT_DATA = [];

		this.invoiceService.getInvoices().subscribe((data: any) => {
			if (data) {
				data.forEach((item: any) => {
					if (filter.owner) {
						if (filter.company === item._id.company._id) {
							if (moment(`${item._id.year}-${item._id.month}-${item._id.day}`, "YYYY-MM-DD").fromNow().match('ago') && item.debitPrice > 0) {
								ELEMENT_DATA.push({
									id: Math.random().toString(12).substring(0),
									statusInvoice: "CONFIRMED",
									debitPrice: item.debitPrice || 0,
									porcent: item.payments[0].feeDebitPrice || null,
									typeInvoice: "debitPrice",
									ownerCompany: item._id.company.name,
									person: "Toop Delivery",
									dateOrder: moment(
										`2020-${item._id.month}-${item._id.day + 1}`,
										"YYYYMMDD"
									).format(),
								});
							}

							if (item.payments) {
								item.payments.forEach((payment: any) => {
									ELEMENT_DATA.push({
										id: Math.random().toString(12).substring(0),
										statusInvoice: payment?.invoice?.statusInvoice || null,
										amount: payment.totalCompany,
										typeInvoice: 'amount',
										createdAt: payment.createdAt,
										orderId: payment?.order?._id || null,
										methodPayment: payment.payload?.Payment?.Type || null,
										ownerCompany: payment.customer?.person[0]?.name || null,
										company: null,
										ownerPerson: null,
										person: item._id.company.name,
										dateOrder: payment.createdAt,
									});
								});
							}
						}
					} else {
						if (moment(`${item._id.year}-${item._id.month}-${item._id.day}`, "YYYY-MM-DD").fromNow().match('ago') && item.debitPrice > 0) {
							ELEMENT_DATA.push({
								id: Math.random().toString(12).substring(0),
								statusInvoice: "CONFIRMED",
								debitPrice: item.debitPrice || 0,
								porcent: item.payments[0].feeDebitPrice || null,
								typeInvoice: "debitPrice",
								ownerCompany: item._id.company.name,
								person: "Toop Delivery",
								dateOrder: moment(
									`2020-${item._id.month}-${item._id.day + 1}`,
									"YYYYMMDD"
								).format(),
							});
						}

						if (item.payments) {
							item.payments.forEach((payment: any) => {
								ELEMENT_DATA.push({
									id: Math.random().toString(12).substring(0),
									statusInvoice: payment?.invoice?.statusInvoice || null,
									amount: payment.totalCompany,
									typeInvoice: 'amount',
									createdAt: payment.createdAt,
									orderId: payment?.order?._id || null,
									methodPayment: payment.payload?.Payment?.Type || null,
									ownerCompany: payment.customer?.person[0]?.name || null,
									company: null,
									ownerPerson: null,
									person: item._id.company.name,
									dateOrder: payment.createdAt,
								});
							});
						}
					}
				});
			}

			self.dataSource = new MatTableDataSource(ELEMENT_DATA);
			this.changeDetectorRefs.detectChanges();
		});
	}

	async detailModalShow (content: any, item: any ) {
		const self = this;

		this.invoiceService.detailInvoice(item.id).subscribe((data: any) => {
			self.detail = data;
		});

		this.modalService.open(content, { ariaLabelledBy: 'modal-detail-invoice', size: 'lg' }).result.then((result) => {
    }, (reason) => {})
	}

	checkPrevOrder (orderId) {
		if (orderId === "debitPrice") {
			return (this.styleCurrent = "bg-secondary");
		}

		return this.styleCurrent = 'bg-light'
	}

  closeAlert() {
    this.alert = null;
  }

  ngAfterViewInit() {
  }

}
