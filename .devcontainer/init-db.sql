-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar schema público se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Comentários sobre as extensões
COMMENT ON EXTENSION postgis IS 'PostGIS geometric and geographic types and functions';
COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology extension for managing spatial topologies';


CREATE TABLE public.pontos_de_interesse (
	id serial4 NOT NULL,
	nome varchar(100) NULL,
	categoria varchar(50) NULL,
	geom public.geometry(point, 4326) NULL,
	CONSTRAINT pontos_de_interesse_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_pontos_interesse_geom ON public.pontos_de_interesse USING gist (geom);


INSERT INTO public.pontos_de_interesse (nome, categoria, geom) VALUES
('Navio Apoio Oceanic', 'Offshore', ST_GeomFromText('POINT(-41.6521 -22.4512)', 4326)),
('Plataforma FPSO-88', 'Petróleo', ST_GeomFromText('POINT(-40.9542 -22.5831)', 4326)),
('Rebocador Titan', 'Apoio Portuário', ST_GeomFromText('POINT(-41.7210 -22.3845)', 4326)),
('Veleiro Blue Marlim', 'Lazer', ST_GeomFromText('POINT(-41.8823 -22.7211)', 4326)),
('Pesqueiro Sete Mares', 'Pesca', ST_GeomFromText('POINT(-41.9544 -22.8522)', 4326)),
('Navio Tanque Gasol', 'Carga', ST_GeomFromText('POINT(-41.2211 -22.5144)', 4326)),
('Lancha Rápida RJ', 'Turismo', ST_GeomFromText('POINT(-42.0122 -22.9811)', 4326)),
('Navio Sonda Discovery', 'Perfuração', ST_GeomFromText('POINT(-40.7812 -22.3122)', 4326)),
('Catamarã Búzios', 'Turismo', ST_GeomFromText('POINT(-41.8511 -22.7044)', 4326)),
('Navio Supridor Alpha', 'Offshore', ST_GeomFromText('POINT(-41.3544 -22.6233)', 4326)),
('Iate Estrela Dalva', 'Lazer', ST_GeomFromText('POINT(-41.9211 -22.9211)', 4326)),
('Draga Rio-Norte', 'Manutenção', ST_GeomFromText('POINT(-41.7822 -22.4122)', 4326)),
('Navio de Carga Beta', 'Comercial', ST_GeomFromText('POINT(-41.1022 -22.8211)', 4326)),
('Escuna Pirata', 'Turismo', ST_GeomFromText('POINT(-41.9833 -23.0122)', 4326)),
('Rebocador de Alto Mar', 'Apoio', ST_GeomFromText('POINT(-40.8522 -22.4544)', 4326)),
('Balsa de Transporte 01', 'Logística', ST_GeomFromText('POINT(-41.6211 -22.3511)', 4326)),
('Navio Patrulha Marinha', 'Segurança', ST_GeomFromText('POINT(-41.4211 -22.9522)', 4326)),
('Veleiro Solo', 'Esporte', ST_GeomFromText('POINT(-41.8211 -22.7533)', 4326));
