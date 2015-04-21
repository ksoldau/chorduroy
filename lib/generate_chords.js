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
    'M': ['M3', 'P5'],
    'm': ['m3', 'P5'],
    'aug': ['M3', 'A5'],
    'dim': ['m3', 'd5']
}

chords['7'] = chords['M'].concat(['m7']);
chords['m7'] = chords['m'].concat(['m7']);
chords['M7'] = chords['M'].concat(['M7']);
chords['aug7'] = chords['aug'].concat(['A7']);
chords['dim7'] = chords['aug'].concat(['d7']);
chords['m7dim5'] = chords['dim'].concat(['m7']);


var instruments = {
    'ukulele': {
        strings: ['C', 'E', 'G', 'A'],
        order: [2, 0, 1, 3],
        frets: 20
    },
    'guitar': {
        strings: ['E', 'A', 'D', 'G', 'B', 'E'],
        frets: 23
    }
}

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

    //console.log(chord);
    notes.push(chordLetter + chordAccidental);

    chord.forEach( function (interval) {
        //console.log(interval);
        var num = rootNum + intervals[ interval ];
        //console.log(num);
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

var chordList = generateChords();

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
        return fullLetters[(fullLetters.indexOf(letter) - accidental.length) % 12];
    }
    else if (accidental.includes('#')) {
        return fullLetters[(fullLetters.indexOf(letter) + accidental.length) % 12];
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
            finger: intervalClass(fullLetters.indexOf(normalize(chord[0])), fullLetters.indexOf(instrument.strings[0])).mod(12)
        };
        var restOfInstrument = assign({}, instrument, {strings: instrument.strings.slice(1)});
        var restOfChord = chord.slice(1);


        return generateChordChart(restOfInstrument, restOfChord, startFret, endFret, acc.concat(fingerPositionObj));

    }

}

console.log(generateChordCharts(instruments.ukulele, chordList, 0, 5));

