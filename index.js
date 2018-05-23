const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const csvListDir = "list"; // Directory where the csvs to process live.
const splitPdfDir = "split_pdfs"; // Directory where the pdfs to rename live.


class InfoObj {
    constructor(name, value) {
        this.name = name;
        this.value = value || "";
    }
}

if (!fs.existsSync(csvListDir)) {
    console.log(`Can't find directory '${csvListDir}'. Are you in the right directory?`);
    return;
}

console.log("Starting DOH MQA csv process job...")

var csvList = [];

// Add csv files in specified directory to a list for processing.
fs.readdirSync(csvListDir).forEach(file => {
    if (file.endsWith(".csv")) {
        csvList.push(file); 
    }
});
console.log(`${csvList.length} csv file(s) found.`)

csvList.forEach(file => {
    var dirPath = `${csvListDir}/${file.substring(0, file.length - 4)}_json`; // Construct the directory name.
    
    // Create the directory.
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath); 
        console.log(`Created directory '${dirPath}'.`);
    } else {
        console.log(`Directory '${dirPath}' already exists.`);
    }

    var rawRecordsFromCsv = fs.readFileSync(`${csvListDir}/${file}`, 'utf-8'); // Read the csv.
    var recordsFromCsv = parse(rawRecordsFromCsv, {"columns": true}); // Parse the csv.

    var count = 0;
    recordsFromCsv.forEach(x => {
        var fileNumber = x["FILE_NBR"];
        var compasLicId = x["COMPAS_LIC_ID"];
        var docType = x["DOCTYPE"];
        var proCode = x["PROCODE"];

        if (fileNumber !== "" && fileNumber !== undefined) {
            var jsonFilePath = `${dirPath}/${fileNumber}.json`;
        
            var infoArr = [];
            infoArr.push(new InfoObj("compas_lic_id", compasLicId));
            infoArr.push(new InfoObj("doctype", docType));
            infoArr.push(new InfoObj("file_nbr", fileNumber));
            infoArr.push(new InfoObj("procode", proCode));
            
            
            var obj = { "info": [infoArr] };
            
            fs.writeFileSync(jsonFilePath, JSON.stringify(obj));
            count++;
        }
    });
    console.log(`${count} json files created.`);
});