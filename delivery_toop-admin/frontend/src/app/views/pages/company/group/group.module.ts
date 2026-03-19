import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { NgbModalModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { GroupComponent } from './group.component';

@NgModule({
	declarations: [
		GroupComponent,
	],
	imports: [
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		MatDialogModule,
		MatRippleModule,
		CommonModule,
		MatAutocompleteModule,
		MatPaginatorModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModalModule,
		NgbAlertModule,
		TranslateModule,
		RouterModule.forChild([
			{
				path: '',
				component: GroupComponent
			},
		]),
	],
	providers: [
		MatIconRegistry,
		{ provide: MatBottomSheetRef, useValue: {} },
		{ provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
		{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
		{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },

	],
})

export class GroupModule { }
