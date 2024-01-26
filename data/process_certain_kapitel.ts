import * as fs from 'fs';
import * as path from 'path';
import { Wort } from './process_text_to_json';
const rootDir = process.cwd();
const artikel:Wort[] = require(path.join(rootDir, '/data/artikel.json'));
const outputFile = path.join(rootDir, '/data/kapitel_1_to_3.txt');
const toKapitel3 = artikel.filter(wort => wort.kapitelNumber <= 3);

const onlyDerArtikel = toKapitel3.filter(wort => wort.artikel === 'der');
const onlyDieArtikel = toKapitel3.filter(wort => wort.artikel === 'die');
const onlyDasArtikel = toKapitel3.filter(wort => wort.artikel === 'das');

const processFile = async () => {
    const outputStream = fs.createWriteStream(outputFile);
    
    const sorted = onlyDerArtikel.concat(onlyDieArtikel).concat(onlyDasArtikel);
    for(const wort of sorted){
        // outputStream.write(`${wort.wort} (${wort.pluralRule.replace('(','').replace(')','')}) - (${wort.plural.replace("die ",'')})\n`);
        // outputStream.write(`${wort.wort} (${wort.pluralRule.replace('(','').replace(')','')})\n`);
        outputStream.write(`${wort.plural.replace("die ",'')}\n`);
    }
  
    outputStream.close();
  };

processFile();