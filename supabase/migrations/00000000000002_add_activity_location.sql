-- location: kota/provinsi/negara aktivitas. Dari Strava bila tersedia,
-- selain itu hasil reverse-geocode titik awal polyline.
-- NULL = belum pernah di-lookup, '' = sudah di-lookup tapi tidak ada
ALTER TABLE activities ADD COLUMN location TEXT;
