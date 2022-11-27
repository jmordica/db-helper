import { Database } from "./mod.ts";

const db = new Database('mysql://root:root@localhost:3306/main');

const user = await db.getUserById(98);

console.log(user);