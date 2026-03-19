// Angular
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Layout
import { LayoutConfigService } from '../../../../../core/_base/layout';

export interface Widget4Data {
	icon?: string;
	pic?: string;
	title?: string;
	date?: string;
	username?: string;
	desc?: string;
	url?: string;
	consumer?: string;
	photo?: string;
	street?: string;
	value?: number;
	situation?: boolean;
}

@Component({
	selector: 'kt-widget4',
	templateUrl: './widget4.component.html',
	styleUrls: ['./widget4.component.scss']
})
export class Widget4Component implements OnInit {
	// Public properties
	@Input() data: Widget4Data[];

	@ContentChild('actionTemplate', { static: true }) actionTemplate: TemplateRef<any>;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// dummy data
		if (!this.data) {
			this.data = shuffle([
				{
					pic: './assets/media/files/doc.svg',
					title: 'Nenhum registro encontrado',
					url: 'https://keenthemes.com.my/metronic',
				}
			]);
		}
	}
}
