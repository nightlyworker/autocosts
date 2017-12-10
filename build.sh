#!/bin/bash
set -e

if [ $# -eq 0 ]
then
        printf "Missing options!\n"
        printf "(run $0 -h for help) \n\n"        
        exit 0
fi

#string with available options
optstring='hcetim'

#if the -copy option is available execute it first
while getopts "$optstring" OPTION; 
do
        case $OPTION in
                
                c)                
                        #make clean copy from src/ to build/ 
                        cd build/
                        printf "\n## Making a clean copy from src/ to build/ \n\n"
                        rm -R -f *
                        cd ../
                        cp -R src/* build/ 
                        ;;
                        
                h)
                        printf "Usage: \n"
                        printf "$0 -h \n"
                        printf "$0 -etc \n"
                        printf "$0 -c -m \n"
                        printf "$0 -cetim \n"
                        printf "\n"
                        printf "   -c     makes [c]lean copy from src/ to build/ (need to be done on the 1st time) \n"
                        printf "   -e     check for JS syntax [e]rrors (with npm jshint) \n"
                        printf "   -t     generate html and jpeg stats [t]ables (connection to DB) \n"
                        printf "   -i     compress [i]mages, jpg and png files (with ImageMagick) \n"                        
                        printf "   -m     [m]inify js, json, css and html files (with npm minifier, html-minifier and json-minify) \n"                        
                        printf "   -h     help (this output) \n\n"
                        exit 0
                        ;;                          
        esac
done

OPTIND=1

#if the -tables option is available execute it before minification so that html generated tables are minified
while getopts "$optstring" OPTION; 
do
        case $OPTION in
                
                t)
                        #generating statistical tables
                        cd stats/
                        printf "\n## Generating statistical tables \n"
                        
                        printf "\n    Extracts stat info from prod and create html tables \n\n"
                        php -f generate_tables.php prod

                        printf "\n    Renders html tables into jpge files \n\n"
                        phantomjs raster_tables.js
                        
                        cd ../
                        ;;                                             

        esac
done

OPTIND=1

while getopts "$optstring" OPTION; 
do
        case $OPTION in

                e)                
                        #checks for JS errors
                        cd scripts/
                        
                        printf "\n## Checking for JS errors in src/ \n\n"                        
                        ./jshint.sh
                        
                        cd ../
                        ;;

                m)
                        #minification of js files
                        cd build/
                        printf "\n## Minifying files \n"
                        
                        printf "\n    Minifying JS files in build/ \n\n"
                        find js/ -type f \
                            -name *.js ! -name "*.min.*" ! -name "vfs_fonts*" \
                            -exec echo {} \; \
                            -exec minify -o {}.min {} \; \
                            -exec rm {} \; \
                            -exec mv {}.min {} \;

                        #minification of CSS files
                        printf "\n    Minifying CSS files in build/ \n\n"
                        find css/ -type f \
                            -name *.css ! -name "*.min.*" \
                            -exec echo {} \; \
                            -exec minify -o {}.min {} \; \
                            -exec rm {} \; \
                            -exec mv {}.min {} \;

                        #minification of html files
                        printf "\n    Minifying HTML files in build/ \n\n"
                        find . -name "*.html" \
                            -type f \
                            -exec echo {} \;  \
                            -exec html-minifier --collapse-whitespace --remove-comments --remove-optional-tags -o {}.min {} \; \
                            -exec rm {} \; \
                            -exec mv {}.min {} \;

                        #minification of json files
                        printf "\n    Minifying JSON files in build/ \n\n"
                        cd countries/
                        for i in *.json; do
                            [ -f "$i" ] || break
                            printf $i" ";
                            json-minify $i > $i.min;
                            rm $i;
                            mv $i.min $i;
                        done
                        cd ../
                        printf "\n"
                        
                        cd ../
                        ;;
                        
                i)
                        #compress images
                        cd build/                        
                        printf "\n## Compress images, jpg and png files \n\n"                            
                        
                        for f in $(find . -type f -name '*.jpg')
                        do 
                            printf "Compressing $f \n"
                            convert $f -sampling-factor 4:2:0 -strip -quality 85 -interlace Plane -colorspace RGB $f.min
                            rm $f
                            mv $f.min $f 
                        done

                        for f in $(find . -type f -name '*.png')
                        do
                            printf "Compressing $f \n"
                            convert $f -strip $f.min
                            rm $f
                            mv $f.min $f
                        done                        
                        
                        cd ../
                        ;;
        esac
done

printf "\nProcessed without errors \n\n"
