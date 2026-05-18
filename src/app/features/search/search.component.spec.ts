import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty results', () => {
    expect(component.results).toEqual([]);
  });

  it('should not be loading on init', () => {
    expect(component.loading).toBe(false);
  });

  it('should have no error on init', () => {
    expect(component.error).toBe('');
  });

  it('should not have searched on init', () => {
    expect(component.searched).toBe(false);
  });

  it('should have an empty search control on init', () => {
    expect(component.searchControl.value).toBe('');
  });

  it('should set loading to true and searched to true when a query is typed', fakeAsync(() => {
    component.searchControl.setValue('Ana');
    tick(500);

    // After debounce fires, tap sets loading=true. HTTP request is pending.
    expect(component.loading).toBe(true);
    expect(component.searched).toBe(true);

    const req = httpMock.expectOne(r => r.url.includes('jsonplaceholder'));
    req.flush([]);
  }));

  it('should call the API after 500ms debounce', fakeAsync(() => {
    component.searchControl.setValue('Ana');
    tick(499);

    httpMock.expectNone(r => r.url.includes('jsonplaceholder'));

    tick(1);
    const req = httpMock.expectOne(r => r.url.includes('name_like=Ana'));
    req.flush([]);
  }));

  it('should update results when API returns data', fakeAsync(() => {
    const mockUsers = [
      { id: 1, name: 'Ana Costa', email: 'ana@teste.com' },
      { id: 2, name: 'Ana Silva', email: 'ana.s@teste.com' },
    ];

    component.searchControl.setValue('Ana');
    tick(500);

    const req = httpMock.expectOne(r => r.url.includes('name_like=Ana'));
    req.flush(mockUsers);

    expect(component.results).toEqual(mockUsers);
    expect(component.loading).toBe(false);
  }));

  it('should set error when API fails', fakeAsync(() => {
    component.searchControl.setValue('Ana');
    tick(500);

    const req = httpMock.expectOne(r => r.url.includes('name_like=Ana'));
    req.error(new ProgressEvent('error'));

    expect(component.error).toBe('Erro ao buscar. Tente novamente.');
    expect(component.loading).toBe(false);
  }));

  it('should clear results when search term is cleared', fakeAsync(() => {
    component.searchControl.setValue('Ana');
    tick(500);

    const req = httpMock.expectOne(r => r.url.includes('name_like=Ana'));
    req.flush([{ id: 1, name: 'Ana', email: 'ana@teste.com' }]);

    expect(component.results.length).toBe(1);

    component.searchControl.setValue('');
    tick(500);

    expect(component.results).toEqual([]);
    expect(component.loading).toBe(false);
  }));

  it('should not make API call when search is empty', fakeAsync(() => {
    component.searchControl.setValue('');
    tick(500);

    httpMock.expectNone(r => r.url.includes('jsonplaceholder'));
  }));

  it('should debounce rapid consecutive inputs', fakeAsync(() => {
    component.searchControl.setValue('A');
    component.searchControl.setValue('An');
    component.searchControl.setValue('Ana');
    tick(500);

    const requests = httpMock.match(r => r.url.includes('jsonplaceholder'));
    expect(requests.length).toBe(1);
    requests.forEach(r => r.flush([]));
  }));

  it('should reset error when a new search is triggered', fakeAsync(() => {
    component.searchControl.setValue('Ana');
    tick(500);

    const req1 = httpMock.expectOne(r => r.url.includes('name_like=Ana'));
    req1.error(new ProgressEvent('error'));
    expect(component.error).toBe('Erro ao buscar. Tente novamente.');

    component.searchControl.setValue('Carlos');
    tick(500);

    expect(component.error).toBe('');

    const req2 = httpMock.expectOne(r => r.url.includes('name_like=Carlos'));
    req2.flush([]);
  }));

  it('should not display "no results" message when not yet searched', () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Nenhum resultado encontrado');
  });

  it('should display "no results" message after search with no results', fakeAsync(() => {
    component.searchControl.setValue('NaoExiste');
    tick(500);

    const req = httpMock.expectOne(r => r.url.includes('name_like=NaoExiste'));
    req.flush([]);

    fixture.detectChanges();

    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain('Nenhum resultado encontrado');
  }));
});
