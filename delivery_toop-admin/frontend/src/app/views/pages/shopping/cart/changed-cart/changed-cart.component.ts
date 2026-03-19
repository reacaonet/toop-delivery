import {
	Component,
	OnInit,
	OnChanges,
	SimpleChanges,
	ChangeDetectorRef,
	Input,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CartItemService } from '../../../../../services/cart/cart-item.service';

@Component({
  selector: 'kt-changed-cart',
  templateUrl: './changed-cart.component.html',
  styleUrls: ['./changed-cart.component.scss']
})
export class ChangedCartComponent implements OnInit, OnChanges {

	@Input()
  order: any;

	open = false;
	load = false;
	alter = [];
	cartItens = [];

  constructor(
		private changeDetectorRefs: ChangeDetectorRef,
		private toastr: ToastrService,
		private cartItemService: CartItemService,
	) {}

  ngOnInit(): void { }

	ngOnChanges(changes: SimpleChanges): void {
		// if (changes.order) {
		// 	console.log('orderm alterada', changes.order);
		// }

		this.open = false;
		this.load = false;
		this.alter = [];
	}


	async getItensChanged() {
		try {
			this.open = false;
			this.load = true;

			let response: any =
				await this.cartItemService.showAll(this.order.shoppingCart).toPromise();
			for (const cardType in response) {
				if (response[cardType] && response[cardType].length > 0) {
					for (const item of response[cardType]) {
						item.product.image = null;
						if (item.product.images && item.product.images.length > 0) {
							item.product.image = item.product.images[0];
						}

						item.product.total = item.product.price * item.product.amount;

						if (item.isEditable === true) {
							item.editableItem.image = null;
							if (item.editableItem.images && item.editableItem.images.length > 0) {
								item.editableItem.image = item.editableItem.images[0];
							}

							item.editableItem.total = item.editableItem.price * item.editableItem.amount;
							this.alter.push(item.editableItem);
						}
					}
				}
			}

			this.cartItens = response;
			this.open = true;
			this.load = false;
			this.changeDetectorRefs.detectChanges();
		} catch (err) {
			console.log('err', err);
			if (err.error && err.error.message) {
				this.toastr.warning(err.error.message, '', { timeOut: 8000 });
			} else {
				this.toastr.warning('Não foi possível processar lista');
			}
		}
	}
}
