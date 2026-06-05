// ==================== SHARED TYPES ====================

export type ID = string;

// Auth
export interface User {
  id: ID;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

// Clients
export interface Client {
  id: ID;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  birthdate?: string;
  notes?: string;
  registeredAt: string;
  source: 'manual' | 'website';
  totalAppointments: number;
  lastService?: string;
  nextMaintenanceSuggested?: string;
  photo?: string;
}

// Services
export interface Service {
  id: ID;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  image?: string;
  category: string;
  active: boolean;
  featured: boolean;
}

// Appointments
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Appointment {
  id: ID;
  clientId: ID;
  clientName: string;
  serviceId: ID;
  serviceName: string;
  date: string; // ISO
  time: string; // HH:mm
  duration: number;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  source: 'manual' | 'website';
  createdAt: string;
}

export interface BlockedSlot {
  id: ID;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

// Products / Inventory
export interface Product {
  id: ID;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  minStock: number;
  unit: string;
  supplier?: string;
  image?: string;
  storeVisible: boolean;
  storeFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sales
export interface SaleItem {
  id: ID;
  type: 'service' | 'product';
  itemId: ID;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'transfer';

export interface Sale {
  id: ID;
  clientId?: ID;
  clientName?: string;
  appointmentId?: ID;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
}

// Cash Flow
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: ID;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  date: string;
  saleId?: ID;
  notes?: string;
  createdAt: string;
}

// ==================== SITE CONTENT TYPES ====================

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  overlayOpacity: number;
}

export interface AboutContent {
  title: string;
  description: string;
  photo?: string;
  mission: string;
  vision: string;
  values: string[];
  yearsExperience: number;
  clientsServed: number;
}

export interface Testimonial {
  id: ID;
  clientName: string;
  photo?: string;
  text: string;
  rating: number;
  date: string;
  approved: boolean;
  source: 'manual' | 'website';
}

export interface GalleryImage {
  id: ID;
  url: string;
  title?: string;
  category: 'before-after' | 'work' | 'studio' | 'general';
  order: number;
  uploadedAt: string;
}

export interface ContactInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  mapEmbed: string;
  businessHours: BusinessHour[];
}

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface ContactMessage {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  seo: {
    [page: string]: {
      title: string;
      description: string;
      keywords: string;
    };
  };
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactInfo;
  settings: SiteSettings;
}

// Store / Loja Online
export type StoreOrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface StoreOrderItem {
  id: ID;
  orderId: ID;
  productId?: ID;
  name: string;
  quantity: number;
  price: number;
}

export interface StoreOrder {
  id: ID;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: StoreOrderStatus;
  notes?: string;
  items: StoreOrderItem[];
  createdAt: string;
}

export interface StoreProduct {
  id: ID;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  storeFeatured: boolean;
}

export interface CartItem {
  productId: ID;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

// Booking (from website)
export interface BookingRequest {
  id: ID;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp?: string;
  clientBirthdate?: string;
  serviceId: ID;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// Store State
export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Data
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  products: Product[];
  sales: Sale[];
  transactions: Transaction[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  contactMessages: ContactMessage[];
  bookingRequests: BookingRequest[];

  // Site Content
  siteContent: SiteContent;

  // Store
  storeOrders: StoreOrder[];
  storeProducts: StoreProduct[];
  cart: CartItem[];

  // Stats
  pageViews: number;
}
