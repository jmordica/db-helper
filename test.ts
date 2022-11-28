import { Db } from "./methods.ts";

const db = new Db('mysql://root:root@localhost:3306/main', 'http://localhost:4001/db');

//const user = await db.getUserById(91118);

//console.log(user);

// Add user to tenant
const res = await db.getUserById(98);

console.log(res);