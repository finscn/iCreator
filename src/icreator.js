/***********************
    Default Config.
        output-file-name : size
************************/

var Config = {
    icon: {
        "Icon.png": 57,
        "Icon@2x.png": 114,
        "Icon-60.png": 60,
        "Icon-60@2x.png": 120,
        "Icon-72.png": 72,
        "Icon-72@2x.png": 144,
        "Icon-76.png": 76,
        "Icon-76@2x.png": 152,
        "Icon-Spotlight-iOS7.png": 40,
        "Icon-Spotlight-iOS7@2x.png": 80,
        "Icon-Spotlight.png": 50,
        "Icon-Spotlight@2x.png": 100,
        "Icon-Small.png": 29,
        "Icon-Small@2x.png": 58,
    },
    launch: {
        "Default.png": [320, 480],
        "Default@2x.png": [640, 960],
        "Default-568h@2x.png": [640, 1136],
        "Default-Portrait~ipad.png": [768, 1024],
        "Default-Portrait@2x~ipad.png": [1536, 2048],
        "Default-Landscape@2x~ipad.png": [2048, 1536],
        "Default-Landscape~ipad.png": [1024, 768],
    },
    minSize: 500, // if launch's long-side < minSize , resize logo to 200%
    maxSize: 1500, // if launch's long-side > maxSize , resize logo to 200%
};


/*****************
    Core code.
******************/

var fs = require('fs');
var cp = require('child_process');
var Path = require('path');

var cwd = process.env.PWD || process.cwd();


var iconImg = null,
    logoImg = null,
    bgColor = "rgba(0,0,0,1)";
var landscape = false,
    portrait = true;
var outputDir = Path.normalize(cwd + "/output/");

var iconP = "-icon:",
    logoP = "-logo:",
    colorP = "-color:",
    outputP = "-output:",
    landP = "-l";


function parseArgv() {
    var args = process.argv.slice(2);
    args.forEach(function(arg) {
        if (arg.indexOf(iconP) == 0) {
            iconImg = arg.substring(iconP.length);
        } else if (arg.indexOf(logoP) == 0) {
            logoImg = arg.substring(logoP.length);
        } else if (arg.indexOf(colorP) == 0) {
            bgColor = arg.substring(colorP.length);
        } else if (arg.indexOf(outputP) == 0) {
            outputDir = arg.substring(outputP.length);
        } else if (arg == landP) {
            landscape = true;
        }
    });

    console.log(iconImg,
        logoImg,
        bgColor,
        landscape,
        outputDir);
}

if (!module.parent) {
    parseArgv();
    console.log("\n");
    if (iconImg && logoImg) {
        generateIcon(iconImg, function() {
            console.log("=== icon over ===\n");
            generateLaunch(logoImg, function() {
                console.log("=== launch over ===\n");
            })
        })
    } else if (iconImg) {
        generateIcon(iconImg, function() {
            console.log("=== icon over ===\n");
        })
    } else if (logoImg) {
        generateLaunch(logoImg, function() {
            console.log("=== launch over ===\n");
        })
    }
}

function generateIcon(iconImg, cb) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    var iconCfg = Config.icon;
    var names = Object.keys(iconCfg);
    var len = names.length;
    var idx = -1;
    var $next = function() {
        idx++;
        if (idx >= len) {
            cb && cb();
            return;
        }
        var img = names[idx];
        var size = iconCfg[img];
        var w, h;
        if (Array.isArray(size)) {
            w = size[0];
            h = size[1];
        } else {
            w = h = size;
        }
        resizeImage(iconImg, w, h, Path.normalize(outputDir + "/" + img), function() {
            console.log(" Icon: " + w + "*" + h + "  " + img + " ");
            $next();
        })
    };

    $next();
}

function generateLaunch(logoImg, cb) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    var launchCfg = Config.launch;
    var names = Object.keys(launchCfg);
    var len = names.length;
    var idx = -1;
    var $next = function() {
        idx++;
        if (idx >= len) {
            cb && cb();
            return;
        }
        var img = names[idx];
        var size = launchCfg[img];
        var w = size[0],
            h = size[1];
        var longSide = Math.max(w, h);
        var scale = longSide > Config.maxSize ? 2 : (longSide < Config.minSize ? 0.5 : 1);
        var iw = imgW * scale,
            ih = imgH * scale;

        var ix = (w - iw) / 2,
            iy = (h - ih) / 2;
        var r = 0;
        if (landscape) {
            if (w < h) {
                r = 90;
                ix = (h - iw) / 2;
                iy = (w - ih) / 2;
            }
        } else {
            if (w > h) {
                r = -90;
                ix = (h - iw) / 2;
                iy = (w - ih) / 2;
            }
        }
        createImage(w, h, bgColor, logoImg, ix, iy, iw, ih, r, Path.normalize(outputDir + "/" + img), function() {
            console.log(" Launch: " + w + "*" + h + "  " + img + " ");
            $next();
        })
    }
    var imgW, imgH;
    readImageSize(logoImg, function(w, h) {
        imgW = w;
        imgH = h;
        $next();
    });
}

function resizeImage(img, w, h, outImg, cb) {
    cp.exec('convert ' + img + ' -resize ' + w + 'x' + h + '! ' + outImg, function(err, stdout, stderr) {
        if (stderr) {
            console.log(stderr)
        }
        cb && cb();
    });
}

function createImage(w, h, bg, img, ix, iy, iw, ih, r, outImg, cb) {
    var draw = 'image SrcOver ' + ix + ',' + iy + ' ' + iw + ',' + ih + ' ' + img + '';
    var cmd = 'convert -size ' + w + 'x' + h + ' xc:"' + bg + '" -rotate ' + (-r) + ' -draw "' + draw + '" -rotate ' + (r) + ' ' + outImg;
    // console.log(cmd);
    cp.exec(cmd, function(err, stdout, stderr) {
        if (stderr) {
            console.log(stderr)
        }
        cb && cb();
    });
}

function readImageSize(img, cb) {
    cp.exec('identify -format "%[w],%[h]\n" ' + img, function(err, stdout, stderr) {
        if (stderr) {
            console.log(stderr)
        }
        var w, h;
        if (stdout) {
            var rs = stdout.trim().split(",");
            if (rs.length == 2) {
                w = parseInt(rs[0]);
                h = parseInt(rs[1]);
            }
        }
        cb && cb(w, h);
    });
}

exports.generateIcon = generateIcon;
exports.generateLaunch = generateLaunch;

