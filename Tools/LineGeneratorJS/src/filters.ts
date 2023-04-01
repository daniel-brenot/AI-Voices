import { UniqueDialogEntry } from "./types";

/** Inverts the  result of the filter passed in */
export function inverse(fn: (row: UniqueDialogEntry)=>boolean) {
    return (row: UniqueDialogEntry) => !fn(row);
}

/** Filter function to check if row has any customization */
export function isDialogManual(row: UniqueDialogEntry) {
    return row.dialog.includes("%") || row.dialog.includes("*") || row.dialog.includes("<");
}

/** Filter function to check if row is a creature */
export function isCreature(row: UniqueDialogEntry) {
    return row.isCreature;
}

export function isDone(row: UniqueDialogEntry) {
    return row.done;
}

export function needsValidation(row: UniqueDialogEntry) {
    return row.needsValidation;
}

export function hasSpeakerName(row: UniqueDialogEntry) {
    return row.dialog.match(new RegExp("%Name", "ig"));
}

export function hasPCRank(row: UniqueDialogEntry) {
    return row.dialog.match(new RegExp("%PCRank", "ig"));
}

export function hasPCRace(row: UniqueDialogEntry) {
    return row.dialog.match(new RegExp("%PCRace", "ig"));
}

export function isEmpty(row: UniqueDialogEntry) {
    return row.dialog == "";
}

export function hasFaction(row: UniqueDialogEntry) {
    return row.dialog.match(new RegExp("%Faction", "ig"));
}


