-- Insertar datos base en SQL Server
USE FitStyleDB;
GO

-- Insertar colores
IF NOT EXISTS (SELECT 1 FROM colores WHERE nombre = 'Azul')
BEGIN
    INSERT INTO colores (nombre, codigo_hsl) VALUES 
    ('Azul', 'hsl(240,100%,50%)'),
    ('Beige', 'hsl(60,20%,80%)'),
    ('Black', 'hsl(0,0%,0%)'),
    ('Blanco', 'hsl(0,0%,100%)'),
    ('Cream White', 'hsl(45,100%,90%)'),
    ('Marrón', 'hsl(30,60%,25%)'),
    ('Morado', 'hsl(280,50%,50%)'),
    ('Negro', 'hsl(0,0%,0%)'),
    ('Preloved Teal', 'hsl(180,25%,50%)'),
    ('Pure Ruby', 'hsl(350,60%,50%)'),
    ('Verde', 'hsl(120,100%,50%)'),
    ('Wonder Beige', 'hsl(60,10%,80%)');
END
GO

-- Insertar marcas
IF NOT EXISTS (SELECT 1 FROM marcas WHERE nombre = 'Adidas')
BEGIN
    INSERT INTO marcas (nombre, descuento) VALUES 
    ('Adidas', NULL),
    ('H&M', NULL),
    ('Zara', NULL),
    ('Shein', NULL),
    ('Dockers', NULL),
    ('Tommy Hilfiger', NULL),
    ('Now', NULL);
END
GO

-- Insertar ocasiones
IF NOT EXISTS (SELECT 1 FROM ocasiones WHERE nombre = 'Casual')
BEGIN
    INSERT INTO ocasiones (nombre) VALUES 
    ('Casual'),
    ('Deporte'),
    ('Formal');
END
GO

-- Insertar temporadas
IF NOT EXISTS (SELECT 1 FROM temporadas WHERE nombre = 'Invierno')
BEGIN
    INSERT INTO temporadas (nombre) VALUES 
    ('Invierno'),
    ('Verano'),
    ('Otoño'),
    ('Primavera');
END
GO

-- Insertar tipo_prendas
IF NOT EXISTS (SELECT 1 FROM tipo_prendas WHERE nombre = 'Polera')
BEGIN
    INSERT INTO tipo_prendas (nombre, es_parte_superior) VALUES 
    ('Polera', 1),
    ('Casaca', 1),
    ('Camisa', 1),
    ('Blusa', 1),
    ('Vestido', 1),
    ('Bermuda', 0),
    ('Pantalon', 0),
    ('Falda', 0),
    ('Jogger', 0);
END
GO

-- Insertar pieles
IF NOT EXISTS (SELECT 1 FROM pieles WHERE nombre = 'Blanco')
BEGIN
    INSERT INTO pieles (nombre, codigo_hsl) VALUES 
    ('Blanco', 'hsl(30, 15%, 85%)'),
    ('Trigueño', 'hsl(30, 30%, 70%)'),
    ('Moreno', 'hsl(30, 20%, 40%)'),
    ('Negro', 'hsl(25, 15%, 25%)');
END
GO
