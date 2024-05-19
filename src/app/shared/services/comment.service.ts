import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Comment } from '../models/Comment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private collectionName = 'comments';

  constructor(private afs: AngularFirestore) {}

  getCommentsByProductId(productId: string): Observable<Comment[]> {
    return this.afs.collection<Comment>(this.collectionName, ref => ref.where('productId', '==', productId)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Comment;
        return { ...data };
      }))
    );
  }

  getLatestCommentsByProductId(productId: string, limit: number, startAfterDate?: number): Observable<Comment[]> {
    let query = this.afs.collection<Comment>(this.collectionName, ref =>
      ref.where('productId', '==', productId)
        .orderBy('date', 'desc')
        .limit(limit)
    );

    if (startAfterDate) {
      query = this.afs.collection<Comment>(this.collectionName, ref =>
        ref.where('productId', '==', productId)
          .orderBy('date', 'desc')
          .startAfter(startAfterDate)
          .limit(limit)
      );
    }

    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Comment;
        return { ...data };
      }))
    );
  }

  addComment(comment: Comment): Promise<void> {
    const id = comment.id || this.createIdd();
    return this.afs.collection<Comment>(this.collectionName).doc(id).set(comment);
  }

  updateComment(comment: Comment): Promise<void> {
    console.log(`Updating comment: ${comment.id}`, comment);
    return this.afs.collection<Comment>(this.collectionName).doc(comment.id).set(comment);
  }

  deleteComment(commentId: string): Promise<void> {
    console.log(`Deleting comment: ${commentId}`);
    return this.afs.collection<Comment>(this.collectionName).doc(commentId).delete();
  }

  checkUserComment(userId: string, productId: string): Observable<Comment | null> {
    return this.afs.collection<Comment>(this.collectionName, ref => ref.where('userId', '==', userId).where('productId', '==', productId)).snapshotChanges().pipe(
      map(actions => {
        if (actions.length === 0) {
          return null;
        } else {
          const data = actions[0].payload.doc.data() as Comment;
          return { ...data };
        }
      })
    );
  }

  createIdd(): string {
    return this.afs.createId();
  }
}
