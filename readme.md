Automobile costs calculator
=========

This calculator allows users to find the true cost of owning a car. It will normally give them a good estimate of what they really need to spend on car ownership. As car payments and expenses come due throughout the year, it's often difficult to really get a good understanding of total spending on a car. This calculator also provides to the user, optionally, the car's full Financial Effort considering the user's income, further providing also optionally the equivalent public transport costs (bus, train, UBER, etc.), considering the user doesn't own a car.

This calculator is and shall always be completely anonymous, as it doesn't request nor permanently store, any name, email, cookies, IP address nor any other personal information. Since it uses NodeJS and NPM it works and it is tested for either Ubuntu related OS or Windows related OS.

## Website
https://autocosts.info<br>
Playground: https://autocosts.info/XX 

### The list of available countries
https://autocustos.info/list

The translations are in corresponding `json` files, namely in the folder `src/countries/`.<br>
The list of available countries is from the file `src/countries/list.json`

### The registered associated domains
https://autocosts.info/domains

## How to install
Install it, build it and run it with the single command<br>
`npm i autocosts`

## How does it work?
Autocosts uses `nodejs`, `expressjs` and `handlebars` to supply a server application that renders a car costs calculator as a webpage loaded by any common browser. 

The project is optimized for a web-based version, and for an APP developped in Apache Cordova. The 2 last letters on the URI stands for the 2-letter ISO country code, and not for the language, since for example United Kingdom and Australia have the same language but different realities concerning the taxes, the terms applied to automobile costs and the units for fuel efficiency. The translations/language files apply therefore only to the selected country.

The project already considers all the units and fuel efficiency cases, different in many countries. The variations for fuel efficiency are `l/100km`, `km/l`, `mpg(US)`, `mpg(imp)` and for distance are `km`, `miles` and `mil` (Nordic mile=10km). More information can be found in the directory `src/countries/`.

For more information regarding how the costs are calculated, you can check the `src/client/core/coreFunctions.js` which is based on the <a href="https://en.wikipedia.org/wiki/Car_costs">12 items that form the car costs</a> for any given country. Namely they are:

* Standing costs
  * Depreciation
  * Car taxes
  * Insurance
  * Inspection
  * Car finance
* Running costs
  * Fuel
  * Maintenance
  * Repairs and Improvements
  * Parking
  * Tolls
  * Fines
  * Car washes

### Aditional services
Autocosts supports the following additional services, which can be enabled or disabled (default), 
using the `node bin/index.js` command line options:

```
Usage: node index.js [options]
Ex:    node index.js -r prod --uber --dataBase

Options: 
-r, --release              'work' for tests or 'prod' for production
-p, --port                 HTTP port on which the application is listening (default:3027 for tests, and 3028 for production)
    --https                Enables protocol https when available
    --print                Enables the standard printing of final report
    --pdf                  Enables the downloading of a pdf final report (using pdfmake)
    --social               Enables social media plugin (js-socials)
    --disableCharts        Disables Charts on final report

    External API services, disabled by default
    API credentials must be in either credentials/work/ or credentials/prod/ according to release
    --cdn                  Enables Content Delivery Network
    --uber                 Enables UBER API
    --googleCaptcha        Enables Google Captcha V2 anti-bot for calculation button
    --googleAnalytics      Enables Google Analytics
    --dataBase             Enables a mysql Database
```

### Database

Autocosts also supports code such that the user inputs might be stored into a `mysql` database. 
The credentials file for said databse should be stored in directory `credentials/prod/` or `credentials/work/`, 
the latter being the test version.

This file `dataBase.json` should look like:

```
{
    "host"      : "*****",
    "user"      : "*****",
    "password"  : "*****",
    "database"  : "*****",
    "port"      : "***** (optional)",
    "db_tables" : {
        "country_specs"    : "country_specs" ,
        "users_insertions" : "users_insertions",
        "monthly_costs_statistics" : "monthly_costs_statistics"
  }
}
```

With the data from said database, it is also possible to make several statisitcal analysis, 
namely the average costs for each country, said statistical analysis having outlier removal techniques, 
such that such outliers do not distort the average.

### Uber

Autocosts uses the UBER API, such that at the final repport, 
the user calculations can be compared with the equivalents costs if the user would use just UBER.

The uber secret token file `uber.json` should be stored in `credentials/prods/` or `credentials/work/`, 
the latter being the test version. This file `uber.json` should be like:

```
{
    "token": "********************************************"
}
```

### Charts

Autocosts uses <a href=http://www.chartjs.org/>chartjs.org</a> as it is free, open source and can be used offline.

### Google Analytics

You can add your Google Analytics credentials. 
The file `googleAnalytics.json` should be stored in `credentials/prods/` or `credentials/work/`, 
the latter being the test version. This file `googleAnalytics.json` should be like:

```
{
    "trackingId": "UA-*******-*"
}
```

### Google Captcha v2

Autocosts support the Google Captcha v2 API to avoid spam bots from poluting the database. 
The captcha secret key file `googleCaptcha.json` should be stored in `credentials/prods/` or `credentials/work/`, 
the latter being the test version. 
This file `googleCaptcha.json` should be like:

```
{  
    "secretKey" : "*************************************"
}
```

### PDF

Autocosts also allows the final report to be printed into a PDF report. It makes use of `pdfmake` npm package.

## Android APP<br>

The <a href="https://play.google.com/store/apps/details?id=info.autocosts">Android APP can be found in Play Store</a>. It uses <a href="https://cordova.apache.org/">Apache Cordova</a> to convert JavaScript built code into APP built files (for example APK files in Android)

## Contributions
* Use four spaces for indentations
* Comment the code in English
* The local variables names, object properties, functions names and directories names shall obey CamelCase
* The directories structure tries to respect the <a href="https://github.com/jfoclpf/autocosts/blob/master/docs/nodeJS-directory-structure.md">directory structure for JavaScript/Node Projects</a>.

## License<br>
GNU GPLv3<br>
http://www.gnu.org/licenses/gpl-3.0.en.html <br>
http://choosealicense.com/licenses/gpl-3.0/
