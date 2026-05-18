import { Component, computed, effect, output, signal } from '@angular/core';

// Fiz a interface aqui só pra facilitar a visualização do exercício, mas 
// em um projeto real, essa interface estaria em um arquivo e pasta separados.
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-cart-counter',
  standalone: true,
  template: '',
})
export class CartCounterComponent {
  readonly items = signal<CartItem[]>([]);

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly totalChanged = output<number>();

  constructor() {
    effect(() => this.totalChanged.emit(this.total()));
  }

  addItem(item: Omit<CartItem, 'quantity'>): void {
    this.items.update(current => {
      const existing = current.find(i => i.id === item.id);
      if (existing) {
        return current.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }

  removeItem(itemId: number): void {
    this.items.update(current => {
      const existing = current.find(i => i.id === itemId);
      if (!existing) return current;
      if (existing.quantity === 1) {
        return current.filter(i => i.id !== itemId);
      }
      return current.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }
}
