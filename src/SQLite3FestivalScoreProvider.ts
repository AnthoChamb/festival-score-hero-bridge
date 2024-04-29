import { Database } from "better-sqlite3";
import { Song } from "./interfaces/Song";
import score_hero_songs from '../score_hero_songs.json';
import { FestivalScoreProvider } from "./interfaces/FestivalScoreProvider";
import { getInstrumentFromFestival } from "./enums/Instrument";

interface HighScore {
    song_id: string;
    score_hero_song_id: number;
    instrument: number;
    difficulty: number;
    score: number;
    stars_earned: number;
    percent: number;
    full_combo: number;
    end_time: string;
}

interface ScoreHeroSong {
    score_hero_song_id: number;
    festival_song_id: string;
}

export class SQLite3FestivalScoreProvider implements FestivalScoreProvider {
    private readonly database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    getHighScores = async (comment?: string) => {
        const stmt = this.database.prepare<unknown[], HighScore>(`
            SELECT
                high_score.song_id,
                score_hero_songs.score_hero_song_id,
                high_score.instrument,
                high_score.difficulty,
                high_score.score,
                high_score.stars_earned,
                high_score.accuracy / 10000 AS percent,
                high_score.full_combo,
                high_score.end_time
            FROM z_scores AS high_score
            INNER JOIN score_hero_songs
                ON high_score.song_id = score_hero_songs.festival_song_id
            LEFT JOIN z_scores
                ON high_score.song_id = z_scores.song_id
                AND high_score.instrument = z_scores.instrument
                AND high_score.difficulty = z_scores.difficulty
                AND high_score.score < z_scores.score
            WHERE z_scores.score IS NULL
        `);

        const iterateHighScores = function* () {
            for (const highScore of stmt.iterate()) {
                const instrument = getInstrumentFromFestival(highScore.instrument);
                if (instrument) {
                    const difficulty = highScore.difficulty - 1;
                    let highScoreComment = '';

                    if (comment) {
                        highScoreComment += comment;
                        highScoreComment += ' - '
                    }
    
                    highScoreComment += highScore.end_time;
    
                    yield {
                        songId: highScore.score_hero_song_id,
                        instrument: instrument,
                        difficulty: difficulty,
                        score: highScore.score,
                        stars: highScore.stars_earned,
                        percent: highScore.percent,
                        fullCombo: highScore.full_combo === 1,
                        comment: highScoreComment
                    }
                }
            }
        }

        return iterateHighScores();
    }

    createSongsTable = () => {
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS score_hero_songs (
                score_hero_song_id INTEGER PRIMARY KEY,
                festival_song_id TEXT NOT NULL
            );
        `);

        const stmt = this.database.prepare(`
            INSERT OR IGNORE INTO score_hero_songs (score_hero_song_id, festival_song_id)
            VALUES (?, ?);
        `);

        for (const score_hero_song of score_hero_songs) {
            stmt.run(score_hero_song.score_hero_song_id, score_hero_song.festival_song_id);
        }
    }

    getSongs = () => {
        const stmt = this.database.prepare<unknown[], ScoreHeroSong>(`
            SELECT score_hero_song_id, festival_song_id
            FROM score_hero_songs;
        `);

        return stmt.all()
    }

    insertSongs = (songs: IterableIterator<Song>) => {
        const stmt = this.database.prepare(`
            INSERT OR IGNORE INTO score_hero_songs (score_hero_song_id, festival_song_id)
            SELECT ?, tracks_controller.song_id
            FROM tracks_controller
            WHERE tracks_controller.artist LIKE ? AND tracks_controller.title LIKE ?;
        `);

        for (const song of songs) {
            stmt.run(song.id, song.artist, song.title);
        }
    }
}