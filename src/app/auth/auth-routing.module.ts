import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './views/auth/auth.component';

const routes: Routes = [{
  path: '',
  component: AuthComponent,
  data: {
    meta: {
      title: 'auth.title',
      description: 'auth.text',
      override: true,
    },
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
