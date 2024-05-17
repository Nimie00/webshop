import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { CommentService } from '../../shared/services/comment.service';
import { AuthService } from '../../shared/services/auth.service';
import { Product } from '../../shared/models/Product';
import { Comment } from '../../shared/models/Comment';
import { OrderService } from '../../shared/services/order.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  comments: Comment[] = [];
  isLoggedIn = false;
  userId: number | undefined;
  commentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private commentService: CommentService,
    private authService: AuthService,
    public orderService: OrderService, // Change to public
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(user => {
      this.isLoggedIn = !!user;
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
      this.authService.getUser().subscribe(user => {
        this.userId = parseInt(<string>user?.id);
        this.loadProduct();
      });
    });
  }

  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(Number(id)).subscribe(data => {
        if (data) {
          this.product = data as Product;
          this.loadComments();
        }
      });
    }
  }

  loadComments() {
    if (this.product) {
      this.commentService.getCommentsByProductId(this.product.id).subscribe(data => {
        this.comments = data as Comment[];
      });
    }
  }

  addComment() {
    if (this.product && this.userId) {
      const newComment: Comment = {
        id: Date.now(),
        userId: this.userId,
        productId: this.product.id,
        username: '', // Add the current user's username here
        comment: this.commentForm.value.commentText,
        date: Date.now()
      };
      this.commentService.createComment(newComment).then(() => {
        this.commentForm.reset();
        this.loadComments();
      });
    }
  }
}
