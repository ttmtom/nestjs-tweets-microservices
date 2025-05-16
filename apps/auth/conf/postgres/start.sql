CREATE TYPE "public"."user_role_enum" AS ENUM (
    'admin',
    'user'
    );

CREATE TABLE user_credentials (
    user_id UUID PRIMARY KEY,
    "hashed_password" character varying NOT NULL,
    "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE NULL
);
