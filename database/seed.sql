-- Datos de ejemplo para el esquema propuesto en schema.sql.
-- Uso: solo para desarrollo/pruebas locales, no son datos reales.

INSERT INTO datasets (nombre, categoria, fuente, ubicacion, frecuencia_actualizacion, responsable) VALUES
('Tramites y servicios SUIT', 'Tramites', 'SUIT', 'datasets/originales/tramites_suit.xlsx', 'Anual', 'Secretaria de Gobierno'),
('Poblacion municipal', 'Demografia y Poblacion', 'SISBEN', 'datasets/originales/poblacion.xlsx', 'Anual', 'Secretaria de Planeacion');
