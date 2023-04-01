import { processCSV, processUniqueDialogRow } from "./csv-utils";
import { inverse, isDialogManual, isDone, isEmpty } from "./filters";
import { getFileIDSFromOutput } from "./file-utils";
import { ElvenAiAPI } from "./elven-ai";
import { generateUniqueVoiceLines, OUTPUT_PATH, UNIQUE_CSV_PATH } from "./main";
import { env } from "./environment";



(async () => {
    let rows = await processCSV(UNIQUE_CSV_PATH, processUniqueDialogRow);
    // Get the ids of the files that actually exist
    let ids = await getFileIDSFromOutput(OUTPUT_PATH);
    // Mark the rows with files that already exist as completed
    // rows = markRowsAsDone(rows, ids);

    let doneButUnmarked = rows.filter(inverse(isDone)).filter(row=>ids.includes(row.id));
    
    // let ranked = doneButUnmarked.filter(row=>row.originalDialog.includes("%PCRank"))
    // console.log(ranked.map(row=>row.id));
    
    let manual = doneButUnmarked.filter(isDialogManual);
    // console.log(`Done but manual: ${manual.length}`)
    console.dir(manual.map(row=>row.id));

    console.log(`Done but unmarked: ${doneButUnmarked.length}`)

    // console.dir(rows.filter(isEmpty).filter(isDone))
    let api = new ElvenAiAPI(env.ELVENAI_API_KEY);
    // console.dir(await api.getVoices());
    // getRaceStats(rows);
    // let emptyLines = rows.filter(isEmpty);


    await generateUniqueVoiceLines(api, rows);
    // console.dir(await getFileIDSFromOutput(OUTPUT_PATH));
    // await markUnverifiedFiles("../../Progress/Morrowind.csv", doneButUnmarked.map(row=>row.id));
    // getGeneralStats(rows);

})();