const axios = require('axios');
const fastify = require('../fastify-config');
const dbservice = require('../../database/service');



fastify.post('/api/v1/bet', async function (request, reply) {
    console.log("LOG");
    console.log(request.body);
    let token = await dbservice.get();
    console.log(token);
    if (token) {
        let result = await callPutOption(token[0].access_token, request.body.betType, request.body.betAmount, "DEMO");
        console.log(result.data);
        reply.send(result.data);
        return;
    }
    reply.send({ ok: 'false' });
});

fastify.get('/api/v1/spot-balance', async function (request, reply) {
    let token = await dbservice.get();
    console.log(token);
    if (token) {
        let result = await getSpotBlance(token[0].access_token);
        console.log(result.data);
        reply.send(result.data);
        return;
    }
    reply.send({ ok: 'false' });
});

async function getSpotBlance(accessToken) {
    const options = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
      };
    var res = await axios.get('https://pocinex.net/api/wallet/binaryoption/spot-balance', options);
    return res;
}

async function callPutOption(accessToken, betType, betAmount, betAccountType) {
    const options = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
      };
    var postData = { betType: betType, betAmount: betAmount, betAccountType: betAccountType }
    var res = await axios.post('https://pocinex.net/api/wallet/binaryoption/bet', postData, options);
    return res;
}
