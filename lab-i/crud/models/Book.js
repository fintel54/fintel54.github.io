const dbPromise = require('../db');

class Book {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.author = data.author || '';
        this.description = data.description || '';
    }

    static async findAll() {
        const db = await dbPromise;
        const rows = await db.all('SELECT * FROM book ORDER BY id DESC');
        return (rows || []).map(r => new Book(r));
    }

    static async findById(id) {
        const db = await dbPromise;
        const row = await db.get('SELECT * FROM book WHERE id = ?', [id]);
        return row ? new Book(row) : null;
    }

    static async create(data) {
        const db = await dbPromise;
        const result = await db.run('INSERT INTO book (title, author, description) VALUES (?, ?, ?)', [data.title, data.author, data.description]);
        return new Book({ ...data, id: result.lastID });
    }

    static async update(id, data) {
        const db = await dbPromise;
        await db.run('UPDATE book SET title = ?, author = ?, description = ? WHERE id = ?', [data.title, data.author, data.description, id]);
        return this.findById(id);
    }

    static async delete(id) {
        const db = await dbPromise;
        await db.run('DELETE FROM book WHERE id = ?', [id]);
        return true;
    }

    async save() {
        const db = await dbPromise;
        if (!this.id) {
            const result = await db.run('INSERT INTO book (title, author, description) VALUES (?, ?, ?)', [this.title, this.author, this.description]);
            this.id = result.lastID;
        } else {
            await db.run('UPDATE book SET title = ?, author = ?, description = ? WHERE id = ?', [this.title, this.author, this.description, this.id]);
        }
        return this;
    }

    async delete() {
        if (!this.id) return false;
        const db = await dbPromise;
        await db.run('DELETE FROM book WHERE id = ?', [this.id]);
        this.id = null;
        return true;
    }
}

module.exports = Book;

