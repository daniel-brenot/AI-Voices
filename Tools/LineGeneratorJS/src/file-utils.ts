import glob from "glob";
import fs from "fs";
import { UniqueDialogEntry } from "./types";

/** Returns the ids of all the files existing in the output folder */
export async function getFileIDSFromOutput(baseDir: string) {
    let files = await glob(`${baseDir}/**/*.mp3`, {
        nodir: true,
        withFileTypes: true,
    });
    return files.map(f=>f.name.substring(0,f.name.length-4));
}

/** Marks all records that have a provided id as done
 * VERY slow since it's not done well. expect this to take a minute or 2s
*/
export function markCompletedFiles(path: string, ids: string[]) {
    let contents = fs.readFileSync(path).toString();

    for(let id of ids) {
        contents = contents.replace(new RegExp(`\\n,id_${id}`), `\n1,id_${id}`)
        contents = contents.replace(new RegExp(`\\n0,id_${id}`), `\n1,id_${id}`)
    }
    fs.writeFileSync(path, contents);
}

/** Marks all records that have a provided id as done
 * VERY slow since it's not done well. expect this to take a minute or 2s
*/
export function markUnverifiedFiles(path: string, ids: string[]) {
    let contents = fs.readFileSync(path).toString();

    for(let id of ids) {
        contents = contents.replace(new RegExp(`\\n,id_${id}`), `\n0,id_${id}`)
    }
    fs.writeFileSync(path, contents);
}

/**
 * Marks a single ID as completed in the master csv
 */
export function markIDCompleted(path: string, id: string) {
    let contents = fs.readFileSync(path).toString();

    contents = contents.replace(new RegExp(`\\n,id_${id}`), `\n1,id_${id}`)
    fs.writeFileSync(path, contents);
}

export function getFilePathForRow(row: UniqueDialogEntry) {
    if(row.isCreature) {
        return `creature/${row.speakerID}/${row.id}.mp3`;
    } else {
        return `${row.race}/${row.gender}/${row.speakerID}/${row.id}.mp3`;
    }
}

