import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {
	order = null;
	currentDate = new Date();
	total = 0;

  constructor() { }

  ngOnInit() {
		if (this.order !== null) {
			this.order = JSON.parse(this.order);

		const userStorage = localStorage.getItem("@user-info")
		? JSON.parse(localStorage.getItem("@user-info"))
		: undefined;
		this.order = localStorage.getItem('@print-order');


			setTimeout(() => {
				window.print();
			}, 1500);
		} else {
			window.close();
		}
	}

}
