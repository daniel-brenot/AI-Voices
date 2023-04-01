import { hasPCRace, isCreature, isDialogManual, isDone, isEmpty } from "./filters";
import { UniqueDialogEntry } from "./types";
import { combineRaceAndGenderForDisplay, getCharacters, getDuplicates, getRowsByGender, getRowsByRace, markRowsAsDone } from "./utils";
import cliProgress from "cli-progress";


export function getGeneralStats(rows: UniqueDialogEntry[]) {
    let raceLines = rows.filter(hasPCRace);
    let doneRaceLines = raceLines.filter(isDone);
    printCompletionStats(raceLines.length, doneRaceLines.length, "Race Lines");
    
    let emptyLines = rows.filter(isEmpty);
    let doneEmptyLines = emptyLines.filter(isDone);
    printCompletionStats(emptyLines.length, doneEmptyLines.length, "Empty Lines");
    let manualLines = rows.filter(isDialogManual);
    let doneManualLines = manualLines.filter(isDone);
    printCompletionStats(manualLines.length, doneManualLines.length, "Manual Lines");
    let automaticLines = rows.filter(row=>!isDialogManual(row));
    let doneAutomaticLines = automaticLines.filter(isDone);
    printCompletionStats(automaticLines.length, doneAutomaticLines.length, "Automatic Lines");
    let completed = rows.filter(isDone);
    printCompletionStats(rows.length, completed.length, "Completed Lines");
    let totalCharacters = getCharacters(rows);
    let completedCharacters = getCharacters(completed);
    printCompletionStats(totalCharacters, completedCharacters, "Completed Chars");
}

export function getRaceStats(rows: UniqueDialogEntry[]) {
    rows = rows.filter(row=>!isCreature(row));
    for(let [race, raceEntries] of Object.entries(getRowsByRace(rows))) {
        for(let [gender, genderEntries] of Object.entries(getRowsByGender(raceEntries))) {
            let completed = genderEntries.filter(isDone);
            printCompletionStats(genderEntries.length, completed.length, `${combineRaceAndGenderForDisplay(race, gender)}`)
        }
    }
}

function printCompletionStats(total: number, value: number, key: string) {
    let completionRatio = `${value}/${total}`.padEnd(12);
    const bar = new cliProgress.SingleBar({
        format: `${key.padEnd(15)} | {bar} | ${completionRatio} || {percentage}%`,
    }, cliProgress.Presets.shades_classic);
    bar.start(total, value);
    bar.stop();
}
