-- V6: users.id now exists, so we can safely add the FK organisations.admin_user_id -> users.id.

ALTER TABLE organisations
    ADD CONSTRAINT fk_org_admin_user FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL;
