Automobile costs calculator
=========

This calculator allows users to find the true cost of owning a car. It will normally give them a good estimate of what they really need to spend on car ownership. As car payments and expenses come due throughout the year, it's often difficult to really get a good understanding of total spending on a car. By default, these values are calculated on a monthly basis. 

This calculator is and shall be completely anonymous, as it doesn't request nor permanently store, any name, email, cookies, IP address nor any other personal information.

### Website
https://autocosts.info<br>
To test and play: https://autocosts.info/XX 

The folder that corresponds to the website public HTML folder is `src/`. Nonetheless one must build it using the script `build.sh` creating therefore a `build/` folder ready to be used as a main public HTML folder. For more information run `./build.sh -h`.

### The list of available countries
https://autocustos.info/list

The translations are in corresponding php files, namely in the folder `src/countries/`.<br>
The list of available countries is from the file `src/countries/list.php`

### The registered associated domains
https://autocosts.info/domains

## Available services
The available services are defined in the global `SWITCH` JS object in the file `Globals.js`

## Android APP<br>
https://play.google.com/store/apps/details?id=info.autocosts

## Projects used

* <a href="http://www.chartjs.org/">chartjs.org</a> for the Android APP charts
* <a href="https://developer.uber.com/">UBER API</a> for transports costs comparisons
* <a href="http://pdfmake.org/#/">pdfmake</a> to export the final report to a pdf file. See folder `src/js/pdf`
* <a href="https://github.com/matthiasmullie/minify">matthiasmullie/minify</a> to minify php generated code on client demand
* <a href="https://github.com/matthiasmullie/path-converter">matthiasmullie/path-converter</a>
* <a href="https://nodejs.org/en/">nodejs</a> for server side DB statistical analysys
* <a href="https://www.imagemagick.org/script/index.php">ImageMagick</a> to compress images (see script `compressImages.sh`)
* <a href="http://jshint.com/install/">JShint</a> to detect if Javascript code has errors
* <a href="https://www.npmjs.com/package/minifyjs">minifyjs</a> to minify deployed Javascript code
* <a href="https://www.npmjs.com/package/html-minifier">html-minifier</a> to minify deployed static HTML
* <a href="https://www.npmjs.com/package/minifier">minifier</a> to minify CSS files
* <a href="http://phantomjs.org/">phantomjs</a> to rasterize HTML tables (costs tables) into JPG images, to be sharable with a link


APP<br>
* it uses <a href="https://cordova.apache.org/">Apache Cordova</a> to convert JavaScript built code into APP built files (for example APK files in Android)

## Contributions
* Use four spaces for indentations
* Always comment the code in English
* Respect the folders structure

## License<br>
GNU GPLv3<br>
http://www.gnu.org/licenses/gpl-3.0.en.html <br>
http://choosealicense.com/licenses/gpl-3.0/
