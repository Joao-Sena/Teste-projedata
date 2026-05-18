import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { UserService } from './user.service';
import { User, Gender } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return all 9 users when no search term is provided', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers().subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(9);
    }));

    it('should return all users when search is empty string', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers('').subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(9);
    }));

    it('should filter users by name (case insensitive)', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers('carlos').subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Carlos Silva');
    }));

    it('should filter users by partial name match', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers('joão').subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(2);
    }));

    it('should filter users by email', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers('carlos@teste').subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('carlos@teste.com');
    }));

    it('should return empty array when no users match', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers('naoexiste123xyz').subscribe(users => (result = users));
      tick(700);
      expect(result.length).toBe(0);
    }));

    it('should emit the result only after 700ms delay', fakeAsync(() => {
      let result: User[] | null = null;
      service.getUsers().subscribe(users => (result = users));

      tick(699);
      expect(result).toBeNull();

      tick(1);
      expect(result).not.toBeNull();
    }));

    it('should return users with all required fields', fakeAsync(() => {
      let result: User[] = [];
      service.getUsers().subscribe(users => (result = users));
      tick(700);

      const user = result[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('phone');
      expect(user).toHaveProperty('gender');
    }));
  });

  describe('addUser', () => {
    const newUserData: Omit<User, 'id'> = {
      name: 'Novo Usuario',
      email: 'novo@teste.com',
      phone: '(11) 99999-0000',
      gender: 'male' as Gender,
    };

    it('should return the added user immediately (no delay)', () => {
      let addedUser: User | null = null;
      service.addUser(newUserData).subscribe(user => (addedUser = user));
      expect(addedUser).not.toBeNull();
    });

    it('should return a user with generated id', () => {
      let addedUser: User | null = null;
      service.addUser(newUserData).subscribe(user => (addedUser = user));
      expect(addedUser!.id).toBeTruthy();
    });

    it('should return the user with the same data as provided', () => {
      let addedUser: User | null = null;
      service.addUser(newUserData).subscribe(user => (addedUser = user));
      expect(addedUser!.name).toBe(newUserData.name);
      expect(addedUser!.email).toBe(newUserData.email);
      expect(addedUser!.phone).toBe(newUserData.phone);
      expect(addedUser!.gender).toBe(newUserData.gender);
    });

    it('should persist the new user in the list', fakeAsync(() => {
      service.addUser(newUserData).subscribe();

      let allUsers: User[] = [];
      service.getUsers().subscribe(users => (allUsers = users));
      tick(700);

      expect(allUsers.length).toBe(10);
      expect(allUsers.some(u => u.email === newUserData.email)).toBe(true);
    }));

    it('should generate a numeric id for each added user', () => {
      let id1: number | undefined;
      let id2: number | undefined;

      service.addUser(newUserData).subscribe(u => (id1 = u.id));
      service.addUser({ ...newUserData, email: 'outro@teste.com' }).subscribe(u => (id2 = u.id));

      expect(typeof id1).toBe('number');
      expect(typeof id2).toBe('number');
    });
  });

  describe('updateUser', () => {
    it('should return the updated user', () => {
      let updatedUser: User | null = null;
      service.updateUser(1, { name: 'Ana Atualizada' }).subscribe(user => (updatedUser = user));
      expect(updatedUser!.name).toBe('Ana Atualizada');
    });

    it('should preserve unchanged fields', () => {
      let updatedUser: User | null = null;
      service.updateUser(1, { name: 'Ana Atualizada' }).subscribe(user => (updatedUser = user));
      expect(updatedUser!.email).toBe('ana@teste.com');
      expect(updatedUser!.phone).toBe('(11) 98888-7777');
    });

    it('should persist the update in the users list', fakeAsync(() => {
      service.updateUser(1, { name: 'Ana Atualizada' }).subscribe();

      let allUsers: User[] = [];
      service.getUsers().subscribe(users => (allUsers = users));
      tick(700);

      const ana = allUsers.find(u => u.id === 1);
      expect(ana!.name).toBe('Ana Atualizada');
    }));

    it('should not affect other users when updating one', fakeAsync(() => {
      service.updateUser(1, { name: 'Ana Atualizada' }).subscribe();

      let allUsers: User[] = [];
      service.getUsers().subscribe(users => (allUsers = users));
      tick(700);

      const carlos = allUsers.find(u => u.id === 2);
      expect(carlos!.name).toBe('Carlos Silva');
    }));

    it('should allow updating email', fakeAsync(() => {
      service.updateUser(2, { email: 'carlos.novo@teste.com' }).subscribe();

      let allUsers: User[] = [];
      service.getUsers().subscribe(users => (allUsers = users));
      tick(700);

      const carlos = allUsers.find(u => u.id === 2);
      expect(carlos!.email).toBe('carlos.novo@teste.com');
    }));

    it('should allow updating gender', fakeAsync(() => {
      service.updateUser(2, { gender: 'female' }).subscribe();

      let allUsers: User[] = [];
      service.getUsers().subscribe(users => (allUsers = users));
      tick(700);

      const user = allUsers.find(u => u.id === 2);
      expect(user!.gender).toBe('female');
    }));
  });
});
