import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { User, Gender } from '../../interfaces/user.interface';

export interface UserFormModalData {
  user?: User;
}

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss'
})
export class UserFormModalComponent {
  private readonly dialogRef = inject(MatDialogRef<UserFormModalComponent>);
  readonly data: UserFormModalData = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);

  readonly genderOptions: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' }
  ];

  form = this.formBuilder.group({
    name: [this.data.user?.name ?? '', Validators.required],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data.user?.phone ?? '', Validators.required],
    gender: [this.data.user?.gender ?? null as Gender | null, Validators.required]
  });

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
