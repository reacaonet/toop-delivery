import { Component, OnInit, Input } from '@angular/core';
import {Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FinanceSplitService } from '../../../../../services/finance/split.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'kt-split-braspag',
  templateUrl: './split-braspag.component.html',
  styleUrls: ['./split-braspag.component.scss']
})
export class SplitBraspagComponent implements OnInit {

	@Input()
	transaction: any;
	userLogged = null;
	load = false;

	splitForm = this.fb.group({
		total: ['', [
			Validators.required,
			Validators.min(1),
		]],
		password: ['', [
			Validators.required,
			Validators.minLength(3),
		]],
		company: this.fb.group({
			subordinateId: ['', []],
			amount: ['', []],
			mdr: [environment.mdr, []],
			fee: ['0', []],
		}),
		deliveryMan: this.fb.group({
			subordinateId: ['', []],
			amount: ['', []],
			mdr: ['', []],
			fee: ['', []],
		}),
	});

  constructor(
		private fb: FormBuilder,
		private toastr: ToastrService,
		private splitService: FinanceSplitService,
		private modalService: NgbModal,
	) { }

  ngOnInit(): void {
		this.userLogged = (localStorage.getItem('@user-logged')) ? JSON.parse(localStorage.getItem('@user-logged')) : undefined;

		if (this.transaction && this.transaction.total) {
			this.splitForm.patchValue({
				total: this.transaction.total,
				company: {
					amount: this.transaction.total
				}
			});
		}

		if (this.transaction && this.transaction.mdr) {
			this.splitForm.get('total').setValue(this.transaction.total);
			this.splitForm.patchValue({
				company: {
					mdr: this.transaction.mdr
				}
			});
		}

		if (this.transaction && this.transaction.cieloMerchantId) {
			this.splitForm.patchValue({
				company: {
					subordinateId: this.transaction.cieloMerchantId
				}
			});
		}
  }

	async sendSplit() {
		try {
			this.load = true;

			if (this.splitForm.invalid) {
				this.toastr.warning('Informe os dados corretamente...');
				this.load = false;
				return;
			}

			let params: any = {};

			let total = this.splitForm.get('total').value;
			let password = this.splitForm.get('password').value;

			// if (password !== 'duW34AoMdf185673') {
			// 	this.load = false;
			// 	return this.toastr.error('Senha incorreta');
			// }

			let paymentId = this.transaction.PaymentId;
			let idUser = this.userLogged.id

			params.idUser = idUser;

			let company = this.splitForm.get('company').value;
			let deliveryMan = this.splitForm.get('deliveryMan').value;

			params.total = total;
			params.password = password;
			params.payload = [];

			if (company.subordinateId && company.amount && company.mdr && company.fee) {
				params.payload.push({
					subordinateId: company.subordinateId,
					amount: company.amount,
					mdr: company.mdr,
					fee: company.fee,
				});
			}

			if (deliveryMan.subordinateId && deliveryMan.amount && deliveryMan.mdr && deliveryMan.fee) {
				params.payload.push({
					subordinateId: deliveryMan.subordinateId,
					amount: deliveryMan.amount,
					mdr: deliveryMan.mdr,
					fee: deliveryMan.fee,
				});
			}

			if (params.payload.length <= 0) {
				this.toastr.warning('Informe pelo menos um Split de Empresa ou Entregador');
				this.load = false;
				return;
			}

			const respons = await this.splitService.sendSplit(paymentId, params).toPromise();
			// console.log('Response', respons);
			this.toastr.success('Divisão feita com sucesso!!');
			this.modalService.dismissAll();
		} catch (err) {
			console.log('Error', err);
			this.load = false;
			let message = 'Falha na divisão do Split';

			if (err.error && err.error.message) {
				message = err.error.message;
			}

			this.toastr.error(message);
		}
	}

}
