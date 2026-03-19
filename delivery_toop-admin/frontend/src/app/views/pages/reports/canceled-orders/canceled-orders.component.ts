import {
	Component,
	OnInit,
	AfterViewInit,
	ChangeDetectorRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormControl } from "@angular/forms";
import moment from "moment";

import { ShoppingService } from "./../../../../services/shopping/shopping.service";
import { ExcelService } from "./../../../../services/excel/excel.service";

@Component({
	selector: "kt-customer",
	templateUrl: "./canceled-orders.component.html",
	styleUrls: ["./canceled-orders.component.scss"],
})
export class CustomerComponent implements OnInit, AfterViewInit {
	childmessage = false;
	dataSource;
	displayedColumns = ["createdAt", "customer", "type", "company", "value"];
	formData;
	pageSize = 20;
	pageLimit: number[] = [20, 50, 100];
	totalLength;
	exporting: Boolean = false;

	constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private modalService: NgbModal,
		private shoppingService: ShoppingService,
		private excelService: ExcelService
	) {}

	ngOnInit() {
		this.getListReports(1, this.pageSize);
	}

	changePage(event) {
		this.pageSize = event.pageSize;
		this.getListReports(event.pageIndex + 1, event.pageSize);
	}

	async getListReports(page, limit) {
		const self = this;
		const ELEMENT_DATA = [];

		this.shoppingService
			.getOrders(page, limit, "ALL", "CANCELED", "", true)
			.subscribe((data: any) => {
				// console.log('data', data)

				self.dataSource = new MatTableDataSource(ELEMENT_DATA);

				if (data.list && Array.isArray(data.list)) {
					data.list.forEach((reports, index) => {
						console.log(reports);

						ELEMENT_DATA.push({
							_id: reports._id,
							company: reports.company,
							customer: reports.customer,
							order_number: reports.order_number,
							customerDelivery: reports.customerDelivery,
							createdAt: moment(reports.createdAt)
								.utc()
								.subtract(3, "hours")
								.format("DD/MM/YYYY HH:mm"),
							payment: reports.payment,
							typePayment: this.getPaymentType(reports.typePayment),
						});
					});
					self.dataSource = new MatTableDataSource(ELEMENT_DATA);
					self.totalLength = data.total;
					this.changeDetectorRefs.detectChanges();
				}
			});
	}

	async viewModalShow(content, report) {
		this.modalService
			.open(content, { ariaLabelledBy: "modal-view-order", size: "lg" })
			.result.then(
				(result) => {},
				(reason) => {}
			);
	}

	ngAfterViewInit() {}

	async generateExcel(page = 1, size = 500) {
		try {
			const title = `financeiro_page_${page}`;
			this.exporting = true;

			const response: any = await this.shoppingService
				.getOrders(page, size, "ALL", "CANCELED", "", true)
				.toPromise();

			const respJson: any = [];

			if (
				response &&
				response.list &&
				Array.isArray(response.list) &&
				response.list.length > 0
			) {
				response.list.forEach((reports) => {
					respJson.push({
						EMPRESA: reports.company?.name,
						CLIENTE: reports.customer?.person[0]?.name,
						"Nº DA ORDEM": reports.order_number,
						DATA: moment(reports.createdAt)
							.utc()
							.subtract(3, "hours")
							.format("DD/MM/YYYY HH:mm"),
						"TIPO DE PAGAMENTO": this.getPaymentType(reports.typePayment),
						"VALOR DO PEDIDO": reports.payment.total.toLocaleString("pt-br", {
							style: "currency",
							currency: "BRL",
						}),
						"CARTÃO FINAL": reports?.payment?.card_last_digits ?? "-",
						"NOME IMPRESSO NO CARTÃO":
							reports?.payment?.card_holder_name ?? "-",
						"BANDEIRA DO CARTÃO": reports?.payment?.card_brand ?? "-",
						"CÓD. DA TRANSAÇÃO": reports?.payment?.paymentProviderId ?? "-",
						"ID DO CARRINHO": reports?.shoppingCart?._id ?? "-",
					});
				});
			} else {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			if (!respJson || !Array.isArray(respJson) || respJson.length <= 0) {
				this.exporting = false;
				this.changeDetectorRefs.detectChanges();
				return;
			}

			const isSave = await this.saveExcel(respJson, title);
			if (isSave) {
				return await this.generateExcel(page + 1, size);
			}
		} catch (err) {
			this.exporting = false;
			this.changeDetectorRefs.detectChanges();
			console.log("Failt generateExcel", err);
		}
	}

	async saveExcel(json: any, title: string) {
		try {
			this.excelService.exportAsExcelFile(json, title);
			return true;
		} catch (err) {
			return false;
		}
	}

	getPaymentType(type) {
		switch (type) {
			case "BRASPAG":
				return "Cartão APP";
			case "PAGARME":
				return "Cartão APP";
			case "CARD":
				return "Cartão no local";
			case "MONEY":
				return "Dinheiro";
			case "PIX":
				return "PIX";
		}
	}
}
