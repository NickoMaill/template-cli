export const fileContent = "version: '3.7'\nservices: \ndb: \nimage: postgres \nrestart: always \nenvironment: \n- POSTGRES_DB=YOUR_PGDATABASE \n- POSTGRES_USER=YOUR_PGUSER \n- POSTGRES_PASSWORD=YOUR_PGPASSWORD \nports: \n- 'YOUR_PGPORT:5432'"