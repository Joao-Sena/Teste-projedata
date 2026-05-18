import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of } from 'rxjs';

import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  // Usando um array pra simular a API para facilitar de não precisar rodar um JSON server. Mas a lógica seria a mesma
  // mudando apenas a forma de obter os dados (ex: usando HttpClient) e a forma de atualizar os dados (ex: fazendo um POST ou PUT na API)
  // defini o genero pois a API de imagem consegue retornar uma imagem de acordo com ele
  private readonly usersSubject = new BehaviorSubject<User[]>([
    { id: 1, name: 'Ana Costa', email: 'ana@teste.com', phone: '(11) 98888-7777', gender: 'female' },
    { id: 2, name: 'Carlos Silva', email: 'carlos@teste.com', phone: '(21) 98888-6666', gender: 'male' },
    { id: 3, name: 'Fernanda Pereira', email: 'fernanda@teste.com', phone: '(31) 98888-5555', gender: 'female' },
    { id: 4, name: 'João Sena', email: 'joao@teste.com', phone: '(41) 98888-4444', gender: 'male' },
    { id: 5, name: 'Joana Oliveira', email: 'joana@teste.com', phone: '(51) 98888-3333', gender: 'female' },
    { id: 6, name: 'Fernando Oliveira', email: 'fernando@teste.com', phone: '(61) 98888-2222', gender: 'male' },
    { id: 7, name: 'Beatriz Souza', email: 'beatriz@teste.com', phone: '(71) 98888-1111', gender: 'female' },
    { id: 8, name: 'Gabriela Silva', email: 'gabriela@teste.com', phone: '(81) 98888-0000', gender: 'female' },
    { id: 9, name: 'João Cardoso', email: 'joao.cardoso@teste.com', phone: '(91) 98888-8888', gender: 'male' },
  ]);

  getUsers(search: string = ''): Observable<User[]> {
    const users = this.usersSubject.getValue();
    const filtered = search
      ? users.filter(
          user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        )
      : users;
    return of(filtered).pipe(delay(700));
  }

  addUser(data: Omit<User, 'id'>): Observable<User> {
    const users = this.usersSubject.getValue();
    const newUser: User = { ...data, id: Date.now() };
    this.usersSubject.next([...users, newUser]);
    return of(newUser);
  }

  updateUser(id: number, data: Partial<Omit<User, 'id'>>): Observable<User> {
    const users = this.usersSubject.getValue();
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, ...data } : user
    );
    this.usersSubject.next(updatedUsers);
    const updated = updatedUsers.find(user => user.id === id)!;
    return of(updated);
  }
}
