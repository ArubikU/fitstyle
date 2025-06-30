-- Insertar datos base
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
('Wonder Beige', 'hsl(60,10%,80%)')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO marcas (nombre, descuento) VALUES 
('Adidas', NULL),
('H&M', NULL),
('Zara', NULL),
('Shein', NULL),
('Dockers', NULL),
('Tommy Hilfiger', NULL),
('Now', NULL)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO ocasiones (nombre) VALUES 
('Casual'),
('Deporte'),
('Formal')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO temporadas (nombre) VALUES 
('Invierno'),
('Verano'),
('Otoño'),
('Primavera')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipo_prendas (nombre, es_parte_superior) VALUES 
('Polera', true),
('Casaca', true),
('Camisa', true),
('Blusa', true),
('Vestido', true),
('Bermuda', false),
('Pantalon', false),
('Falda', false),
('Jogger', false)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO pieles (nombre, codigo_hsl) VALUES 
('Blanco', 'hsl(30, 15%, 85%)'),
('Trigueño', 'hsl(30, 30%, 70%)'),
('Moreno', 'hsl(30, 20%, 40%)'),
('Negro', 'hsl(25, 15%, 25%)')
ON CONFLICT (nombre) DO NOTHING;
