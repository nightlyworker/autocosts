const path  = require('path');
const url   = require(path.join(__dirname, 'url'));
const mysql = require('mysql'); //module to get info from DB
const async = require('async'); //module to allow to execute the queries in series
const debug = require('debug')('app:stats');

var averageNormalizedCosts;
var chartContent; //chartjs content of World statistics
var chartTable;   //HTML table data relating to the chart
var dateOfCalculation; //date when the chart data was calculated

module.exports = {
    
    req: function(req, res, serverData, wordsOfUK) {

        var data = {};
        data.wordsOfUK = wordsOfUK;
        data.serverData = serverData;        
        delete data.serverData.availableCountries.XX;   
        
        data.chartContent = chartContent;
        data.chartTable   = chartTable;
        data.dateOfCalculation = dateOfCalculation;
        data.averageNormalizedCosts = averageNormalizedCosts;

        //information depending on this request from the client    
        var clientData = {
            "isThisATest"  : url.isThisATest(req),      //boolean variable regarding if present request is a test
            "notLocalhost" : !url.isThisLocalhost(req), //boolean variable regarding if present request is from localhost
            "httpProtocol" : url.getProtocol(req, serverData.settings.switches.https)
        }    
        data.clientData = clientData;    
        
        data.layout = false;    
        var fileToRender = path.join(serverData.directories.index, "views", "stats.hbs");
        res.render(fileToRender, data);
        
    },
    
    prepareChart : function(serverData, WORDS, eventEmitter){
        
        var dbInfo = serverData.settings.dataBase.credentials;
        debug(dbInfo);
        
        //get current date in a formated string
        var d = new Date();
        dateOfCalculation = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear();

        var costs = {}; //object of arrays, each property is a cost item array
        var labels = [];
        var table = {}; //table with useful information for each country stats (total users, valid users, etc.)
        
        async.series([
        //creates DB connection and connects
            function(callback) {

                db = mysql.createConnection(dbInfo);
                console.log('\nGetting normalised costs from ' +
                            'DB table ' + dbInfo.database + '->' + dbInfo.db_tables.monthly_costs_normalized);

                db.connect(function(err){
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                    }                   
                    callback();
                });            
            },
            
            //Get the normalised costs
            function(callback) {                
                
                var i, n, cc;
                db.query('SELECT * FROM ' + dbInfo.db_tables.monthly_costs_normalized, 
                    function(err, results, fields) {
                        
                        if (err) {
                            console.log("Cannot connect to Database");
                            throw err;
                        }                        
                        
                        //removes entries with no valid users
                        for (i=0; i<results.length; i++){  
                            if(!results[i].valid_users){
                                results.splice(i, 1); //removes element i
                                i--;
                            }
                        }
                        debug(results);
                    
                        var costsStrs = ["Depreciation", 
                            "Insurance", 
                            "Loan_interests", 
                            "Inspection", 
                            "Car_tax", 
                            "Maintenance", 
                            "Fuel", 
                            "Repairs", 
                            "Parking", 
                            "Tolls", 
                            "Fines", 
                            "Washing"]; 
                    
                        results.sort(function(a,b){
                            return b.total_costs_year-a.total_costs_year
                        });
                    
                        //on every cost item, builds an array of values for said cost item
                        //to be used by the chartjs chart
                        for (n=0; n<costsStrs.length; n++){
                            costs[costsStrs[n]]=[];//cost item array                         
                            for (i=0; i<results.length; i++){
                                cc = results[i].country;
                                if (cc !== "XX"){
                                    var yearlyCost = results[i][costsStrs[n]]*12;
                                    //copies value from db (monthly) to object (yearly)
                                    costs[costsStrs[n]].push(yearlyCost);
                                    //fills labels, but just needs once
                                    if(n==0){
                                        labels.push(results[i].country);
                                    }
                                }
                            }
                        }                                                
                        //debug(costs);
                    
                        //convert values from monthly to yearly on every cost item
                        for (n=0; n<costsStrs.length; n++){
                            var costItem = costsStrs[n];
                            for (cc in results){
                                results[cc][costItem] = results[cc][costItem]*12;
                            }
                        }
                    
                        //calculate values for the last table on web page
                        var v, t;
                        for (i=0; i<results.length; i++){                        
                            cc = results[i].country; //country code string
                            
                            //add some extra info the the object results to be parsed into the web page
                            results[i].countryName = serverData.availableCountries[cc];
                            results[i].distance_std_option = WORDS[cc].distance_std_option;
                            
                            table[cc] = {}; //creates object for the country
                            table[cc].country_name = serverData.availableCountries[cc];
                            table[cc].valid_users = v = results[i].valid_users;
                            table[cc].total_users = t = results[i].total_users;
                            table[cc].global_total_users = results[i].global_total_users; //total users from all countries
                            table[cc].percentage_valid = v/t*100; //% of valid users                            
                            //currency
                            table[cc].CurrToEUR = results[i].CurrToEUR
                            table[cc].Currency  = WORDS[cc].curr_code;
                        }
                        chartTable = table;
                        //debug(table);
                    
                        averageNormalizedCosts = results;
                        debug(averageNormalizedCosts);
                    
                        callback();
                    }
                );
            },
            
            function(callback){
                
                var countryList = serverData.availableCountries;
                var wordsOfUK = WORDS.UK;

                var dataset = [
                    {
                        label: wordsOfUK.depreciation_st,
                        data: costs.Depreciation,
                        backgroundColor: 'navy'
                    }, {
                        label: wordsOfUK.insurance_short,
                        data: costs.Insurance,
                        backgroundColor: 'blue'
                    }, {
                        label: wordsOfUK.credit,
                        data: costs.Loan_interests,
                        backgroundColor: 'aqua'
                    }, {
                        label: wordsOfUK.inspection_short,
                        data: costs.Inspection,
                        backgroundColor: 'teal'
                    }, {
                        label: wordsOfUK.road_taxes_short,
                        data: costs.Car_tax,
                        backgroundColor: 'olive'
                    }, {
                        label: wordsOfUK.maintenance,
                        data: costs.Maintenance,
                        backgroundColor: 'green'
                    }, {
                        label: wordsOfUK.rep_improv,
                        data: costs.Repairs,
                        backgroundColor: 'lime'
                    }, {
                        label: wordsOfUK.fuel,
                        data: costs.Fuel,
                        backgroundColor: 'maroon'
                    }, {
                        label: wordsOfUK.parking,
                        data: costs.Parking,
                        backgroundColor: 'yellow'
                    }, {
                        label: wordsOfUK.tolls,
                        data: costs.Tolls,
                        backgroundColor: 'orange'
                    }, {
                        label: wordsOfUK.fines,
                        data: costs.Fines,
                        backgroundColor: 'red'
                    }, {
                        label: wordsOfUK.washing,
                        data: costs.Washing,
                        backgroundColor: 'purple'
                    }
                ];                

                var options = {
                    maintainAspectRatio: false,
                    legend: {
                        position: 'bottom', // place legend on the right side of chart
                        display: true, //do not display
                        labels : {
                            fontSize: 9,
                            fontColor: 'black'
                        }
                    },
                    scales: {
                        xAxes: [{
                            stacked: true, // this should be set to make the bars stacked
                            beginAtZero: true
                        }],
                        yAxes: [{
                            stacked: true, // this also..
                            beginAtZero: true
                        }]
                    },
                    animation: {
                        duration : 1000,
                        easing : 'linear'
                    }
                };

                chartContent = {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: dataset
                    },
                    options: options
                };        

                console.log("Chart of world statistics calculated");
            }
        ]);//async.series        
    }//prepareChart
}


