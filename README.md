# VORM - VOXO ORM :notebook:

VORM is a simple ORM like module for VOXO which provides a simple interface for various backend databases (currently MySQl and rqlite are supported).

- Works with MySql, rqlite
- Simple interface (single entry point)
- Easy to swap backend database on a per query basis
- Easy to extend with new backend databases
- Usage of named parameters

## Usage

```ts
import { Vorm } from "https://deno.land/x/vorm/mod.ts";

const db = new Vorm('mysql://root:root@localhost:3306/main', 'http://localhost:4001/db');

const res = await db.getUserById(98);
console.log(res);
```

## Response Object

Response object is a simple object with the following properties:

```ts
{
  req: { // Request object
    sql: string, // SQL query
    vales: { [key: string]: any }, // Values for named parameters
    db: string, // Database name
    isWrite: boolean, // Is write query
    queue: boolean, // Is queued write query (rqlite only)
  },
  rows: { [param: string]: string | number }[], // Rows returned by the SELECT query
  affectedRows: number, // Number of affected rows by the INSERT/UPDATE/DELETE query
  insertId: number, // Insert ID of the INSERT query
  time: number, // Time taken to execute the query (rqlite only)
  error: string, // Error message if any
}
```