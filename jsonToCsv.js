const fs = require('fs');
const path = require('path');

const jsonsDir = path.join(__dirname, 'jsons');
const csvDir = path.join(__dirname, 'csv');

function jsonToCSV(json) {
  const csvRows = [];

  const headers = Array.from(
    json.reduce((acc, cur) => {
      Object.keys(cur).forEach((key) => acc.add(key));
      return acc;
    }, new Set())
  );

  csvRows.push(headers.join(','));

  for (const row of json) {
    const values = headers.map((header) => {
      if (row[header] === undefined) {
        return '""';
      } else if (Array.isArray(row[header])) {
        const phones = row[header].length ? row[header].join('; ') : '';
        return `"${phones}"`;
      } else {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

fs.readdir(jsonsDir, (err, files) => {
  if (err) {
    console.error('Erro ao listar arquivos do diretório:', err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === '.json') {
      const jsonFilePath = path.join(jsonsDir, file);
      const csvFilePath = path.join(
        csvDir,
        path.basename(file, '.json') + '.csv'
      );

      fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Erro ao ler o arquivo:', err);
          return;
        }

        const jsonData = JSON.parse(data);
        const csvData = jsonToCSV(jsonData);

        fs.writeFile(csvFilePath, csvData, (err) => {
          if (err) {
            console.error('Erro ao salvar o arquivo CSV:', err);
          } else {
            console.log('Arquivo CSV salvo com sucesso:', csvFilePath);
          }
        });
      });
    }
  });
});
