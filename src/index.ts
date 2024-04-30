import Database from 'better-sqlite3';
import * as fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { FestivalScoreHeroBridge } from './FestivalScoreHeroBridge';
import { PlaywrightScoreHeroPage } from './PlaywrightScoreHeroPage';
import { SQLite3FestivalScoreProvider } from './SQLite3FestivalScoreProvider';
import { ScoreHeroPage } from './interfaces/ScoreHeroPage';

const synchSongs = async (scoreHeroPage: ScoreHeroPage, festivalScoreProvider: SQLite3FestivalScoreProvider) => {
  const songs = await scoreHeroPage.getSongs();
  festivalScoreProvider.insertSongs(songs);
}

const writeSongsFile = async (festivalScoreProvider: SQLite3FestivalScoreProvider) => {
  const songs = festivalScoreProvider.getSongs();
  const json = JSON.stringify(songs);
  await fs.writeFile('score_hero_songs.json', json);
}

(async () => {
  await using browser = await chromium.launch();
  await using context = await browser.newContext();
  await using page = await context.newPage();
  await using scoreHeroPage = new PlaywrightScoreHeroPage(page);
  await scoreHeroPage.login('', '');

  const database = new Database('leaderboard_data.db');
  database.pragma('journal_mode = WAL');
  const festivalScoreProvider = new SQLite3FestivalScoreProvider(database);
  festivalScoreProvider.createSongsTable();

  const bridge = new FestivalScoreHeroBridge(festivalScoreProvider, scoreHeroPage);
  await bridge.uploadHighScores();
})();
