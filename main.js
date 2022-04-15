import fetch from 'node-fetch';
import Fs from 'fs';

const getRequiredEnvVar = envVar => {
    const val = process.env[envVar];
    if (!val) {
        throw new Error(`${envVar} environment variable not set.`);
    }

    return val;
}

const START_DATE = getRequiredEnvVar('START_DATE');
const FITBIT_AUTHORIZATION_HEADER = getRequiredEnvVar('FITBIT_AUTHORIZATION_HEADER');
const GARMIN_COOKIE = getRequiredEnvVar('GARMIN_COOKIE');

console.info('Fetching weight data from Fitbit...');
const weightData = [];
let offset = 0;
const limit = 100;
while (true) {
    const resp = await (await fetch(`https://web-api.fitbit.com/1.1/user/-/body/log/weight/list.json?offset=${offset}&limit=${limit}&sort=asc&afterDate=${START_DATE}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Locale": "en_US",
            "Authorization": FITBIT_AUTHORIZATION_HEADER,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "referrer": "https://www.fitbit.com/",
        "method": "GET",
        "mode": "cors"
    })).json();
    if (resp.weight.length === 0) {
        break;
    }
    resp.weight.forEach(entry => {
        console.log(`📩  📅 ${entry.date} 🕐 ${entry.time} ⚖️ ${entry.weight}`);
        weightData.push(entry)
    });

    offset += limit;
}

console.info('Writing weight data to weightData.json...');
Fs.writeFileSync('weightData.json', JSON.stringify(weightData, undefined, 4));

console.info('Sending weight data to Garmin Connect...');
for (const entry of weightData) {
    const {
        date,
        time,
        weight
    } = entry;
    const timeWithTrailingZeroes = `${time}.00`;

    console.log(`✉️  📅 ${entry.date} 🕐 ${entry.time} ⚖️ ${entry.weight}`);
    const resp = await fetch("https://connect.garmin.com/modern/proxy/weight-service/user-weight", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-GB,en;q=0.5",
            "NK": "NT",
            "X-app-ver": "4.53.3.0",
            "Content-Type": "application/json;charset=utf-8",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "Cookie": GARMIN_COOKIE
        },
        "referrer": "https://connect.garmin.com/modern/weight/2022-04-15/0",
        "body": `{\"dateTimestamp\":\"${date}T${timeWithTrailingZeroes}\",\"gmtTimestamp\":\"${date}T${timeWithTrailingZeroes}\",\"unitKey\":\"kg\",\"value\":${weight}}`,
        "method": "POST",
        "mode": "cors"
    });
    if (!resp.ok) {
        console.error({
            entry,
            response: {
                status: resp.status,
                statusText: resp.statusText,
                body: await resp.text()
            }
        });
        throw new Error('Failed to persist weight entry to Garmin Connect.');
    }
}
