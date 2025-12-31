import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MenuComponent } from './menu/menu.component';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, MenuComponent, ButtonModule, DrawerModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  drawerVisible = false;

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.drawerVisible = false; // fecha ao navegar
      });
  }

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }

  logout() {
    this.auth.logout();
  }
}