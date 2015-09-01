CREATE OR REPLACE FUNCTION create_shark_role()
  RETURNS void AS
$BODY$
DECLARE
	temp BIGINT;
BEGIN

	CREATE ROLE shark LOGIN
	ENCRYPTED PASSWORD 'md5088dfc423ab6e29229aeed8eea5ad290'
	NOSUPERUSER NOINHERIT NOCREATEDB NOCREATEROLE;
	ALTER ROLE shark SET search_path=pg_default,shark; 

EXCEPTION WHEN duplicate_object THEN RETURN;
END
$BODY$
  LANGUAGE 'plpgsql' VOLATILE;

SELECT create_shark_role();

DROP FUNCTION create_shark_role();

--CREATE SCHEMA shark;
--ALTER SCHEMA shark OWNER TO shark;
