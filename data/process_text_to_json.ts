import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rootDir = process.cwd();
const inputFile = path.join(rootDir, '/data/cleaned_artikel.txt');
const outputFile = path.join(rootDir, '/data/artikel.json');

export type Wort = {
    artikel: string;
    wort: string;
    plural: string;
    pluralRule: string;
    kapitelNumber: number;
    kapitelName: string;
}

const markForSingular = "(Sg.)"

const makePlural = (wort: string, pluralRule: string):string => {
    if(pluralRule === '-'){
        return 'die '+wort
    } else {
        const splittedRule = pluralRule.split('-');
        const addToEndOfWort = splittedRule[splittedRule.length - 1];
        const isChangedToUmlaut = pluralRule.includes('"');
        if(!isChangedToUmlaut){
            return 'die '+wort+addToEndOfWort;
        } else if(isChangedToUmlaut){
            // change the first occuring a, u, or o in the wort to ä, ü, or ö  then add the end of word
            const umlautMap:{ [key: string]: string; } = {
                'a': 'ä',
                'u': 'ü',
                'o': 'ö'
            }
            const wortArray = wort.split('');
            const indexOfFirstVowel = wortArray.findLastIndex((letter) => {
                return ['a', 'u', 'o'].includes(letter);
            })
            const firstVowel = wortArray[indexOfFirstVowel];
            const umlaut = umlautMap[firstVowel];
            wortArray[indexOfFirstVowel] = umlaut;
            const newWort = wortArray.join('');
            return 'die '+newWort+addToEndOfWort;
        }

        return wort;
    }
    
}

const processFile = async () => {
    const inputStream = fs.createReadStream(inputFile);
    const outputStream = fs.createWriteStream(outputFile);
    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });
    const allOfWort: Wort[] = [];
    let currentKapitelNumber = "";
    let currentKapitelName = "";
    for await (const line of rl) {
        const isKapitel = line.startsWith('Kapitel');
        if (isKapitel) {
            currentKapitelName = line;
            const kapitelNumber = line.replace('Kapitel ','').split(":")[0]
            currentKapitelNumber = kapitelNumber;
        } else {
            const isValidLine = line.includes(', ');
            const isValidSingular = line.includes(markForSingular);
            if (isValidLine) {
                const [wortInfo, pluralRule] = line.split(', ');
                const cleanedPluralWord = pluralRule.split(' ')[0];
                const [artikel, wort] = wortInfo.split(' '); 
                const pluralWort = makePlural(wort, cleanedPluralWord);
                const wortObj:Wort = {
                    artikel,
                    wort,
                    plural: pluralWort,
                    pluralRule: cleanedPluralWord,
                    kapitelName: currentKapitelName,
                    kapitelNumber: +currentKapitelNumber
                }
                allOfWort.push(wortObj);
            }

            if(isValidSingular){
                const wortInfo = line.replace(' '+markForSingular, '');
                const [artikel, wort] = wortInfo.split(' ');
                const wortObj:Wort = {
                    artikel,
                    wort,
                    plural: artikel + ' ' + wort,
                    pluralRule: markForSingular,
                    kapitelName: currentKapitelName,
                    kapitelNumber: +currentKapitelNumber
                }
                allOfWort.push(wortObj);
            }
        }
    }

    outputStream.write(JSON.stringify(allOfWort,null, 2));
    
    outputStream.close();
  };

  processFile();