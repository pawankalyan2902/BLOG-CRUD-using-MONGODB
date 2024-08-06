const mongodb=require("mongodb");

const client=mongodb.MongoClient;

let db;
async function create_database(){
       const connections_To_Server= await client.connect("mongodb://127.0.0.1:27017/myapp");
          db=connections_To_Server.db("blog");
}

function getdb()
{
    return db;
}
module.exports={
    create:create_database,
    getdb:getdb,
}