import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    rePassword: new FormControl('')
  });

  constructor(private router: Router, private location: Location, private authService: AuthService, private userService: UserService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log(this.registerForm.value);
    this.authService.register(this.registerForm.get('email')?.value as string, this.registerForm.get('password')?.value as string)
      .then((cred) => {
        console.log(cred);
        const user: User = {
          id: cred.user?.uid as string,
          email: this.registerForm.get('email')?.value as string,
          username: (this.registerForm.get('email')?.value as string).split('@')[0],
          isAdmin: false,
        };
        this.userService.create(user)
          .then((_) => {
            console.log('User added successfully.');
            alert('Registration successful, you will be transported to /login after clicking ok');

            setTimeout(() => {
              this.router.navigateByUrl('/login');
            }, 200); // 3000 ms = 3 seconds
          })
          .catch((error) => {
            console.log(error);
            alert(error);
          });
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }


  goBack() {
    this.location.back();
  }

}
