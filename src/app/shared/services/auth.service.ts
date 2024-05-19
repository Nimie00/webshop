import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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
            map(firestoreUser => {
              if (firestoreUser) {
                return {
                  ...firestoreUser,
                  id: user.uid,
                  email: user.email || '',
                };
              } else {
                // Ha nem található a Firestore-ban a felhasználó, akkor hozzuk létre
                const newUser: User = {
                  id: user.uid,
                  email: user.email || '',
                  isAdmin: false,
                  username: user.email?.split('@')[0] || ''
                };
                this.createUser(newUser);
                return newUser;
              }
            })
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

  isUserLoggedIn(): Observable<boolean> {
    return this.auth.authState.pipe(map(user => !!user));
  }

  logout() {
    return this.auth.signOut();
  }

  getUser(): Observable<User | null> {
    return this.user$;
  }

  createUser(user: User) {
    return this.afs.doc(`users/${user.id}`).set(user);
  }

  isAdmin(user: User): boolean {
    return user.isAdmin;
  }

  getUserById(userId: string): Observable<User | undefined> {
    return this.afs.doc<User>(`users/${userId}`).valueChanges();
  }
}
