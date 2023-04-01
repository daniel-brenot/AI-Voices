import cliProgress from "cli-progress";
import { isCreature,isDone } from "./filters";
import { UniqueDialogEntry } from "./types";
import { combineRaceAndGenderForDisplay, getRowsByGender, getRowsByRace, getRowsBySpeakerID} from "./utils";
import { ElvenAiAPI } from "./elven-ai";
import { BackoffHandler, RubberRateLimiter } from "./rate-limit";
import { env } from "./environment";

/** Global rate limiter for calling the API (15 second limit) */
// const LIMITER = new RateLimiter(10 * 1000);
export const LIMITER = new RubberRateLimiter(100);

// const LIMITER = new RateLimiter(10);

/** Global backoff handler with a 5 minute base backoff, factored by 2 for each failure */
// const BACKOFF = new BackoffHandler(5 * 60 * 1000, 2);
export const BACKOFF = new BackoffHandler(5 * 1000, 2);


export const OUTPUT_PATH = "../../FOMOD/00 - Core/Sound/Vo/AIV/"
export const UNIQUE_CSV_PATH = "../../Progress/Morrowind.csv";
export const UNIQUE_PURISTS_CSV_PATH = "../../Progress/Patch for Purists.csv";

export const GENERIC_CSV_PATH = "../../Progress/Morrowind Generic.csv";
export const GENERIC_PURISTS_CSV_PATH = "../../Progress/Patch for Purists Generic.csv";

export async function generateUniqueVoiceLines(api: ElvenAiAPI, rows: UniqueDialogEntry[]) {

    /** A map of <Species Gender> to <voiceID>  */
    let voiceIDs: Record<string, string>;
    try {
        voiceIDs = await api.getVoices();
    } catch(err) {
        throw new Error("Failed to get voices. Is your API Key valid?")
    }

    let incompleteRows = rows.filter(row=>!isDone(row));

    let raceRows = incompleteRows.filter(row=>!isCreature(row));
    let creatureRows = incompleteRows.filter(isCreature);

    await generateRaceVoiceLines(api, voiceIDs,raceRows);
    await generateCreatureVoiceLines(api, voiceIDs, creatureRows);
}

export async function generateRaceVoiceLines(api: ElvenAiAPI, voiceIDs: Record<string, string>, rows: UniqueDialogEntry[]) {
    for(let [race, raceEntries] of Object.entries(getRowsByRace(rows))) {
        for(let [gender, genderEntries] of Object.entries(getRowsByGender(raceEntries))) {
            let displayIndex  = combineRaceAndGenderForDisplay(race, gender);
            if(env.GENERATE_RACE !== "all" && env.GENERATE_RACE !== displayIndex) {
                console.log(`Skipping ${displayIndex} since it doesn't match ${env.GENERATE_RACE}`);
                continue;
            }
            let voiceID = voiceIDs[displayIndex];
            if(!voiceID) {
                console.log(`Voice not found for "${displayIndex}". Please create one.`);
                continue;
            }
            // Skip this row if it's already complete
            if(genderEntries.length == 0) continue;
            const bar = new cliProgress.SingleBar({
                format: `${displayIndex.padEnd(25)} | {bar} || {value}/{total} | {eta_formatted}`,
            }, cliProgress.Presets.shades_classic);
            bar.start(genderEntries.length, 0);
            for(let row of genderEntries) {
                // Reset backoff if last iteration was successfull
                BACKOFF.reset();
                // Used to know if the generation was a success so we can retry if not
                let success = false;
                while(!success) {
                    try {
                        // await api.generateVoiceLine(row.dialog, voiceID, `${OUTPUT_PATH}${getFilePathForRow(row)}`);
                        success = true;
                    } catch (err) {
                        let backoffBar = new cliProgress.SingleBar({
                            format: `${"Backing off...".padEnd(25)} | {bar} || {eta_formatted}`
                        }, cliProgress.Presets.shades_classic);
                        backoffBar.start(BACKOFF.backoffTime, 0);
                        await BACKOFF.backoff((function(this: cliProgress.SingleBar, elapsed: number) { this.update(elapsed) }).bind(backoffBar));
                        backoffBar.stop();
                    }
                }
                
                await LIMITER.limit();
                bar.increment();
            }
            bar.stop();
        }
    }
}

export async function generateCreatureVoiceLines(api: ElvenAiAPI, voiceIDs: Record<string, string>, rows: UniqueDialogEntry[]) {
    for(let [speakerID, lines] of Object.entries(getRowsBySpeakerID(rows))){
        let speakerName = lines[0].speakerName;
        if(env.GENERATE_RACE !== "all" && env.GENERATE_RACE !== speakerName) {
            console.log(`Skipping ${speakerName} since it doesn't match ${env.GENERATE_RACE}`);
            continue;
        }
        let voiceID = voiceIDs[speakerName];
        // If the voice wasn't found, let the user know and skip
        if(!voiceID) {
            console.log(`Voice not found for "${speakerName}". Please create one.`);
            continue;
        }
        // Skip this row if it's already complete
        const bar = new cliProgress.SingleBar({
            format: `${lines[0].speakerName.padEnd(25)} | {bar} || {value}/{total} | {eta_formatted} `,
        }, cliProgress.Presets.shades_classic);
        bar.start(lines.length, 0);
        let i = 0;
        for(let row of lines) {
            // Reset backoff if last iteration was successfull
            BACKOFF.reset();
            // Used to know if the generation was a success so we can retry if not
            let success = false;
            while(!success) {
                try {
                    // await api.generateVoiceLine(row.dialog, voiceID, `${OUTPUT_PATH}${getFilePathForRow(row)}`);
                    success = true;
                } catch (err) {
                    let backoffBar = new cliProgress.SingleBar({
                        format: `${"Backing off...".padEnd(25)} | {bar} || {eta_formatted}`
                    }, cliProgress.Presets.shades_classic);
                    backoffBar.start(BACKOFF.backoffTime, 0);
                    await BACKOFF.backoff((function(this: cliProgress.SingleBar, elapsed: number) { this.update(elapsed) }).bind(backoffBar));
                    backoffBar.stop();
                }
            }
            
            await LIMITER.limit();
            bar.increment();
        }
        bar.stop();
    }
}