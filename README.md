A hacky Node.js script that exports weight history from Fitbit and exports it to Garmin Connect.

# How to use this

## Prerequisites
1. Log in to your Fitbit dashboard on the web
2. From the network tab in your browser console, grab a request that goes to a URL starting with `https://web-api.fitbit.com/`
3. Copy the value of the `Authorization` request header and save it. It should look something like `Bearer <long string of letters and numbers>`.
4. Log in to Garmin Connect
5. From the network tab in your browser console, grab a request going to a URL that starts with `https://connect.garmin.com/` (maybe filter by `XHR` requests)
4. Copy the value of the `Cookie` request header and save it.

## Run the script
1. Clone the repo and open a terminal in the repo's directory
2. `npm install`
3. Determine the date that you would like to start importing data from (in format `<year>-<month>-<day>` e.g. `2022-04-15` for tyhe 15th of April of 2022).
4. Run the script like so:
```
START_DATE="<your desired date to start importing from>" FITBIT_AUTHORIZATION_HEADER="<the value of the Fitbit Authorization header that you grabbed before>" GARMIN_COOKIE="<the value of the Garmin Connect Cookie header that you grabbed before>" node main.js
```

For example:
```
START_DATE="2022-04-15" FITBIT_AUTHORIZATION_HEADER="bm8gdGhpcyBpcyBub3QgbXkgcmVhbCBzZXNzaW9uIGRhdGEsIGkgYW0gbm90IGFuIGlkaW90Cg" GARMIN_COOKIE="__cflb=fgd678df658g56fdg567; GarminUserPrefs=en-GB; GARMIN-SSO=1; GarminNoCache=true; GARMIN-SSO-GUID=D5496827B390474E96AC37C0E41CE667; GARMIN-SSO-CUST-GUID=C8F9822B-64E2-4F8D-9187-596C51FDFC58; SESSIONID=r8gVEl4ajEK6FrO6tTcnUg; JWT_FGP=2a89b2d0-fb24-4ed7-930c-5a6b68acab74" node main.js
```
(No, none of the data in this example is really from my account, don't worry.)

All available weight data from the supplied start date will be read from Fitbit and sent to Garmin, as well as exported to a file called `weightData.json` on your machine.
