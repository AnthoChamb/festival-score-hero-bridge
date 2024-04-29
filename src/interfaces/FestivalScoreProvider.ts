import { Score } from "./Score";

export interface FestivalScoreProvider {
    getHighScores(): Promise<IterableIterator<Score>>;
}