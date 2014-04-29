iCreator
========

A command-line tool for creating all icons and launch-screen images of iOS App.



------------------

### Getting started

First, download and install [ImageMagick](http://www.imagemagick.org/). 

In Mac OS X, you can simply use Homebrew and do:
```
brew install imagemagick
```



Second, install [Node.js](http://nodejs.org).
```
brew install node
```


Then make sure A Icon Image (for creating icons) and A logo Image(for launch-screen) are prepared.

**Notice:**  A launch-screen image == your logo over a solid-colored background.



### Examples

* generate all icons

```
node icreator.js  -icon:YourBigIcon.png
```

* generate all launch-screen images.  ```-color:backgorund-color``` 

```
node icreator.js  -logo:YourLogo.png -color:#ffffff
```

*  ```-l``` means the App is running in Landscape

```
node icreator.js -logo:logo.png -color:#ffffff -l
```

* ```-output:xxxx``` is output dir (relative to cwd)

```
node icreator.js  -icon:icon.png   -output:../icons
```


### About the size of logo image

iCreator will draw your logo image on a solid-colored launch-screen image ( center alignment ).

The output image's size is between 320x480 to 1536x2048.

If screen-image's long side < 500 , iCreator will resize logo image to 50%.

If screen-image's long side > 1500 , iCreator will resize logo image to 200%.

So, it's recommended that let the size of your logo image be between 300x300 to 500x500.







