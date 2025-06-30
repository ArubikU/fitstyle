-- Script de prueba para las funciones de SQL Server
USE FitStyleDB;
GO

PRINT 'Iniciando pruebas de funciones...';
GO

-- Prueba 1: Función de recomendación de outfits
PRINT 'Prueba 1: Función recomendar_outfit';
SELECT * FROM dbo.recomendar_outfit(1, NULL, NULL);
GO

-- Prueba 2: Colores recomendados por tono de piel
PRINT 'Prueba 2: Colores recomendados para piel tipo 1 (Blanco)';
SELECT * FROM dbo.colores_recomendados_por_piel(1);
GO

PRINT 'Prueba 3: Colores recomendados para piel tipo 2 (Trigueño)';
SELECT * FROM dbo.colores_recomendados_por_piel(2);
GO

-- Prueba 4: Procedimiento de estadísticas (requiere datos de prueba)
PRINT 'Prueba 4: Estadísticas de usuario';
-- Primero insertar un usuario de prueba si no existe
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'test@example.com')
BEGIN
    INSERT INTO usuarios (nombre, email, contrasena, genero, pieles_id_piel)
    VALUES ('Usuario Test', 'test@example.com', 'hashedpassword', 1, 1);
END

DECLARE @test_user_id INT = (SELECT id_usuario FROM usuarios WHERE email = 'test@example.com');
EXEC dbo.sp_obtener_estadisticas_usuario @test_user_id;
GO

-- Prueba 5: Función de compatibilidad de colores
PRINT 'Prueba 5: Compatibilidad de colores';
SELECT dbo.calcular_compatibilidad_colores('hsl(240,100%,50%)', 'hsl(0,100%,50%)') as compatibilidad_azul_rojo;
SELECT dbo.calcular_compatibilidad_colores('hsl(240,100%,50%)', 'hsl(250,100%,50%)') as compatibilidad_azul_similar;
GO

-- Prueba 6: Función de prendas por temporada
PRINT 'Prueba 6: Prendas de invierno para hombres';
SELECT * FROM dbo.obtener_prendas_por_temporada(1, 1, 5);
GO

PRINT 'Prueba 7: Prendas de verano para mujeres';
SELECT * FROM dbo.obtener_prendas_por_temporada(2, 0, 5);
GO

-- Prueba 8: Vista de outfits completos
PRINT 'Prueba 8: Vista de outfits completos';
SELECT TOP 5 * FROM dbo.vw_outfits_completos;
GO

-- Prueba 9: Verificar trigger de auditoría
PRINT 'Prueba 9: Trigger de auditoría';
-- Insertar un outfit de prueba
DECLARE @test_user_id INT = (SELECT TOP 1 id_usuario FROM usuarios);
INSERT INTO outfits (nombre, usuarios_id_usuario) VALUES ('Outfit Test Trigger', @test_user_id);

-- Verificar que se creó el registro de auditoría
IF EXISTS (SELECT * FROM sysobjects WHERE name='outfit_auditoria' AND xtype='U')
BEGIN
    SELECT TOP 3 * FROM outfit_auditoria ORDER BY fecha_accion DESC;
END
ELSE
BEGIN
    PRINT 'Tabla de auditoría no encontrada';
END
GO

-- Prueba 10: Rendimiento de funciones
PRINT 'Prueba 10: Rendimiento de funciones';
DECLARE @start_time DATETIME = GETDATE();

-- Ejecutar múltiples recomendaciones
DECLARE @i INT = 1;
WHILE @i <= 10
BEGIN
    SELECT COUNT(*) FROM dbo.recomendar_outfit(1, NULL, NULL);
    SET @i = @i + 1;
END

DECLARE @end_time DATETIME = GETDATE();
PRINT 'Tiempo transcurrido: ' + CAST(DATEDIFF(MILLISECOND, @start_time, @end_time) AS VARCHAR) + ' ms';
GO

PRINT 'Pruebas completadas exitosamente!';
GO
