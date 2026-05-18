import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserFormModalComponent } from './user-form-modal.component';
import { User } from '../../interfaces/user.interface';

describe('UserFormModalComponent', () => {
  let component: UserFormModalComponent;
  let fixture: ComponentFixture<UserFormModalComponent>;
  let mockDialogRef: { close: jest.Mock };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@email.com',
    phone: '(11) 99999-9999',
    gender: 'female',
  };

  function setup(user?: User): void {
    mockDialogRef = { close: jest.fn() };

    TestBed.configureTestingModule({
      imports: [UserFormModalComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: user ? { user } : {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('add mode (no user data)', () => {
    beforeEach(() => setup());

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have invalid form when all fields are empty', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('should have name field invalid when empty', () => {
      expect(component.form.get('name')?.invalid).toBe(true);
    });

    it('should have email field invalid when empty', () => {
      expect(component.form.get('email')?.invalid).toBe(true);
    });

    it('should have phone field invalid when empty', () => {
      expect(component.form.get('phone')?.invalid).toBe(true);
    });

    it('should have gender field invalid when empty', () => {
      expect(component.form.get('gender')?.invalid).toBe(true);
    });

    it('should have valid form when all fields are filled correctly', () => {
      component.form.setValue({
        name: 'Novo Usuario',
        email: 'novo@email.com',
        phone: '(11) 91111-1111',
        gender: 'male',
      });
      expect(component.form.valid).toBe(true);
    });

    it('should mark email as invalid for wrong format', () => {
      component.form.patchValue({ email: 'not-an-email' });
      expect(component.form.get('email')?.hasError('email')).toBe(true);
    });

    it('should not close dialog when form is invalid and save is called', () => {
      component.save();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog with null when cancel is called', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });

    it('should show "Adicionar" title for add mode', () => {
      const titleEl: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(titleEl.textContent?.trim()).toContain('Adicionar');
    });

    it('should close dialog with form value when form is valid and save is called', () => {
      component.form.setValue({
        name: 'Novo Usuario',
        email: 'novo@email.com',
        phone: '(11) 91111-1111',
        gender: 'male',
      });

      component.save();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        name: 'Novo Usuario',
        email: 'novo@email.com',
        phone: '(11) 91111-1111',
        gender: 'male',
      });
    });

    it('should expose genderOptions with male and female', () => {
      expect(component.genderOptions.length).toBe(2);
      const values = component.genderOptions.map(o => o.value);
      expect(values).toContain('male');
      expect(values).toContain('female');
    });
  });

  describe('edit mode (with user data)', () => {
    beforeEach(() => setup(mockUser));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should pre-fill name field with user data', () => {
      expect(component.form.get('name')?.value).toBe(mockUser.name);
    });

    it('should pre-fill email field with user data', () => {
      expect(component.form.get('email')?.value).toBe(mockUser.email);
    });

    it('should pre-fill phone field with user data', () => {
      expect(component.form.get('phone')?.value).toBe(mockUser.phone);
    });

    it('should pre-fill gender field with user data', () => {
      expect(component.form.get('gender')?.value).toBe(mockUser.gender);
    });

    it('should have valid form when initialized with complete user data', () => {
      expect(component.form.valid).toBe(true);
    });

    it('should show "Editar" title for edit mode', () => {
      const titleEl: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(titleEl.textContent?.trim()).toContain('Editar');
    });

    it('should close dialog with form value on save', () => {
      component.save();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        gender: mockUser.gender,
      });
    });

    it('should close dialog with updated values when form is modified', () => {
      component.form.patchValue({ name: 'Nome Alterado' });
      component.save();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nome Alterado' })
      );
    });

    it('should close dialog with null when cancel is called', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });

    it('should become invalid when required field is cleared', () => {
      component.form.patchValue({ name: '' });
      expect(component.form.invalid).toBe(true);
    });
  });
});
