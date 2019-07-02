import Text from "../models/text.model"
import fs from 'fs'

const upload = (req, res) => {
    //get file info
    const fullfilename = req.body.filename.replace('/', '\\');
    const filename = fullfilename.substr(fullfilename.lastIndexOf('\\') + 1)
    const newPath = "./client/upload/" + filename;
    const stats = fs.statSync(fullfilename);
    const fileSizeInBytes = stats.size;
    //Upload File
    fs.readFile(fullfilename, 'utf8', function (err, data) {
        //Get number of trigrams in string to store in DB
        const trigramCount = findTrigrams(data).length;
        //Transfer file to public folder
        fs.writeFile(newPath, data, function (err) {
            //Insert DB MOdel
            const model = new Text({
                fileName: filename,
                data: data,
                size: fileSizeInBytes,
                path: newPath,
                trigramCount: trigramCount
            })
            model.save();
            //return generated ID
            res.send(model._id);
        })
    })
}

const getTexts = (req, res) => {
    Text.find({}, function (err, textFiles) {
        res.send(textFiles);
    })
}

const getTextInfo = (req, res) => {
    Text.findOne({
        _id: req.params.id
    }, function (err, textFile) {
        res.send(textFile);
    })
}

const generateTrigramText = (req, res) => {
    Text.findOne({
        _id: req.params.id
    }, function (err, textFile) {
        const trigrams = findTrigrams(textFile.data)
        var output = req.query.seedWords;
        /*
            Generate words until we run out of possibilities
            or we reach the maxSize amount of words
        */
        for (var i = 0; i < req.query.maxSize; i++) {
            const nextWord = generateNextWord(output, trigrams)
            if (nextWord)
                output += " " + nextWord;
            else break
        }
        console.log(output);
        res.send(output);
    })
}

//Private Functions
//Used to generate the next word in a string given trigram possibilities
const generateNextWord = (str, trigrams) => {
    const words = str.split(" ").slice(-2, str.length - 1);
    //remove whitespace
    const firstWord = words[0] ? words[0].replace(/\s/g, "") : undefined;
    const secondWord = words[1] ? words[1].replace(/\s/g, "") : undefined
    const key = firstWord + " " + secondWord;

    if(firstWord && secondWord){
        const item = trigrams.find(function (item) {
            return item.key.toLowerCase() == key.toLowerCase()
        });
        if (item && item.nextWords.length != 0) {
            //Choose a random word out of the possible words
            var randomIndex = Math.floor(Math.random() * item.nextWords.length)
            return item.nextWords[randomIndex]
        }
    }
}

//Used to find trigram possibilites
const findTrigrams = (str) => {
    var words = str.split(" ");
    var keys = []
    for (var i = 0; i < words.length - 2; i++) {
        var key = words[i].replace(/\s/g, "") + " " + words[i + 1].replace(/\s/g, "")
        var nextWord = words[i + 2]
        var item = keys.find(function (item) {
            return item.key == key
        });
        if (item == undefined) {
            keys.push({
                key: key,
                nextWords: [nextWord]
            })
        } else
            item.nextWords.push(nextWord)
    }
    return keys
}

export default {
    upload,
    getTexts,
    getTextInfo,
    generateTrigramText
}