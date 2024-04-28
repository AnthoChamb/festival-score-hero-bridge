import { Difficulty } from "../enums/Difficulty";
import { Instrument } from "../enums/Instrument";
import { Score } from "./Score";

export interface ScoreHeroPage {
    login(username: string, password: string): Promise<void>;
    getMaxScore(song: number, instrument: Instrument, difficulty: Difficulty): Promise<number>;
    insertScore(song: number, score: Score): Promise<void>;
}