import {
  SCHOOL_PRODUCTS,
  PLAYHOUSE_PRODUCTS,
  CARNIVAL_PRODUCTS,
  buildLongList,
} from './products';
import { Product } from '../types/sdui';

/**
 * Resolves a string `productSource` (referenced in campaign JSON) into a
 * concrete product array. Keeps JSON payloads compact; in a real backend
 * the catalog would be embedded or fetched separately by ID.
 */
export function resolveProductSource(source: string | undefined): Product[] {
  switch (source) {
    case 'school':
      return SCHOOL_PRODUCTS.slice(0, 4);
    case 'school-long':
      return buildLongList(SCHOOL_PRODUCTS, 6);
    case 'playhouse':
      return PLAYHOUSE_PRODUCTS.slice(0, 4);
    case 'playhouse-long':
      return buildLongList(PLAYHOUSE_PRODUCTS, 6);
    case 'carnival':
      return CARNIVAL_PRODUCTS.slice(0, 4);
    case 'carnival-long':
      return buildLongList(CARNIVAL_PRODUCTS, 6);
    default:
      return [];
  }
}
