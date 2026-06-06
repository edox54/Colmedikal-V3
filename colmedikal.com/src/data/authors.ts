import { Author } from '../types';
import avatarGomez from '../assets/images/avatar_gomez_1780024902226.png';
import avatarRestrepo from '../assets/images/avatar_restrepo_1780024921091.png';
import avatarCaballero from '../assets/images/avatar_caballero_1780024936325.png';

export const AUTHORS: Record<string, Author> = {
  gomez: {
    id: 'gomez',
    name: 'Dr. Alejandro Gómez Pradilla',
    role: 'Director Médico de Colmedikal',
    specialty: 'Especialista en Cardiología y Medicina Interna',
    experience: 'Más de 17 años de experiencia en el sector salud en Ecuador',
    avatar: avatarGomez,
    bio: 'El Dr. Gómez cuenta con una amplia trayectoria coordinando servicios de salud preventiva y medicina integral en Ecuador. Graduado de la Universidad Central del Ecuador y con especialización en el exterior, lidera el programa de cardiología integral de Colmedikal.'
  },
  restrepo: {
    id: 'restrepo',
    name: 'Dra. Mariana Restrepo Hoyos',
    role: 'Coordinadora de Medicina y Bienestar Preventivo',
    specialty: 'Especialista en Medicina Familiar',
    experience: '12+ años de trayectoria clínica acompañando familias ecuatorianas',
    avatar: avatarRestrepo,
    bio: 'La Dra. Mariana se dedica al diseño científico de programas de medicina familiar y tamizaje temprano en el Austro y la Costa ecuatoriana. Su filosofía combina la evidencia médica de vanguardia con un trato cálido, humano e integral.'
  },
  caballero: {
    id: 'caballero',
    name: 'Dra. Sofía Caballero Restrepo',
    role: 'Directora del Programa Materno-Infantil',
    specialty: 'Ginecóloga Obstetra y Especialista en Embarazo de Alto Riesgo',
    experience: '14+ años cuidando la salud de las madres y neonatos ecuatorianos',
    avatar: avatarCaballero,
    bio: 'La Dra. Sofía es un referente en la atención de gestantes y neonatología en Ecuador. Lidera con pasión el programa de maternidad y parto humanizado de Colmedikal.'
  }
};
