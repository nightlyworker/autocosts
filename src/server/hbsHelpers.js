/*Handlebars Helper Functions*/
const debug = require('debug')('app:helpers');

module.exports = {

    /*using for selecting value in HTML select boxes*/
    isSelected: function (CC, value) {            
        return CC === value ? ' ' + 'selected' : ''; 
    },
    /*negation*/
    negate: function(boolVar) {
        return !boolVar;
    },
    /*chose the HTML costs table for specific country*/
    costsTable: function (CC){
        return CC;
    },
    bannerFlag: function (CC){
        return CC.toLowerCase() + ' ' + 'flag';
    },
    //function that adpats the title for lower case 
    //having only uppercase on the firt letters of the words bigger than 4 characters
    adaptTitle: function(Title){ 

        //lower case all string
        var title = Title.toLowerCase();
        //get an array of words stripped by space
        var words = title.split(" ");
        //if a word has a size bigger than 4, uppercase first letter            
        for (var i = 0; i< words.length;  i++){
            if (words[i].length > 4){
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1); //uppercase of first letter of word
            }
        }

        title = words.join(' ');
        return title;
    },        
    //get first sentence of string, with HTML tags stripped out
    metaDescription: function(string){            
        return (string.split('.')[0]).replace(/<(?:.|\n)*?>/gm, '');
    },
    //function that gets a string of main/key words from title
    //Ex: "calculadora dos custos do automóvel" returns "calculadora, custos, automóvel"
    getKeywords: function(title, str1, str2){

        //lower case all strings
        var localTitle = title.toLowerCase();
        var localStr1 = str1.toLowerCase();
        var localStr2 = str2.toLowerCase();

        //get an array of words stripped by space
        var words = localTitle.split(" ");

        //if a word has a size bigger than 3, adds to keywords
        var keywords = []; var word;
        for(var i=0; i<words.length; i++){
            word = words[i];
            if (word.length >3 ){
                keywords.push(word);
            }
        }

        keywords.push(localStr1);
        keywords.push(localStr2);

        var keywords_string = keywords.join(',');

        return keywords_string;
    },      
    json: function(context) {
        return JSON.stringify(context);
    },
    jsonObj: function(obj){
        return encodeURI(JSON.stringify(obj));
    },
    striOutHTML: function(str){
        return str.replace(/<(?:.|\n)*?>/gm, '');
    },
    getFuelEfficiencyOptStr: function(optN){
        switch(optN){
            case 1:
                return "l/100km";            
            case 2:
                return "km/l";            
            case 3:
                return "mpg(imp)";
            case 4:
                return "mpg(US)";           
            case 5:
                return "l/mil";
            case 6:
                return "km/gal(US)";
            default: 
                return "error";
        }
    },
    getDistanceOptStr: function(optN){
        switch(optN){
            case 1:
                return "kilometres";            
            case 2:
                return "miles";            
            case 3:
                return "mil";
            default: 
                return "error";
        }
    },
    getDistanceOptStrShort: function(optN){
        switch(optN){
            case 1:
                return "km";            
            case 2:
                return "mi";            
            case 3:
                return "Mil";
            default: 
                return "error";
        }
    },    
    getFuelPriceVolumeOptStr: function(optN){
        switch(optN){
            case 1:
                return "litres";            
            case 2:
                return "imperial gallons";            
            case 3:
                return "US gallons";
            default: 
                return "error";
        }
    },
    get2letterLangCode: function(langCode){
        return langCode.substr(0, 2);
    },
    //convert number to string with n decimal values
    toFixed: function(num, n){
        return num.toFixed(n);
    },
    //Content Security Policy; domainsArr has the domains of this calculator: autocosts.info, autocustos.info, etc.
    getCSPstring(domainsArr){
        
        //creates string with calculator domains
        var domainsStr = "", i;
        for (i=0; i<domainsArr.length; i++){
            domainsStr += "*." + domainsArr[i] + " " + domainsArr[i] + " ";
        }
        
        var reliableDomains = [ "cdnjs.cloudflare.com",
                                "code.jquery.com",
                                "googleapis.com",
                                "google.com",
                                "gstatic.com",
                                "google-analytics.com",
                                "autocosts.work"];
        
         //adds string with reliable domains
        for (i=0; i<reliableDomains.length; i++){
            domainsStr += "*." + reliableDomains[i] + " " + reliableDomains[i] + " ";
        }
        
        var CSPstr = "default-src 'self'" + " " + domainsStr + "; ";
        CSPstr += "script-src 'self' 'unsafe-eval' 'unsafe-inline'" + " " + domainsStr + "; ";        
        CSPstr += "style-src 'self' 'unsafe-inline' 'unsafe-eval'" + " " + domainsStr + "; ";
        CSPstr += "img-src 'self'" + " " + domainsStr + ";";
        
        debug(CSPstr);
        return CSPstr;    
    }
}

