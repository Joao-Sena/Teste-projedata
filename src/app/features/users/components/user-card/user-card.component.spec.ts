import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { UserCardComponent } from './user-card.component';
import { User } from '../../interfaces/user.interface';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@email.com',
    phone: '(11) 99999-9999',
    gender: 'female',
  };

  const mockMaleUser: User = {
    id: 2,
    name: 'Male User',
    email: 'male@email.com',
    phone: '(21) 99999-8888',
    gender: 'male',
  };

  function setup(user: User = mockUser): ComponentFixture<UserCardComponent> {
    TestBed.configureTestingModule({
      imports: [UserCardComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    const f = TestBed.createComponent(UserCardComponent);
    f.componentRef.setInput('user', user);
    f.detectChanges();
    return f;
  }

  beforeEach(() => {
    fixture = setup();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the user signal with the provided user', () => {
    expect(component.user()).toEqual(mockUser);
  });

  it('should display user name', () => {
    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.user-name');
    expect(nameEl.textContent?.trim()).toBe(mockUser.name);
  });

  it('should display user email', () => {
    const emailEl: HTMLElement = fixture.nativeElement.querySelector('.user-email');
    expect(emailEl.textContent?.trim()).toBe(mockUser.email);
  });

  it('should render an avatar image', () => {
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('.user-avatar');
    expect(imgEl).not.toBeNull();
    expect(imgEl.src).toBeTruthy();
  });

  it('should use "women" in avatar url for female users', () => {
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('.user-avatar');
    expect(imgEl.src).toContain('women');
  });

  it('should use "men" in avatar url for male users', () => {
    TestBed.resetTestingModule();
    const maleFixture = setup(mockMaleUser);
    const imgEl: HTMLImageElement = maleFixture.nativeElement.querySelector('.user-avatar');
    expect(imgEl.src).toContain('men');
  });

  it('should render an edit button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
  });

  it('should emit edit event with the user when edit button is clicked', () => {
    const editSpy = jest.fn();
    component.edit.subscribe(editSpy);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(editSpy).toHaveBeenCalledWith(mockUser);
    expect(editSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit the correct user instance on edit', () => {
    let emittedUser: User | undefined;
    component.edit.subscribe(user => (emittedUser = user));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emittedUser).toEqual(mockUser);
  });

  it('should update displayed name when user input changes', () => {
    const updatedUser: User = { ...mockUser, name: 'Updated Name' };
    fixture.componentRef.setInput('user', updatedUser);
    fixture.detectChanges();

    const nameEl: HTMLElement = fixture.nativeElement.querySelector('.user-name');
    expect(nameEl.textContent?.trim()).toBe('Updated Name');
  });
});
