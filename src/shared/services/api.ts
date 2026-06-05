import type {
  Client, Service, Appointment, BlockedSlot, Product, Sale, Transaction,
  Testimonial, GalleryImage, ContactMessage, BookingRequest, SiteContent,
  StoreOrder, StoreProduct, CartItem,
} from '../types';

const BASE    = '/api';
const TIMEOUT = 15_000; // 15 segundos

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(res.status, err.error || `Erro ${res.status} na API`);
    }

    return res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === 'AbortError') {
      throw new ApiError(408, 'A requisição demorou demais. Verifique sua conexão.');
    }
    throw new ApiError(0, (e as Error).message || 'Erro de rede desconhecido.');
  } finally {
    clearTimeout(timer);
  }
}

const get   = <T>(path: string)                 => req<T>('GET',    path);
const post  = <T>(path: string, body: unknown)  => req<T>('POST',   path, body);
const put   = <T>(path: string, body: unknown)  => req<T>('PUT',    path, body);
const patch = <T>(path: string, body?: unknown) => req<T>('PATCH',  path, body);
const del   = (path: string)                    => req<void>('DELETE', path);

// ── Auth ───────────────────────────────────────────────────────
export const authApi = {
  login:  (email: string, password: string) => post<{ user: { id: string; name: string; email: string; role: string } }>('/auth/login', { email, password }),
  me:     ()                                => get<{ user: { id: string; name: string; email: string; role: string } }>('/auth/me'),
  logout: ()                                => post<{ success: boolean }>('/auth/logout', {}),
};

// ── Stats ──────────────────────────────────────────────────────
export const statsApi = {
  get:       () => get<{ pageViews: number }>('/stats'),
  trackView: () => post<{ pageViews: number }>('/stats/view', {}),
};

// ── Clients ────────────────────────────────────────────────────
export const clientsApi = {
  getAll:  ()                                                          => get<Client[]>('/clients'),
  create:  (data: Omit<Client, 'id' | 'registeredAt' | 'totalAppointments'>) => post<Client>('/clients', data),
  update:  (id: string, data: Partial<Client>)                        => put<Client>(`/clients/${id}`, data),
  remove:  (id: string)                                               => del(`/clients/${id}`),
};

// ── Services ───────────────────────────────────────────────────
export const servicesApi = {
  getAll:  ()                                    => get<Service[]>('/services'),
  create:  (data: Omit<Service, 'id'>)           => post<Service>('/services', data),
  update:  (id: string, data: Partial<Service>)  => put<Service>(`/services/${id}`, data),
  remove:  (id: string)                          => del(`/services/${id}`),
};

// ── Appointments ───────────────────────────────────────────────
export const appointmentsApi = {
  getAll: (params?: { date?: string; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return get<Appointment[]>(`/appointments${qs}`);
  },
  create:  (data: Omit<Appointment, 'id' | 'createdAt'>)   => post<Appointment>('/appointments', data),
  update:  (id: string, data: Partial<Appointment>)        => put<Appointment>(`/appointments/${id}`, data),
  remove:  (id: string)                                    => del(`/appointments/${id}`),
};

// ── Blocked Slots ──────────────────────────────────────────────
export const blockedSlotsApi = {
  getAll:  ()                                      => get<BlockedSlot[]>('/blocked-slots'),
  create:  (data: Omit<BlockedSlot, 'id'>)         => post<BlockedSlot>('/blocked-slots', data),
  remove:  (id: string)                            => del(`/blocked-slots/${id}`),
};

// ── Products ───────────────────────────────────────────────────
export const productsApi = {
  getAll:  ()                                                          => get<Product[]>('/products'),
  create:  (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>)   => post<Product>('/products', data),
  update:  (id: string, data: Partial<Product>)                       => put<Product>(`/products/${id}`, data),
  remove:  (id: string)                                               => del(`/products/${id}`),
};

// ── Sales ──────────────────────────────────────────────────────
export const salesApi = {
  getAll:  ()                              => get<Sale[]>('/sales'),
  create:  (data: Omit<Sale, 'id' | 'createdAt'>) => post<Sale>('/sales', data),
};

// ── Transactions ───────────────────────────────────────────────
export const transactionsApi = {
  getAll:  (month?: string)                                              => get<Transaction[]>(`/transactions${month ? '?month=' + month : ''}`),
  create:  (data: Omit<Transaction, 'id' | 'createdAt'>)               => post<Transaction>('/transactions', data),
  update:  (id: string, data: Partial<Transaction>)                    => put<Transaction>(`/transactions/${id}`, data),
  remove:  (id: string)                                                => del(`/transactions/${id}`),
};

// ── Testimonials ───────────────────────────────────────────────
export const testimonialsApi = {
  getAll:  ()                                      => get<Testimonial[]>('/testimonials'),
  create:  (data: Omit<Testimonial, 'id'>)         => post<Testimonial>('/testimonials', data),
  update:  (id: string, data: Partial<Testimonial>) => put<Testimonial>(`/testimonials/${id}`, data),
  remove:  (id: string)                            => del(`/testimonials/${id}`),
};

// ── Gallery ────────────────────────────────────────────────────
export const galleryApi = {
  getAll:  ()                                           => get<GalleryImage[]>('/gallery'),
  create:  (data: Omit<GalleryImage, 'id' | 'uploadedAt'>) => post<GalleryImage>('/gallery', data),
  update:  (id: string, data: Partial<GalleryImage>)   => put<GalleryImage>(`/gallery/${id}`, data),
  remove:  (id: string)                                => del(`/gallery/${id}`),
};

// ── Contact Messages ───────────────────────────────────────────
export const contactApi = {
  getAll:   ()                                                             => get<ContactMessage[]>('/contact-messages'),
  create:   (data: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>)    => post<ContactMessage>('/contact-messages', data),
  markRead: (id: string)                                                  => patch<{ success: boolean }>(`/contact-messages/${id}/read`),
  remove:   (id: string)                                                  => del(`/contact-messages/${id}`),
};

// ── Booking Requests ───────────────────────────────────────────
export const bookingApi = {
  getAll:       ()                             => get<BookingRequest[]>('/booking-requests'),
  create:       (data: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => post<BookingRequest>('/booking-requests', data),
  updateStatus: (id: string, status: string)   => patch<{ success: boolean }>(`/booking-requests/${id}/status`, { status }),
};

// ── Store (público) ────────────────────────────────────────────
export const storePublicApi = {
  getProducts: ()                                                        => get<StoreProduct[]>('/store/products'),
  createOrder: (data: { customerName: string; customerEmail?: string; customerPhone: string; customerAddress?: string; items: CartItem[]; paymentMethod: string; notes?: string }) =>
    post<StoreOrder>('/store/orders', data),
};

// ── Store Orders (admin) ───────────────────────────────────────
export const storeOrdersApi = {
  getAll:       ()                              => get<StoreOrder[]>('/store-orders'),
  updateStatus: (id: string, status: string)    => patch<{ success: boolean }>(`/store-orders/${id}/status`, { status }),
  remove:       (id: string)                    => del(`/store-orders/${id}`),
};

// ── Site Content ───────────────────────────────────────────────
export const siteContentApi = {
  getAll:        ()                                           => get<SiteContent>('/site-content'),
  getSection:    (section: string)                           => get<Partial<SiteContent>>(`/site-content/${section}`),
  updateSection: (section: keyof SiteContent, data: Partial<SiteContent[keyof SiteContent]>) => put<{ success: boolean }>(`/site-content/${section}`, data),
};

export { ApiError };
