import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a sidebar element', () => {
    const sidebarEl: HTMLElement = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebarEl).not.toBeNull();
  });

  it('should render 6 navigation buttons', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(6);
  });

  it('should have the first button marked as active', () => {
    const firstButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button:first-child');
    expect(firstButton.classList.contains('nav-btn--active')).toBe(true);
  });

  it('should render a "Usuários" button with aria-label', () => {
    const usersButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[aria-label="Usuários"]'
    );
    expect(usersButton).not.toBeNull();
  });

  it('should render a "Dashboard" button with aria-label', () => {
    const dashboardButton = fixture.nativeElement.querySelector('[aria-label="Dashboard"]');
    expect(dashboardButton).not.toBeNull();
  });

  it('should render a "Relatórios" button with aria-label', () => {
    const relatoriosButton = fixture.nativeElement.querySelector('[aria-label="Relatórios"]');
    expect(relatoriosButton).not.toBeNull();
  });

  it('should render a "Notificações" button with aria-label', () => {
    const notificacoesButton = fixture.nativeElement.querySelector(
      '[aria-label="Notificações"]'
    );
    expect(notificacoesButton).not.toBeNull();
  });

  it('should render a "Configurações" button with aria-label', () => {
    const configButton = fixture.nativeElement.querySelector('[aria-label="Configurações"]');
    expect(configButton).not.toBeNull();
  });

  it('should render a "Ajuda" button with aria-label', () => {
    const ajudaButton = fixture.nativeElement.querySelector('[aria-label="Ajuda"]');
    expect(ajudaButton).not.toBeNull();
  });

  it('should have only one active button', () => {
    const activeButtons = fixture.nativeElement.querySelectorAll('.nav-btn--active');
    expect(activeButtons.length).toBe(1);
  });
});
