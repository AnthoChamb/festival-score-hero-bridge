import { Score } from "./Score";

export interface FestivalScoreProvider {
    getHighScores(comment?: string): Promise<IterableIterator<Score>>;
}