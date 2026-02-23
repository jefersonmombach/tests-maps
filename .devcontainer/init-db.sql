-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Criar schema público se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Comentários sobre as extensões
COMMENT ON EXTENSION postgis IS 'PostGIS geometric and geographic types and functions';
COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology extension for managing spatial topologies';
