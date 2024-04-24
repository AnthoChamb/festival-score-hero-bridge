import { Score } from "./Score";

export interface ScoreHeroPage {
    login(username: string, password: string): Promise<void>;
    insertScore(song: number, score: Score): Promise<void>;
}