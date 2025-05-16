CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_hash VARCHAR UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "user_username" ON "users" ("username");
CREATE UNIQUE INDEX "user_hash_id" ON "users" ("id_hash");
