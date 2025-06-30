-- Función para recomendar outfits basado en características del usuario
CREATE OR REPLACE FUNCTION recomendar_outfit(
    p_usuario_id INTEGER,
    p_ocasion_id INTEGER DEFAULT NULL,
    p_temporada_id INTEGER DEFAULT NULL
) RETURNS TABLE (
    outfit_id INTEGER,
    prenda_superior_id INTEGER,
    prenda_superior_nombre VARCHAR,
    prenda_superior_imagen VARCHAR,
    prenda_inferior_id INTEGER,
    prenda_inferior_nombre VARCHAR,
    prenda_inferior_imagen VARCHAR,
    precio_total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH usuario_info AS (
        SELECT u.genero, u.pieles_id_piel
        FROM usuarios u
        WHERE u.id_usuario = p_usuario_id
    ),
    prendas_superiores AS (
        SELECT p.id_prenda, p.nombre, p.url_imagen, p.precio
        FROM prendas p
        JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        JOIN usuario_info ui ON p.genero = ui.genero
        WHERE tp.es_parte_superior = true
        AND (p_ocasion_id IS NULL OR p.ocasiones_id_ocasion = p_ocasion_id)
        AND (p_temporada_id IS NULL OR p.temporadas_id_temporada = p_temporada_id)
        ORDER BY RANDOM()
        LIMIT 5
    ),
    prendas_inferiores AS (
        SELECT p.id_prenda, p.nombre, p.url_imagen, p.precio
        FROM prendas p
        JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        JOIN usuario_info ui ON p.genero = ui.genero
        WHERE tp.es_parte_superior = false
        AND (p_ocasion_id IS NULL OR p.ocasiones_id_ocasion = p_ocasion_id)
        AND (p_temporada_id IS NULL OR p.temporadas_id_temporada = p_temporada_id)
        ORDER BY RANDOM()
        LIMIT 5
    )
    SELECT 
        ROW_NUMBER() OVER ()::INTEGER as outfit_id,
        ps.id_prenda as prenda_superior_id,
        ps.nombre as prenda_superior_nombre,
        ps.url_imagen as prenda_superior_imagen,
        pi.id_prenda as prenda_inferior_id,
        pi.nombre as prenda_inferior_nombre,
        pi.url_imagen as prenda_inferior_imagen,
        (ps.precio + pi.precio) as precio_total
    FROM prendas_superiores ps
    CROSS JOIN prendas_inferiores pi
    ORDER BY RANDOM()
    LIMIT 3;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener colores que combinan con el tono de piel
CREATE OR REPLACE FUNCTION colores_recomendados_por_piel(p_piel_id INTEGER)
RETURNS TABLE (
    color_id INTEGER,
    color_nombre VARCHAR,
    color_hsl VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id_color, c.nombre, c.codigo_hsl
    FROM colores c
    WHERE 
        CASE 
            WHEN p_piel_id = 1 THEN c.nombre IN ('Azul', 'Verde', 'Morado', 'Pure Ruby')
            WHEN p_piel_id = 2 THEN c.nombre IN ('Beige', 'Wonder Beige', 'Cream White', 'Marrón')
            WHEN p_piel_id = 3 THEN c.nombre IN ('Blanco', 'Cream White', 'Preloved Teal', 'Pure Ruby')
            WHEN p_piel_id = 4 THEN c.nombre IN ('Blanco', 'Cream White', 'Wonder Beige', 'Pure Ruby')
            ELSE true
        END;
END;
$$ LANGUAGE plpgsql;
