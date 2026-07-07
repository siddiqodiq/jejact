-- splits: per-km metric splits dari detailed activity (untuk template pace splits)
-- NULL = detail belum pernah di-fetch, '[]' = sudah di-fetch tapi tidak ada splits
ALTER TABLE activities ADD COLUMN splits JSONB;
