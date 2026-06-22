import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../../../shared/models/item.model';

// ─── Supporting Interfaces ────────────────────────────────────────────────────

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface OrderPayload {
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderReceipt {
  orderId: string;
  totalAmount: number;
  estimatedDelivery: string;
  status: 'confirmed' | 'pending';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EcommerceService {

  private readonly API_BASE = '/api';

  private mockItems: Item[] = [
    // ── أدوات (Tools) ────────────────────────────────────────────────────────
    {
      _id: '1', supplierId: 's1',
      title: 'طقم مفاتيح ربط احترافي',
      description: 'طقم مفاتيح ربط من الفولاذ المقاوم للصدأ - 24 قطعة بأحجام مختلفة',
      price: 349.99, stockQuantity: 30, category: 'Tools', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2', supplierId: 's1',
      title: 'طقم لقم حفر احترافي',
      description: 'طقم لقم حفر متعددة الاستخدامات - مناسب للخشب والمعدن والخرسانة',
      price: 149.99, stockQuantity: 50, category: 'Tools', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3', supplierId: 's1',
      title: 'مطرقة كهربائية ثقيلة',
      description: 'مطرقة كهربائية 1500W مع وضع الدوران والطرق للأعمال الشاقة',
      price: 899.99, stockQuantity: 15, category: 'Tools', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '4', supplierId: 's1',
      title: 'ماكينة قطع زوايا',
      description: 'ماكينة قطع احترافية 2200W بقرص 230mm لقطع المعادن والحجارة',
      price: 1250.00, stockQuantity: 3, category: 'Tools', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── معدات (Equipment) ────────────────────────────────────────────────────
    {
      _id: '5', supplierId: 's2',
      title: 'ونش هيدروليكي 3 طن',
      description: 'ونش هيدروليكي عالي الجودة بحمولة 3 طن - مثالي لرفع السيارات',
      price: 1899.99, stockQuantity: 8, category: 'Equipment', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '6', supplierId: 's2',
      title: 'كمبريسور هواء صناعي',
      description: 'كمبريسور هواء 50 لتر بضغط 8 بار - مثالي للورش والغسيل',
      price: 2500.00, stockQuantity: 6, category: 'Equipment', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '7', supplierId: 's2',
      title: 'ماكينة لحام MIG',
      description: 'ماكينة لحام MIG/MAG احترافية 250A مع خرطوم الغاز والتوصيلات',
      price: 3200.00, stockQuantity: 4, category: 'Equipment', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '8', supplierId: 's2',
      title: 'جهاز فحص تشخيص السيارات',
      description: 'جهاز OBD2 احترافي لفحص جميع أعطال السيارات ودعم جميع الماركات',
      price: 1750.00, stockQuantity: 12, category: 'Equipment', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── قطع غيار (Spare Parts) ───────────────────────────────────────────────
    {
      _id: '9', supplierId: 's3',
      title: 'طقم شمعات إشعال NGK',
      description: 'طقم شمعات إشعال NGK الأصلية - متوافق مع معظم السيارات اليابانية والكورية',
      price: 149.99, stockQuantity: 200, category: 'Spare Parts', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '10', supplierId: 's3',
      title: 'فلتر زيت محرك',
      description: 'فلتر زيت عالي الكفاءة - يدوم حتى 10,000 كم ومتوافق مع جميع أنواع الزيوت',
      price: 65.00, stockQuantity: 150, category: 'Spare Parts', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '11', supplierId: 's3',
      title: 'تيل فرامل أمامي',
      description: 'تيل فرامل أمامي عالي الأداء - متوافق مع تويوتا وهيونداي وكيا',
      price: 220.00, stockQuantity: 2, category: 'Spare Parts', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '12', supplierId: 's3',
      title: 'بطارية سيارة 70Ah',
      description: 'بطارية سيارة 70 أمبير بدون صيانة - ضمان سنتين وجاهزة للتركيب فوراً',
      price: 850.00, stockQuantity: 0, category: 'Spare Parts', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── عُدد (Hardware) ───────────────────────────────────────────────────────
    {
      _id: '13', supplierId: 's4',
      title: 'صندوق تخزين أدوات محترف',
      description: 'صندوق تخزين بلاستيك مقوى بـ 5 أدراج - مقاوم للصدأ والصدمات',
      price: 450.00, stockQuantity: 20, category: 'Hardware', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '14', supplierId: 's4',
      title: 'تشكيلة مسامير استانلس ستيل',
      description: 'تشكيلة من مسامير الاستانلس ستيل بأحجام مختلفة - 500 قطعة في علبة',
      price: 180.00, stockQuantity: 75, category: 'Hardware', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '15', supplierId: 's4',
      title: 'طقم مثاقب وقضبان تمديد',
      description: 'طقم مثاقب احترافي مع قضبان تمديد - مناسب للأماكن الضيقة والبعيدة',
      price: 320.00, stockQuantity: 0, category: 'Hardware', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── سباكة (Plumbing) ─────────────────────────────────────────────────────
    {
      _id: '16', supplierId: 's5',
      title: 'طقم أدوات سباكة احترافي',
      description: 'طقم أدوات سباكة شامل يحتوي على مفاتيح وأنابيب ومواسير بأحجام مختلفة',
      price: 520.00, stockQuantity: 25, category: 'Plumbing', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '17', supplierId: 's5',
      title: 'خلاط حوض فضي عالي الجودة',
      description: 'خلاط حوض من النحاس المطلي بالكروم - ضمان 5 سنوات ضد التسريب',
      price: 380.00, stockQuantity: 40, category: 'Plumbing', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '18', supplierId: 's5',
      title: 'سيفون أرضي مقاوم للروائح',
      description: 'سيفون أرضي من الاستانلس ستيل مع صمام مانع للروائح - سهل التركيب',
      price: 95.00, stockQuantity: 100, category: 'Plumbing', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '19', supplierId: 's5',
      title: 'أنابيع PPR حرارية 20mm',
      description: 'أنابيع PPR مقاومة للحرارة حتى 95 درجة - مناسبة للمياه الساخنة والباردة',
      price: 45.00, stockQuantity: 500, category: 'Plumbing', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── نجارة (Carpentry) ────────────────────────────────────────────────────
    {
      _id: '20', supplierId: 's6',
      title: 'منشار كهربائي دائري احترافي',
      description: 'منشار كهربائي دائري 1800W بقرص 185mm - مثالي لقطع الخشب بدقة عالية',
      price: 1100.00, stockQuantity: 10, category: 'Carpentry', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '21', supplierId: 's6',
      title: 'ماكينة تفريز خشب',
      description: 'ماكينة تفريز 2000W مع طقم أدوات تفريز متعددة الأشكال للأعمال الاحترافية',
      price: 1650.00, stockQuantity: 7, category: 'Carpentry', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '22', supplierId: 's6',
      title: 'طقم إزاميل نجارة احترافية',
      description: 'طقم إزاميل من الفولاذ عالي الكربون - 8 قطع بأحجام مختلفة مع حقيبة جلد',
      price: 280.00, stockQuantity: 35, category: 'Carpentry', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── سيراميك (Ceramics) ───────────────────────────────────────────────────
    {
      _id: '23', supplierId: 's7',
      title: 'قاطعة سيراميك احترافية 60cm',
      description: 'قاطعة سيراميك يدوية بطول 60 سم - مثالية للبلاط والسيراميك بقطع نظيف',
      price: 650.00, stockQuantity: 15, category: 'Ceramics', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '24', supplierId: 's7',
      title: 'لاصق بلاط فليكس بلاس',
      description: 'لاصق بلاط مرن عالي القوة - مناسب للأسطح الداخلية والخارجية، كيس 25 كجم',
      price: 85.00, stockQuantity: 200, category: 'Ceramics', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '25', supplierId: 's7',
      title: 'روبة حشو فواصل سيراميك',
      description: 'روبة إيبوكسي للحشو بين الفواصل - مقاومة للماء والبقع، متوفرة بألوان متعددة',
      price: 120.00, stockQuantity: 80, category: 'Ceramics', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── دهانات (Painting) ────────────────────────────────────────────────────
    {
      _id: '26', supplierId: 's8',
      title: 'رولة دهان احترافية مع كيت',
      description: 'رولة دهان فيلكرو مع طارة وعصا تمديد - مناسبة لجميع أنواع الدهانات',
      price: 95.00, stockQuantity: 60, category: 'Painting', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '27', supplierId: 's8',
      title: 'كمبريسور رش دهان هوائي',
      description: 'كمبريسور رش دهان هوائي 600W مع مسدس رش احترافي - للأسطح الكبيرة',
      price: 1200.00, stockQuantity: 9, category: 'Painting', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '28', supplierId: 's8',
      title: 'بوية جدران بيضاء مطفية 18 لتر',
      description: 'بوية جدران داخلية مطفية عالية التغطية - مضادة للبكتيريا وسهلة التنظيف',
      price: 420.00, stockQuantity: 45, category: 'Painting', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── كهربا (Electrical) ───────────────────────────────────────────────────
    {
      _id: '29', supplierId: 's9',
      title: 'لوحة كهربائية توزيع 12 دائرة',
      description: 'لوحة توزيع كهربائية 12 دائرة مع قواطع حماية - مناسبة للمنازل والمكاتب',
      price: 380.00, stockQuantity: 20, category: 'Electrical', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '30', supplierId: 's9',
      title: 'كابل كهربائي نحاس 2.5mm',
      description: 'كابل كهربائي نحاسي معزول 2.5mm - لفة 100 متر مناسبة للتمديدات المنزلية',
      price: 560.00, stockQuantity: 30, category: 'Electrical', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '31', supplierId: 's9',
      title: 'طقم عدة كهربائي معزول',
      description: 'طقم عدة كهربائي 12 قطعة بمقابض معزولة حتى 1000 فولت - شهادة CE',
      price: 245.00, stockQuantity: 0, category: 'Electrical', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── تكييف (HVAC) ─────────────────────────────────────────────────────────
    {
      _id: '32', supplierId: 's10',
      title: 'غاز فريون R32 للتكييف',
      description: 'غاز فريون R32 صديق للبيئة - أسطوانة 10 كجم للتكييفات الحديثة',
      price: 750.00, stockQuantity: 18, category: 'HVAC', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '33', supplierId: 's10',
      title: 'مضخة تفريغ تكييف 2 مرحلة',
      description: 'مضخة تفريغ مرحلتين 1/4 حصان - ضرورية لتركيب وصيانة التكييفات',
      price: 890.00, stockQuantity: 12, category: 'HVAC', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '34', supplierId: 's10',
      title: 'فلتر هواء تكييف عالمي',
      description: 'فلتر هواء تكييف قابل للغسيل - يناسب معظم ماركات التكييفات المنزلية',
      price: 65.00, stockQuantity: 150, category: 'HVAC', status: 'active',
      createdAt: new Date().toISOString(),
    },
    // ── تنظيف (Cleaning) ─────────────────────────────────────────────────────
    {
      _id: '35', supplierId: 's11',
      title: 'ماكينة غسيل بالضغط العالي',
      description: 'ماكينة غسيل بضغط 150 بار وقوة 2000W - مثالية للسيارات والأرضيات',
      price: 1350.00, stockQuantity: 14, category: 'Cleaning', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '36', supplierId: 's11',
      title: 'مكنسة كهربائية صناعية',
      description: 'مكنسة كهربائية صناعية 30 لتر 1400W - تمتص السوائل والمواد الجافة',
      price: 980.00, stockQuantity: 8, category: 'Cleaning', status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '37', supplierId: 's11',
      title: 'منظف متعدد الأغراض مركز',
      description: 'منظف مركز متعدد الأغراض - يزيل الشحوم والبقع الصعبة، جالون 5 لتر',
      price: 120.00, stockQuantity: 200, category: 'Cleaning', status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  // ── Cart State ───────────────────────────────────────────────────────────────
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItems$.asObservable();
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );

  constructor(private http: HttpClient) {}

  // ── Product Fetching ─────────────────────────────────────────────────────────
  getProducts(search?: string, category?: string): Observable<Item[]> {
    let results = [...this.mockItems];
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        item =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }
    if (category) {
      results = results.filter(item => item.category === category);
    }
    return of(results);
  }

  getProductById(id: string): Observable<Item> {
    const found = this.mockItems.find(item => item._id === id);
    if (!found) throw new Error(`Item with id "${id}" not found.`);
    return of(found);
  }

  // ── Cart Management ──────────────────────────────────────────────────────────
  addToCart(item: Item, quantity = 1): void {
    const current = this.cartItems$.getValue();
    const existingIndex = current.findIndex(ci => ci.item._id === item._id);
    if (existingIndex !== -1) {
      const updated = current.map((ci, idx) =>
        idx === existingIndex ? { ...ci, quantity: ci.quantity + quantity } : ci
      );
      this.cartItems$.next(updated);
    } else {
      this.cartItems$.next([...current, { item, quantity }]);
    }
  }

  removeFromCart(itemId: string): void {
    const updated = this.cartItems$.getValue().filter(ci => ci.item._id !== itemId);
    this.cartItems$.next(updated);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(itemId); return; }
    const updated = this.cartItems$.getValue().map(ci =>
      ci.item._id === itemId ? { ...ci, quantity } : ci
    );
    this.cartItems$.next(updated);
  }

  clearCart(): void { this.cartItems$.next([]); }

  getCartTotal(): number {
    return this.cartItems$.getValue()
      .reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────
  placeOrder(orderPayload: OrderPayload): Observable<OrderReceipt> {
    return this.http.post<OrderReceipt>(`${this.API_BASE}/orders`, orderPayload);
  }
}