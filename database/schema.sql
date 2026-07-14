-- =============================================================================
-- ESQUEMA PROPUESTO -- borrador de ejemplo, no es un esquema en produccion.
-- =============================================================================
-- El prototipo actual NO usa una base de datos: la consola analiza los
-- archivos directamente en el navegador, y n8n no persiste nada entre
-- ejecuciones. Este esquema es un punto de partida para el dia que el
-- proyecto necesite guardar datasets, historial de verificaciones de
-- calidad, o catalogar los datasets del municipio de forma centralizada.
-- Ajustalo antes de usarlo en serio.

CREATE TABLE datasets (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  fuente VARCHAR(100),
  ubicacion TEXT,                 -- ruta local o URL si es federado
  frecuencia_actualizacion VARCHAR(50),
  responsable VARCHAR(255),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verificaciones_calidad (
  id SERIAL PRIMARY KEY,
  dataset_id INTEGER REFERENCES datasets(id),
  fecha TIMESTAMP DEFAULT NOW(),
  total_registros INTEGER,
  total_errores INTEGER,
  codigos_detectados TEXT[],      -- ej. {ERR007,ERR018,ERR020}
  reporte_json JSONB              -- reporte completo, tal como lo arma el verificador
);

CREATE TABLE consultas_ciudadanas (
  id SERIAL PRIMARY KEY,
  dataset_id INTEGER REFERENCES datasets(id),
  pregunta TEXT,
  fecha TIMESTAMP DEFAULT NOW(),
  respuesta_json JSONB            -- respuesta que devolvio n8n (ver docs/api.md)
);
