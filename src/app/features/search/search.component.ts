import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  finalize,
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
class SearchService {
  private http = inject(HttpClient);

  search(query: string): Observable<User[]> {
    return this.http.get<User[]>(
      `https://jsonplaceholder.typicode.com/users?name_like=${query}`
    );
  }
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div style="max-width: 400px; margin: 40px auto; font-family: sans-serif">
      <h2>Busca Reativa com RxJS</h2>

      <input
        [formControl]="searchControl"
        placeholder="Buscar usuário..."
        style="width: 100%; padding: 8px; font-size: 16px; box-sizing: border-box"
      />

      @if (loading) {
        <p style="color: gray">Carregando...</p>
      }

      @if (error) {
        <p style="color: red">{{ error }}</p>
      }

      @if (results.length > 0) {
        <ul style="padding: 0; list-style: none; margin-top: 8px">
          @for (user of results; track user.id) {
            <li style="padding: 8px; border-bottom: 1px solid #eee">
              <strong>{{ user.name }}</strong> — {{ user.email }}
            </li>
          }
        </ul>
      }

      @if (!loading && searched && results.length === 0 && !error) {
        <p>Nenhum resultado encontrado.</p>
      }
    </div>
  `,
})
export class SearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  results: User[] = [];
  loading = false;
  error = '';
  searched = false;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((query) => {
          this.loading = !!query;
          this.error = '';
          this.searched = !!query;
          if (!query) this.results = [];
        }),
        switchMap((query) => {
          if (!query) return of([]);
          return this.searchService.search(query).pipe(
            catchError(() => {
              this.error = 'Erro ao buscar. Tente novamente.';
              return of([]);
            }),
            finalize(() => (this.loading = false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((users) => (this.results = users));
  }
}
