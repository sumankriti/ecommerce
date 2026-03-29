import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppShellComponent } from './app-shell/app-shell.component';
import { PageShellComponent } from './page-shell/page-shell.component';

@NgModule({
  imports: [CommonModule, AppShellComponent, PageShellComponent],
  exports: [AppShellComponent, PageShellComponent],
})
export class SharedModule {}
