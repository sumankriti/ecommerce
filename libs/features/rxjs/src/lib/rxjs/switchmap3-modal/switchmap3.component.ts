import { Component, DestroyRef, inject } from "@angular/core";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, map, Subject, switchMap } from "rxjs";
import { SwitchMapService } from "../../services/switchmap.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'switchmap3',
    templateUrl: `./switchmap3.component.html`,
    styleUrls: ['./switchmap3.component.scss'],
    imports: [MatIconModule,MatButtonModule,MatDialogModule,MatInputModule,FormsModule,CommonModule]
})
export class SwitchMap3Component {
    value = 'Clear me';
     button$ = new Subject<void>();
     search$ = new Subject<string>();
     private destroyRef = inject(DestroyRef);
     userService = inject(SwitchMapService);
     constructor() {
        this.button$.pipe(
            switchMap(() => this.userService.getUsers()),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (res) => console.log(res),
            error: (err) => console.log(err)
        });

        this.search$.pipe(
            debounceTime(300),
            map(term => term.trim()),
            distinctUntilChanged(),
            switchMap((term) => this.userService.searchUsers(term)),
            takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
            next: (res) => console.log(res),
            error: (err) => console.log(err)
        })
     }

    callSwitchMap(){
    this.button$.next();
    }

    inputChange(event:string): void {
        console.log('event',event);
        this.search$.next(event);
    }

}