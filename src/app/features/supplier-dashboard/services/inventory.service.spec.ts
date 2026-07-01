import { InventoryService } from './inventory.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('InventoryService', () => {
  let service: InventoryService;
  let apiServiceSpy: any;

  beforeEach(() => {
    apiServiceSpy = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
    service = new InventoryService(apiServiceSpy);
  });

  it('should call getInventory with correct endpoint and map name to title', () => {
    const mockBackendItems = [{ id: '1', name: 'Product A', price: 100 }];
    const expectedMappedItems = [
      expect.objectContaining({ _id: '1', title: 'Product A', price: 100 })
    ];
    apiServiceSpy.get.mockReturnValue(of(mockBackendItems));
    
    service.getInventory('sup123').subscribe(items => {
      expect(items).toEqual(expectedMappedItems);
    });
    
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/products');
  });

  it('should call getItemById with correct endpoint and map product', () => {
    const mockBackendItem = { id: '1', name: 'Product A' };
    const expectedMappedItem = expect.objectContaining({ _id: '1', title: 'Product A' });
    apiServiceSpy.get.mockReturnValue(of(mockBackendItem));
    
    service.getItemById('item123').subscribe(item => {
      expect(item).toEqual(expectedMappedItem);
    });
    
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/products/item123');
  });

  it('should call createItem with mapped payload and return mapped product', () => {
    const payload = { title: 'New Item', description: 'Test desc', price: 50 };
    const mockBackendItem = { id: '1', name: 'New Item', description: 'Test desc', price: 50 };
    const expectedMappedItem = expect.objectContaining({ _id: '1', title: 'New Item' });
    apiServiceSpy.post.mockReturnValue(of(mockBackendItem));
    
    service.createItem(payload as any).subscribe(item => {
      expect(item).toEqual(expectedMappedItem);
    });
    
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/products', {
      name: 'New Item',
      description: 'Test desc',
      price: 50,
      stockQuantity: undefined,
      category: undefined,
      imageUrl: undefined,
      status: undefined
    });
  });

  it('should call updateItem with mapped payload and return mapped product', () => {
    const payload = { title: 'Updated Item' };
    const mockBackendItem = { id: 'item123', name: 'Updated Item' };
    const expectedMappedItem = expect.objectContaining({ _id: 'item123', title: 'Updated Item' });
    apiServiceSpy.put.mockReturnValue(of(mockBackendItem));
    
    service.updateItem('item123', payload as any).subscribe(item => {
      expect(item).toEqual(expectedMappedItem);
    });
    
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/products/item123', {
      name: 'Updated Item',
      description: undefined,
      price: undefined,
      stockQuantity: undefined,
      category: undefined,
      imageUrl: undefined,
      status: undefined
    });
  });

  it('should call deleteItem with correct endpoint', () => {
    apiServiceSpy.delete.mockReturnValue(of(undefined));
    
    service.deleteItem('item123').subscribe();
    
    expect(apiServiceSpy.delete).toHaveBeenCalledWith('/products/item123');
  });
});
