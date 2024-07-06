CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,
    passwordHashed TEXT,
    salt TEXT
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    comment TEXT,
    time_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT OR IGNORE INTO users (name) VALUES 
    ('User1'),
    ('User2'),
    ('User3');

INSERT INTO comments (comment, user_id) VALUES
    ('Comment 1 by User1', 1),
    ('Comment 2 by User1', 1),
    ('Comment 3 by User1', 1),
    ('Comment 4 by User1', 1),
    ('Comment 5 by User1', 1),
    ('Comment 1 by User2', 2),
    ('Comment 2 by User2', 2),
    ('Comment 3 by User2', 2),
    ('Comment 4 by User2', 2),
    ('Comment 5 by User2', 2),
    ('Comment 1 by User3', 3),
    ('Comment 2 by User3', 3),
    ('Comment 3 by User3', 3),
    ('Comment 4 by User3', 3),
    ('Comment 5 by User3', 3);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    session_id TEXT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
