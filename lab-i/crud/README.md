# CRUD Application - Express.js + SQLite

Kompletna aplikacja CRUD (Create, Read, Update, Delete) na bazie Express.js, z bazą danych SQLite i szablonami EJS. Przeniesiona z aplikacji PHP (LAB G).

## Wymagania

- Node.js >= 14.0
- npm lub pnpm

## Instalacja

```bash
cd C:\ptw\lab-i\crud
npm install
# lub
pnpm install
```

## Uruchomienie

```bash
npm start
# serwer uruchomi się na porcie 59625
# adres: http://localhost:59625/books
```

## Struktura projektu

```
crud/
├── bin/www                      # Entry point serwera
├── db.js                        # Konfiguracja SQLite (sql.js)
├── app.js                       # Konfiguracja Express
├── models/
│   └── Book.js                  # Model danych (async API)
├── routes/
│   └── books.js                 # Routing CRUD
├── views/
│   └── books/
│       ├── index.ejs            # Lista wszystkich książek
│       ├── show.ejs             # Podgląd pojedynczej książki
│       ├── create.ejs           # Formularz tworzenia
│       └── edit.ejs             # Formularz edycji + usuwania
├── sql/
│   └── migration-001-create-books-table.sql  # Migracja SQL
├── public/
│   └── stylesheets/style.css    # Style CSS (z LAB G)
└── data.db                      # Baza danych SQLite (zostanie utworzona)
```

## Operacje CRUD

### 1. Lista wszystkich książek (READ)
- **GET** `/books` - wyświetl listę
- Szablona: `views/books/index.ejs`

### 2. Widok pojedynczej książki (READ)
- **GET** `/books/:id` - wyświetl szczegóły
- Szablon: `views/books/show.ejs`

### 3. Tworzenie nowej książki (CREATE)
- **GET** `/books/create` - wyświetl formularz
- **POST** `/books` - zapisz nową książkę
- Szablon: `views/books/create.ejs`

### 4. Edycja książki (UPDATE)
- **GET** `/books/:id/edit` - wyświetl formularz edycji
- **POST** `/books/:id/edit` - zapisz zmiany
- Szablon: `views/books/edit.ejs`

### 5. Usuwanie książki (DELETE)
- **POST** `/books/:id/delete` - usuń książkę (z potwierdzeniem)
- Redirect do listy

## Baza danych

### Tabela `book`

```sql
CREATE TABLE book (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,
    description TEXT NOT NULL
);
```

Migracje SQL są automatycznie czytane z folderu `sql/` i wykonywane przy starcie aplikacji.

## Technologia

- **Backend**: Express.js 4.16
- **Database**: SQLite (sql.js - WASM bez native bindings)
- **Templating**: EJS 2.6
- **Styles**: CSS (LESS source z LAB G)
- **ORM**: Własny helper do sql.js

## Uwagi

- Baza danych jest zapisywana na dysku w pliku `data.db` przy każdej operacji mutacyjnej
- Parametry formularza muszą być w formacie: `book[title]`, `book[author]`, `book[description]`
- Walidacja: Wszystkie pola są wymagane
- SQL.js jest używany zamiast sqlite3 aby uniknąć komplikacji z native bindingiem na Windows

## Pliki źródłowe z LAB G

- SQL migracje: `sql/migration-001-create-books-table.sql`
- Style CSS: `public/stylesheets/style.css` (na bazie LESS z LAB G)
- Layout: inspirowany szablonami PHP z LAB G

## Testy

Aplikacja została przetestowana:
- ✓ Tworzenie nowej książki
- ✓ Wyświetlanie listy
- ✓ Wyświetlanie szczegółów
- ✓ Edycja
- ✓ Usuwanie
- ✓ Persystencja danych na dysku


