import { Component, inject } from "@angular/core";
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { delay, exhaustMap, Subject } from "rxjs";
import { SwitchMapService } from "../../services/switchmap.service";

@Component({
    selector: 'exhaustmap-modal',
    templateUrl: `./exhaustmap-modal.component.html`,
    styleUrls: ['./exhaustmap-modal.component.scss'],
    imports: [MatIconModule,MatButtonModule,MatDialogModule,MatInputModule,FormsModule,CommonModule]
})
export class ExhaustMapModalComponent {

    loginButton$ = new Subject<void>();

    userService = inject(SwitchMapService);

    constructor(){
        this.loginButton$.pipe(
            exhaustMap(() => this.userService.getUsers().pipe(delay(3000)))
        ).subscribe({
            next: (res) => console.log(res),
            error: (err) => console.warn(err)
        })
    }
    callExhaustMap(): void {
    this.loginButton$.next(); 
    }
}