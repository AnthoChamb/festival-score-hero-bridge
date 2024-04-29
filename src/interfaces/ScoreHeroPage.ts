import { Difficulty } from "../enums/Difficulty";
import { Instrument } from "../enums/Instrument";
import { Score } from "./Score";
import { Song } from "./Song";

export interface ScoreHeroPage {
    login(username: string, password: string): Promise<void>;
    getSongs(): Promise<IterableIterator<Song>>;
    getMaxScore(songId: number, instrument: Instrument, difficulty: Difficulty): Promise<number>;
    insertScore(score: Score): Promise<void>;
}