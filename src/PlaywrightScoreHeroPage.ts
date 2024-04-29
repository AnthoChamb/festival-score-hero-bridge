import { Page } from "playwright";
import { Difficulty } from "./enums/Difficulty";
import { Game } from "./enums/Game";
import { Instrument, getInstrumentPrefix } from "./enums/Instrument";
import { Platform } from "./enums/Platform";
import { Score } from "./interfaces/Score";
import { ScoreHeroPage } from "./interfaces/ScoreHeroPage";
import { Song } from "./interfaces/Song";

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

    getSongs = async () => {
        const url = new URL('rankings.php', this.baseUrl);
        url.searchParams.set('game', Game.Festival.toString());
        url.searchParams.set('platform', Platform.Any.toString());
        url.searchParams.set('size', '1');
        url.searchParams.set('group', Instrument.Lead.toString());
        url.searchParams.set('diff', Difficulty.Expert.toString());

        await this.page.goto(url.toString());
        const songs = await this.page.evaluate(() => {
            const songOptionElements = document.querySelectorAll<HTMLOptionElement>('select[name="song"] > option');
            const songs: Song[] = []

            for (const songOptionElement of songOptionElements.values()) {
                const songId = Number(songOptionElement.value);
    
                // Exclude "All Songs", "Intensity" and separator options
                if (songId > 0) {
                    const match = songOptionElement.innerText.match(/^"(.+)" by (.+)$/)
    
                    if (match) {
                        const [, title, artist] = match;
                        songs.push({ id: songId, title: title, artist: artist });
                    }
                }
            }

            return songs;
        });
        return songs.values();
    }

    getMaxScore = async (songId: number, instrument: Instrument, difficulty: Difficulty) => {
        const url = new URL('view_scores.php', this.baseUrl);
        url.searchParams.set('game', Game.Festival.toString());
        url.searchParams.set('platform', Platform.Any.toString());
        url.searchParams.set('size', '1');
        url.searchParams.set('group', instrument.toString());
        url.searchParams.set('diff', difficulty.toString());
        url.searchParams.set('song', songId.toString());

        await this.page.goto(url.toString());
        return await this.page.evaluate(() => {
            // Score Hero does not have any id or class for the scores table so we use this selector instead
            const scoreCellElements = document.querySelectorAll<HTMLTableCellElement>(
                '#content-popup > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td > table:nth-child(7) > tbody > tr:not(.headrow, .browncol) > td:nth-child(2)'
            );

            let maxScore = 0;

            for (const scoreCellElement of scoreCellElements.values()) {
                const score = Number(scoreCellElement.innerText);
                if (score > maxScore) {
                    maxScore = score;
                }
            }

            return maxScore;
        });
    }

    insertScore = async (score: Score) => {
        const url = new URL('insert_score.php', this.baseUrl);
        url.searchParams.set('game', Game.Festival.toString());
        url.searchParams.set('platform', Platform.Any.toString());
        url.searchParams.set('size', '1');
        url.searchParams.set('group', score.instrument.toString());
        url.searchParams.set('diff', score.difficulty.toString());
        url.searchParams.set('song', score.songId.toString());
        
        const instrumentPrefix = getInstrumentPrefix(score.instrument);

        await this.page.goto(url.toString());
        await this.page.locator('#score').fill(score.score.toString());
        await this.page.locator('#rating').fill(score.stars.toString());
        await this.page.locator(`input[name="${instrumentPrefix}Percent"]`).fill(score.percent.toString());
        await this.page.locator('#fullcombo').setChecked(score.fullCombo);

        if (score.comment) {
            await this.page.locator('input[name="comment"]').fill(score.comment);
        }

        await this.page.locator('input[type="submit"]').click();
    }

    [Symbol.asyncDispose] = async () => {
        await this.page.close();
    }
}