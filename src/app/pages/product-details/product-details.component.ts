import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { CommentService } from '../../shared/services/comment.service';
import { OrderService } from '../../shared/services/order.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from '../../shared/services/auth.service';
import { Product } from '../../shared/models/Product';
import { Comment } from '../../shared/models/Comment';
import { switchMap, tap } from 'rxjs/operators';
import { of, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  productImageUrl?: string;
  userId?: string;
  hasOrdered = false;
  rating = 0;
  comments: Comment[] = [];
  userComment?: Comment;
  userMap: { [key: string]: string } = {};
  newRating: number = 0;
  newComment: string = '';
  currentPage = 1;
  commentsPerPage = 5;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private commentService: CommentService,
    private orderService: OrderService,
    private storage: AngularFireStorage,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getUser().pipe(
      tap(user => {
        if (user) {
          this.userId = user.id;
        }
      }),
      switchMap(() => {
        return this.route.paramMap;
      }),
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.productService.getProductById(Number(id));
        } else {
          return of(null);
        }
      }),
      tap(product => {
        if (product) {
          this.product = product;
          this.loadComments(product.id);
          this.checkUserComment();
        }
      })
    ).subscribe({
      next: (product) => {
        this.product = product ?? undefined;
        if (this.product?.id && this.userId) {
          this.checkIfOrdered(this.userId, this.product.id);
        }
        if (product?.imageId) {
          const imgRef = this.storage.ref(`images/${product.imageId}.png`);
          lastValueFrom(imgRef.getDownloadURL()).then(url => {
            this.productImageUrl = url;
          }).catch(error => {
            console.log('Failed to get download URL:', error);
          });
        }
      },
      error: (error) => {
        console.log('Error in ngOnInit:', error);
      }
    });
  }

  loadComments(productId: string, startAfterDate?: number): void {
    this.commentService.getLatestCommentsByProductId(productId, this.commentsPerPage, startAfterDate).subscribe(comments => {
      this.comments = comments;
      this.comments.forEach(comment => {
        this.authService.getUserById(comment.userId).subscribe(user => {
          this.userMap[comment.userId] = user?.username || 'Unknown user';
        });
      });
    });
  }

  submitComment(): void {
    if (this.newRating > 0 && this.newComment.trim().length > 0) {
      if (!this.userId || !this.product?.id) {
        console.log('Missing userId or productId');
        return;
      }
      const comment: Comment = {
        id: this.userComment?.id || this.commentService.createIdd(),
        userId: this.userId,
        productId: this.product.id,
        comment: this.newComment,
        date: Date.now(),
        rating: this.newRating
      };

      if (this.userComment) {
        this.commentService.updateComment(comment).then(() => {
          this.loadComments(this.product!.id); // Frissítjük a kommenteket
          this.newRating = 0;
          this.newComment = '';
          this.userComment = undefined;
        }).catch(error => {
          console.log('Error occurred while updating the review:', error);
          alert(error);
        });
      } else {
        this.commentService.addComment(comment).then(() => {
          this.loadComments(this.product!.id); // Frissítjük a kommenteket
          this.newRating = 0;
          this.newComment = '';
          this.userComment = comment; // Beállítjuk a userComment változót, hogy a felhasználó frissíthesse vagy törölhesse az értékelést
        }).catch(error => {
          console.log('Error occurred while saving the review:', error);
          alert(error);
        });
      }
    } else {
      alert('Kérjük, töltse ki az értékelést és a megjegyzést!');
    }
  }

  deleteComment(): void {
    if (this.userComment) {
      this.commentService.deleteComment(this.userComment.id).then(() => {
        this.userComment = undefined;
        this.newRating = 0;
        this.newComment = '';
        this.loadComments(this.product!.id); // Frissítjük a kommenteket
      }).catch(error => {
        console.log('Error occurred while deleting the review:', error);
        alert(error);
      });
    }
  }

  getUsernameById(userId: string): string {
    return this.userMap[userId] || 'Ismeretlen felhasználó';
  }

  checkIfOrdered(userId: string, productId: string) {
    this.orderService.checkIfOrdered(userId, productId).subscribe({
      next: (hasOrdered) => {
        this.hasOrdered = hasOrdered;
      },
      error: (error) => {
        console.log('Error checking if ordered:', error);
      }
    });
  }

  checkUserComment(): void {
    if (this.userId && this.product) {
      this.commentService.checkUserComment(this.userId, this.product.id).subscribe(comment => {
        this.userComment = comment ?? undefined;
        if (this.userComment) {
          this.newRating = this.userComment.rating;
          this.newComment = this.userComment.comment;
        }
      });
    }
  }

  orderProduct() {
    if (this.userId && this.product) {
      this.orderService.createOrder(this.userId, this.product.id.toString()).then(() => {
        alert('Product ordered successfully!');
        this.hasOrdered = true;
      }).catch(error => {
        console.log('Error ordering product:', error);
      });
    }
  }

  cancelOrder() {
    if (this.userId && this.product) {
      this.orderService.cancelOrder(this.userId, this.product.id.toString()).then(() => {
        alert('Order cancelled successfully!');
        this.hasOrdered = false;
      }).catch(error => {
        console.log('Error cancelling order:', error);
      });
    }
  }

  nextPage() {
    if (this.comments.length > 0) {
      const lastCommentDate = this.comments[this.comments.length - 1].date;
      this.currentPage++;
      this.loadComments(this.product!.id, lastCommentDate);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadComments(this.product!.id);
    }
  }
}

