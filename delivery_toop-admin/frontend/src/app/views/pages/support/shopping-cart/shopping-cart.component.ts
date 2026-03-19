import {
	Component,
	OnInit,
	OnDestroy,
	ChangeDetectorRef,
	ViewChild,
	Directive,
} from "@angular/core";
import { ShoppingService } from "./../../../../services/shopping/shopping.service";

@Component({
	selector: "kt-shopping-cart",
	templateUrl: "./shopping-cart.component.html",
	styleUrls: ["./shopping-cart.component.scss"],
})
export class ShoppingCartsComponent implements OnInit {
	dataCartsList = [];

	timeLeft: number = 30;

	constructor(
		private ShoppingService: ShoppingService,
		private changeDetectorRefs: ChangeDetectorRef
	) {}

	async getCarts() {
		const ELEMENT_DATA = [];
		const data: any = await this.ShoppingService.getAllCarts().toPromise();

		for (let carts of data) {
			ELEMENT_DATA.push({
				_id: carts._id,
				isDeleted: carts.isDeleted,
				status: carts.status,
				person: carts.person[0] ? carts.person[0].name : "",
				company: carts.company[0].name ? carts.company[0].name : "",
				fingerPrint: carts.fingerPrintId ? true : false,
				tip: carts.tip ? carts.tip : "",
				updatedAt: carts.updatedAt ? carts.updatedAt : "",
			});

			this.dataCartsList = ELEMENT_DATA;
			this.changeDetectorRefs.detectChanges();
		}
	}

	ngOnInit() {
		this.getCarts();
	}

	ngAfterViewInit() {
		setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
				if (document.getElementById("timer")) {
					document.getElementById(
						"timer"
					).innerHTML = `Atualiza em ${this.timeLeft.toString()} segundos`;
				}
			} else {
				this.timeLeft = 30;
				this.getCarts();
			}
		}, 1000);
	}
}
