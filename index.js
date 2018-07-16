#!/usr/bin/env node

const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const csvListDir = "JSON"; // Directory where the csvs to process live.
const splitPdfDir = "JSON/split_pdfs"; // Directory where the pdfs to rename live.
const renamedPdfDir = "JSON/renamed_pdfs"; // Directory where the renamed pdfs live.

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

// Create the directory for renamed pdfs.
if (!fs.existsSync(renamedPdfDir)) {
    fs.mkdirSync(renamedPdfDir); 
    console.log(`Created directory '${renamedPdfDir}'.`);
} else {
    console.log(`Directory '${renamedPdfDir}' already exists.`);
}

csvList.forEach(file => {
    var dirPath = `${csvListDir}/${file.substring(0, file.length - 4)}_json`; // Construct the directory name.
    
    // Create the directory for json data.
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
        // Get the values from the csv row.
        var sequenceNumber = x["SEQ"];
        var fileNumber = x["FILE_NBR"];
        var compasLicId = x["COMPAS_LIC_ID"];
        var docType = x["DOCTYPE"];
        var proCode = x["PROCODE"];

        if (fileNumber !== "" && fileNumber !== undefined) { // Skip if no file number provided.

            var jsonFilePath = `${dirPath}/${fileNumber}`; // Construct the file name.

            // Check for duplicate file.
            if (fs.existsSync(jsonFilePath+".json")) {
                var appendFileCount = 1;
                while (fs.existsSync(`${jsonFilePath}_${appendFileCount}.json`)) {
                    appendFileCount++;
                }
                jsonFilePath = `${jsonFilePath}_${appendFileCount}`;
            }

            jsonFilePath = jsonFilePath + ".json";

            // Construct the object graph for the correct output format.
            var infoArr = [];
            infoArr.push(new InfoObj("doctype", docType));
            infoArr.push(new InfoObj("file_nbr", fileNumber));
            infoArr.push(new InfoObj("procode", proCode));
            var obj = { "info": [infoArr] };
            
            fs.writeFileSync(jsonFilePath, JSON.stringify(obj)); // Write the file.

            var pdfPath = `${splitPdfDir}/${sequenceNumber}.pdf`;
            if (fs.existsSync(pdfPath)) {
                //fs.renameSync(pdfPath, `${renamedPdfDir}/${fileNumber}.pdf`); // Rename the corresponding pdf.

                // Check for duplicates
                var renamedPdfFilePath = `${renamedPdfDir}/${fileNumber}`; 
                if (fs.existsSync(renamedPdfFilePath+".pdf")) {
                    var appendFileCount = 1;
                    while (fs.existsSync(`${renamedPdfFilePath}_${appendFileCount}.pdf`)) {
                        appendFileCount++;
                    }
                    renamedPdfFilePath = `${renamedPdfFilePath}_${appendFileCount}`;
                }
    
                renamedPdfFilePath = renamedPdfFilePath + ".pdf";

                fs.copyFileSync(pdfPath, renamedPdfFilePath);

            } else {
                console.log(`${pdfPath} doesn't exist!`);
            }
            
            count++;
        }
    });
    console.log(`${count} records processed.`);
});
