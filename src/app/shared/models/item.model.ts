export interface Item {
  _id: string;
  supplierId: string;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  status: 'active' | 'out-of-stock' | 'draft';
  createdAt: string;
}
