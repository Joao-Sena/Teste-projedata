import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  startWith,
  switchMap
} from 'rxjs';

import { UserService } from '../../services/user.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import {
  UserFormModalComponent,
  UserFormModalData
} from '../../components/user-form-modal/user-form-modal.component';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    UserCardComponent,
    SidebarComponent
  ],
  templateUrl: './user-list.page.html',
  styleUrl: './user-list.page.scss'
})
export class UserListPage {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchControl = new FormControl('');
  private readonly refreshTrigger = new BehaviorSubject<void>(undefined);

  constructor() {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.refreshTrigger
    ]).pipe(
      switchMap(([search]) => {
        this.loading.set(true);
        this.error.set(null);
        return this.userService.getUsers(search ?? '').pipe(
          catchError(() => {
            this.error.set('Erro ao carregar usuários. Tente novamente.');
            return of([]);
          })
        );
      }),
      takeUntilDestroyed()
    ).subscribe(users => {
      this.users.set(users);
      this.loading.set(false);
    });
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(UserFormModalComponent, {
      width: '700px',
      maxWidth: '700px',
      panelClass: 'dialog-square',
      data: {} as UserFormModalData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.userService.addUser(result).subscribe({
        next: () => {
          this.snackBar.open('Usuário adicionado com sucesso!', 'Fechar', { duration: 3000 });
          this.refreshTrigger.next();
        },
        error: () => {
          this.snackBar.open('Erro ao adicionar usuário.', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  openEditModal(user: User): void {
    const dialogRef = this.dialog.open(UserFormModalComponent, {
      width: '700px',
      maxWidth: '700px',
      panelClass: 'dialog-square',
      data: { user } as UserFormModalData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.userService.updateUser(user.id, result).subscribe({
        next: () => {
          this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.refreshTrigger.next();
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar usuário.', 'Fechar', { duration: 3000 });
        }
      });
    });
  }
}
