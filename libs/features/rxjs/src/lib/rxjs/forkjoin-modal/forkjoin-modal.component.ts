import { Component, inject } from "@angular/core";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SwitchMapService } from "../../services/switchmap.service";
import { forkJoin, map } from "rxjs";

@Component({
    selector: 'forkjoin-modal',
    templateUrl: `./forkjoin-modal.component.html`,
    styleUrls: ['./forkjoin-modal.component.scss'],
    imports: [MatIconModule,MatButtonModule,MatDialogModule,MatInputModule,FormsModule,CommonModule]
})
export class ForkJoinModalComponent {

    service = inject(SwitchMapService);

    loadPosts(): void {
        const userId = 1;

        const user$ = this.service.getUserById(userId);
        const posts$ = this.service.getPostsByUserId(userId);

        forkJoin({ user: user$, posts: posts$ }).pipe(
            map(({user,posts}) => ({
                userId: user.id,
                userName: user.name,
                email: user.email,
                postsCount: posts.length
            }))
        ).subscribe((result) => console.log(result));
    }
}
