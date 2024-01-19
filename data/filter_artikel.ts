import * as fs from 'fs';
import * as readline from 'readline';

const inputFile = 'your_input_file.txt';
const outputFile = 'filtered_output_file.txt';

const filterLines = (line: string): boolean => {
  return /^(das|die|der)/.test(line);
};

const processFile = async () => {
  const inputStream = fs.createReadStream(inputFile);
  const outputStream = fs.createWriteStream(outputFile);
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (filterLines(line)) {
      outputStream.write(`${line}\n`);
    }
  }

  outputStream.close();
};

processFile();