CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    owner_notified BOOLEAN DEFAULT FALSE,
    owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    finder_phone VARCHAR(20),
    finder_email VARCHAR(255),
    finder_ip INET,
    finder_latitude DOUBLE PRECISION,
    finder_longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

