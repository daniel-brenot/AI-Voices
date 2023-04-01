import { UniqueDialogEntry } from "./types";

export function combineRaceAndGenderForDisplay(race: string, gender: string) {
    return `${capitalizeWords(race)} ${gender == "f"?"Female":"Male"}`;
}

/** Capitalizes every word in the string */
export function capitalizeWords(words: string) {
    try {
        let wordsList = words.split(" ");
        return wordsList.map((word) => word[0].toUpperCase() + word.substring(1)).join(" ");
    } catch(err) {
        return words;
    }
}

/** Gets the rows with the ids passed in marked as completed */
export function markRowsAsDone(rows: UniqueDialogEntry[], ids: string[]) {
    return rows.map(row => ({...row, done: row.done || ids.includes(row.id)}));
}

export function getCharacters(rows: UniqueDialogEntry[]) {
    return rows.reduce((count, row)=>row.dialog.length+count, 0);
}

/**
 * Groups all the rows by race, excluding creatures.
 * The keys in this map are the race of the entry
 */
export function getRowsByRace(rows: UniqueDialogEntry[]) {
    let result: Record<string, UniqueDialogEntry[]> = {}
    for(let row of rows) {
        if(!result[row.race]) result[row.race] = [];
        result[row.race].push(row);
    }
    return result;
}

/**
 * Groups all the rows by speaker id
 * The keys in this map are the speaker id of the entry
 */
export function getRowsBySpeakerID(rows: UniqueDialogEntry[]) {
    let result: Record<string, UniqueDialogEntry[]> = {}
    for(let row of rows) {
        if(!result[row.speakerID]) result[row.speakerID] = [];
        result[row.speakerID].push(row);
    }
    return result;
}

/**
 * Groups all the rows by gender, assuming all the input rows aren't creatures.
 * The keys in this map are the gender of the entry
 */
export function getRowsByGender(rows: UniqueDialogEntry[]) {
    let result: Record<string, UniqueDialogEntry[]> = {f: [], m: []};
    for(let row of rows) {
        if(!row.gender) continue;
        result[row.gender].push(row);
    }
    return result;
}

/** Gets the rows that are duplicates of others, excluding the first match for the line of dialog */
export function getDuplicates(rows: UniqueDialogEntry[]) {
    let byRace = getRowsByRace(rows);
    return Object.entries(byRace).map(([race, lines])=>{
        let dialogMap: Record<string, UniqueDialogEntry> = {};
        let duplicates: UniqueDialogEntry[] = [];
        for(let row of lines) {
            if(!dialogMap[row.dialog]) dialogMap[row.dialog] = row;
            else duplicates.push(row);
        }
        return duplicates;
    }).flat();
    
}

export function removeDuplicates(rows: UniqueDialogEntry[]) {
    let dialogMap: Record<string, boolean> = {};
    return rows.filter(row=>{
        if(dialogMap[row.dialog]) return false;
        dialogMap[row.dialog]=true;
        return true;
    });
}
