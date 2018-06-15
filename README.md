# DOHMQA App

1. Generate json formatted data files for each record in the csv.
2. Rename pdfs to the corresponding file_nbr in the csv.

## Installation

1. Make sure [Node.js](https://nodejs.org/en/) is installed on the target machine.
2. Open your terminal or command prompt to this repository's directory and run the command `npm install -g git+https://github.com/russ4stall/dohmqa.git`.


## Execution 

Open your terminal or command prompt to the directory you want to execute the script in and run the command `dohmqa`.

In order for this to run correctly, the following must be true:
1. The csv files to process must be in a directory named 'list'
2. The pdfs to rename must be in a directory named 'split_pdfs'
3. These column headers in the csv exist and are named as such : 'seq', 'FILE_NBR', 'COMPAS_LIC_ID', 'DOCTYPE', 'PROCODE'
