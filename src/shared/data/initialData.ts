import { v4 as uuidv4 } from 'uuid';
import type {
  Client, Service, Appointment, Product, Sale, Transaction,
  Testimonial, GalleryImage, ContactMessage, SiteContent, AppState
} from '../types';

const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

export const initialClients: Client[] = [
  { id: uuidv4(), name: 'Ana Carolina Silva', email: 'ana@email.com', phone: '(11) 99999-1111', whatsapp: '5511999991111', birthdate: '1990-03-15', registeredAt: now, source: 'website', totalAppointments: 8, lastService: '2024-04-10', nextMaintenanceSuggested: '2024-04-31', notes: 'Prefere cílios fio a fio' },
  { id: uuidv4(), name: 'Beatriz Ferreira', email: 'bia@email.com', phone: '(11) 98888-2222', registeredAt: now, source: 'manual', totalAppointments: 3, lastService: '2024-04-05' },
  { id: uuidv4(), name: 'Camila Santos', email: 'cami@email.com', phone: '(11) 97777-3333', whatsapp: '5511977773333', registeredAt: now, source: 'website', totalAppointments: 12, lastService: '2024-04-12', nextMaintenanceSuggested: '2024-04-26' },
  { id: uuidv4(), name: 'Daniela Oliveira', email: 'dani@email.com', phone: '(11) 96666-4444', registeredAt: now, source: 'manual', totalAppointments: 5, lastService: '2024-03-28' },
  { id: uuidv4(), name: 'Fernanda Costa', email: 'fer@email.com', phone: '(11) 95555-5555', registeredAt: now, source: 'website', totalAppointments: 1 },
];

export const initialServices: Service[] = [
  { id: uuidv4(), name: 'Volume Russo', description: 'Técnica de volume com múltiplos fios para olhar dramático e intenso.', price: 280, duration: 150, category: 'Volume', active: true, featured: true, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400' },
  { id: uuidv4(), name: 'Fio a Fio', description: 'Extensão clássica com um fio por cílio natural. Resultado natural e elegante.', price: 180, duration: 120, category: 'Clássico', active: true, featured: true, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400' },
  { id: uuidv4(), name: 'Manutenção', description: 'Manutenção a partir de 14 dias. Reposição dos fios caídos.', price: 120, duration: 90, category: 'Manutenção', active: true, featured: false, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
  { id: uuidv4(), name: 'Híbrido', description: 'Mix entre fio a fio e volume. Natural com volume na ponta externa.', price: 230, duration: 135, category: 'Volume', active: true, featured: true, image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
  { id: uuidv4(), name: 'Mega Volume', description: 'Volume extremo com leques densos. Para quem quer o máximo de impacto.', price: 320, duration: 180, category: 'Volume', active: true, featured: false },
  { id: uuidv4(), name: 'Lash Lifting', description: 'Curvatura permanente dos cílios naturais sem extensão. Dura 6-8 semanas.', price: 150, duration: 60, category: 'Outros', active: true, featured: true },
];

export const initialProducts: Product[] = [
  { id: uuidv4(), name: 'Cola Ultra Bond 5ml', description: 'Cola profissional de alta fixação', category: 'Insumos', price: 89.90, costPrice: 35, quantity: 8, minStock: 5, unit: 'unidade', supplier: 'BL Beauty', createdAt: now, updatedAt: now },
  { id: uuidv4(), name: 'Fios Silk 0.07mm C 11mm', description: 'Bandeja 12 linhas fios de seda', category: 'Fios', price: 45.00, costPrice: 18, quantity: 3, minStock: 5, unit: 'bandeja', supplier: 'Lash Store', createdAt: now, updatedAt: now },
  { id: uuidv4(), name: 'Pinça Curva Precisão', description: 'Pinça curva para volume russo', category: 'Ferramentas', price: 120, costPrice: 55, quantity: 4, minStock: 2, unit: 'unidade', createdAt: now, updatedAt: now },
  { id: uuidv4(), name: 'Primer Lash 15ml', description: 'Primer para limpeza e preparação dos cílios', category: 'Insumos', price: 38, costPrice: 14, quantity: 12, minStock: 4, unit: 'frasco', createdAt: now, updatedAt: now },
  { id: uuidv4(), name: 'Fita Micropore 3M', description: 'Fita para isolamento das pálpebras', category: 'Insumos', price: 12, costPrice: 4, quantity: 2, minStock: 5, unit: 'rolo', createdAt: now, updatedAt: now },
];

export const initialTestimonials: Testimonial[] = [
  { id: uuidv4(), clientName: 'Ana Carolina', text: 'Amei o resultado! Meus cílios ficaram perfeitos, naturalíssimos. Super recomendo!', rating: 5, date: '2024-04-01', approved: true, source: 'website' },
  { id: uuidv4(), clientName: 'Beatriz Ferreira', text: 'Profissional incrível, ambiente lindo e resultado maravilhoso. Já sou fã!', rating: 5, date: '2024-03-25', approved: true, source: 'manual' },
  { id: uuidv4(), clientName: 'Camila Santos', text: 'Volume russo impecável! Acordo linda todo dia sem precisar de maquiagem.', rating: 5, date: '2024-03-18', approved: true, source: 'website' },
  { id: uuidv4(), clientName: 'Daniela Costa', text: 'Manutenção feita com cuidado e atenção. Cílios duraram mais de 3 semanas!', rating: 4, date: '2024-03-10', approved: true, source: 'manual' },
];

export const initialGallery: GalleryImage[] = [
  { id: uuidv4(), url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600', title: 'Volume Russo', category: 'before-after', order: 1, uploadedAt: now },
  { id: uuidv4(), url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600', title: 'Fio a Fio', category: 'work', order: 2, uploadedAt: now },
  { id: uuidv4(), url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', title: 'Resultado', category: 'before-after', order: 3, uploadedAt: now },
  { id: uuidv4(), url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600', title: 'Estúdio', category: 'studio', order: 4, uploadedAt: now },
];

const client1Id = initialClients[0].id;
const client2Id = initialClients[1].id;
const client3Id = initialClients[2].id;
const svc1Id = initialServices[0].id;
const svc2Id = initialServices[1].id;
const svc3Id = initialServices[2].id;

export const initialAppointments: Appointment[] = [
  { id: uuidv4(), clientId: client1Id, clientName: initialClients[0].name, serviceId: svc1Id, serviceName: initialServices[0].name, date: today, time: '09:00', duration: 150, status: 'confirmed', price: 280, source: 'website', createdAt: now },
  { id: uuidv4(), clientId: client2Id, clientName: initialClients[1].name, serviceId: svc2Id, serviceName: initialServices[1].name, date: today, time: '11:00', duration: 120, status: 'pending', price: 180, source: 'manual', createdAt: now },
  { id: uuidv4(), clientId: client3Id, clientName: initialClients[2].name, serviceId: svc3Id, serviceName: initialServices[2].name, date: today, time: '14:00', duration: 90, status: 'confirmed', price: 120, source: 'website', createdAt: now },
];

export const initialTransactions: Transaction[] = [
  { id: uuidv4(), type: 'income', category: 'Serviços', description: 'Volume Russo - Ana Carolina', amount: 280, paymentMethod: 'pix', date: today, createdAt: now },
  { id: uuidv4(), type: 'income', category: 'Serviços', description: 'Fio a Fio - Beatriz', amount: 180, paymentMethod: 'credit', date: today, createdAt: now },
  { id: uuidv4(), type: 'expense', category: 'Insumos', description: 'Compra cola e fios', amount: 150, date: today, createdAt: now },
  { id: uuidv4(), type: 'expense', category: 'Aluguel', description: 'Aluguel do espaço', amount: 800, date: new Date(new Date().setDate(1)).toISOString().split('T')[0], createdAt: now },
];

export const initialSiteContent: SiteContent = {
  hero: {
    title: 'Realce sua Beleza com Cílios Perfeitos',
    subtitle: 'Extensão de cílios premium com técnicas exclusivas para um olhar irresistível.',
    ctaText: 'Agendar Agora',
    ctaLink: '/agendamento',
    backgroundImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600',
    overlayOpacity: 0.55,
  },
  about: {
    title: 'Sobre a Lash Designer',
    description: 'Somos especialistas em extensão de cílios há mais de 5 anos, transformando olhares com técnica, qualidade e cuidado.',
    mission: 'Realçar a beleza natural de cada cliente com técnicas premium e atendimento personalizado.',
    vision: 'Ser referência em extensão de cílios no Brasil, com foco em qualidade e inovação.',
    values: ['Qualidade', 'Profissionalismo', 'Cuidado', 'Inovação', 'Satisfação'],
    yearsExperience: 5,
    clientsServed: 1200,
    photo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
  },
  contact: {
    address: 'Rua das Flores, 123 – Sala 42',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    phone: '(11) 3333-4444',
    whatsapp: '5511999991234',
    email: 'contato@lashdesigner.com.br',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.07548!2d-46.6518!3d-23.5615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzQyLjAiUyA0NsKwMzknMDYuNiJX!5e0!3m2!1spt-BR!2sbr!4v1617000000000!5m2!1spt-BR!2sbr',
    businessHours: [
      { day: 'Segunda', open: '09:00', close: '18:00', closed: false },
      { day: 'Terça', open: '09:00', close: '18:00', closed: false },
      { day: 'Quarta', open: '09:00', close: '18:00', closed: false },
      { day: 'Quinta', open: '09:00', close: '18:00', closed: false },
      { day: 'Sexta', open: '09:00', close: '18:00', closed: false },
      { day: 'Sábado', open: '09:00', close: '14:00', closed: false },
      { day: 'Domingo', open: '', close: '', closed: true },
    ],
  },
  settings: {
    siteName: 'Lash Designer',
    tagline: 'Extensão de Cílios Premium',
    primaryColor: '#ec4899',
    secondaryColor: '#be185d',
    accentColor: '#eab308',
    darkMode: false,
    socialLinks: {
      instagram: 'https://instagram.com/lashdesigner',
      facebook: 'https://facebook.com/lashdesigner',
      tiktok: 'https://tiktok.com/@lashdesigner',
    },
    seo: {
      home: { title: 'Lash Designer – Extensão de Cílios Premium', description: 'Extensão de cílios com técnicas exclusivas.', keywords: 'extensão de cílios, lash, volume russo, fio a fio' },
      services: { title: 'Serviços – Lash Designer', description: 'Conheça nossos serviços de extensão de cílios.', keywords: 'serviços, extensão, lash' },
      about: { title: 'Sobre – Lash Designer', description: 'Conheça nossa história e missão.', keywords: 'sobre, lash designer' },
    },
  },
};

const STORAGE_KEY = 'lash_designer_data';

export function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export function saveState(state: Partial<AppState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function getInitialState(): Omit<AppState, 'user' | 'isAuthenticated'> {
  const saved = loadState();
  return {
    clients:         saved.clients         ?? initialClients,
    services:        saved.services        ?? initialServices,
    appointments:    saved.appointments    ?? initialAppointments,
    blockedSlots:    saved.blockedSlots    ?? [],
    products:        saved.products        ?? initialProducts,
    sales:           saved.sales           ?? [],
    transactions:    saved.transactions    ?? initialTransactions,
    testimonials:    saved.testimonials    ?? initialTestimonials,
    gallery:         saved.gallery         ?? initialGallery,
    contactMessages: saved.contactMessages ?? [],
    bookingRequests: saved.bookingRequests ?? [],
    siteContent:     saved.siteContent     ?? initialSiteContent,
    pageViews:       0,
  };
}

