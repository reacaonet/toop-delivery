// Angular
import { Component, OnInit } from '@angular/core';
// Object-Path
import * as objectPath from 'object-path';
import path from 'path';

import { environment } from '../../../../environments/environment';
// Layout
import { LayoutConfigService } from '../../../core/_base/layout';
// import * as packageJson from './../../../../../package.json';

@Component({
  selector: 'kt-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  // Public properties
  today: number = Date.now();
  fluid: boolean;

  public appVersion;

 /**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayouConfigService
	 */
  constructor(private layoutConfigService: LayoutConfigService) {
  }

 /**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

 /**
	 * On init
	 */
  ngOnInit(): void {
    // this.appVersion = environment.appVersion;
    this.appVersion = '';

    const config = this.layoutConfigService.getConfig();
    // footer width fluid
    this.fluid = objectPath.get(config, 'footer.self.width') === 'fluid';
  }
}
