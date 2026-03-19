import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-print',
  templateUrl: './print-supermarket.component.html',
  styleUrls: ['./print-supermarket.component.scss']
})
export class PrintSupermarketComponent implements OnInit {
	order = null;
	currentDate = new Date();

  constructor() { }

  ngOnInit() {
		this.order = localStorage.getItem('@print-order');

		if (this.order !== null) {
			this.order = JSON.parse(this.order);
			// console.log('Print Order Supermarket', this.order);

			setTimeout(() => {
				window.print();
			}, 1500);
		} else {
			window.close();
		}
	}

	// async getCartDetails() {
	// 	const cartDetails: any = await this.shoppingService
	// 	.getOrderById(cart._id)
	// 	.toPromise();
	// }

}
