import { Page } from "playwright";
import { ScoreHeroPage } from "./interfaces/ScoreHeroPage";
import { Game } from "./enums/Game";
import { Platform } from "./enums/Platform";
import { Score } from "./interfaces/Score";
import { Instrument, getInstrumentPrefix } from "./enums/Instrument";
import { Difficulty } from "./enums/Difficulty";

export class PlaywrightScoreHeroPage implements ScoreHeroPage, AsyncDisposable {
    private readonly baseUrl = new URL('https://rockband.scorehero.com');
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    login = async (username: string, password: string) => {
        const url = new URL('login.php', this.baseUrl);
        await this.page.goto(url.toString());
        await this.page.locator('#uname').fill(username);
        await this.page.locator('#pass').fill(password);
        await this.page.locator('input[type="submit"]').click();
        await this.page.waitForURL(this.baseUrl.toString());
    }

    getMaxScore = async (song: number, instrument: Instrument, difficulty: Difficulty) => {
        const url = new URL('view_scores.php', this.baseUrl);
        url.searchParams.set('game', Game.Festival.toString());
        url.searchParams.set('platform', Platform.Any.toString());
        url.searchParams.set('size', '1');
        url.searchParams.set('group', instrument.toString());
        url.searchParams.set('diff', difficulty.toString());
        url.searchParams.set('song', song.toString());

        await this.page.goto(url.toString());

        const scoreElements = await this.page.evaluate(() => {
            // Score Hero does not have any id or class for the scores table so we use this selector instead
            return document.querySelectorAll<HTMLTableCellElement>(
                "#content-popup > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td > table:nth-child(7) > tbody > tr:not(.headrow, .browncol) > td:nth-child(2)"
            );
        });

        let maxScore = 0;

        for (const scoreElement of scoreElements.values()) {
            const score = Number(scoreElement.innerText);
            if (score > maxScore) {
                maxScore = score;
            }
        }

        return maxScore;
    }

    insertScore = async (song: number, score: Score) => {
        const url = new URL('insert_score.php', this.baseUrl);
        url.searchParams.set('game', Game.Festival.toString());
        url.searchParams.set('platform', Platform.Any.toString());
        url.searchParams.set('size', '1');
        url.searchParams.set('group', score.instrument.toString());
        url.searchParams.set('diff', score.difficulty.toString());
        url.searchParams.set('song', song.toString());
        
        const instrumentPrefix = getInstrumentPrefix(score.instrument);

        await this.page.goto(url.toString());
        await this.page.locator('#score').fill(score.score.toString());
        await this.page.locator('#rating').fill(score.stars.toString());
        await this.page.locator(`input[name="${instrumentPrefix}Percent"]`).fill(score.percent.toString());
        await this.page.locator('#fullcombo').setChecked(score.fullCombo);
        await this.page.locator('input[type="submit"]').click();
    }

    [Symbol.asyncDispose] = async () => {
        await this.page.close();
    }
}