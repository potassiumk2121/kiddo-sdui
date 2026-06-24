import { Product } from '../types/sdui';

/**
 * Mock product catalog. In a real app this comes from the backend; here we
 * generate a sizeable list to stress-test FlashList virtualization.
 */

const PLACEHOLDER = 'https://picsum.photos/seed/';

function gen(seed: string, title: string, price: number, badge?: string): Product {
  return {
    id: seed,
    title,
    price,
    image: `${PLACEHOLDER}${seed}/300/300`,
    ...(badge ? { badge } : {}),
  };
}

export const SCHOOL_PRODUCTS: Product[] = [
  gen('lb-1', 'Galaxy Lunchbox', 18.99, 'NEW'),
  gen('lb-2', 'Dinosaur Bento Box', 22.5),
  gen('bag-1', 'Astronaut Backpack', 39.99, '-20%'),
  gen('bag-2', 'Unicorn Backpack', 34.0),
  gen('pencil-1', 'Rainbow Pencil Set', 9.99),
  gen('book-1', 'Hardcover Notebook', 6.5),
  gen('water-1', 'Stainless Water Bottle', 14.99, 'HOT'),
  gen('snack-1', 'Snack Container', 7.0),
];

export const PLAYHOUSE_PRODUCTS: Product[] = [
  gen('zoo-1', 'Petting Zoo Pass', 12.0, 'FAMILY'),
  gen('zoo-2', 'Splash Park Ticket', 18.0),
  gen('toy-1', 'Water Blaster XL', 24.99),
  gen('toy-2', 'Floating Pool Ring', 11.5),
  gen('ice-1', 'Ice Cream Voucher', 5.0, 'TREAT'),
  gen('sun-1', 'Sunglasses Kids', 8.99),
  gen('towel-1', 'Beach Towel', 16.0),
  gen('hat-1', 'Summer Sun Hat', 12.5),
];

export const CARNIVAL_PRODUCTS: Product[] = [
  gen('gift-1', 'Mystery Box S', 9.99, '?'),
  gen('gift-2', 'Mystery Box M', 19.99, '?'),
  gen('gift-3', 'Mystery Box L', 29.99, 'RARE'),
  gen('ticket-1', 'Carnival Ride Pass', 14.0),
  gen('candy-1', 'Cotton Candy Pack', 4.5),
  gen('mask-1', 'Carnival Mask', 7.5),
  gen('plush-1', 'Mystery Plush', 16.0, 'NEW'),
  gen('coupon-1', 'Surprise Coupon', 0, 'FREE'),
];

/**
 * Build a long horizontally-scrollable list to demo Dynamic Collection
 * performance. Repeats the catalog a few times.
 */
export function buildLongList(base: Product[], multiplier = 6): Product[] {
  const out: Product[] = [];
  for (let i = 0; i < multiplier; i++) {
    for (const p of base) {
      out.push({ ...p, id: `${p.id}-${i}` });
    }
  }
  return out;
}
