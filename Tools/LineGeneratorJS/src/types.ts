
export interface UniqueDialogEntry {
    needsValidation: boolean;
    done: boolean;
    id: string;
    speakerID: string;
    speakerName: string;
    race: string;
    gender: string;
    faction: string;
    pcRank: string;
    isCreature: boolean;
    originalDialog: string;
    dialog: string;
}