CREATE TABLE tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_hash VARCHAR UNIQUE,
    title VARCHAR(280) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    author_id VARCHAR NOT NULL
);

CREATE UNIQUE INDEX tweets_hash_id ON tweets (id_hash)
    WHERE deleted_at IS NULL;

CREATE INDEX tweets_author_id ON tweets (author_id);
