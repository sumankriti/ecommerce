import { Component, inject } from "@angular/core";
import { SwitchMapService } from "../../services/switchmap.service";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { concatMap, from, map, tap } from "rxjs";

@Component({
    selector: 'concatmap-modal',
    templateUrl: `./concatmap-modal.component.html`,
    styleUrls: ['./concatmap-modal.component.scss'],
    imports: [MatIconModule,MatButtonModule,MatDialogModule,MatInputModule,FormsModule,CommonModule]
})
export class ConcatMapModalComponent {

    postService = inject(SwitchMapService);

    loadPosts(): void {
        const usersId  = [1,2,3];
        from(usersId).pipe(
            concatMap((userId) => this.postService.getUserById(userId).pipe(
                concatMap((user) => this.postService.getPostsByUserId(user.id).pipe(
                    map(posts => ({
                        userName: user.name,
                        totalPosts: posts.length
                    }))
                ))
            )),
            tap(result => console.log(result))
        ).subscribe(res => console.log(res));
    }

}