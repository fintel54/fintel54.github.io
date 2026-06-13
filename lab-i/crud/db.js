const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const migrationsDir = path.join(__dirname, 'sql');

// Zwraca obiekt DB z metodami all/get/run (async)
const dbPromise = initSqlJs().then(SQL => {
    console.log('✓ sql.js initialized');
    // Wczytaj plik jeśli istnieje
    let db;
    if (fs.existsSync(dbPath)) {
        const filebuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(new Uint8Array(filebuffer));
        console.log('✓ Loaded existing database from', dbPath);
    } else {
        db = new SQL.Database();
        console.log('✓ Created new in-memory database');
    }

    // Helper do persystencji na dysk
    function persist() {
        try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
            console.log('✓ Database persisted to disk');
        } catch (e) {
            console.error('✗ Error persisting database:', e.message);
        }
    }

    // Wczytaj i wykonaj migracje SQL z pliku
    try {
        if (fs.existsSync(migrationsDir)) {
            const migrationFiles = fs.readdirSync(migrationsDir)
                .filter(f => f.endsWith('.sql'))
                .sort();
            console.log('✓ Found migration files:', migrationFiles);
            for (const file of migrationFiles) {
                const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                console.log(`  Loading migration: ${file}`);
                console.log(`  SQL content: ${sqlContent.substring(0, 50)}...`);
                try {
                    db.exec(sqlContent);
                    console.log(`✓ Migration executed: ${file}`);
                } catch (e) {
                    // Tabela mogła już istnieć (np. przy drugiej inicjacji)
                    if (!e.message.includes('already exists') && !e.message.includes('SQLITE_ERROR')) {
                        console.error(`Error running migration ${file}:`, e.message);
                    } else {
                        console.log(`✓ Migration skipped (already applied): ${file}`);
                    }
                }
            }
            persist();
        }
    } catch (err) {
        console.error('Error during migrations:', err.message);
    }

    return {
        all: async (sql, params = []) => {
            try {
                // Użyj prepared statement dla wszystkich operacji
                const stmt = db.prepare(sql);
                if (params.length > 0) {
                    stmt.bind(params);
                }
                const rows = [];
                while (stmt.step()) {
                    rows.push(stmt.getAsObject());
                }
                stmt.free();
                return rows;
            } catch (e) {
                console.error('Error in db.all():', e.message, 'SQL:', sql);
                throw e;
            }
        },
        get: async (sql, params = []) => {
            try {
                // Użyj prepared statement
                const stmt = db.prepare(sql);
                if (params.length > 0) {
                    stmt.bind(params);
                }
                let obj = null;
                if (stmt.step()) {
                    obj = stmt.getAsObject();
                }
                stmt.free();
                return obj;
            } catch (e) {
                console.error('Error in db.get():', e.message, 'SQL:', sql);
                throw e;
            }
        },
        run: async (sql, params = []) => {
            try {
                // Użyj prepared statement dla INSERT/UPDATE/DELETE
                const stmt = db.prepare(sql);
                if (params.length > 0) {
                    stmt.bind(params);
                }
                stmt.step();
                stmt.free();
                persist();
                // Pobierz lastInsertRowId
                const res = db.exec('SELECT last_insert_rowid() as id');
                const lastID = (res && res[0] && res[0].values && res[0].values[0]) ? res[0].values[0][0] : null;
                return { lastID };
            } catch (e) {
                console.error('Error in db.run():', e.message, 'SQL:', sql);
                throw e;
            }
        }
    };
});

module.exports = dbPromise;

