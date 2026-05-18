import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';

import { UserListPage } from './user-list.page';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';

const mockUsers: User[] = [
  { id: 1, name: 'Ana Costa', email: 'ana@teste.com', phone: '(11) 98888-7777', gender: 'female' },
  { id: 2, name: 'Carlos Silva', email: 'carlos@teste.com', phone: '(21) 98888-6666', gender: 'male' },
  { id: 3, name: 'Fernanda Pereira', email: 'fernanda@teste.com', phone: '(31) 98888-5555', gender: 'female' },
];

describe('UserListPage', () => {
  let fixture: ComponentFixture<UserListPage>;
  let component: UserListPage;
  let userServiceMock: jest.Mocked<UserService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    userServiceMock = {
      getUsers: jest.fn().mockReturnValue(of(mockUsers)),
      addUser: jest.fn().mockReturnValue(of({ id: 4 } as User)),
      updateUser: jest.fn().mockReturnValue(of(mockUsers[0])),
      deleteUser: jest.fn().mockReturnValue(of(null)),
    } as unknown as jest.Mocked<UserService>;

    dialogMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [UserListPage],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(UserListPage);
    component = fixture.componentInstance;
  }

  // ===== Initialization Tests =====
  describe('Initialization', () => {
    it('should create component', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      expect(component).toBeTruthy();
    }));

    it('should have initial signals set correctly', fakeAsync(() => {
      createComponent();
      expect(component.users()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
    }));

    it('should have empty search control', fakeAsync(() => {
      createComponent();
      expect(component.searchControl.value).toBe('');
    }));

    it('should load users on component init', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(userServiceMock.getUsers).toHaveBeenCalledWith('');
      expect(component.users()).toEqual(mockUsers);
    }));

    it('should set loading to false after users load', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.loading()).toBe(false);
    }));

    it('should clear error signal when loading', fakeAsync(() => {
      userServiceMock.getUsers.mockReturnValue(of(mockUsers));
      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.error()).toBeNull();
    }));
  });

  // ===== Search Tests =====
  describe('Search Functionality', () => {
    it('should call getUsers with search term when search control changes', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      component.searchControl.setValue('Ana');
      tick(300);

      expect(userServiceMock.getUsers).toHaveBeenCalledWith('Ana');
    }));

    it('should debounce search by 300ms', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      const initialCallCount = userServiceMock.getUsers.mock.calls.length;

      component.searchControl.setValue('A');
      component.searchControl.setValue('An');
      component.searchControl.setValue('Ana');
      tick(299);

      expect(userServiceMock.getUsers.mock.calls.length).toBe(initialCallCount);

      tick(1);
      expect(userServiceMock.getUsers.mock.calls.length).toBeGreaterThan(initialCallCount);
    }));

    it('should set loading to true when search changes', fakeAsync(() => {
      const delayedUsers = new Subject<User[]>();
      userServiceMock.getUsers.mockReturnValue(delayedUsers.asObservable());

      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.loading()).toBe(true);
      delayedUsers.next(mockUsers);
      delayedUsers.complete();
    }));

    it('should handle empty search', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      component.searchControl.setValue('');
      tick(300);

      expect(userServiceMock.getUsers).toHaveBeenCalledWith('');
    }));

    it('should handle null search value as empty string', fakeAsync(() => {
      createComponent();
      fixture.detectChanges();
      tick(300);

      component.searchControl.setValue(null);
      tick(300);

      expect(userServiceMock.getUsers).toHaveBeenCalledWith('');
    }));
  });

  // ===== Error Handling Tests =====
  describe('Error Handling', () => {
    it('should set error signal when getUsers fails', fakeAsync(() => {
      userServiceMock.getUsers.mockReturnValue(throwError(() => new Error('Falha')));

      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.error()).toBe('Erro ao carregar usuários. Tente novamente.');
      expect(component.users()).toEqual([]);
      expect(component.loading()).toBe(false);
    }));

    it('should clear error and set loading when new search starts', fakeAsync(() => {
      userServiceMock.getUsers.mockReturnValue(of(mockUsers));

      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.error()).toBeNull();
      expect(component.loading()).toBe(false);
    }));

    it('should update users even after error', fakeAsync(() => {
      userServiceMock.getUsers.mockReturnValueOnce(throwError(() => new Error('Falha')));
      createComponent();
      fixture.detectChanges();
      tick(300);

      expect(component.error()).toBe('Erro ao carregar usuários. Tente novamente.');

      userServiceMock.getUsers.mockReturnValueOnce(of(mockUsers));
      component.searchControl.setValue('test');
      tick(300);

      expect(component.users()).toEqual(mockUsers);
      expect(component.error()).toBeNull();
    }));
  });

  // ===== Add User Modal Tests =====
  describe('openAddModal', () => {
    it('should open dialog when openAddModal is called', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(dialogMock.open).toHaveBeenCalled();
    }));

    it('should open dialog with correct configuration', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(dialogMock.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: '700px',
          maxWidth: '700px',
          panelClass: 'dialog-square'
        })
      );
    }));

    it('should call addUser when dialog closes with result', fakeAsync(() => {
      const newUserData = { name: 'Novo', email: 'novo@test.com', phone: '(11) 99999-0000', gender: 'male' as const };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(newUserData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(userServiceMock.addUser).toHaveBeenCalledWith(newUserData);
    }));

    it('should not call addUser when dialog is cancelled', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(userServiceMock.addUser).not.toHaveBeenCalled();
    }));

    it('should show success snackbar after adding user', fakeAsync(() => {
      const newUserData = { name: 'Novo', email: 'novo@test.com', phone: '(11) 99999-0000', gender: 'male' as const };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(newUserData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Usuário adicionado com sucesso!',
        'Fechar',
        { duration: 3000 }
      );
    }));

    it('should refresh users after adding', fakeAsync(() => {
      const newUserData = { name: 'Novo', email: 'novo@test.com', phone: '(11) 99999-0000', gender: 'male' as const };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(newUserData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      const initialCallCount = userServiceMock.getUsers.mock.calls.length;

      component.openAddModal();

      expect(userServiceMock.getUsers.mock.calls.length).toBeGreaterThan(initialCallCount);
    }));

    it('should show error snackbar when addUser fails', fakeAsync(() => {
      const newUserData = { name: 'Novo', email: 'novo@test.com', phone: '(11) 99999-0000', gender: 'male' as const };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(newUserData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);
      userServiceMock.addUser.mockReturnValue(throwError(() => new Error('Erro ao adicionar')));

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openAddModal();

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Erro ao adicionar usuário.',
        'Fechar',
        { duration: 3000 }
      );
    }));
  });

  // ===== Edit User Modal Tests =====
  describe('openEditModal', () => {
    it('should open dialog when openEditModal is called', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalled();
    }));

    it('should pass user data to dialog', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { user: mockUsers[0] } })
      );
    }));

    it('should call updateUser when dialog closes with result', fakeAsync(() => {
      const updatedData = { ...mockUsers[0], name: 'Ana Atualizada' };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(updatedData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(mockUsers[0].id, updatedData);
    }));

    it('should not call updateUser when dialog is cancelled', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    }));

    it('should show success snackbar after updating user', fakeAsync(() => {
      const updatedData = { ...mockUsers[0], name: 'Ana Atualizada' };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(updatedData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Usuário atualizado com sucesso!',
        'Fechar',
        { duration: 3000 }
      );
    }));

    it('should refresh users after updating', fakeAsync(() => {
      const updatedData = { ...mockUsers[0], name: 'Ana Atualizada' };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(updatedData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      const initialCallCount = userServiceMock.getUsers.mock.calls.length;

      component.openEditModal(mockUsers[0]);

      expect(userServiceMock.getUsers.mock.calls.length).toBeGreaterThan(initialCallCount);
    }));

    it('should show error snackbar when updateUser fails', fakeAsync(() => {
      const updatedData = { ...mockUsers[0], name: 'Ana Atualizada' };
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(updatedData)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);
      userServiceMock.updateUser.mockReturnValue(throwError(() => new Error('Erro ao atualizar')));

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[0]);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Erro ao atualizar usuário.',
        'Fechar',
        { duration: 3000 }
      );
    }));

    it('should work with different users', fakeAsync(() => {
      const dialogRefMock = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
      } as unknown as MatDialogRef<any>;
      dialogMock.open.mockReturnValue(dialogRefMock);

      createComponent();
      fixture.detectChanges();
      tick(300);

      component.openEditModal(mockUsers[1]);
      component.openEditModal(mockUsers[2]);

      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
      expect(dialogMock.open).toHaveBeenCalledTimes(2);
    }));
  });
});
