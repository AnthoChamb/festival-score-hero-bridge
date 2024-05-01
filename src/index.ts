#!/usr/bin/env node
import Database from 'better-sqlite3';
import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { FestivalScoreHeroBridge } from './FestivalScoreHeroBridge';
import { PlaywrightScoreHeroPage } from './PlaywrightScoreHeroPage';
import { SQLite3FestivalScoreProvider } from './SQLite3FestivalScoreProvider';

interface UploadHighScoreOptions {
  username: string;
  password: string;
  comment?: string;
}

const uploadHighScores = async (filename: string, options: UploadHighScoreOptions) => {
  await using browser = await chromium.launch();
  await using context = await browser.newContext();
  await using page = await context.newPage();
  await using scoreHeroPage = new PlaywrightScoreHeroPage(page);
  await scoreHeroPage.login(options.username, options.password)
  
  const database = new Database(filename);
  database.pragma('journal_mode = WAL');
  const festivalScoreProvider = new SQLite3FestivalScoreProvider(database);
  festivalScoreProvider.createSongsTable();
  
  const bridge = new FestivalScoreHeroBridge(festivalScoreProvider, scoreHeroPage);
  await bridge.uploadHighScores(options.comment);
}

const synchSongs = async (filename: string) => {
  await using browser = await chromium.launch();
  await using context = await browser.newContext();
  await using page = await context.newPage();
  await using scoreHeroPage = new PlaywrightScoreHeroPage(page);
  
  const database = new Database(filename);
  database.pragma('journal_mode = WAL');
  const festivalScoreProvider = new SQLite3FestivalScoreProvider(database);
  festivalScoreProvider.createSongsTable();

  const songs = await scoreHeroPage.getSongs();
  festivalScoreProvider.insertSongs(songs);
}

const writeSongsFile = async (filename: string, destination: string) => {
  const database = new Database(filename);
  database.pragma('journal_mode = WAL');
  const festivalScoreProvider = new SQLite3FestivalScoreProvider(database);
  festivalScoreProvider.createSongsTable();

  const songs = festivalScoreProvider.getSongs();
  const json = JSON.stringify(songs);
  await fs.writeFile(destination, json);
}

(async () => {
  const program = new Command()

  program.command('upload')
    .description('upload Festival high scores to Score Hero')
    .argument('<filename>', 'Festival score database filename')
    .requiredOption('-u, --username <username>', 'Score Hero username')
    .requiredOption('-p, --password <password>', 'Score Hero password')
    .option('-c, --comment <comment>', 'score comment')
    .action(uploadHighScores);

  program.command('synch')
    .description('synch Score Hero song IDs with the Festival score database')
    .argument('<filename>', 'Festival score database filename')
    .action(synchSongs);

  program.command('write')
    .description('write Score Hero song IDs from the Festival score database to a JSON file')
    .argument('<filename>', 'Festival score database filename')
    .argument('[destination]', 'destination JSON filename', 'score_hero_songs.json')
    .action(writeSongsFile);

  await program.parseAsync(process.argv);
})();
