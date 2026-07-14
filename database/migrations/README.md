# Migraciones

Sin base de datos en produccion todavia -- ver la nota al inicio de
`../schema.sql`. Cuando se implemente, cada cambio de esquema deberia
quedar como un archivo numerado aqui, ej:

```
001_crear_datasets.sql
002_agregar_verificaciones_calidad.sql
```

para poder aplicar los cambios en orden y llevar registro de la
evolucion del esquema.
