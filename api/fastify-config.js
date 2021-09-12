const fastify = require('fastify')({
    connectionTimeout: 60000,
    logger: true
})

fastify.listen(3000, (err, address) => {
    if (err){
        console.log(err);
        throw err;
    } 
    // Server is now listening on ${address}
  });

module.exports = fastify;