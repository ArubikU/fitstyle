-- Crear base de datos FitStyleDB para SQL Server
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FitStyleDB')
BEGIN
    CREATE DATABASE FitStyleDB;
END
GO

USE FitStyleDB;
GO

-- Crear tablas para FitStyle en SQL Server
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='colores' AND xtype='U')
BEGIN
    CREATE TABLE colores (
        id_color INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        codigo_hsl NVARCHAR(25) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='marcas' AND xtype='U')
BEGIN
    CREATE TABLE marcas (
        id_marca INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        descuento DECIMAL(4,2) NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ocasiones' AND xtype='U')
BEGIN
    CREATE TABLE ocasiones (
        id_ocasion INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='temporadas' AND xtype='U')
BEGIN
    CREATE TABLE temporadas (
        id_temporada INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tipo_prendas' AND xtype='U')
BEGIN
    CREATE TABLE tipo_prendas (
        id_tipo INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        es_parte_superior BIT NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pieles' AND xtype='U')
BEGIN
    CREATE TABLE pieles (
        id_piel INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL UNIQUE,
        codigo_hsl NVARCHAR(25) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
BEGIN
    CREATE TABLE usuarios (
        id_usuario INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        email NVARCHAR(50) NOT NULL UNIQUE,
        contrasena NVARCHAR(255) NOT NULL,
        altura DECIMAL(5,2) NULL,
        peso DECIMAL(5,2) NULL,
        pieles_id_piel INT REFERENCES pieles(id_piel),
        genero BIT NULL, -- 1 = masculino, 0 = femenino
        suscripcion BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='outfits' AND xtype='U')
BEGIN
    CREATE TABLE outfits (
        id_outfit INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(20) NULL,
        usuarios_id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='prendas' AND xtype='U')
BEGIN
    CREATE TABLE prendas (
        id_prenda INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(50) NOT NULL,
        descripcion NVARCHAR(500) NULL,
        precio DECIMAL(6,2) CHECK (precio > 0),
        genero BIT NOT NULL,
        material NVARCHAR(50) NULL,
        url NVARCHAR(200) NULL,
        url_imagen NVARCHAR(200) NULL,
        tipo_prendas_id_tipo INT NOT NULL REFERENCES tipo_prendas(id_tipo),
        temporadas_id_temporada INT NOT NULL REFERENCES temporadas(id_temporada),
        colores_id_color INT NOT NULL REFERENCES colores(id_color),
        ocasiones_id_ocasion INT NOT NULL REFERENCES ocasiones(id_ocasion),
        marcas_id_marca INT NOT NULL REFERENCES marcas(id_marca)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='prendas_outfits' AND xtype='U')
BEGIN
    CREATE TABLE prendas_outfits (
        prendas_id_prenda INT REFERENCES prendas(id_prenda),
        outfits_id_outfit INT REFERENCES outfits(id_outfit),
        PRIMARY KEY (prendas_id_prenda, outfits_id_outfit)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='valoraciones' AND xtype='U')
BEGIN
    CREATE TABLE valoraciones (
        id_valoracion INT IDENTITY(1,1) PRIMARY KEY,
        comentario NVARCHAR(500) NULL,
        estrellas SMALLINT NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
        outfits_id_outfit INT NOT NULL REFERENCES outfits(id_outfit)
    );
END
GO
