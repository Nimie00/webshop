import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
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
          return this.getUserById(user.uid).pipe(
            switchMap(firestoreUser => {
              if (firestoreUser) {
                return this.isAdmin(user.uid).pipe(
                  map(isAdmin => ({
                    ...firestoreUser,
                    id: user.uid,
                    email: user.email || '',
                    isAdmin: isAdmin,
                  }))
                );
              } else {
                // Ha nem található a Firestore-ban a felhasználó, akkor hozzuk létre
                const newUser: User = {
                  id: user.uid,
                  email: user.email || '',
                  isAdmin: false, // Az alapértelmezett érték legyen false
                  username: user.email?.split('@')[0] || ''
                };
                return from(this.createUser(newUser)).pipe(
                  switchMap(() => this.isAdmin(user.uid)),
                  map(isAdmin => {
                    console.log('New user created in Firestore:', newUser);
                    return {
                      ...newUser,
                      isAdmin: isAdmin,
                    };
                  }),
                  catchError(error => {
                    console.log('Error creating new user:', error);
                    return of(null);
                  })
                );
              }
            }),
            catchError(error => {
              console.log('Error fetching user from Firestore:', error);
              return of(null);
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

  createUser(user: User): Promise<void> {
    return this.afs.doc(`users/${user.id}`).set(user);
  }

  isAdmin(userId: string): Observable<boolean> {
    return this.afs.collection('Users').doc<User>(userId).valueChanges().pipe(
      map(user => {
        const isAdmin = user?.isAdmin ?? false;
        console.log(`Fetched admin status for user ${userId}: ${isAdmin}`);
        return isAdmin;
      })
    );
  }

  getUserById(userId: string): Observable<User | null> {
    return this.afs.collection('Users').doc<User>(userId).valueChanges().pipe(
      map(user => {
        if (user) {
          return {
            ...user,
            id: userId,
            username: user.username,
            isAdmin: user.isAdmin ?? false
          };
        } else {
          return null;
        }
      })
    );
  }
}
