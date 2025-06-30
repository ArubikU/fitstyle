-- Funciones para SQL Server (equivalentes a las de PostgreSQL)
USE FitStyleDB;
GO

-- Función para recomendar outfits basado en características del usuario
IF OBJECT_ID('dbo.recomendar_outfit', 'TF') IS NOT NULL
    DROP FUNCTION dbo.recomendar_outfit;
GO

CREATE FUNCTION dbo.recomendar_outfit(
    @p_usuario_id INT,
    @p_ocasion_id INT = NULL,
    @p_temporada_id INT = NULL
)
RETURNS @result TABLE (
    outfit_id INT,
    prenda_superior_id INT,
    prenda_superior_nombre NVARCHAR(50),
    prenda_superior_imagen NVARCHAR(200),
    prenda_inferior_id INT,
    prenda_inferior_nombre NVARCHAR(50),
    prenda_inferior_imagen NVARCHAR(200),
    precio_total DECIMAL(8,2)
)
AS
BEGIN
    -- Variables para almacenar información del usuario
    DECLARE @user_genero BIT;
    DECLARE @user_piel_id INT;
    
    -- Obtener información del usuario
    SELECT @user_genero = genero, @user_piel_id = pieles_id_piel
    FROM usuarios 
    WHERE id_usuario = @p_usuario_id;
    
    -- Insertar combinaciones de outfits
    WITH prendas_superiores AS (
        SELECT TOP 5 
            p.id_prenda, 
            p.nombre, 
            p.url_imagen, 
            p.precio
        FROM prendas p
        INNER JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        WHERE tp.es_parte_superior = 1
        AND p.genero = @user_genero
        AND (@p_ocasion_id IS NULL OR p.ocasiones_id_ocasion = @p_ocasion_id)
        AND (@p_temporada_id IS NULL OR p.temporadas_id_temporada = @p_temporada_id)
        ORDER BY NEWID() -- Equivalente a RANDOM() en PostgreSQL
    ),
    prendas_inferiores AS (
        SELECT TOP 5 
            p.id_prenda, 
            p.nombre, 
            p.url_imagen, 
            p.precio
        FROM prendas p
        INNER JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        WHERE tp.es_parte_superior = 0
        AND p.genero = @user_genero
        AND (@p_ocasion_id IS NULL OR p.ocasiones_id_ocasion = @p_ocasion_id)
        AND (@p_temporada_id IS NULL OR p.temporadas_id_temporada = @p_temporada_id)
        ORDER BY NEWID()
    )
    INSERT INTO @result (
        outfit_id,
        prenda_superior_id,
        prenda_superior_nombre,
        prenda_superior_imagen,
        prenda_inferior_id,
        prenda_inferior_nombre,
        prenda_inferior_imagen,
        precio_total
    )
    SELECT TOP 3
        ROW_NUMBER() OVER (ORDER BY NEWID()) as outfit_id,
        ps.id_prenda as prenda_superior_id,
        ps.nombre as prenda_superior_nombre,
        ps.url_imagen as prenda_superior_imagen,
        pi.id_prenda as prenda_inferior_id,
        pi.nombre as prenda_inferior_nombre,
        pi.url_imagen as prenda_inferior_imagen,
        (ps.precio + pi.precio) as precio_total
    FROM prendas_superiores ps
    CROSS JOIN prendas_inferiores pi
    ORDER BY NEWID();
    
    RETURN;
END;
GO

-- Función para obtener colores que combinan con el tono de piel
IF OBJECT_ID('dbo.colores_recomendados_por_piel', 'TF') IS NOT NULL
    DROP FUNCTION dbo.colores_recomendados_por_piel;
GO

CREATE FUNCTION dbo.colores_recomendados_por_piel(@p_piel_id INT)
RETURNS @result TABLE (
    color_id INT,
    color_nombre NVARCHAR(100),
    color_hsl NVARCHAR(25)
)
AS
BEGIN
    INSERT INTO @result (color_id, color_nombre, color_hsl)
    SELECT c.id_color, c.nombre, c.codigo_hsl
    FROM colores c
    WHERE 
        CASE 
            WHEN @p_piel_id = 1 THEN 
                CASE WHEN c.nombre IN ('Azul', 'Verde', 'Morado', 'Pure Ruby') THEN 1 ELSE 0 END
            WHEN @p_piel_id = 2 THEN 
                CASE WHEN c.nombre IN ('Beige', 'Wonder Beige', 'Cream White', 'Marrón') THEN 1 ELSE 0 END
            WHEN @p_piel_id = 3 THEN 
                CASE WHEN c.nombre IN ('Blanco', 'Cream White', 'Preloved Teal', 'Pure Ruby') THEN 1 ELSE 0 END
            WHEN @p_piel_id = 4 THEN 
                CASE WHEN c.nombre IN ('Blanco', 'Cream White', 'Wonder Beige', 'Pure Ruby') THEN 1 ELSE 0 END
            ELSE 1
        END = 1;
    
    RETURN;
END;
GO

-- Procedimiento almacenado para obtener estadísticas de usuario
IF OBJECT_ID('dbo.sp_obtener_estadisticas_usuario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_obtener_estadisticas_usuario;
GO

CREATE PROCEDURE dbo.sp_obtener_estadisticas_usuario
    @p_usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @total_outfits INT;
    DECLARE @promedio_estrellas DECIMAL(3,2);
    DECLARE @precio_promedio DECIMAL(8,2);
    DECLARE @color_favorito NVARCHAR(100);
    
    -- Contar total de outfits guardados
    SELECT @total_outfits = COUNT(*)
    FROM outfits 
    WHERE usuarios_id_usuario = @p_usuario_id;
    
    -- Calcular promedio de estrellas
    SELECT @promedio_estrellas = AVG(CAST(v.estrellas AS DECIMAL(3,2)))
    FROM valoraciones v
    INNER JOIN outfits o ON v.outfits_id_outfit = o.id_outfit
    WHERE o.usuarios_id_usuario = @p_usuario_id;
    
    -- Calcular precio promedio de outfits
    SELECT @precio_promedio = AVG(precio_total.total)
    FROM (
        SELECT SUM(p.precio) as total
        FROM outfits o
        INNER JOIN prendas_outfits po ON o.id_outfit = po.outfits_id_outfit
        INNER JOIN prendas p ON po.prendas_id_prenda = p.id_prenda
        WHERE o.usuarios_id_usuario = @p_usuario_id
        GROUP BY o.id_outfit
    ) precio_total;
    
    -- Encontrar color más usado
    SELECT TOP 1 @color_favorito = c.nombre
    FROM outfits o
    INNER JOIN prendas_outfits po ON o.id_outfit = po.outfits_id_outfit
    INNER JOIN prendas p ON po.prendas_id_prenda = p.id_prenda
    INNER JOIN colores c ON p.colores_id_color = c.id_color
    WHERE o.usuarios_id_usuario = @p_usuario_id
    GROUP BY c.nombre
    ORDER BY COUNT(*) DESC;
    
    -- Retornar resultados
    SELECT 
        @total_outfits as total_outfits,
        ISNULL(@promedio_estrellas, 0) as promedio_estrellas,
        ISNULL(@precio_promedio, 0) as precio_promedio,
        ISNULL(@color_favorito, 'Sin preferencia') as color_favorito;
END;
GO

-- Función para calcular compatibilidad de colores
IF OBJECT_ID('dbo.calcular_compatibilidad_colores', 'FN') IS NOT NULL
    DROP FUNCTION dbo.calcular_compatibilidad_colores;
GO

CREATE FUNCTION dbo.calcular_compatibilidad_colores(
    @color1_hsl NVARCHAR(25),
    @color2_hsl NVARCHAR(25)
)
RETURNS INT
AS
BEGIN
    DECLARE @compatibilidad INT = 50; -- Valor base
    
    -- Extraer valores HSL (simplificado)
    DECLARE @h1 INT, @s1 INT, @l1 INT;
    DECLARE @h2 INT, @s2 INT, @l2 INT;
    
    -- Parsear HSL básico (esto es una simplificación)
    -- En un caso real, necesitarías una función más robusta para parsear HSL
    SET @h1 = TRY_CAST(SUBSTRING(@color1_hsl, CHARINDEX('(', @color1_hsl) + 1, 
                      CHARINDEX(',', @color1_hsl) - CHARINDEX('(', @color1_hsl) - 1) AS INT);
    SET @h2 = TRY_CAST(SUBSTRING(@color2_hsl, CHARINDEX('(', @color2_hsl) + 1, 
                      CHARINDEX(',', @color2_hsl) - CHARINDEX('(', @color2_hsl) - 1) AS INT);
    
    -- Calcular diferencia de matiz
    DECLARE @diff_h INT = ABS(@h1 - @h2);
    IF @diff_h > 180 SET @diff_h = 360 - @diff_h;
    
    -- Determinar compatibilidad basada en teoría del color
    IF @diff_h < 30 SET @compatibilidad = 85; -- Colores análogos
    ELSE IF ABS(@diff_h - 180) < 20 SET @compatibilidad = 90; -- Complementarios
    ELSE IF ABS(@diff_h - 120) < 20 OR ABS(@diff_h - 240) < 20 SET @compatibilidad = 80; -- Triádicos
    
    -- Verificar si son colores neutros (simplificado)
    IF @color1_hsl LIKE '%0%' OR @color2_hsl LIKE '%0%' SET @compatibilidad = 75;
    
    RETURN @compatibilidad;
END;
GO

-- Vista para outfits con información completa
IF OBJECT_ID('dbo.vw_outfits_completos', 'V') IS NOT NULL
    DROP VIEW dbo.vw_outfits_completos;
GO

CREATE VIEW dbo.vw_outfits_completos
AS
SELECT 
    o.id_outfit,
    o.nombre as outfit_nombre,
    o.created_at,
    u.nombre as usuario_nombre,
    u.email as usuario_email,
    v.estrellas,
    v.comentario,
    STRING_AGG(p.nombre, ', ') as prendas_nombres,
    SUM(p.precio) as precio_total,
    COUNT(p.id_prenda) as cantidad_prendas
FROM outfits o
INNER JOIN usuarios u ON o.usuarios_id_usuario = u.id_usuario
LEFT JOIN valoraciones v ON o.id_outfit = v.outfits_id_outfit
LEFT JOIN prendas_outfits po ON o.id_outfit = po.outfits_id_outfit
LEFT JOIN prendas p ON po.prendas_id_prenda = p.id_prenda
GROUP BY 
    o.id_outfit, o.nombre, o.created_at, u.nombre, u.email, v.estrellas, v.comentario;
GO

-- Función para obtener recomendaciones por temporada
IF OBJECT_ID('dbo.obtener_prendas_por_temporada', 'TF') IS NOT NULL
    DROP FUNCTION dbo.obtener_prendas_por_temporada;
GO

CREATE FUNCTION dbo.obtener_prendas_por_temporada(
    @temporada_id INT,
    @genero BIT,
    @limite INT = 10
)
RETURNS @result TABLE (
    id_prenda INT,
    nombre NVARCHAR(50),
    precio DECIMAL(6,2),
    color_nombre NVARCHAR(100),
    marca_nombre NVARCHAR(100),
    tipo_nombre NVARCHAR(100)
)
AS
BEGIN
    INSERT INTO @result
    SELECT TOP (@limite)
        p.id_prenda,
        p.nombre,
        p.precio,
        c.nombre as color_nombre,
        m.nombre as marca_nombre,
        tp.nombre as tipo_nombre
    FROM prendas p
    INNER JOIN colores c ON p.colores_id_color = c.id_color
    INNER JOIN marcas m ON p.marcas_id_marca = m.id_marca
    INNER JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
    WHERE p.temporadas_id_temporada = @temporada_id
    AND p.genero = @genero
    ORDER BY p.precio ASC;
    
    RETURN;
END;
GO

-- Trigger para auditoría de outfits
IF OBJECT_ID('dbo.tr_outfit_auditoria', 'TR') IS NOT NULL
    DROP TRIGGER dbo.tr_outfit_auditoria;
GO

CREATE TRIGGER tr_outfit_auditoria
ON outfits
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Crear tabla de auditoría si no existe
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='outfit_auditoria' AND xtype='U')
    BEGIN
        CREATE TABLE outfit_auditoria (
            id_auditoria INT IDENTITY(1,1) PRIMARY KEY,
            id_outfit INT,
            accion NVARCHAR(10),
            usuario_sistema NVARCHAR(100),
            fecha_accion DATETIME DEFAULT GETDATE(),
            datos_anteriores NVARCHAR(MAX),
            datos_nuevos NVARCHAR(MAX)
        );
    END
    
    -- Registrar inserciones
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO outfit_auditoria (id_outfit, accion, usuario_sistema, datos_nuevos)
        SELECT 
            i.id_outfit,
            'INSERT',
            SYSTEM_USER,
            CONCAT('nombre:', i.nombre, ', usuario_id:', i.usuarios_id_usuario)
        FROM inserted i;
    END
    
    -- Registrar actualizaciones
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO outfit_auditoria (id_outfit, accion, usuario_sistema, datos_anteriores, datos_nuevos)
        SELECT 
            i.id_outfit,
            'UPDATE',
            SYSTEM_USER,
            CONCAT('nombre:', d.nombre, ', usuario_id:', d.usuarios_id_usuario),
            CONCAT('nombre:', i.nombre, ', usuario_id:', i.usuarios_id_usuario)
        FROM inserted i
        INNER JOIN deleted d ON i.id_outfit = d.id_outfit;
    END
    
    -- Registrar eliminaciones
    IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO outfit_auditoria (id_outfit, accion, usuario_sistema, datos_anteriores)
        SELECT 
            d.id_outfit,
            'DELETE',
            SYSTEM_USER,
            CONCAT('nombre:', d.nombre, ', usuario_id:', d.usuarios_id_usuario)
        FROM deleted d;
    END
END;
GO
