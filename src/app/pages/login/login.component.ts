import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { FakeLoadingService } from '../../shared/services/fake-loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  email = new FormControl('');
  password = new FormControl('');

  loadingSubscription?: Subscription;
  loadingObservation?: Observable<boolean>;

  loading: boolean = false;

  constructor(private router: Router, private loadingService: FakeLoadingService, private authService: AuthService) { }

  ngOnInit(): void {
  }

  async login() {
    this.loading = true;
      this.authService.login(this.email.value as string, this.password.value as string).then(cred => {
        alert('Login successful, you will be transported to /main after clicking ok');

        setTimeout(() => {
          this.router.navigateByUrl('/main');
        }, 200); // 3000 ms = 3 seconds
        this.loading = false;
      }).catch(error => {
        console.log(error);
        alert(error);
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.loadingSubscription?.unsubscribe();
  }

}
