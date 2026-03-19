import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from "@angular/material/dialog";
import { MatIconRegistry } from "@angular/material/icon";
import { NgbModalModule, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatPaginatorModule } from "@angular/material/paginator";

import { MAT_DATE_LOCALE, MatRippleModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { MatCheckboxModule } from "@angular/material/checkbox";

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { NgxMaskModule } from "ngx-mask";

import { CityComponent, EditClientDialog } from "./city.component";

@NgModule({
	imports: [
		MatAutocompleteModule,
		MatFormFieldModule,
		MatSelectModule,
		MatInputModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		MatDialogModule,
		MatPaginatorModule,
		MatRippleModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModalModule,
		NgbAlertModule,
		NgxMaskModule.forRoot(),
		TranslateModule,
		RouterModule.forChild([
			{
				path: "",
				component: CityComponent,
			},
		]),
	],
	declarations: [CityComponent, EditClientDialog],
	entryComponents: [EditClientDialog],
	providers: [
		MatIconRegistry,
		{ provide: MatBottomSheetRef, useValue: {} },
		{ provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: "en-GB" },
		{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
		{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
	],
})
export class CityModule {}
