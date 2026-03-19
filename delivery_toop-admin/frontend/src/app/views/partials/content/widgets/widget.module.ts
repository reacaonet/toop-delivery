import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CoreModule } from '../../../../core/core.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// General widgets
import { Widget1Component } from './widget1/widget1.component';
import { Widget4Component } from './widget4/widget4.component';
import { Widget5Component } from './widget5/widget5.component';
import { Widget12Component } from './widget12/widget12.component';
import { Widget14Component } from './widget14/widget14.component';
import { Widget26Component } from './widget26/widget26.component';
import { Timeline2Component } from './timeline2/timeline2.component';

@NgModule({
  declarations: [
    // Widgets
    Widget1Component,
    Widget4Component,
    Widget5Component,
    Widget12Component,
    Widget14Component,
    Widget26Component,
    Timeline2Component,
  ],
  exports: [
    // Widgets
    Widget1Component,
    Widget4Component,
    Widget5Component,
    Widget12Component,
    Widget14Component,
    Widget26Component,
    Timeline2Component,
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    MatTableModule,
    CoreModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
  ]
})
export class WidgetModule {
}
