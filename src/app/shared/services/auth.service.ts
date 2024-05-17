import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: AngularFireAuth, private afs: AngularFirestore) {
    this.user$ = this.auth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges().pipe(
            map(userData => ({ ...userData, id: user.uid }) as User)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  isUserLoggedIn() {
    return this.auth.user;
  }

  logout() {
    return this.auth.signOut();
  }

  getUser(): Observable<User | null> {
    return this.user$;
  }
}
