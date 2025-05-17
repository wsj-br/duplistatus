#!/bin/bash
#
#  Convert the logo to png and multi-resolution favicon.ico 
#
#
BASEDIR=$(dirname "$0") 
DOCS=$BASEDIR/../docs
IMAGES=$BASEDIR/../public/images
APP=$BASEDIR/../src/app

# convert the banner (svg) to a png (transparent background)
convert -background none -resize 25% $DOCS/duplidash_banner.svg $DOCS/duplidash_banner.png 

# convert the logo (svg) to a png (transparent background)
convert -background none  $DOCS/duplidash_logo.svg $IMAGES/duplidash_logo.png 

# convert the logo (png) to an ico
convert $IMAGES/duplidash_logo.png -define icon:auto-resize=16,24,32,48,64,96,128  $APP/favicon.ico 


