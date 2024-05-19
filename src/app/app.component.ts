import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';
import { User } from './shared/models/User';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  page = '';
  routes: Array<string> = [];
  loggedInUser?: User | null;  // Saját User típus
  adminUser?: true| false;
  title: any;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.routes = this.router.config.map(conf => conf.path) as string[];

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((evts: any) => {
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if (this.routes.includes(currentPage)) {
        this.page = currentPage;
      }
    });

    // Felhasználói állapot figyelése és beállítása
    this.authService.getUser().subscribe({
      next: (user) => {
        this.loggedInUser = user;
        this.adminUser = !!user?.isAdmin;
        localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      },
      error: (error) => {
        console.log(error);
        localStorage.setItem('user', JSON.stringify(null));
      }
    });
  }

  changePage(selectedPage: string) {
    this.router.navigateByUrl(selectedPage);
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }

  onClose(event: any, sidenav: MatSidenav) {
    if (event === true) {
      sidenav.close();
    }
  }

  logout(_?: boolean) {
    this.authService.logout().then(() => {
      console.log('Logged out successfully.');
      localStorage.removeItem('user');  // Felhasználói adatok eltávolítása kijelentkezéskor
      this.router.navigate(['/']);  // Navigáció az alapértelmezett oldalra kijelentkezés után
    }).catch(error => {
      console.log(error);
    });
  }
}
