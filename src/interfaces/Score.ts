import { Difficulty } from "../enums/Difficulty";
import { Instrument } from "../enums/Instrument";

export interface Score {
    songId: number;
    instrument: Instrument;
    difficulty: Difficulty;
    score: number;
    stars: number;
    percent: number;
    fullCombo: boolean;
    comment?: string, 
}