import fs from "fs";
import CsvReadableStream from "csv-reader";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { UniqueDialogEntry } from "./types";

/**
 * Processes the CSV at the path provided and uses the processRow function
 * on each row to create the output list from the CSV
 * @param csvPath 
 * @param processRow 
 */
export async function processCSV<T>(csvPath: string, processRow: (row: string[]) => T | null): Promise<T[]> {
    return new Promise(res=>{
        let rows: T[] = [];
        // If failed to guess encoding, default to 1255
        let inputStream = fs
            .createReadStream(csvPath)
            .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' }));
        inputStream
	        .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, skipHeader: true }))
	        .on("data", (row: any) =>  {
                let result = processRow(row);
                if(result) rows.push(result);
            })
            .on("end", () => { res(rows); });
    });
}

export function processUniqueDialogRow(row: string[]): UniqueDialogEntry {
    // We skip if this is already done
    let [
        isDone, infoID,
        speakerID, speakerName,
        race, gender,
        faction, _rank,
        _type, pcRank,
        dialog,
    ] = row;

    // Gender is m or f, but comes in as Male or Female.
    // We skip getting gender for creatures
    let isCreature = row[5] == "";

    // Initial row extracted from CSV.
    // We need to replace text and perform checks before continuing
    let processedRow: UniqueDialogEntry = {
        done: isDone == "" ? false: true,
        needsValidation: isDone == "0" ? true: false,
        id: infoID.substring(3),
        speakerID,
        speakerName,
        race: race.toLowerCase(),
        gender: isCreature ? "":gender.toLowerCase()[0],
        faction,
        pcRank,
        isCreature,
        dialog,
        originalDialog: dialog
    };
    if(!isCreature && (processedRow.gender!== "m" && processedRow.gender!== "f")) throw new Error(`Unexpected gender: ${gender}`)

    processedRow = fillRowTemplate(processedRow);
    processedRow = replaceDialogWithPronunciation(processedRow);
    processedRow = removeActionText(processedRow);
    return processedRow;
}

/**
 * Fills the parameters in the dialog with values from the row
 */
function fillRowTemplate(row: UniqueDialogEntry) {
    row.dialog = row.dialog.replace(new RegExp("%Name", "ig"), row.speakerName);
    row.dialog = row.dialog.replace(new RegExp("%PCRank", "ig"), row.pcRank);
    row.dialog = row.dialog.replace(new RegExp("%Faction", "ig"), row.faction);
    return row;
}

/**
 * Some words don't sound right, so this will replace
 * them with words and sylables that the ai can pronounce
 */
function replaceDialogWithPronunciation(row: UniqueDialogEntry) {
    row.dialog = row.dialog.replace(new RegExp("nerevareen", "ig"), "ner-evv-er-ein");
    row.dialog = row.dialog.replace(new RegExp("Vivec", "ig"), "Vihveck");
    row.dialog = row.dialog.replace(new RegExp("Hla Oad", "ig"), "Hlah Ohad");
    return row;   
}

/**
 * Removes any text between square brackets
 */
function removeActionText(row: UniqueDialogEntry) {
    row.dialog = row.dialog.replace(/\[.*\]/g, "");
    return row;
}