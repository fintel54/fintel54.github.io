const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET /books - Lista wszystkich książek
router.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.render('books/index', {
            title: 'Books List',
            bodyClass: 'index',
            books: books || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Database error', error: { status: 500 } });
    }
});

// GET /books/create - Formularz tworzenia
router.get('/create', (req, res) => {
    const book = new Book();
    res.render('books/create', {
        title: 'Create Book',
        bodyClass: 'edit',
        book: book
    });
});

// POST /books - Zapis nowej książki
router.post('/', async (req, res) => {
    const { book: bookData } = req.body;

    if (bookData && bookData.title && bookData.author && bookData.description) {
        try {
            await Book.create(bookData);
            res.redirect('/books');
        } catch (err) {
            console.error(err);
            res.status(500).render('books/create', { title: 'Create Book', bodyClass: 'edit', book: new Book(bookData), error: 'Database error' });
        }
    } else {
        res.status(400).render('books/create', { title: 'Create Book', bodyClass: 'edit', book: new Book(bookData), error: 'All fields are required' });
    }
});

// GET /books/:id - Podgląd pojedynczej książki
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found', error: { status: 404 } });
        }
        res.render('books/show', { title: `${book.title} (${book.id})`, bodyClass: 'show', book: book });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Database error', error: { status: 500 } });
    }
});

// GET /books/:id/edit - Formularz edycji
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found', error: { status: 404 } });
        }
        res.render('books/edit', { title: `Edit Book ${book.title} (${book.id})`, bodyClass: 'edit', book: book });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Database error', error: { status: 500 } });
    }
});

// POST /books/:id/edit - Zapis zmian
router.post('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found', error: { status: 404 } });
        }

        const { book: bookData } = req.body;
        if (bookData && bookData.title && bookData.author && bookData.description) {
            await Book.update(req.params.id, bookData);
            res.redirect('/books');
        } else {
            res.status(400).render('books/edit', { title: `Edit Book ${book.title} (${book.id})`, bodyClass: 'edit', book: Object.assign(book, bookData || {}), error: 'All fields are required' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Database error', error: { status: 500 } });
    }
});

// POST /books/:id/delete - Usunięcie książki
router.post('/:id/delete', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found', error: { status: 404 } });
        }
        await book.delete();
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error deleting book', error: { status: 500 } });
    }
});

module.exports = router;
