import { get } from './api';

interface ControlDetail {
  id: number;
  code: string;
  name: string;
  controlType: string;
  controlNature: string;
  frequency: string;
  isDocumented: boolean;
}

export function listControls(filters?: { auId?: number; obligationId?: number }) {
  const params = new URLSearchParams();
  if (filters?.auId) params.set('auId', String(filters.auId));
  if (filters?.obligationId) params.set('obligationId', String(filters.obligationId));
  const qs = params.toString();
  return get<ControlDetail[]>(`/controls${qs ? `?${qs}` : ''}`);
}

export function getControl(controlId: number) {
  return get<ControlDetail>(`/controls/${controlId}`);
}

export function getControlQuality(controlId: number) {
  return get<unknown>(`/controls/${controlId}/quality`);
}

export function getControlPerformance(controlId: number) {
  return get<unknown>(`/controls/${controlId}/performance`);
}

export function getControlEnvironment(auId: number) {
  return get<unknown>(`/control-environment/${auId}`);
}
