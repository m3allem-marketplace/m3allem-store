export interface ShopInfo {
  shopId: string;
  nameAr: string;
  address: string;
  rating: number;
  deliveryTime: string;
}

export interface Item {
  _id: string;
  supplierId: string;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  subCategory?: string;
  brand?: string;
  currency?: string;
  unit?: string;
  imageUrl?: string;
  shop?: ShopInfo;
  status: 'active' | 'out-of-stock' | 'draft';
  createdAt: string;
}
