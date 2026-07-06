/**
 * seed-providers.mjs
 * Replaces all doctors in the API with the Colmedikal RED.MED provider network.
 * Usage: node scripts/seed-providers.mjs <ADMIN_TOKEN>
 */

const token = process.argv[2];
if (!token) {
  console.error('Uso: node scripts/seed-providers.mjs <ADMIN_TOKEN>');
  process.exit(1);
}

const API = 'https://api.colmedikal.com';
const HOURS = 'Lun-Vie 08:00-18:00 | Sáb 08:00-14:00';

const p = (name, city, clinic, education, image = 'icon_building', nivel = 1) => ({
  name,
  specialty: image === 'icon_hospital' ? 'Hospital / Clínica' : image === 'icon_lab' ? 'Laboratorio Clínico' : 'Centro Médico',
  city, phone: '', email: '', clinic,
  rating: '5.00', availability: HOURS,
  education, image, cost: 0, active: true, nivel,
});

const PROVIDERS = [
  // ── GUAYAS — GUAYAQUIL ───────────────────────────────────────────────────
  p('MEDIGLOBAL - KENNEDY', 'Guayaquil, Guayas', 'Cdla. Kennedy Vieja, Calle 8va. No. 111 y Ave. San Jorge', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('FISIOSMART', 'Guayaquil, Guayas', 'Vía a la Costa Km 14, Plaza del Hipermarket, planta alta local 2', 'MEDICINA GENERAL, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA'),
  p('CENTROS MÉDICOS CRUZ ROJA (URDESA)', 'Guayaquil, Guayas', 'Av. Jorge Pérez Concha e Ilanes y Peatonal 32 Central (Diagonal a Farmacia Medicity)', 'MEDICINA GENERAL, LABORATORIO'),
  p('TRAUMADENT', 'Guayaquil, Guayas', 'Ed. Trade Building, Av. Joaquín Orrantia González y Pasaje 1A NE, Torre A Of. L829, 8vo Piso. Al lado Mall del Sol', 'TRAUMATOLOGÍA'),
  p('TELEMEDICA', 'Guayaquil, Guayas', 'Av. Democracia N8 y Sufragio Libre, frente al Consejo Nacional Electoral', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, LABORATORIO, RAYOS X'),
  p('STAT MEDICAL', 'Guayaquil, Guayas', 'Av. Francisco de Orellana, C.C. Gran Manzana, local 26-27', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA'),
  p('DRA. ANDREA GRANDA', 'Guayaquil, Guayas', 'Av. Agustín Freire solar 2-4 entre Antonio Parra Velasco, 3er pasaje, Ed. Business Plaza, primer piso of. 101 (Acuarela del Río)', 'NUTRICIÓN'),
  p('FAMILY HEALTH - GASTROENTEROLOGÍA', 'Guayaquil, Guayas', 'Av. Nahím Isaías y Dr. Luis Orrantia Cornejo, Clínica Milenium piso 3 Gastrovida', 'GASTROENTEROLOGÍA'),
  p('SUMEDICO (PLAZA QUIL)', 'Guayaquil, Guayas', 'C.C. Plaza Quil local 12', 'GINECOLOGÍA'),
  p('SUMEDICO (RIVER PLAZA - DAULE)', 'Guayaquil, Guayas', 'C.C. River Plaza, local A4, frente a La Joya', 'GINECOLOGÍA'),
  p('SUMEDICO (GUAYACANES)', 'Guayaquil, Guayas', 'Cdla. Guayacanes Mz 78 Villa 18, frente a la cancha de Sauces 5', 'GINECOLOGÍA'),
  p('CENTRO MÉDICO DOCTOR-RED', 'Guayaquil, Guayas', 'Alborada XII Etapa Manzana 26 – Solar 24', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('SUMEDICO (ALBORADA)', 'Guayaquil, Guayas', 'Cdla. La Alborada 12ava Etapa, Mz 24 V. 26, frente al Hospital de Especialidades de la ciudad', 'GINECOLOGÍA'),
  p('CLÍNICA UNIÓN', 'Guayaquil, Guayas', 'Av. Fco. de Orellana sl 19 #670 y Av. Benjamín Carrión', 'MEDICINA GENERAL, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CENTRO DE ESPECIALIDADES RIVERA', 'Guayaquil, Guayas', 'Las Orquídeas, Av. Fco. de Orellana Sl 22-23 MZ61 frente al UPC', 'MEDICINA GENERAL, GINECOLOGÍA, PEDIATRÍA, LABORATORIO'),
  p('PROSALUD (ORQUÍDEAS)', 'Guayaquil, Guayas', 'Cdla. Las Orquídeas mz.1043 solar 37 al frente al Gimnasio Taurus', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('MEDISALUD', 'Guayaquil, Guayas', 'Cdla. Las Orquídeas mz 56 villa 41, redondel de las Orquídeas junto a Farmacia Cruz Azul', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('CENTRO DE ESPECIALIDADES FAMILY HEALTH (MUCHO LOTE 2)', 'Guayaquil, Guayas', 'Mucho Lote 2, Toledo Externo, Mz 2833 V15', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN'),
  p('CENTRO MÉDICO SALUD FAMILIAR (MUCHO LOTE 2)', 'Guayaquil, Guayas', 'Mucho Lote 2, Mz 2975 solar 3, Urb. Victoria Club (Exterior)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('ASISMEDIK', 'Guayaquil, Guayas', 'Av. Isidro Ayora y José Luis Tamayo (Samanes)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('SUMEDICO (CALIFORNIA)', 'Guayaquil, Guayas', 'Parque California 2 (PECA) km 11.5 Vía a Daule, Bloque K local 18', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('SUMEDICO (FLORIDA NORTE)', 'Guayaquil, Guayas', 'Florida Norte, av. principal mz 618 frente a Parque Lineal', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('PROSALUD (ORQUÍDEAS II)', 'Guayaquil, Guayas', 'Cdla. Las Orquídeas mz.1043 solar 37 frente al Gimnasio Taurus', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA, CARDIOLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('SUMEDICO (ORQUÍDEAS II)', 'Guayaquil, Guayas', 'Cdla. Las Orquídeas, av. Francisco de Orellana mz 61 villa 13, pasando el redondel en sentido centro a norte', 'GINECOLOGÍA'),
  p('SUMEDICO (GARZOTA)', 'Guayaquil, Guayas', 'Garzota 1, Av. Guillermo Pareja, Mz 15 Solar 2, junto al Tuti', 'GINECOLOGÍA'),
  p('SUMEDICO (MAPASINGUE ESTE)', 'Guayaquil, Guayas', 'Plaza Tía El Trébol, Km. 5 1/2 Vía a Daule, junto a Santa Priscila', 'MEDICINA GENERAL, GINECOLOGÍA'),
  p('COMEGA', 'Guayaquil, Guayas', 'Julián Coronel 101 y Rumichaca (Centro)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('SUMEDICO (PORTETE)', 'Guayaquil, Guayas', 'Av. Portete entre la 13 y la 14 diagonal a Banco Solidario, frente a parada de Metrovía', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('CENTRO MÉDICO SAN CRISTÓBAL', 'Guayaquil, Guayas', 'Coop. 26 de abril solar 2 y mz. 2182, atrás de la Avícola Fernández (Guasmo Sur)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('SUMEDICO (AV. 25 DE JULIO)', 'Guayaquil, Guayas', 'Av. 25 de Julio Mz 10 solar 1, diagonal a Mall del Sur, junto a Farmacia Medicity, frente a parada Metrovía', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('MEDIGLOBAL - SUR', 'Guayaquil, Guayas', 'Av. 25 de Julio y Alberto Avellán, frente al Hospital Teodoro Maldonado Carbo', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('MEDIMASTER', 'Guayaquil, Guayas', 'Av. Domingo Comín 724 entre Oriente y Calle C, C.C. Paseo Centenario', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, NUTRICIÓN'),
  // ── GUAYAS — DAULE ───────────────────────────────────────────────────────
  p('HOSPITAL SAN PEDRO CLAVER', 'Daule, Guayas', 'Francisco de Paula y Santander Solar 6 y Clemente Yerovi (Banife)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA, CARDIOLOGÍA, UROLOGÍA', 'icon_hospital'),
  p('VITALSALUD', 'Daule, Guayas', 'Calle Pompeyo García y Vicente Piedrahita (Banife)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('PUNTO MEDIG DAULE', 'Daule, Guayas', 'Sector Banife – Calle Guillermo Ronquillo y Balzar, a una cuadra de ex Respuesta Fajardo', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  // ── GUAYAS — LA AURORA / SAMBORONDÓN ────────────────────────────────────
  p('WECARE (PLAZA TÍA CENTRAL)', 'La Aurora, Guayas', 'C.C. Plaza Tía Central, Locales 26 y 27, KM 11.5 Vía Samborondón', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('ETERNAVITAL', 'La Aurora, Guayas', 'Urb. Villa Club, Ed. Villa Club junto a Ed. Internacional de la Visión', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN'),
  p('WECARE (PLAZA TÍA LA JOYA)', 'Daule, Guayas', 'C.C. Plaza Tía La Joya, Locales 26 y 27, Urb. La Joya', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('MEDIGLOBAL - PALMORA', 'Daule, Guayas', 'Av. León Febres Cordero S/N, Palmora Plaza (a 1 km de Urb. La Joya)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('FALCOMEDIC', 'Daule, Guayas', 'Av. León Febres Cordero Ribadeneyra, CC Mix Center (Locales 6, 7 y 8)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CENTRO MÉDICO NOVAVIDA', 'Samborondón, Guayas', 'Calle Bolívar y 31 de Octubre, junto a la Escuela Fiscal Samborondón', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TELEMEDICINA, LABORATORIO'),
  // ── GUAYAS — DURÁN ───────────────────────────────────────────────────────
  p('CENTRO MÉDICO IMEDENT', 'Durán, Guayas', 'Av. Abel Gilbert # 227-231 y calle Simbambe, Ed. Imedent, a una cuadra de CNEL', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('CLÍNICA MORENO', 'Durán, Guayas', 'Cdla. El Recreo 3era Etapa Mz. 306 V', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN'),
  p('DOCTORES 360', 'Durán, Guayas', 'Plaza Shiva, vía Durán-Tambo Km. 3.5', 'MEDICINA GENERAL, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, GASTROENTEROLOGÍA'),
  // ── GUAYAS — CIUDADES MENORES ────────────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES MÉDICAS ROSA DE SARÓN', 'Milagro, Guayas', 'Calle 24 de Mayo entre Eloy Alfaro y Atahualpa, diagonal al Hospital Dr. León Becerra', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, LABORATORIO, RAYOS X'),
  p('MEDIFAM', 'Bucay, Guayas', 'Barrio La Puntilla, vía a Riobamba, junto a la parada de buses interprovinciales', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('MEDICFAMI', 'El Triunfo, Guayas', 'Av. 9 de Octubre y Mozart Safadi, frente al Hospital El Triunfo', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, RAYOS X'),
  p('LAB CLÍNICO MÉDICO SAN ANDRÉS', 'Posorja, Guayas', 'Calle Gutierrez Chaguay y Av. 25 NE - Juan Urquiza (frente a Ferretería Fabrimar)', 'MEDICINA GENERAL, GINECOLOGÍA, LABORATORIO', 'icon_lab'),
  p('FISIOMED', 'Posorja, Guayas', 'Abdón Calderón y Jaime Roldós, Barrio San Gregorio', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA'),
  p('CENTRO MÉDICO SAN ANDRÉS (PUERTO EL MORRO)', 'Puerto El Morro, Guayas', 'Av. Principal, frente al Subcentro de Salud MSP', 'MEDICINA GENERAL, GINECOLOGÍA, LABORATORIO'),
  p('CENTRO DE APOYO DIAGNÓSTICO SAN ANDRÉS', 'Playas, Guayas', 'C.C. El Colteño, Av. 15 de Agosto y Calle Enrique Torbay, a una cuadra del Hospital Básico de Playas', 'MEDICINA GENERAL, GINECOLOGÍA, LABORATORIO', 'icon_lab'),
  p('CENTRO MÉDICO INTEGRAL SAN ANDRÉS', 'Playas, Guayas', 'Calle Cuenca y Av. Paquisha', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, GASTROENTEROLOGÍA'),
  p('LABORATORIO CLÍNICO SAN ANDRÉS', 'Progreso, Guayas', 'Diagonal al estadio, junto al MSP', 'LABORATORIO', 'icon_lab'),
  // ── CAÑAR ────────────────────────────────────────────────────────────────
  p('1KP MEDICAL CENTRO DE ESPECIALIDADES MÉDICAS', 'La Troncal, Cañar', 'Calle del Zafreno, diagonal a Coopac Austro', 'MEDICINA GENERAL, GINECOLOGÍA, NUTRICIÓN'),
  // ── LOS RÍOS ─────────────────────────────────────────────────────────────
  p('DAR MEDIC', 'Babahoyo, Los Ríos', 'Malecón 2303 entre Eloy Alfaro y Rocafuerte, Ed. Bienestar', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('CENTRO DE TRAUMATOLOGÍA Y GASTROENTEROLOGÍA', 'Babahoyo, Los Ríos', '10 de agosto entre 9 de noviembre y Ricaurte', 'TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('CEMOPLAF (QUEVEDO)', 'Quevedo, Los Ríos', 'Calle 7 de Octubre y Bolívar esquina', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  p('CENTROS MÉDICOS CRUZ ROJA (QUEVEDO)', 'Quevedo, Los Ríos', 'Calle Tercera y Calle D (diagonal a almacenes Normita)', 'MEDICINA GENERAL, LABORATORIO'),
  // ── EL ORO ───────────────────────────────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES VIRGEN DEL ROSARIO', 'Machala, El Oro', 'Av. Colón y Eloy Alfaro Esquina', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('MIMEDIK (9 DE MAYO)', 'Machala, El Oro', 'Sucre entre 9 de mayo y Guayas', 'MEDICINA GENERAL, GINECOLOGÍA, CARDIOLOGÍA'),
  p('MIMEDIK (CENTRO)', 'Machala, El Oro', 'Boyacá entre Colón y Tarqui', 'MEDICINA GENERAL, PEDIATRÍA'),
  p('PLENIVID (CENTRO)', 'Machala, El Oro', 'Calle Boyacá entre 23 de Abril y Napoleón Mera', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN'),
  p('PASAJE MEDIK', 'Pasaje, El Oro', '9 de Mayo entre San Martín y Rocafuerte', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('HOSPITAL DEL DÍA DURÁN', 'Santa Rosa, El Oro', 'Cristóbal Colón y Arcelia Guzmán, frente a la plazoleta de los héroes', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN', 'icon_hospital'),
  p('PLENIVID (SANTA ROSA)', 'Santa Rosa, El Oro', 'Calles Colón y Javier Soto, Barrio Amazonas', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN'),
  p('ARENIMED', 'Arenillas, El Oro', 'Calles Chile y Uruguay, Cdla. Las Américas, frente a la cancha sintética', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA'),
  // ── MANABÍ ───────────────────────────────────────────────────────────────
  p('CENTRO MÉDICO BARBASQUILLO', 'Manta, Manabí', 'Av. E15 vía San Mateo, arriba de Laboratorios Santa Marta', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('CENTROS MÉDICOS CRUZ ROJA (MANTA)', 'Manta, Manabí', 'Barrio Córdova, Av. Flavio Reyes entre Av. 14 y Av. 15 (diagonal a Fritada Imbabureña)', 'MEDICINA GENERAL, CARDIOLOGÍA, LABORATORIO'),
  p('AGILMED', 'Chone, Manabí', 'Calle Pichincha entre 7 de Agosto y Rocafuerte, frente a la Notaria 2', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CENTRO MÉDICO SAN JOSÉ (EL CARMEN)', 'El Carmen, Manabí', 'Carlos Alberto Aray SN y Pasaje 2', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  p('CENTROS MÉDICOS CRUZ ROJA (PORTOVIEJO)', 'Portoviejo, Manabí', 'Av. Manabí, Urb. Portal de Los Bosques Local # 1', 'MEDICINA GENERAL, CARDIOLOGÍA, TRAUMATOLOGÍA, LABORATORIO'),
  // ── SANTA ELENA ──────────────────────────────────────────────────────────
  p('PUNTO MÉDICO SAN PABLO', 'San Pablo, Santa Elena', 'Entrando por San Pablo, bajando el puente, diagonal a farmacias económicas', 'MEDICINA GENERAL, PEDIATRÍA, CARDIOLOGÍA'),
  p('CLÍNICA SANTA MARTHA', 'La Libertad, Santa Elena', 'Calle Juan de Salinas 15-18, entre las calles Sucre y 18 de Noviembre', 'MEDICINA GENERAL, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CEMAS CENTRO DE ESPECIALIDADES MÉDICAS', 'Salinas, Santa Elena', 'Diagonal al Registro Civil de Santa Elena', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('QRAR CENTRO MÉDICO DE ESPECIALIDADES', 'Salinas, Santa Elena', 'Av. Carlos Espinoza Larrea, junto a Canal Brisa TV', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA, LABORATORIO'),
  // ── ESMERALDAS ───────────────────────────────────────────────────────────
  p('CENTRO MÉDICO SAN JOSÉ OBRERO', 'Esmeraldas, Esmeraldas', 'Avenida Colón y San José Obrero (esquina)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, LABORATORIO'),
  p('CEMOPLAF (ESMERALDAS)', 'Esmeraldas, Esmeraldas', 'Av. Cuarta Colón Solar 1 e Imbabura', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, LABORATORIO'),
  p('ECUACUBA', 'Atacames, Esmeraldas', 'Av. principal a dos calles del Hotel Colonial', 'MEDICINA GENERAL, GINECOLOGÍA, PEDIATRÍA, GASTROENTEROLOGÍA, NUTRICIÓN, LABORATORIO'),
  // ── PICHINCHA ────────────────────────────────────────────────────────────
  p('CENTRO MÉDICO ÁNGEL CASTRO', 'Cayambe, Pichincha', 'Rocafuerte y Pichincha', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CEMEBI MEJÍA', 'Machachi, Pichincha', 'Av. Pablo Guarderas N8-193 (2do piso), junto a la Cooperativa San Francisco', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CENTRO MÉDICO VIDA (CARAPUNGO)', 'Quito, Pichincha', 'Av. Padre Luis Vaccari y Río Bermejo, CC Vaccari Plaza (Carapungo)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('CENTROS MÉDICOS ESPECIALIZADOS VITALCLINIC (CARAPUNGO)', 'Quito, Pichincha', 'Calle Jaime Roldós Aguilera y Galo Plaza, 2do piso, frente al Colegio Buonarroti (Carapungo)', 'MEDICINA GENERAL, GINECOLOGÍA, CARDIOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  p('CENTRO MÉDICO VIDA (EL BATÁN)', 'Quito, Pichincha', 'Av. 6 de Diciembre N40-34 y Gaspar de Villarroel (El Batán)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('CENTRO MÉDICO SALUD Y VIDA (RUMIPAMBA)', 'Quito, Pichincha', 'Yugoeslavia N34-71 y Azuay (Rumipamba)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  p('CENTRO MÉDICO (RUMIPAMBA II)', 'Quito, Pichincha', 'Av. Brasil N39-222 y Pasaje Taborda (Rumipamba)', 'MEDICINA GENERAL, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('REHABILITAMED', 'Quito, Pichincha', 'Av. América y Vozandes, Ed. Med Plaza, 7mo piso, consultorio 711 (La Concepción)', 'TRAUMATOLOGÍA'),
  p('VITMED (CHIMBACALLE)', 'Quito, Pichincha', 'Calle Baltazar González S944 y Gualberto Pérez, diagonal al Banco Pichincha (Chimbacalle)', 'MEDICINA GENERAL, NUTRICIÓN'),
  p('MEDICFEM (COMITÉ DEL PUEBLO)', 'Quito, Pichincha', 'E12d Manuel Checa E12-176 y N65c Nicolás Rodríguez (Comité del Pueblo)', 'GINECOLOGÍA'),
  p('MEDICFEM (REAL AUDIENCIA)', 'Quito, Pichincha', 'Av. Real Audiencia N63-274 y Nazacota Puento (Real Audiencia)', 'GINECOLOGÍA'),
  p('MEDICFEM (CARAPUNGO)', 'Quito, Pichincha', 'Av. Luis Vaccari N1575 y Carihuairazo (Carapungo)', 'GINECOLOGÍA'),
  p('MEDICFEM (AJAVI)', 'Quito, Pichincha', 'San Bartolo, Ajavi lote 3 y OE6 (Ajavi)', 'GINECOLOGÍA'),
  p('MEDICFEM (COTOCOLLAO)', 'Quito, Pichincha', 'Unión y Progreso OE4-746 y Av. La Prensa (Cotocollao)', 'GINECOLOGÍA'),
  p('CENTRO MÉDICO VIDA (VILLAFLORA)', 'Quito, Pichincha', 'Núñez de Balboa OE1-29 y Francisco Gómez (Villaflora)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('DEMISUR DIAGNOSTIC', 'Quito, Pichincha', 'Av. Alonso de Angulo OE2-60 y Benedetto Tenorio, a una cuadra al norte del parque concha acústica (Villaflora)', 'MEDICINA GENERAL, GINECOLOGÍA, TRAUMATOLOGÍA, LABORATORIO, RAYOS X', 'icon_lab'),
  p('CENTRO MÉDICO ROMEA', 'Quito, Pichincha', 'Av. Ajavi OE4149 y José María Alemán (Solanda)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('CENTRO MÉDICO VIRGEN DE LA NUBE', 'Quito, Pichincha', 'Barrio Pueblo Solo Pueblo, calles OE2d y S44, frente a Unidad Educativa Matilde Hidalgo (Quitumbe)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA'),
  p('MEDICFEM (LOS TUBOS)', 'Quito, Pichincha', 'San Bartolo, Ajavi OE5-137 y Sozoranga (Los Tubos)', 'GINECOLOGÍA'),
  p('MEDICFEM (LA BRETAÑA)', 'Quito, Pichincha', 'Av. Maldonado S46-290 y S47D (La Bretaña)', 'GINECOLOGÍA'),
  p('MEDICFEM (LA ECUATORIANA)', 'Quito, Pichincha', 'Av. La Ecuatoriana OE7-212 y Palemon Monroy (La Ecuatoriana)', 'GINECOLOGÍA'),
  p('MEDICAL CENTER KOCHER (SAN RAFAEL)', 'Quito, Pichincha', 'Av. General Enríquez sn e Isla Salango, CC Plaza El Doral 2do piso (San Rafael)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('MEDICFEM (VALLE DE LOS CHILLOS)', 'Rumiñahui, Pichincha', 'Isla Genovesa entre Av. Gral. Rumiñahui y Av. Gral. Enríquez (Valle de los Chillos)', 'GINECOLOGÍA'),
  p('CENTROS MÉDICOS CRUZ ROJA (COTOCOLLAO)', 'Quito, Pichincha', 'Papallacta OE1-66 y Av. de la Prensa (Cotocollao)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, LABORATORIO'),
  p('ESPECIALIDADES MÉDICAS TUMBACO', 'Tumbaco, Pichincha', 'Calle Gonzalo de Vera OE 2 136 y Vicente Rocafuerte', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA'),
  p('MEDICAL CENTER KOCHER (TUMBACO)', 'Tumbaco, Pichincha', 'Fredy González de Vera OE1-140 y Gonzalo Pizarro', 'MEDICINA GENERAL'),
  p('LH MEDICAL', 'Tumbaco, Pichincha', 'Av. Oswaldo Guayasamín, CC Ventura Mall', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('ALIVIAMED', 'Tumbaco, Pichincha', 'Av. Oswaldo Guayasamín 1/2, CC Ventura Mall local 14-2 PA', 'MEDICINA GENERAL, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, UROLOGÍA'),
  p('MEDIBIX', 'Tumbaco, Pichincha', 'Calle Eugenio Espejo 1-68 y Simón Bolívar, frente al Parque Central', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, LABORATORIO, RAYOS X'),
  // ── SANTO DOMINGO DE LOS TSÁCHILAS ───────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES OMEGASALUD', 'Santo Domingo, Tsáchilas', 'Av. Río Leila s/n y Aloag, frente al Hospital IESS (Chiguilpe)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, GASTROENTEROLOGÍA, LABORATORIO, RAYOS X'),
  p('VITALMÉDICA', 'Santo Domingo, Tsáchilas', 'Av. Quito entre Cuenca y Riobamba (Bomboli)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('PROMOSALUD', 'Santo Domingo, Tsáchilas', 'Av. Galápagos y Tulcán, diagonal a funeraria Carrasco, frente a parada de buses', 'MEDICINA GENERAL, LABORATORIO'),
  p('CONSULTORIO DRA. LISSETH GUTIERREZ', 'Santo Domingo, Tsáchilas', 'Av. Tsafiqui y Tulcán, calle Juan Egüez', 'NUTRICIÓN, LABORATORIO'),
  // ── AZUAY ────────────────────────────────────────────────────────────────
  p('DR. CARLOS AYALA GRANDA', 'Cuenca, Azuay', 'Mariscal Lamar 549 entre Hermano Miguel y Mariano Cueva, Consultorio 302, MULTISALUD', 'MEDICINA GENERAL'),
  p('CENTRO MÉDICO VIDANUEVA', 'Cuenca, Azuay', 'Av. González Suárez y Ramayana', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('CENTROS MÉDICOS CRUZ ROJA (CUENCA)', 'Cuenca, Azuay', 'Av. Paseo de los Cañaris y Viracochabamba esquina (diagonal al IESS materno infantil)', 'MEDICINA GENERAL, GINECOLOGÍA, TRAUMATOLOGÍA, UROLOGÍA, LABORATORIO'),
  // ── CARCHI ───────────────────────────────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES MÉDICAS SAUDE', 'Tulcán, Carchi', 'Av. Calderón y Argentina Esquina', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),
  // ── COTOPAXI ─────────────────────────────────────────────────────────────
  p('CENTRO DE SALUD SANTA RITA', 'Latacunga, Cotopaxi', 'Calle sin nombre y Luis de Anda, frente al pantano, detrás de la Quitus (Barrio La Cocha)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA'),
  p('CEMOPLAF (LATACUNGA)', 'Latacunga, Cotopaxi', 'Av. Amazonas y calle General Maldonado, Ed. Terán (La Matriz)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  // ── CHIMBORAZO ───────────────────────────────────────────────────────────
  p('HOSPITAL SAN PEDRO (RIOBAMBA)', 'Riobamba, Chimborazo', 'Calle Uruguay e Isabel de Godín, esquina', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA', 'icon_hospital'),
  p('CEMOPLAF (RIOBAMBA)', 'Riobamba, Chimborazo', 'Rocafuerte 9-60 y Colón', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  // ── LOJA ─────────────────────────────────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES MÉDICAS REINA DE EL CISNE', 'Loja, Loja', 'Av. Cuxibamba y Riobamba, Esquina (El Sagrario)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  // ── TUNGURAHUA ───────────────────────────────────────────────────────────
  p('CENTRO DE ESPECIALIDADES DIAMOND', 'Ambato, Tungurahua', 'Ayllón entre 12 de Noviembre y Floreana IV, frente a las Gradas Ayllón (La Merced)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA'),
  p('VITMED (AMBATO)', 'Ambato, Tungurahua', 'Av. Los Shyris s/n y Rodrigo de Triana (Huachi Loreto)', 'MEDICINA GENERAL, NUTRICIÓN'),
  p('ZONAVITAL', 'Ambato, Tungurahua', 'Av. Los Shyris y Naripillahuazo, 2do piso, Ed. plomo (San Cayetano)', 'MEDICINA GENERAL, GINECOLOGÍA, LABORATORIO'),
  p('MEDICFEM (AMBATO)', 'Ambato, Tungurahua', 'Unión Nacional y Pasteur (La Merced)', 'GINECOLOGÍA'),
  // ── IMBABURA ─────────────────────────────────────────────────────────────
  p('CEMOPLAF (IBARRA)', 'Ibarra, Imbabura', 'Rocafuerte 9-60 y Colón (San Francisco)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  p('CONSULTORIOS SAN JOAQUÍN', 'Ibarra, Imbabura', 'Juana Atabalipa y Espinoza de los Monteros, a 2 cuadras del coliseo de Caranqui', 'MEDICINA GENERAL'),
  p('MEDICENTER (IBARRA)', 'Ibarra, Imbabura', 'Dr. Cristóbal Tobar Subia y Fray Bartolomé de las Casas, junto a la Estación de Servicios el Jardín (El Sagrario)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA'),
  p('CEMOPLAF (OTAVALO)', 'Otavalo, Imbabura', 'Bolívar 1207 y Salinas (Jordán)', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  p('MEDICENTER (OTAVALO)', 'Otavalo, Imbabura', 'Sucre 11-35 y Cristóbal Colón, a dos cuadras de la Plaza de Ponchos', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA'),
  p('MEDICENTER (ATUNTAQUI)', 'Atuntaqui, Imbabura', 'Pérez Muñoz 11-35 y General Enríquez – 2do piso, frente a Ferretería Punto Azul', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA'),
  // ── NAPO ─────────────────────────────────────────────────────────────────
  p('CLÍNICA DE ESPECIALIDADES GALENUS', 'Tena, Napo', 'Tena, Provincia de Napo', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, UROLOGÍA, LABORATORIO'),
  p('CENTRO DE ESPECIALIDADES MÉDICAS RESPIRA VITAL', 'Tena, Napo', 'Av. Muyuna s/n y Jorge Carrera, diagonal a la Administración del Parque Lineal', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO'),
  // ── PASTAZA ──────────────────────────────────────────────────────────────
  p('HOSPITAL VIDA', 'Puyo, Pastaza', 'Junto al Banco del Austro, 10 de Agosto y Puyo', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA, LABORATORIO', 'icon_hospital'),
  // ── MORONA SANTIAGO ──────────────────────────────────────────────────────
  p('CLÍNICA DE ESPECIALIDADES SANTA FE', 'Macas, Morona Santiago', 'Calle Soasti y Gabino Rivadeneira', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, NUTRICIÓN, CARDIOLOGÍA, TRAUMATOLOGÍA, UROLOGÍA, LABORATORIO, RAYOS X'),

  // ── NIVEL 2 (Centros demo — próximamente) ─────────────────────────────────
  p('CENTRO MÉDICO ESPECIALIZADO NORTE (DEMO)', 'Quito, Pichincha', 'Av. Naciones Unidas y Shyris, Torre Médica, Quito', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA', 'icon_building', 2),
  p('CLÍNICA AVANZADA DEL LITORAL (DEMO)', 'Guayaquil, Guayas', 'Av. Francisco de Orellana y Justino Cornejo, Guayaquil', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA', 'icon_building', 2),

  // ── NIVEL 3 (Centros demo — próximamente) ─────────────────────────────────
  p('HOSPITAL DE ESPECIALIDADES COLMEDIKAL (DEMO)', 'Quito, Pichincha', 'Av. de los Shyris y Suecia, Quito', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA', 'icon_hospital', 3),
  p('CLÍNICA INTERNACIONAL COLMEDIKAL (DEMO)', 'Guayaquil, Guayas', 'Av. Kennedy y Av. del Periodista, Guayaquil', 'MEDICINA GENERAL, PEDIATRÍA, GINECOLOGÍA, CARDIOLOGÍA, TRAUMATOLOGÍA, GASTROENTEROLOGÍA, UROLOGÍA', 'icon_hospital', 3),
];

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

// Step 1: fetch all existing
console.log('📋 Obteniendo prestadores existentes...');
const listRes = await fetch(`${API}/api/admin/doctors?limit=1000`, { headers });
const listData = await listRes.json();
const existing = listData.data || [];
console.log(`   Encontrados: ${existing.length} prestadores.`);

// Step 2: delete all
console.log('\n🗑️  Eliminando prestadores existentes...');
for (const doc of existing) {
  const r = await fetch(`${API}/api/admin/doctors/${doc.id}`, { method: 'DELETE', headers });
  console.log(`   ${r.ok ? '✓' : '✗'} Eliminado: ${doc.name} (${doc.id})`);
}

// Step 3: upload all new providers
console.log(`\n📤 Subiendo ${PROVIDERS.length} prestadores de la red RED.MED...\n`);
let ok = 0;
for (const prov of PROVIDERS) {
  const slug = prov.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const body = { ...prov, id: `col-${slug}-${Date.now().toString(36)}` };
  const r = await fetch(`${API}/api/admin/doctors`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (r.ok) { ok++; console.log(`   ✓ [N${prov.nivel}] ${prov.name}`); }
  else { console.error(`   ✗ FALLÓ: ${prov.name}`, await r.text()); }
  await new Promise(res => setTimeout(res, 60));
}

console.log(`\n✅ Listo: ${ok}/${PROVIDERS.length} prestadores cargados en la API.`);
