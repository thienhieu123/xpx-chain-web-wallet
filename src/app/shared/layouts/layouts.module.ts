import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CoreModule } from '../../core/core.module';
import { SidebarAuthComponent } from './headers/sidebar-auth/sidebar-auth.component';
import { WrapperAuthComponent } from './wrappers/wrapper-auth/wrapper-auth.component';
import { SidebarMainComponent } from './headers/sidebar-main/sidebar-main.component';


const components = [
  SidebarAuthComponent,
  WrapperAuthComponent
];

@NgModule({
  imports: [
    CoreModule,
    RouterModule
  ],
  declarations: [
    components,
    SidebarMainComponent
  ],
  exports: [
    components
  ]
})
export class LayoutsModule { }
