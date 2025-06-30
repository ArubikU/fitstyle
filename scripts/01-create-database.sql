-- Crear tablas para FitStyle
CREATE TABLE IF NOT EXISTS colores (
    id_color SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_hsl VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS marcas (
    id_marca SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descuento DECIMAL(4,2)
);

CREATE TABLE IF NOT EXISTS ocasiones (
    id_ocasion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS temporadas (
    id_temporada SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipo_prendas (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    es_parte_superior BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS pieles (
    id_piel SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_hsl VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    altura DECIMAL(5,2),
    peso DECIMAL(5,2),
    pieles_id_piel INTEGER REFERENCES pieles(id_piel),
    genero BOOLEAN, -- true = masculino, false = femenino
    suscripcion BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outfits (
    id_outfit SERIAL PRIMARY KEY,
    nombre VARCHAR(20),
    usuarios_id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prendas (
    id_prenda SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(6,2) CHECK (precio > 0),
    genero BOOLEAN NOT NULL,
    material VARCHAR(50),
    url VARCHAR(200),
    url_imagen VARCHAR(200),
    tipo_prendas_id_tipo INTEGER NOT NULL REFERENCES tipo_prendas(id_tipo),
    temporadas_id_temporada INTEGER NOT NULL REFERENCES temporadas(id_temporada),
    colores_id_color INTEGER NOT NULL REFERENCES colores(id_color),
    ocasiones_id_ocasion INTEGER NOT NULL REFERENCES ocasiones(id_ocasion),
    marcas_id_marca INTEGER NOT NULL REFERENCES marcas(id_marca)
);

CREATE TABLE IF NOT EXISTS prendas_outfits (
    prendas_id_prenda INTEGER REFERENCES prendas(id_prenda),
    outfits_id_outfit INTEGER REFERENCES outfits(id_outfit),
    PRIMARY KEY (prendas_id_prenda, outfits_id_outfit)
);

CREATE TABLE IF NOT EXISTS valoraciones (
    id_valoracion SERIAL PRIMARY KEY,
    comentario VARCHAR(500),
    estrellas SMALLINT NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    outfits_id_outfit INTEGER NOT NULL REFERENCES outfits(id_outfit)
);
