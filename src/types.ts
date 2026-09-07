/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface WhyUsItem {
  id: string;
  text: string;
}

export interface InfraMetric {
  id: string;
  label: string;
  value: string;
  description: string;
  iconName: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'replied';
}

export interface LocationDetail {
  address: string;
  hours: string;
  phones: {
    cereales: string;
    logistica: string;
    insumos: string;
    administracion: string;
  };
}
