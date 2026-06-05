import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AppointmentStatus, PaymentMethod } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: string): string {
  try { return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR }); }
  catch { return date; }
}

export function formatDateTime(date: string): string {
  try { return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }); }
  catch { return date; }
}

export function formatMonth(date: string): string {
  try { return format(new Date(date), 'MMMM yyyy', { locale: ptBR }); }
  catch { return date; }
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  'no-show': 'Não compareceu',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'badge-yellow',
  confirmed: 'badge-green',
  cancelled: 'badge-red',
  completed: 'badge-blue',
  'no-show': 'badge-gray',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
  transfer: 'Transferência',
};

export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function generateTimeSlots(start = '08:00', end = '18:00', interval = 30): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur < endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0');
    const m = (cur % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += interval;
  }
  return slots;
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
