import { FestivalScoreProvider } from "./interfaces/FestivalScoreProvider";
import { ScoreHeroPage } from "./interfaces/ScoreHeroPage";

export class FestivalScoreHeroBridge {
    private readonly festivalScoreProvider: FestivalScoreProvider;
    private readonly scoreHeroPage: ScoreHeroPage;

    constructor(festivalScoreProvider: FestivalScoreProvider, scoreHeroPage: ScoreHeroPage) {
        this.festivalScoreProvider = festivalScoreProvider;
        this.scoreHeroPage = scoreHeroPage;
    }

    uploadHighScores = async (comment?: string) => {
        const highScores = await this.festivalScoreProvider.getHighScores();

        for (const highScore of highScores) {
            const maxScore = await this.scoreHeroPage.getMaxScore(highScore.songId, highScore.instrument, highScore.difficulty);

            if (highScore.score > maxScore) {
                await this.scoreHeroPage.insertScore(highScore);
            }
        }
    }
}