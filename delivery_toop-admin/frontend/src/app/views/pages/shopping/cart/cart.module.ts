import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconRegistry } from "@angular/material/icon";
import { NgbModalModule, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
	CurrencyMaskModule,
	CurrencyMaskConfig,
	CURRENCY_MASK_CONFIG,
} from "ng2-currency-mask";
import { PartialsModule } from "./../../../partials/partials.module";

import { MAT_DATE_LOCALE, MatRippleModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
	MatBottomSheetRef,
	MAT_BOTTOM_SHEET_DATA,
} from "@angular/material/bottom-sheet";
import { MatPaginatorModule } from "@angular/material/paginator";

import { MatCheckboxModule } from "@angular/material/checkbox";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { NgxPermissionsModule } from "ngx-permissions";

import { CartComponent } from "./cart.component";
import { OrderUpdateComponent } from "./order-update/order-update.component";
import { QueueDeliveryComponent } from "./queue-delivery/queue-delivery.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { InfiniteScrollModule } from "ngx-infinite-scroll";

// NgBootstrap
import {
	NgbDropdownModule,
	NgbTabsetModule,
	NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { ChangedCartComponent } from "./changed-cart/changed-cart.component";

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
	align: "right",
	allowNegative: false,
	decimal: ",",
	precision: 2,
	prefix: "R$ ",
	suffix: "",
	thousands: ".",
};

@NgModule({
	declarations: [
		CartComponent,
		OrderUpdateComponent,
		QueueDeliveryComponent,
		ChangedCartComponent,
	],
	imports: [
		MatAutocompleteModule,
		MatFormFieldModule,
		PartialsModule,
		NgbDropdownModule,
		NgbTabsetModule,
		NgbTooltipModule,
		MatSelectModule,
		DragDropModule,
		MatPaginatorModule,
		MatInputModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		MatDialogModule,
		MatRippleModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModalModule,
		NgbAlertModule,
		TranslateModule,
		CurrencyMaskModule,
		InfiniteScrollModule,
		RouterModule.forChild([
			{
				path: "",
				component: CartComponent,
			},
		]),
		NgxPermissionsModule.forChild({}),
	],
	providers: [
		MatIconRegistry,
		{ provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
		{ provide: MatBottomSheetRef, useValue: {} },
		{ provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: "en-GB" },
		{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
	],
})
export class CartModule {}
