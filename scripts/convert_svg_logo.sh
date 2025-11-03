#!/bin/bash
#
#  Convert the logo to png and multi-resolution favicon.ico 
#
#
BASEDIR=$(dirname "$0") 
DOCS_IMG=$BASEDIR/../website/static/img
IMAGES=$BASEDIR/../public/images
APP=$BASEDIR/../src/app

# convert the banner (svg) to a png (transparent background)
echo "Converting banner to png"
convert -background none -resize 25% $DOCS_IMG/duplistatus_banner.svg $DOCS_IMG/duplistatus_banner.png 

# convert the logo (svg) to a png (transparent background)
echo "Converting logo to png"
convert -background none  $DOCS_IMG/duplistatus_logo.svg $IMAGES/duplistatus_logo.png 

# convert the logo (png) to an ico
echo "Converting logo to ico"
convert $IMAGES/duplistatus_logo.png -define icon:auto-resize=16,24,32,48,64,96,128  $APP/favicon.ico 

echo "all done"
