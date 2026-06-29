CREATE OR REPLACE FUNCTION validate_directus_file_upload()
RETURNS TRIGGER AS $$
DECLARE
    folder_name VARCHAR;
BEGIN
    IF NEW.folder IS NOT NULL THEN
        SELECT name INTO folder_name FROM directus_folders WHERE id = NEW.folder;
        IF folder_name = 'documents' AND NEW.filename_download NOT ILIKE '%.pdf' THEN
            RAISE EXCEPTION 'FILE_VALIDATION_ERROR: Only PDF documents (.pdf) are allowed in the documents folder.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_directus_file_upload ON directus_files;
CREATE TRIGGER trigger_validate_directus_file_upload
BEFORE INSERT ON directus_files
FOR EACH ROW
EXECUTE FUNCTION validate_directus_file_upload();
