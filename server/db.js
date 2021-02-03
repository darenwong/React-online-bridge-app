const Pool = require("pg").Pool;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
    })
pool.on('connect', () => console.log('connected to db'));

module.exports= pool;