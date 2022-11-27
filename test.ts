import { Database } from "./mod.ts";

const db = new Database('mysql://root:root@localhost:3306/main', 'http://localhost:4001/db');

//const user = await db.getUserById(98);

const users = await db.getUsersByAccountId(37);

console.log(users);