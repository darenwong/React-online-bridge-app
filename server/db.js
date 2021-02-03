const Pool = require("pg").Pool;

const pool = new Pool({
    user: "ycerfxrqdubcii",
    password: "339ccdeb8c5541562f66b233a8a3a4bad40586604bae17a114a8086ed0479126",
    host: "ec2-34-224-254-126.compute-1.amazonaws.com",
    port: 5432,
    database: "ddbvnbpdt0921s",
})
module.exports= pool;