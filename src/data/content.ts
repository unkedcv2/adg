/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, ValueItem, WhyUsItem, InfraMetric, LocationDetail } from '../types';

export const HERO_CONTENT = {
  title: "Dos trayectorias. Un mismo compromiso.",
  subtitle: "ADG Almacén de Granos S.A.",
  description: "Nace como una nueva empresa, respaldada por la trayectoria de Monasterio Tattersall y PGL – Productores General La Madrid, con el compromiso de brindar soluciones integrales para el productor agropecuario.",
  ctaPrimary: "Contactanos",
  ctaSecondary: "Acceso Clientes",
  whatsappUrl: "https://wa.me/5492314405179?text=Hola%20ADG%20Almac%C3%A9n%20de%20Granos%2C%20quisiera%20hacer%20una%20consulta."
};

export const ABOUT_CONTENT = {
  title: "Quiénes Somos",
  highlight: "Una nueva empresa, construida sobre la experiencia de dos referentes del agro.",
  paragraphs: [
    "ADG Almacén de Granos S.A. nace como una nueva empresa impulsada por Monasterio Tattersall y PGL – Productores General La Madrid, dos organizaciones con una amplia trayectoria y un profundo conocimiento del sector agropecuario.",
    "La experiencia, el compromiso y la visión de ambas empresas convergen en este nuevo proyecto, creado para brindar soluciones integrales al productor con una identidad propia y una mirada puesta en el futuro.",
    "ADG combina el respaldo de años de trabajo junto al campo con un equipo enfocado en la innovación, la cercanía y la mejora continua, ofreciendo un servicio eficiente, profesional y adaptado a los desafíos de la producción agropecuaria actual.",
    "Más que el resultado de una unión, ADG representa una nueva etapa: una empresa que nace para potenciar fortalezas, generar nuevas oportunidades y seguir acompañando el crecimiento del agro."
  ]
};

export const IMPULSORES_CONTENT = {
  title: "Quiénes impulsan este proyecto",
  description: "ADG es un proyecto impulsado por la experiencia y el compromiso de dos empresas referentes del sector, uniendo su trayectoria para potenciar el crecimiento del campo.",
  monasterio: {
    name: "Monasterio Tattersall",
    detail: "Consólida firma consignataria con más de 70 años liderando el mercado ganadero y de servicios agropecuarios en todo el país."
  },
  pgl: {
    name: "PGL – Productores Gral. La Madrid",
    detail: "Reconocida firma regional con vasta experiencia en el acopio de granos, comercialización y asesoramiento cercano al productor."
  },
  adg: {
    name: "ADG Almacén de Granos S.A.",
    detail: "La sinergia perfecta: soluciones integrales de acopio, logística y comercialización de granos con una visión innovadora."
  }
};

export const VALUES_CONTENT: ValueItem[] = [
  {
    id: "value-experiencia",
    title: "Experiencia",
    description: "El conocimiento y la trayectoria de quienes acompañan al productor desde hace años.",
    iconName: "ShieldCheck"
  },
  {
    id: "value-compromiso",
    title: "Compromiso",
    description: "Construimos relaciones de confianza, entendiendo que detrás de cada campaña hay personas y proyectos.",
    iconName: "Handshake"
  },
  {
    id: "value-cercania",
    title: "Cercanía",
    description: "Creemos en la atención personalizada, el acompañamiento permanente y el contacto directo.",
    iconName: "Users"
  },
  {
    id: "value-innovacion",
    title: "Innovación",
    description: "Incorporamos nuevas herramientas y procesos para brindar un servicio cada vez más eficiente.",
    iconName: "Lightbulb"
  }
];

export const SERVICES_CONTENT: ServiceItem[] = [
  {
    id: "service-acopio",
    title: "Acopio de granos",
    description: "Infraestructura preparada para la recepción, conservación y manejo de granos, garantizando eficiencia y calidad en cada proceso.",
    iconName: "Warehouse"
  },
  {
    id: "service-logistica",
    title: "Logística",
    description: "Contamos con una sólida estructura operativa y un servicio de logística propio de más de 100 camiones, que le permite brindar agilidad, cumplimiento y seguridad en cada operación.",
    iconName: "Truck"
  },
  {
    id: "service-asesoramiento",
    title: "Asesoramiento",
    description: "Un equipo comprometido para brindar respuestas ágiles y acompañar al productor durante toda la campaña de punta a punta.",
    iconName: "FileSpreadsheet"
  }
];

export const WHY_ADG_CONTENT: WhyUsItem[] = [
  { id: "why-1", text: "Respaldo de empresas con amplia trayectoria y solidez financiera." },
  { id: "why-2", text: "Atención personalizada para adaptar cada negocio a la necesidad de la campaña." },
  { id: "why-3", text: "Equipo especializado con profundo conocimiento del mercado granario." },
  { id: "why-4", text: "Procesos eficientes y transparentes en recepción, pesaje y liquidación." },
  { id: "why-5", text: "Compromiso real con el desarrollo y la sustentabilidad del agro regional." }
];

export const INFRA_CONTENT: InfraMetric[] = [
  {
    id: "metric-trucks",
    label: "Capacidad de Tránsito",
    value: "+100",
    description: "Camiones diarios operativos coordinados en cosecha",
    iconName: "TrendingUp"
  },
  {
    id: "metric-storage",
    label: "Almacenamiento",
    value: "Infraestructura",
    description: "Instalaciones preparadas para la conservación y manejo de granos",
    iconName: "Database"
  },
  {
    id: "metric-location",
    label: "Ubicación",
    value: "Estratégica",
    description: "Acceso ágil en el corazón productivo de la región",
    iconName: "MapPin"
  },
  {
    id: "metric-team",
    label: "Equipo",
    value: "Especializado",
    description: "Personal idóneo con foco en la mejora continua",
    iconName: "Briefcase"
  }
];

export const LOCATION_CONTENT: LocationDetail = {
  address: "Rivadavia 82, Daireaux, Bs. As.",
  hours: "Lunes a Viernes: 08:00 a 12:00 y de 15:00 a 19:00 horas",
  phones: {
    cereales: "2314-405179",
    logistica: "2314-405176",
    insumos: "2314-534715",
    administracion: "2314-474965"
  }
};

export const CLIENT_ACCESS_CONTENT = {
  title: "Tu información, siempre disponible.",
  subtitle: "Acceso Clientes",
  description: "Muy pronto podrás acceder a un espacio exclusivo para clientes de ADG donde encontrarás información comercial, documentación y herramientas para realizar gestiones de manera simple y segura.",
  buttonText: "Acceso Clientes",
  destinationUrl: "https://clientes.adgsa.com.ar" // Mock URL for the future platform redirect
};
