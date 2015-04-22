
String.prototype.repeat = function(times) {
    return (new Array(times + 1).join(this));
}
String.prototype.includes = function (str) {
    return this.indexOf(str) > -1;
}

Array.prototype.repeat = function(times) {
    if (times === 0) {
        return [];
    }
    else {
        return this.concat(this.repeat(times - 1));
    }
}

Number.prototype.mod = function(n) {
return ((this%n)+n)%n;
}

var intervals = { // these numbers are in terms of whole steps
    'P1': 0,
    'm2': 1,
    'M2': 2,
    'm3': 3,
    'M3': 4,
    'P4': 5,
    'P5': 7,
    'm6': 8,
    'M6': 9,
    'm7': 10,
    'M7': 11,
    'P8': 12,

    'd2': 0,
    'A1': 1,
    'd3': 2,
    'A2': 3,
    'd4': 4,
    'A3': 5,
    'd5': 6,
    'A4': 6,
    'd6': 7,
    'A5': 8,
    'd7': 9,
    'A6': 10,
    'd8': 11,
    'A7': 12
}

var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
var fullLetters = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

var chords = {
    'M': ['P1', 'M3', 'P5'],
    'm': ['P1', 'm3', 'P5'],
    'aug': ['P1', 'M3', 'A5'],
    'dim': ['P1', 'm3', 'd5']
}

chords['7'] = chords['M'].concat(['m7']);
chords['m7'] = chords['m'].concat(['m7']);
chords['M7'] = chords['M'].concat(['M7']);
chords['aug7'] = chords['aug'].concat(['A7']);
chords['dim7'] = chords['dim'].concat(['d7']);
chords['m7dim5'] = chords['dim'].concat(['m7']);


var instruments = {
    'ukulele': {
        strings: ['C', 'E', 'G', 'A'],
        order: [2, 0, 1, 3],
        frets: 12
    },
    'guitar': {
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        order: [0, 1, 2, 3, 4, 5],
        frets: 23
    }
}

var chordList = generateChords();
var exampleChords = generateChordCharts(instruments.guitar, chordList, 0, 5);


var fullLetters = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

///// Needs refactoring

var fretCount = 5;

var stringWidth = 2;
var fretLength = 80;
var spaceAboveNeck = 200;
var neckHeight = fretCount * fretLength;
var canvasHeight = neckHeight + spaceAboveNeck;

window.onload = function() {
    var counter = 1;
    for (var chord in exampleChords) {
        if (exampleChords[chord] != 'no chord chart available for chord') {
            var canvas = drawChordChart(chord, instruments.guitar);
            document.getElementById('chord-charts').appendChild(canvas);
            counter++;
        }
    }
}

function drawChordChart(chord, instrument) {
    var stringCount = instrument.strings.length;
    var neckWidth = stringCount * 50;
    var canvasStyles = "width=" + neckWidth + " height=" + canvasHeight; 

    var chordNoSpaces = chord.replace(/\ /g, "")
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', chordNoSpaces)    
    canvas.setAttribute('width', neckWidth);    
    canvas.setAttribute('height', canvasHeight);
    var ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = 'grey';//colorTheNote(chord.split(/(\s+)/)[0]);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = "white"
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(chord, neckWidth/2, spaceAboveNeck/4);

    // neck 
    ctx.fillStyle = "lightgrey";
    ctx.fillRect(0, spaceAboveNeck, neckWidth, neckHeight);

    // frets 
    var fretLineWidth = 2;
    for (var i = 0; i < fretCount; i++) {
        var fretY = (i * (fretLength - fretLineWidth/2)) + spaceAboveNeck;
        ctx.beginPath();
        ctx.moveTo(0, fretY);
        ctx.lineTo(neckWidth, fretY);
        ctx.strokeStyle = "grey";
        ctx.stroke();
    } 

    // strings
    ctx.fillStyle = "#000000";
    for (var i = 0; i < stringCount; i++) {
        var fretY = (i * (fretLength - fretLineWidth/2)) + spaceAboveNeck;
        ctx.beginPath();
        ctx.moveTo(stringX(i), spaceAboveNeck);
        ctx.lineTo(stringX(i), canvasHeight);
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    // fingers
    var positions = exampleChords[chord];
    var fontSize = 20;
    ctx.font = fontSize + "px sans-serif";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    var counter = 0;
    for (var i = 0; i < positions.length; i++ ) {
        // circle
        var xLength = 20;
        if (positions[i] === 'x') {
            ctx.beginPath();
            ctx.moveTo(stringX(i) + xLength/2, spaceAboveNeck -(xLength * 2));
            ctx.lineTo(stringX(i) - xLength/2, spaceAboveNeck - xLength);
            ctx.moveTo(stringX(i) + xLength/2, spaceAboveNeck - xLength);
            ctx.lineTo(stringX(i) - xLength/2, spaceAboveNeck - (xLength * 2));

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            var circleY = ((fretLength * positions[i].fret) - fretLength/2) + spaceAboveNeck
            ctx.beginPath();
            ctx.arc(stringX(i), circleY, fretLength/4, 0, 2 * Math.PI, false);
            chordQuality = chord.split(/(\s+)/)[2];
            ctx.fillStyle = colorTheNote(counter);//intervals[chords[chordQuality][counter]]
            ctx.fill();
            var intervalQuality = chords[chordQuality][counter][0];
            ctx.strokeStyle = colorTheNote(counter, true);//intervalQuality === 'P' ? colorTheNote(counter) : colorTheQuality(intervalQuality);
            ctx.lineWidth = 3;
            ctx.stroke();


            // note name
            ctx.fillStyle = "white"
            ctx.fillText(positions[i].letter, stringX(i), circleY);

            counter++;
        }
    }

    return canvas;
}

function stringX(stringNum) {
    return stringNum * (50 - stringWidth/2) + 25;
}

// from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function colorLuminance(hex, lum) {

  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#", c, i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i*2,2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00"+c).substr(c.length);
  }

  return rgb;
}

function colorTheNote(position, isStroke) {
    var colors = [
      [2, 62, 76], // "C14D49", 
      // [14, 66, 81], // "CE6646", 
      // [23, 72, 87], // "DD7B3E", 
      // [45, 66, 90], // "E5BF4E", 
      [104, 56, 75], // "70BF54", 
      // [152, 64, 75], // "44BF86", 
      [184, 65, 75], // "42B6BF", 
      // [204, 66, 75], // "418CBF",   
      // [228, 59, 75], // "4E64BF", 
      // [260, 60, 86], // "8357DB", 
      [283, 61, 75], // "9E4ABF", 
      // [322, 51, 66], // "A85288"  
      // [2, 62, 76] // "C14D49"
    ];
    var hsb = colors[position];
    var hue = hsb[0];
    var lightness = (hsb[2]/100 * (2 - hsb[1]/100)) / 2 * (isStroke ? .70 : 1);
    var saturation = ((hsb[2]/100 * hsb[1]/100) / (1 - Math.abs(2 * lightness - 1)));
    return 'hsl(' + hue + ', ' + 100 * saturation + '%, ' + 100 * lightness + '%)';
}

function colorTheQuality(quality) {
var colors = {
      'm': '#ECC56D',
      'M': '#D1AF61',
      'A': '#856F3D',
      'd': '#6B5931'
    };
    return colors[quality];
}
/// From generate_chords




// these two functions are from https://github.com/sindresorhus/object-assign/blob/master/index.js
function ToObject(val) {
    if (val == null) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }

    return Object(val);
}

function assign (target, source) {
    var from;
    var keys;
    var to = ToObject(target);

    for (var s = 1; s < arguments.length; s++) {
        from = arguments[s];
        keys = Object.keys(Object(from));

        for (var i = 0; i < keys.length; i++) {
            to[keys[i]] = from[keys[i]];
        }
    }

    return to;
};


function addAccidental(distanceFromLetter) {
    return (distanceFromLetter > 0) ? '#'.repeat(distanceFromLetter) : 'b'.repeat(-distanceFromLetter);
}

function intervalClass(a, b) {
    return Math.min(a - b, 12 - (a - b));
}

function createChord(chordLetter, chordAccidental, quality) { // 'F', 'm'
    var notes = [];
    var rootNum;

    if (chordAccidental === 'b') {
        rootNum = (fullLetters.indexOf(chordLetter) - 1) % 12;
    } else if (chordAccidental === '#') {
        rootNum = (fullLetters.indexOf(chordLetter) + 1) % 12;
    } else {
        rootNum = fullLetters.indexOf(chordLetter);
    }

    var chord = chords[quality];

    //notes.push(chordLetter + chordAccidental);

    chord.forEach( function (interval) {
        var num = rootNum + intervals[ interval ];
        var noteLetter = letters[ (letters.indexOf(chordLetter) + parseInt(interval[1]) - 1) % 7 ];
        var note = noteLetter + addAccidental(intervalClass(num, fullLetters.indexOf(noteLetter)));

        notes.push(note);
    });

    return notes;
}

function generateChords () {
    var output = {
        // ex: 'A': ['A', 'C#', 'E']
    }
    letters.forEach(function (letter) {
            ['b', '', '#'].forEach( function (accidental) {
                for (var chordName in chords) {
                    output[letter + accidental + ' ' + chordName] = createChord(letter, accidental, chordName);
                }
            });
    })
    return output;
}


function generateChordCharts(instrument, chords, startFret, endFret) {
    var ret = {};
    for (var chord in chords) {
        ret[chord] = generateChordChart(instrument, chords[chord], startFret, endFret, []);
    }
    return ret;
}

function normalize(note) {
    // ex: note = 'A##'
    var letter = note[0];
    var accidental = note.slice(1);

    if (accidental.includes('b')) {
        return fullLetters[(fullLetters.indexOf(letter) - accidental.length).mod(12)];
    }
    else if (accidental.includes('#')) {
        return fullLetters[(fullLetters.indexOf(letter) + accidental.length).mod(12)];
    }
    else {
        return note;
    }
}


function generateChordChart(instrument, chord, startFret, endFret, acc) {
    var numberOfNotHitStrings = instrument.strings.length - chord.length;
    if (chord.length === 0) {
        var leftOverStrings = instrument.strings.length;
        var notesInFreqOrder = acc.concat(['x'].repeat(leftOverStrings));
        var notesInStringOrder = [];
        for (var i = 0; i < instrument.order.length; i++ ) {
            notesInStringOrder.push(notesInFreqOrder[instrument.order[i]]);            
        }
        return notesInStringOrder;
    }
    else if (numberOfNotHitStrings < 0) {
        return null;
    }

    var noteInterval = intervalClass(fullLetters.indexOf(normalize(chord[0])), fullLetters.indexOf(instrument.strings[0])).mod(12);

    if (noteInterval < (startFret % 12) || noteInterval > (endFret % 12)) { // it cant fit
        if (numberOfNotHitStrings > 0) {
            var restOfInstrument = assign({}, instrument, {strings: instrument.strings.slice(1)});
            return generateChordChart(restOfInstrument, chord, startFret, endFret, acc.concat('x'));
        }
        else {
            return "no chord chart available for chord"; 
        }
    }
    else { // it can fit
        var fingerPositionObj = {
            letter: chord[0], 
            string: instrument.strings[0], 
            fret: intervalClass(fullLetters.indexOf(normalize(chord[0])), fullLetters.indexOf(instrument.strings[0])).mod(12)
        };
        var restOfInstrument = assign({}, instrument, {strings: instrument.strings.slice(1)});
        var restOfChord = chord.slice(1);


        return generateChordChart(restOfInstrument, restOfChord, startFret, endFret, acc.concat(fingerPositionObj));

    }

}
