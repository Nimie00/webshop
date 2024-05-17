// comment.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Comment } from '../models/Comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  collectionName = 'comments';

  constructor(private afs: AngularFirestore) { }

  getCommentsByProductId(productId: number) {
    return this.afs.collection<Comment>(this.collectionName, ref => ref.where('productId', '==', productId)).valueChanges({ idField: 'id' });
  }

  createComment(comment: Comment) {
    return this.afs.collection<Comment>(this.collectionName).doc(comment.id.toString()).set(comment);
  }

  updateComment(comment: Comment) {
    return this.afs.collection<Comment>(this.collectionName).doc(comment.id.toString()).set(comment);
  }

  deleteComment(commentId: number) {
    return this.afs.collection<Comment>(this.collectionName).doc(commentId.toString()).delete();
  }
}
