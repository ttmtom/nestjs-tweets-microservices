CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_hash VARCHAR UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL
);

CREATE UNIQUE INDEX idx_users_username_unique_when_not_deleted ON users (username)
    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX user_hash_id ON users (id_hash)
    WHERE deleted_at IS NULL;
