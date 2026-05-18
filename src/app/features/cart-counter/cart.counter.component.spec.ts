import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartCounterComponent, CartItem } from './cart.counter.component';

describe('CartCounterComponent', () => {
  let component: CartCounterComponent;
  let fixture: ComponentFixture<CartCounterComponent>;

  const itemA: Omit<CartItem, 'quantity'> = { id: 1, name: 'Item A', price: 10 };
  const itemB: Omit<CartItem, 'quantity'> = { id: 2, name: 'Item B', price: 25 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty items list', () => {
    expect(component.items()).toEqual([]);
  });

  it('should start with total equal to 0', () => {
    expect(component.total()).toBe(0);
  });

  describe('addItem', () => {
    it('should add a new item with quantity 1', () => {
      component.addItem(itemA);

      expect(component.items().length).toBe(1);
      expect(component.items()[0]).toEqual({ ...itemA, quantity: 1 });
    });

    it('should increment quantity when the same item is added again', () => {
      component.addItem(itemA);
      component.addItem(itemA);

      expect(component.items().length).toBe(1);
      expect(component.items()[0].quantity).toBe(2);
    });

    it('should add multiple different items independently', () => {
      component.addItem(itemA);
      component.addItem(itemB);

      expect(component.items().length).toBe(2);
    });

    it('should not modify other items when incrementing quantity', () => {
      component.addItem(itemA);
      component.addItem(itemB);
      component.addItem(itemA);

      const bItem = component.items().find(i => i.id === itemB.id);
      expect(bItem!.quantity).toBe(1);
    });

    it('should preserve all item fields when adding', () => {
      component.addItem(itemA);

      const added = component.items()[0];
      expect(added.id).toBe(itemA.id);
      expect(added.name).toBe(itemA.name);
      expect(added.price).toBe(itemA.price);
    });
  });

  describe('removeItem', () => {
    it('should decrement quantity when item has quantity greater than 1', () => {
      component.addItem(itemA);
      component.addItem(itemA);
      component.removeItem(itemA.id);

      expect(component.items()[0].quantity).toBe(1);
    });

    it('should remove the item from the list when quantity reaches 0', () => {
      component.addItem(itemA);
      component.removeItem(itemA.id);

      expect(component.items()).toEqual([]);
    });

    it('should do nothing when item does not exist in the list', () => {
      component.addItem(itemA);
      component.removeItem(999);

      expect(component.items().length).toBe(1);
    });

    it('should not affect other items when removing one', () => {
      component.addItem(itemA);
      component.addItem(itemB);
      component.removeItem(itemA.id);

      expect(component.items().length).toBe(1);
      expect(component.items()[0].id).toBe(itemB.id);
    });

    it('should preserve remaining items data when removing one', () => {
      component.addItem(itemA);
      component.addItem(itemA);
      component.addItem(itemB);
      component.removeItem(itemA.id);

      const aItem = component.items().find(i => i.id === itemA.id);
      expect(aItem!.quantity).toBe(1);
      expect(aItem!.price).toBe(itemA.price);
    });
  });

  describe('total computed signal', () => {
    it('should be 0 when no items', () => {
      expect(component.total()).toBe(0);
    });

    it('should compute total for a single item with quantity 1', () => {
      component.addItem(itemA);
      expect(component.total()).toBe(10);
    });

    it('should compute total for a single item with quantity > 1', () => {
      component.addItem(itemA);
      component.addItem(itemA);
      expect(component.total()).toBe(20);
    });

    it('should compute total for multiple different items', () => {
      component.addItem(itemA);
      component.addItem(itemB);
      expect(component.total()).toBe(35);
    });

    it('should update total when item is added', () => {
      component.addItem(itemA);
      const totalAfterFirst = component.total();
      component.addItem(itemB);
      expect(component.total()).toBeGreaterThan(totalAfterFirst);
    });

    it('should update total when item is removed', () => {
      component.addItem(itemA);
      component.addItem(itemA);
      component.removeItem(itemA.id);
      expect(component.total()).toBe(10);
    });

    it('should return 0 after all items are removed', () => {
      component.addItem(itemA);
      component.removeItem(itemA.id);
      expect(component.total()).toBe(0);
    });

    it('should compute total correctly with mixed quantities', () => {
      component.addItem(itemA);
      component.addItem(itemA);
      component.addItem(itemA);
      component.addItem(itemB);
      component.addItem(itemB);
      // itemA: 3 * 10 = 30, itemB: 2 * 25 = 50 → total = 80
      expect(component.total()).toBe(80);
    });
  });

  describe('totalChanged output', () => {
    it('should expose a totalChanged output emitter', () => {
      expect(component.totalChanged).toBeDefined();
      expect(typeof component.totalChanged.subscribe).toBe('function');
    });

    it('should emit via effect when total changes (verified through total signal)', () => {
      // The effect calls totalChanged.emit(this.total()) when total changes.
      // We verify the total signal changes correctly, which drives the emission.
      component.addItem(itemA);
      expect(component.total()).toBe(10);

      component.addItem(itemA);
      expect(component.total()).toBe(20);

      component.removeItem(itemA.id);
      expect(component.total()).toBe(10);
    });
  });
});
