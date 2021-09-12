const cron = require('cron');
const axios = require('axios');
const dbservice = require('../database/service');


// TODO: refreshToken, accessToken get từ DB ra ở những chỗ gọi, không dùng ở đây
// mỗi phút sẽ reload lại cái token trong thời gian chờ kết quả
const job = new cron.CronJob({
    cronTime: '00 * * * * *',
    onTick: async function () {
        let token = await dbservice.get();
        console.log(token);
        let newToken = await getToken(token[0].refresh_token);
        console.log("New token info");
        console.log(newToken);
        if (newToken) {
            await dbservice.updateToken(newToken);
            console.log("Update token success for {user}");
        } else {
            console.log("Update token fail for {user}");
        }
        
    }
});



async function getToken(refreshToken) {
    var postData = { client_id: "pocinex-web", grant_type: "refresh_token", "refresh_token": refreshToken }
    var rest = await axios.post('https://pocinex.net/api/auth/auth/token', postData);
    if (rest.data.ok) {
        console.log("get token success for ...{userId}");
        return { access_token: rest.data.d.access_token, refresh_token: rest.data.d.refresh_token }
    }
    return null;
}



job.start();


