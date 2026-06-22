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

  it('should call getInventory with correct endpoint', () => {
    const mockItems = [{ _id: '1' }];
    apiServiceSpy.get.mockReturnValue(of(mockItems));
    
    service.getInventory('sup123').subscribe(items => {
      expect(items).toEqual(mockItems);
    });
    
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/inventory?supplierId=sup123');
  });

  it('should call getItemById with correct endpoint', () => {
    const mockItem = { _id: '1' };
    apiServiceSpy.get.mockReturnValue(of(mockItem));
    
    service.getItemById('item123').subscribe(item => {
      expect(item).toEqual(mockItem);
    });
    
    expect(apiServiceSpy.get).toHaveBeenCalledWith('/inventory/item123');
  });

  it('should call createItem with correct endpoint', () => {
    const payload = { title: 'New Item' };
    const mockItem = { _id: '1', title: 'New Item' };
    apiServiceSpy.post.mockReturnValue(of(mockItem));
    
    service.createItem(payload as any).subscribe(item => {
      expect(item).toEqual(mockItem);
    });
    
    expect(apiServiceSpy.post).toHaveBeenCalledWith('/inventory', payload);
  });

  it('should call updateItem with correct endpoint', () => {
    const payload = { title: 'Updated Item' };
    const mockItem = { _id: 'item123', title: 'Updated Item' };
    apiServiceSpy.put.mockReturnValue(of(mockItem));
    
    service.updateItem('item123', payload as any).subscribe(item => {
      expect(item).toEqual(mockItem);
    });
    
    expect(apiServiceSpy.put).toHaveBeenCalledWith('/inventory/item123', payload);
  });

  it('should call deleteItem with correct endpoint', () => {
    apiServiceSpy.delete.mockReturnValue(of(undefined));
    
    service.deleteItem('item123').subscribe();
    
    expect(apiServiceSpy.delete).toHaveBeenCalledWith('/inventory/item123');
  });
});
