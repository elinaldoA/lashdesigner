import { create } from 'zustand';
import type {
  AppState, Client, Service, Appointment, BlockedSlot, Product,
  Sale, Transaction, Testimonial, GalleryImage,
  ContactMessage, BookingRequest, SiteContent, User,
  StoreOrder, StoreProduct, CartItem,
} from '../types';
import {
  authApi, statsApi,
  clientsApi, servicesApi, appointmentsApi, blockedSlotsApi,
  productsApi, salesApi, transactionsApi, testimonialsApi,
  galleryApi, contactApi, bookingApi, siteContentApi,
  storeOrdersApi, storePublicApi,
} from '../services/api';

const emptySiteContent: SiteContent = {
  hero: { title: '', subtitle: '', ctaText: '', ctaLink: '/agendamento', backgroundImage: '', overlayOpacity: 0.5 },
  about: { title: '', description: '', mission: '', vision: '', values: [], yearsExperience: 0, clientsServed: 0 },
  contact: { address: '', city: '', state: '', zipCode: '', phone: '', whatsapp: '', email: '', mapEmbed: '', businessHours: [] },
  settings: { siteName: 'Lash Designer', tagline: '', primaryColor: '#ec4899', secondaryColor: '#be185d', accentColor: '#eab308', darkMode: false, socialLinks: {}, seo: {} },
};

interface Actions {
  login:           (email: string, password: string) => Promise<boolean>;
  logout:          () => Promise<void>;
  checkAuth:       () => Promise<boolean>;
  loadPublicData:  () => Promise<void>;
  loadAdminData:   () => Promise<void>;
  loadAll:         () => Promise<void>;

  addClient:    (c: Omit<Client, 'id' | 'registeredAt' | 'totalAppointments'>) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addService:    (s: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, s: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addAppointment:    (a: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, a: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addBlockedSlot:    (b: Omit<BlockedSlot, 'id'>) => Promise<void>;
  removeBlockedSlot: (id: string) => Promise<void>;

  addProduct:    (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addSale: (s: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;

  addTransaction:    (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addTestimonial:    (t: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, t: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  addGalleryImage:    (g: Omit<GalleryImage, 'id' | 'uploadedAt'>) => Promise<void>;
  updateGalleryImage: (id: string, g: Partial<GalleryImage>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;

  addContactMessage: (m: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  markMessageRead:   (id: string) => Promise<void>;
  deleteMessage:     (id: string) => Promise<void>;

  addBookingRequest:    (b: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => Promise<BookingRequest>;
  updateBookingRequest: (id: string, b: Partial<BookingRequest>) => Promise<void>;

  updateSiteContent: (content: Partial<SiteContent>) => Promise<void>;

  // Store
  loadStoreProducts:   () => Promise<void>;
  loadStoreOrders:     () => Promise<void>;
  updateStoreOrderStatus: (id: string, status: string) => Promise<void>;
  deleteStoreOrder:    (id: string) => Promise<void>;
  addToCart:           (item: CartItem) => void;
  removeFromCart:      (productId: string) => void;
  updateCartQuantity:  (productId: string, quantity: number) => void;
  clearCart:           () => void;
}

type Store = AppState & Actions & { loading: boolean; error: string | null };

export const useStore = create<Store>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  clients: [],
  services: [],
  appointments: [],
  blockedSlots: [],
  products: [],
  sales: [],
  transactions: [],
  testimonials: [],
  gallery: [],
  contactMessages: [],
  bookingRequests: [],
  siteContent: emptySiteContent,
  storeOrders: [],
  storeProducts: [],
  cart: [],
  pageViews: 0,

  // ── Auth ───────────────────────────────────────────────────────────
  login: async (email, password) => {
    try {
      const { user } = await authApi.login(email, password);
      set({ user: user as User, isAuthenticated: true });
      await get().loadAdminData();
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // prossegue mesmo com erro no backend
    } finally {
      set({
        user: null, isAuthenticated: false,
        clients: [], appointments: [], products: [], sales: [],
        transactions: [], contactMessages: [], bookingRequests: [], pageViews: 0,
      });
    }
  },

  checkAuth: async () => {
    try {
      const { user } = await authApi.me();
      set({ user: user as User, isAuthenticated: true });
      return true;
    } catch {
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },

  // ── Carrega dados do site público (sem autenticação) ───────────────
  loadPublicData: async () => {
    set({ loading: true, error: null });
    try {
      const [services, blockedSlots, testimonials, gallery, siteRaw, storeProducts] = await Promise.all([
        servicesApi.getAll(),
        blockedSlotsApi.getAll(),
        testimonialsApi.getAll(),
        galleryApi.getAll(),
        siteContentApi.getAll(),
        storePublicApi.getProducts(),
      ]);

      const site = siteRaw as any;
      const siteContent: SiteContent = {
        hero:     site.hero     ?? emptySiteContent.hero,
        about:    site.about    ?? emptySiteContent.about,
        contact:  site.contact  ?? emptySiteContent.contact,
        settings: site.settings ?? emptySiteContent.settings,
      };

      set({
        services:      services      as Service[],
        blockedSlots:  blockedSlots  as BlockedSlot[],
        testimonials:  testimonials  as Testimonial[],
        gallery:       gallery       as GalleryImage[],
        storeProducts: storeProducts as StoreProduct[],
        siteContent,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      set({ loading: false, error: e.message });
      console.error('❌ Erro ao carregar dados públicos:', e.message);
    }
  },

  // ── Carrega dados do admin (requer autenticação) ───────────────────
  loadAdminData: async () => {
    try {
      const [clients, appointments, products, sales, transactions, contactMessages, bookingRequests, storeOrders, statsRaw] = await Promise.all([
        clientsApi.getAll(),
        appointmentsApi.getAll(),
        productsApi.getAll(),
        salesApi.getAll(),
        transactionsApi.getAll(),
        contactApi.getAll(),
        bookingApi.getAll(),
        storeOrdersApi.getAll(),
        statsApi.get(),
      ]);

      const stats = statsRaw as { pageViews: number };

      set({
        clients:         clients         as Client[],
        appointments:    appointments    as Appointment[],
        products:        products        as Product[],
        sales:           sales           as Sale[],
        transactions:    transactions    as Transaction[],
        contactMessages: contactMessages as ContactMessage[],
        bookingRequests: bookingRequests as BookingRequest[],
        storeOrders:     storeOrders     as StoreOrder[],
        pageViews:       stats.pageViews ?? 0,
      });
    } catch (e: any) {
      console.error('❌ Erro ao carregar dados do admin:', e.message);
    }
  },

  // ── Carrega tudo (público + admin) — usado quando já autenticado ───
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [
        clients, services, appointments, blockedSlots, products,
        sales, transactions, testimonials, gallery,
        contactMessages, bookingRequests, storeOrders, storeProducts, siteRaw, statsRaw,
      ] = await Promise.all([
        clientsApi.getAll(),
        servicesApi.getAll(),
        appointmentsApi.getAll(),
        blockedSlotsApi.getAll(),
        productsApi.getAll(),
        salesApi.getAll(),
        transactionsApi.getAll(),
        testimonialsApi.getAll(),
        galleryApi.getAll(),
        contactApi.getAll(),
        bookingApi.getAll(),
        storeOrdersApi.getAll(),
        storePublicApi.getProducts(),
        siteContentApi.getAll(),
        statsApi.get(),
      ]);

      const site = siteRaw as any;
      const siteContent: SiteContent = {
        hero:     site.hero     ?? emptySiteContent.hero,
        about:    site.about    ?? emptySiteContent.about,
        contact:  site.contact  ?? emptySiteContent.contact,
        settings: site.settings ?? emptySiteContent.settings,
      };

      const stats = statsRaw as { pageViews: number };

      set({
        clients:         clients         as Client[],
        services:        services        as Service[],
        appointments:    appointments    as Appointment[],
        blockedSlots:    blockedSlots    as BlockedSlot[],
        products:        products        as Product[],
        sales:           sales           as Sale[],
        transactions:    transactions    as Transaction[],
        testimonials:    testimonials    as Testimonial[],
        gallery:         gallery         as GalleryImage[],
        contactMessages: contactMessages as ContactMessage[],
        bookingRequests: bookingRequests as BookingRequest[],
        storeOrders:     storeOrders     as StoreOrder[],
        storeProducts:   storeProducts   as StoreProduct[],
        siteContent,
        pageViews:       stats.pageViews ?? 0,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      set({ loading: false, error: e.message });
      console.error('❌ Erro ao carregar dados do banco MySQL:', e.message);
    }
  },

  // ── Clients ────────────────────────────────────────────────────────
  addClient: async (c) => {
    const created = await clientsApi.create(c) as Client;
    set(s => ({ clients: [...s.clients, created] }));
  },
  updateClient: async (id, c) => {
    const updated = await clientsApi.update(id, c) as Client;
    set(s => ({ clients: s.clients.map(x => x.id === id ? updated : x) }));
  },
  deleteClient: async (id) => {
    await clientsApi.remove(id);
    set(s => ({ clients: s.clients.filter(x => x.id !== id) }));
  },

  // ── Services ───────────────────────────────────────────────────────
  addService: async (sv) => {
    const created = await servicesApi.create(sv) as Service;
    set(s => ({ services: [...s.services, created] }));
  },
  updateService: async (id, sv) => {
    const full = { ...get().services.find(x => x.id === id)!, ...sv };
    const updated = await servicesApi.update(id, full) as Service;
    set(s => ({ services: s.services.map(x => x.id === id ? updated : x) }));
  },
  deleteService: async (id) => {
    await servicesApi.remove(id);
    set(s => ({ services: s.services.filter(x => x.id !== id) }));
  },

  // ── Appointments ───────────────────────────────────────────────────
  addAppointment: async (a) => {
    const created = await appointmentsApi.create(a) as Appointment;
    set(s => ({ appointments: [...s.appointments, created] }));
  },
  updateAppointment: async (id, a) => {
    const full = { ...get().appointments.find(x => x.id === id)!, ...a };
    const updated = await appointmentsApi.update(id, full) as Appointment;
    set(s => ({ appointments: s.appointments.map(x => x.id === id ? updated : x) }));
  },
  deleteAppointment: async (id) => {
    await appointmentsApi.remove(id);
    set(s => ({ appointments: s.appointments.filter(x => x.id !== id) }));
  },
  addBlockedSlot: async (b) => {
    const created = await blockedSlotsApi.create(b) as BlockedSlot;
    set(s => ({ blockedSlots: [...s.blockedSlots, created] }));
  },
  removeBlockedSlot: async (id) => {
    await blockedSlotsApi.remove(id);
    set(s => ({ blockedSlots: s.blockedSlots.filter(x => x.id !== id) }));
  },

  // ── Products ───────────────────────────────────────────────────────
  addProduct: async (p) => {
    const created = await productsApi.create(p) as Product;
    set(s => ({ products: [...s.products, created] }));
  },
  updateProduct: async (id, p) => {
    const full = { ...get().products.find(x => x.id === id)!, ...p };
    const updated = await productsApi.update(id, full) as Product;
    set(s => ({ products: s.products.map(x => x.id === id ? updated : x) }));
  },
  deleteProduct: async (id) => {
    await productsApi.remove(id);
    set(s => ({ products: s.products.filter(x => x.id !== id) }));
  },

  // ── Sales ──────────────────────────────────────────────────────────
  addSale: async (sl) => {
    const created = await salesApi.create(sl) as Sale;
    set(s => ({ sales: [...s.sales, created] }));
  },

  // ── Transactions ───────────────────────────────────────────────────
  addTransaction: async (t) => {
    const created = await transactionsApi.create(t) as Transaction;
    set(s => ({ transactions: [...s.transactions, created] }));
  },
  updateTransaction: async (id, t) => {
    const full = { ...get().transactions.find(x => x.id === id)!, ...t };
    const updated = await transactionsApi.update(id, full) as Transaction;
    set(s => ({ transactions: s.transactions.map(x => x.id === id ? updated : x) }));
  },
  deleteTransaction: async (id) => {
    await transactionsApi.remove(id);
    set(s => ({ transactions: s.transactions.filter(x => x.id !== id) }));
  },

  // ── Testimonials ───────────────────────────────────────────────────
  addTestimonial: async (t) => {
    const created = await testimonialsApi.create(t) as Testimonial;
    set(s => ({ testimonials: [...s.testimonials, created] }));
  },
  updateTestimonial: async (id, t) => {
    const full = { ...get().testimonials.find(x => x.id === id)!, ...t };
    const updated = await testimonialsApi.update(id, full) as Testimonial;
    set(s => ({ testimonials: s.testimonials.map(x => x.id === id ? updated : x) }));
  },
  deleteTestimonial: async (id) => {
    await testimonialsApi.remove(id);
    set(s => ({ testimonials: s.testimonials.filter(x => x.id !== id) }));
  },

  // ── Gallery ────────────────────────────────────────────────────────
  addGalleryImage: async (g) => {
    const created = await galleryApi.create(g) as GalleryImage;
    set(s => ({ gallery: [...s.gallery, created] }));
  },
  updateGalleryImage: async (id, g) => {
    const full = { ...get().gallery.find(x => x.id === id)!, ...g };
    const updated = await galleryApi.update(id, full) as GalleryImage;
    set(s => ({ gallery: s.gallery.map(x => x.id === id ? updated : x) }));
  },
  deleteGalleryImage: async (id) => {
    await galleryApi.remove(id);
    set(s => ({ gallery: s.gallery.filter(x => x.id !== id) }));
  },

  // ── Contact Messages ───────────────────────────────────────────────
  addContactMessage: async (m) => {
    const created = await contactApi.create(m) as ContactMessage;
    set(s => ({ contactMessages: [...s.contactMessages, created] }));
  },
  markMessageRead: async (id) => {
    await contactApi.markRead(id);
    set(s => ({ contactMessages: s.contactMessages.map(x => x.id === id ? { ...x, read: true } : x) }));
  },
  deleteMessage: async (id) => {
    await contactApi.remove(id);
    set(s => ({ contactMessages: s.contactMessages.filter(x => x.id !== id) }));
  },

  // ── Booking Requests ───────────────────────────────────────────────
  addBookingRequest: async (b) => {
    const created = await bookingApi.create(b) as BookingRequest;
    set(s => ({ bookingRequests: [...s.bookingRequests, created] }));
    return created;
  },
  updateBookingRequest: async (id, b) => {
    if (b.status) await bookingApi.updateStatus(id, b.status);
    set(s => ({ bookingRequests: s.bookingRequests.map(x => x.id === id ? { ...x, ...b } : x) }));
  },

  // ── Site Content ───────────────────────────────────────────────────
  updateSiteContent: async (content) => {
    const updates = Object.entries(content) as [keyof SiteContent, any][];
    await Promise.all(updates.map(([section, data]) => siteContentApi.updateSection(section, data)));
    set(s => ({ siteContent: { ...s.siteContent, ...content } }));
  },

  // ── Store ──────────────────────────────────────────────────────────
  loadStoreProducts: async () => {
    const products = await storePublicApi.getProducts();
    set({ storeProducts: products as StoreProduct[] });
  },
  loadStoreOrders: async () => {
    const orders = await storeOrdersApi.getAll();
    set({ storeOrders: orders as StoreOrder[] });
  },
  updateStoreOrderStatus: async (id, status) => {
    await storeOrdersApi.updateStatus(id, status);
    set(s => ({ storeOrders: s.storeOrders.map(o => o.id === id ? { ...o, status: status as any } : o) }));
  },
  deleteStoreOrder: async (id) => {
    await storeOrdersApi.remove(id);
    set(s => ({ storeOrders: s.storeOrders.filter(o => o.id !== id) }));
  },

  addToCart: (item) => {
    set(s => {
      const existing = s.cart.find(c => c.productId === item.productId);
      if (existing) {
        return { cart: s.cart.map(c => c.productId === item.productId ? { ...c, quantity: c.quantity + item.quantity } : c) };
      }
      return { cart: [...s.cart, item] };
    });
  },
  removeFromCart: (productId) => {
    set(s => ({ cart: s.cart.filter(c => c.productId !== productId) }));
  },
  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set(s => ({ cart: s.cart.filter(c => c.productId !== productId) }));
    } else {
      set(s => ({ cart: s.cart.map(c => c.productId === productId ? { ...c, quantity } : c) }));
    }
  },
  clearCart: () => set({ cart: [] }),
}));
