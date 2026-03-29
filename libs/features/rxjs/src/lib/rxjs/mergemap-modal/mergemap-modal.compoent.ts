import { Component, inject } from "@angular/core";
import { SwitchMapService } from "../../services/switchmap.service";
import { from, map, merge, mergeMap, toArray } from "rxjs";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'mergemap-modal',
    templateUrl: `./mergemap-modal.compoent.html`,
    styleUrls: ['./mergemap-modal.compoent.scss'],
    imports: [MatIconModule,MatButtonModule,MatDialogModule,MatInputModule,FormsModule,CommonModule]
})
export class MergeMapModalComponent {
    services = inject(SwitchMapService);

    loadPosts(): void {
       const userId = [1,2,3];
       from(userId).pipe(
       mergeMap((userId) => this.services.getUserById(userId).pipe(
        mergeMap((user) => this.services.getPostsByUserId(user.id).pipe(
            map((posts) => ({
                userId: user.id,
                userName: user.name,
                postComments: posts.length
            }))
        ))
       )),toArray()
       ).subscribe(res => console.log(res));
    }
}