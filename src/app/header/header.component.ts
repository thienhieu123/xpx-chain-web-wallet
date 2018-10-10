import { Component, OnInit } from '@angular/core';
import { AppConfig, Config } from '../config/app.config';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/services/login.service';
import { Router } from '@angular/router';
import { WalletService } from "../shared";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  header: object;
  isLogged$: Observable<boolean>;
  showMenu = false;
  keyObject = Object.keys;

  constructor(
    private _loginService: LoginService,
    private route: Router,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
  /**
   * array data header
   *
   * @memberof HeaderComponent
   */
    this.header = {
      'createWallet': {
        'type': 'default',
        'name': 'Create wallet',
        'class': '',
        'icon': 'fa fa-envelope',
        'rol': false,
        'link': AppConfig.routes.createWallet,
        'show': true,
        'submenu': {}
      },
      'importWallet': {
        'type': 'default',
        'name': 'Import wallet',
        'class': '',
        'icon': 'fa fa-key',
        'rol': false,
        'link': AppConfig.routes.importWallet,
        'show': true,
        'submenu': {}
      },
      'dashboard': {
        'type': 'dropdown',
        'name': 'dashboard',
        'class': '',
        'icon': 'fa fa-home',
        'rol': false,
        'link': AppConfig.routes.dashboard,
        'show': false,
        'submenu': {
          'dashboard': {
            'type': 'default',
            'name': 'dashboard',
            'class': '',
            'icon': 'fa fa-home',
            'rol': true,
            'link': AppConfig.routes.dashboard,
            'show': true,
            'submenu': {}
          }
        }
      },
      'login': {
        'type': 'default',
        'name': 'login',
        'class': '',
        'icon': 'fa fa-home',
        'rol': false,
        'link': AppConfig.routes.login,
        'show': true,
        'submenu': {}
      },
      'signout': {
        'type': 'default',
        'name': 'signout',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': AppConfig.routes.login,
        'show': true,
        'submenu': {}
      }
    };

    /**
     * Observable state of the login
     *
     * @memberof HeaderComponent
     */
    this.isLogged$ = this._loginService.getIsLogged();
    this.isLogged$.subscribe(
      response => {
        this.showMenu = response;
      }
    );
  }

  /**
   *
   *
   * @param {String} [param]
   * @memberof HeaderComponent
   */
  logout(param?: String) {
    this._loginService.setLogged(false);
    this.route.navigate([`/${param}`]);
  }
}
