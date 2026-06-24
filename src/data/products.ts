import { Product } from '../types/sdui';

/**
 * Mock product catalog. In a real app this comes from the backend; here we
 * generate a sizeable list to stress-test FlashList virtualization.
 */

function productImage(label: string, bg = 'EAF4FF', fg = '17324D'): string {
  return `https://placehold.co/600x600/${bg}/${fg}.png?text=${encodeURIComponent(
    label,
  )}`;
}

function gen(
  seed: string,
  title: string,
  price: number,
  badge?: string,
  imageLabel = title,
  bg?: string,
): Product {
  return {
    id: seed,
    title,
    price,
    image: productImage(imageLabel, bg),
    ...(badge ? { badge } : {}),
  };
}

export const SCHOOL_PRODUCTS: Product[] = [
  gen('lb-1', 'Galaxy Lunchbox', 18.99, 'NEW', 'Galaxy\nLunchbox', 'DCEBFF'),
  gen('lb-2', 'Dinosaur Bento Box', 22.5, undefined, 'Dino\nBento', 'E7F9EE'),
  gen('bag-1', 'Astronaut Backpack', 39.99, '-20%', 'Astronaut\nBag', 'EEF2FF'),
  gen('bag-2', 'Unicorn Backpack', 34.0, undefined, 'Unicorn\nBag', 'FFEAF4'),
  gen('pencil-1', 'Rainbow Pencil Set', 9.99, undefined, 'Rainbow\nPencils', 'FFF4D6'),
  gen('book-1', 'Hardcover Notebook', 6.5, undefined, 'Hardcover\nNotebook', 'E0F7FA'),
  gen('water-1', 'Stainless Water Bottle', 14.99, 'HOT', 'Water\nBottle', 'E6F4FF'),
  gen('snack-1', 'Snack Container', 7.0, undefined, 'Snack\nBox', 'FDF2F8'),
];

export const PLAYHOUSE_PRODUCTS: Product[] = [
  gen('zoo-1', 'Petting Zoo Pass', 12.0, 'FAMILY', 'Zoo\nPass', 'E8F8F5'),
  gen('zoo-2', 'Splash Park Ticket', 18.0, undefined, 'Splash\nTicket', 'DDF7FF'),
  gen('toy-1', 'Water Blaster XL', 24.99, undefined, 'Water\nBlaster', 'E0F2FE'),
  gen('toy-2', 'Floating Pool Ring', 11.5, undefined, 'Pool\nRing', 'FFF7ED'),
  gen('ice-1', 'Ice Cream Voucher', 5.0, 'TREAT', 'Ice Cream\nVoucher', 'FFEAF4'),
  gen('sun-1', 'Sunglasses Kids', 8.99, undefined, 'Kids\nShades', 'FEF3C7'),
  gen('towel-1', 'Beach Towel', 16.0, undefined, 'Beach\nTowel', 'DBEAFE'),
  gen('hat-1', 'Summer Sun Hat', 12.5, undefined, 'Sun\nHat', 'FDE68A'),
];

export const CARNIVAL_PRODUCTS: Product[] = [
  gen('gift-1', 'Mystery Box S', 9.99, '?', 'Mystery\nBox S', 'F5E8FF'),
  gen('gift-2', 'Mystery Box M', 19.99, '?', 'Mystery\nBox M', 'FFE8EC'),
  gen('gift-3', 'Mystery Box L', 29.99, 'RARE', 'Mystery\nBox L', 'E0F2FE'),
  gen('ticket-1', 'Carnival Ride Pass', 14.0, undefined, 'Ride\nPass', 'FFF3E0'),
  gen('candy-1', 'Cotton Candy Pack', 4.5, undefined, 'Cotton\nCandy', 'FCE7F3'),
  gen('mask-1', 'Carnival Mask', 7.5, undefined, 'Carnival\nMask', 'EDE9FE'),
  gen('plush-1', 'Mystery Plush', 16.0, 'NEW', 'Mystery\nPlush', 'DCFCE7'),
  gen('coupon-1', 'Surprise Coupon', 0, 'FREE', 'Surprise\nCoupon', 'FEF9C3'),
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
