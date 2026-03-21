const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function processCSV() {
  const filePath = path.join(__dirname, '../public/medicine.csv');
  const outPath = path.join(__dirname, '../public/medicines.json');
  console.log('Reading from', filePath);
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const names = new Set();
  let first = true;

  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }
    // id,name,price...
    // The name is the second column. Sometimes it might contain a comma if it's quoted, 
    // but a quick glance at the data suggests no quotes for names, or only standard quoting.
    // Let's split by comma. If the first column matches an ID, second is the name.
    // We can use a regex to handle CSV correctly or just basic split if names aren't quoted.
    
    // basic CSV split considering quotes:
    // This regex splits on comma, but not commas inside quotes.
    const columns = [];
    let cur = '';
    let inQuote = false;
    for (let c of line) {
        if (c === '"') {
            inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
            columns.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    columns.push(cur);
    
    if (columns.length > 1) {
      const name = columns[1].trim() || '';
      if (name) {
        names.add(name);
      }
    }
  }

  const output = Array.from(names);
  console.log(`Extracted ${output.length} unique medicine names.`);
  fs.writeFileSync(outPath, JSON.stringify(output));
  console.log('Saved to', outPath);
}

processCSV().catch(console.error);
