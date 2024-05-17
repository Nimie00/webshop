import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  registerForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    rePassword: new FormControl('')
  });

  constructor(private location: Location, private authService: AuthService, private userService: UserService) { }

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
        };
        this.userService.create(user)
          .then((_) => {
            console.log('User added successfully.');
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }


  goBack() {
    this.location.back();
  }

}
