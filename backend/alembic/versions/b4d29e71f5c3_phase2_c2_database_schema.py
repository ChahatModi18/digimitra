"""Phase 2: Implement Claude C2 database schema and data model

Revision ID: b4d29e71f5c3
Revises: a3f609a448d5
Create Date: 2026-09-27 12:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.mysql import BIGINT, INTEGER, SMALLINT, TINYINT, ENUM, JSON


# revision identifiers, used by Alembic.
revision: str = 'b4d29e71f5c3'
down_revision: Union[str, None] = 'a3f609a448d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------
    # 0. Drop empty Phase 1 child tables to allow clean primary/foreign key migration
    # ------------------------------------------------------------
    op.execute("SET FOREIGN_KEY_CHECKS = 0;")
    empty_phase1_tables = [
        'progress_logs',
        'roadmap_items',
        'roadmap_tasks',
        'roadmaps',
        'business_recommendations',
        'classification_evidence',
        'ml_predictions',
        'classification_results',
        'ml_models',
        'assessment_scores',
        'assessment_answers',
        'assessments',
        'question_options',
        'questions',
        'rule_recommendations',
        'recommendations',
        'rules',
        'research_evaluation_records',
        'audit_logs',
    ]
    for tbl in empty_phase1_tables:
        op.execute(f"DROP TABLE IF EXISTS `{tbl}`;")
    op.execute("SET FOREIGN_KEY_CHECKS = 1;")

    # ------------------------------------------------------------
    # 1. Reference / Lookup: rbdl_levels (C2 Entity 2.1)
    # ------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS rbdl_levels (
            id                  TINYINT UNSIGNED NOT NULL PRIMARY KEY,
            code                VARCHAR(30) NOT NULL UNIQUE,
            name_en             VARCHAR(100) NOT NULL,
            name_hi             VARCHAR(100) NOT NULL,
            description_en      TEXT NULL,
            description_hi      TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )
    op.execute("ALTER TABLE rbdl_levels MODIFY COLUMN id TINYINT UNSIGNED NOT NULL;")

    op.execute("SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';")
    op.execute(
        """
        INSERT IGNORE INTO rbdl_levels (id, code, name_en, name_hi, description_en, description_hi)
        VALUES
        (0, 'L0', 'Foundational Readiness', 'बुनियादी तैयारी', 'Level 0 — Foundational Readiness: Manual record-keeping, cash-only operations, no active digital business footprint.', 'स्तर 0 — बुनियादी तैयारी: मैन्युअल रिकॉर्ड-कीपिंग, केवल नकद संचालन, कोई सक्रिय डिजिटल व्यावसायिक उपस्थिति नहीं।'),
        (1, 'L1', 'Basic Digital Presence', 'बुनियादी डिजिटल उपस्थिति', 'Level 1 — Basic Digital Presence: Adoption of QR/UPI payments, WhatsApp Business, or local online listings.', 'स्तर 1 — बुनियादी डिजिटल उपस्थिति: क्यूआर/यूपीआई भुगतान, व्हाट्सएप बिजनेस, या स्थानीय ऑनलाइन लिस्टिंग को अपनाना।'),
        (2, 'L2', 'Operational Digitalization', 'परिचालन डिजिटलीकरण', 'Level 2 — Operational Digitalization: Digital bookkeeping, structured inventory, active social commerce or e-commerce channel.', 'स्तर 2 — परिचालन डिजिटलीकरण: डिजिटल बहीखाता, संरचित इन्वेंट्री, सक्रिय सोशल कॉमर्स या ई-कॉमर्स चैनल।'),
        (3, 'L3', 'Growth-Oriented Digitalization', 'विकास-उन्मुख डिजिटलीकरण', 'Level 3 — Growth-Oriented Digitalization: Integrated ERP/CRM workflows, multi-channel selling, automated inventory sync, and data-informed decision making.', 'स्तर 3 — विकास-उन्मुख डिजिटलीकरण: एकीकृत ईआरपी/सीआरएम वर्कफ़्लो, मल्टी-चैनल बिक्री, स्वचालित इन्वेंट्री सिंक, और डेटा-आधारित निर्णय लेना।');
        """
    )
    op.execute("SET SQL_MODE=@OLD_SQL_MODE;")

    # ------------------------------------------------------------
    # 2. Business Categories Taxonomy (C2 Entity 2.3)
    # ------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS business_categories (
            id                  INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            parent_category_id  INT UNSIGNED NULL,
            name_en             VARCHAR(100) NOT NULL,
            name_hi             VARCHAR(100) NOT NULL,
            description_en      TEXT NULL,
            description_hi      TEXT NULL,
            is_active           BOOLEAN NOT NULL DEFAULT TRUE,
            created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id)
                REFERENCES business_categories(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    op.execute(
        """
        INSERT IGNORE INTO business_categories (id, name_en, name_hi, description_en, description_hi)
        VALUES
        (1, 'Retail & Trade', 'खुदरा एवं व्यापार', 'Retail stores, grocers, apparel, consumer goods', 'किराना, परिधान, खुदरा दुकान'),
        (2, 'Manufacturing & Handicrafts', 'विनिर्माण एवं हस्तशिल्प', 'Handlooms, textiles, small manufacturing, artisan goods', 'हथकरघा, वस्त्र, लघु निर्माण'),
        (3, 'Services & Consulting', 'सेवाएं एवं परामर्श', 'Repair services, professional services, salons, maintenance', 'मरम्मत, पेशेवर सेवाएं, सैलून'),
        (4, 'Food & Beverage', 'खाद्य एवं पेय', 'Restaurants, cafes, bakeries, sweet shops, catering', 'रेस्तरां, कैफे, बेकरी, मिठाई की दुकानें'),
        (5, 'General MSME', 'सामान्य एमएसएमई', 'Other micro, small and medium enterprises', 'अन्य सूक्ष्म, लघु एवं मध्यम उद्यम');
        """
    )

    # ------------------------------------------------------------
    # 3. Migrate Users Table (C2 Entity 2.2)
    # ------------------------------------------------------------
    op.execute("SET FOREIGN_KEY_CHECKS = 0;")
    op.execute("ALTER TABLE users MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;")
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_users_schema;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_users_schema()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'hashed_password') THEN
                ALTER TABLE users CHANGE COLUMN hashed_password password_hash VARCHAR(255) NOT NULL;
            END IF;
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone_number') THEN
                ALTER TABLE users CHANGE COLUMN phone_number phone VARCHAR(15) NULL;
            END IF;
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'preferred_language') THEN
                ALTER TABLE users ADD COLUMN preferred_language ENUM('en','hi') NOT NULL DEFAULT 'en' AFTER role;
            END IF;
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_verified') THEN
                ALTER TABLE users DROP COLUMN is_verified;
            END IF;
            ALTER TABLE users MODIFY COLUMN full_name VARCHAR(150) NOT NULL;
            ALTER TABLE users MODIFY COLUMN role ENUM('business_owner','consultant','admin','researcher') NOT NULL DEFAULT 'business_owner';
        END;
        """
    )
    op.execute("CALL _migrate_users_schema();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_users_schema;")
    op.execute("SET FOREIGN_KEY_CHECKS = 1;")

    # ------------------------------------------------------------
    # 4. Migrate Businesses Table (C2 Entity 2.4 - Preserving Existing MSME Data)
    # ------------------------------------------------------------
    op.execute("SET FOREIGN_KEY_CHECKS = 0;")
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_businesses_schema;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_businesses_schema()
        BEGIN
            ALTER TABLE businesses MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;

            -- Add new C2 columns if not yet present
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'businesses' AND COLUMN_NAME = 'owner_user_id') THEN
                ALTER TABLE businesses
                ADD COLUMN owner_user_id BIGINT UNSIGNED NULL AFTER id,
                ADD COLUMN category_id INT UNSIGNED NULL AFTER owner_user_id,
                ADD COLUMN business_name VARCHAR(200) NULL AFTER category_id,
                ADD COLUMN registration_number VARCHAR(50) NULL AFTER business_name,
                ADD COLUMN business_size ENUM('micro','small','medium') NULL AFTER registration_number,
                ADD COLUMN district VARCHAR(100) NULL AFTER state,
                ADD COLUMN city_town VARCHAR(100) NULL AFTER district,
                ADD COLUMN contact_phone VARCHAR(15) NULL AFTER pincode,
                ADD COLUMN contact_email VARCHAR(255) NULL AFTER contact_phone,
                ADD COLUMN years_in_operation SMALLINT UNSIGNED NULL AFTER contact_email,
                ADD COLUMN employee_count SMALLINT UNSIGNED NULL AFTER years_in_operation,
                ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER employee_count;

                -- Migrate existing Phase 1 data into new C2 columns
                IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'businesses' AND COLUMN_NAME = 'owner_id') THEN
                    UPDATE businesses
                    SET
                        owner_user_id = owner_id,
                        business_name = name,
                        business_size = LOWER(enterprise_size),
                        district = city,
                        city_town = city,
                        category_id = CASE
                            WHEN sector LIKE '%Handicraft%' OR sector LIKE '%Manufacturing%' THEN 2
                            WHEN sector LIKE '%Retail%' THEN 1
                            WHEN sector LIKE '%Food%' OR sector LIKE '%Beverage%' THEN 4
                            WHEN sector LIKE '%Service%' THEN 3
                            ELSE 5
                        END
                    WHERE owner_user_id IS NULL;

                    -- Drop legacy columns
                    ALTER TABLE businesses
                    DROP COLUMN owner_id,
                    DROP COLUMN name,
                    DROP COLUMN enterprise_size,
                    DROP COLUMN sector,
                    DROP COLUMN city,
                    DROP COLUMN description,
                    DROP COLUMN primary_language;
                END IF;

                -- Make mandatory columns NOT NULL and add constraints
                ALTER TABLE businesses
                MODIFY COLUMN owner_user_id BIGINT UNSIGNED NOT NULL,
                MODIFY COLUMN category_id INT UNSIGNED NOT NULL,
                MODIFY COLUMN business_name VARCHAR(200) NOT NULL,
                MODIFY COLUMN business_size ENUM('micro','small','medium') NOT NULL,
                MODIFY COLUMN district VARCHAR(100) NOT NULL,
                ADD UNIQUE KEY uq_business_registration (registration_number),
                ADD CONSTRAINT fk_business_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT,
                ADD CONSTRAINT fk_business_category FOREIGN KEY (category_id) REFERENCES business_categories(id) ON DELETE RESTRICT;

                CREATE INDEX idx_businesses_owner ON businesses(owner_user_id);
                CREATE INDEX idx_businesses_category ON businesses(category_id);
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_businesses_schema();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_businesses_schema;")
    op.execute("SET FOREIGN_KEY_CHECKS = 1;")

    # ------------------------------------------------------------
    # 5. Questions & Question Options (C2 Entity 2.5 & 2.6)
    # ------------------------------------------------------------
    op.create_table(
        'questions',
        sa.Column('id', INTEGER(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('question_code', sa.String(length=50), nullable=False),
        sa.Column('dimension_code', sa.String(length=50), nullable=False),
        sa.Column('question_text_en', sa.Text(), nullable=False),
        sa.Column('question_text_hi', sa.Text(), nullable=False),
        sa.Column('question_type', ENUM('single_choice', 'multi_choice', 'boolean', 'numeric', 'text'), nullable=False),
        sa.Column('applies_to_business_size', sa.String(length=100), nullable=True),
        sa.Column('display_order', SMALLINT(unsigned=True), server_default=sa.text('0'), nullable=False),
        sa.Column('version', INTEGER(unsigned=True), server_default=sa.text('1'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question_code', name='uq_question_code'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_questions_dimension', 'questions', ['dimension_code'])

    op.create_table(
        'question_options',
        sa.Column('id', INTEGER(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('question_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('option_code', sa.String(length=50), nullable=False),
        sa.Column('label_en', sa.String(length=255), nullable=False),
        sa.Column('label_hi', sa.String(length=255), nullable=False),
        sa.Column('score_value', sa.Numeric(precision=5, scale=2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('display_order', SMALLINT(unsigned=True), server_default=sa.text('0'), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE', name='fk_option_question'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('question_id', 'option_code', name='uq_question_option'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )

    # ------------------------------------------------------------
    # 6. Assessments, Assessment Answers, Assessment Scores (C2 2.7 - 2.9)
    # ------------------------------------------------------------
    op.create_table(
        'assessments',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('business_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('previous_assessment_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('question_bank_version', INTEGER(unsigned=True), server_default=sa.text('1'), nullable=False),
        sa.Column('language_used', ENUM('en', 'hi'), server_default='en', nullable=False),
        sa.Column('status', ENUM('in_progress', 'submitted', 'abandoned'), server_default='in_progress', nullable=False),
        sa.Column('started_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='RESTRICT', name='fk_assessment_business'),
        sa.ForeignKeyConstraint(['previous_assessment_id'], ['assessments.id'], ondelete='SET NULL', name='fk_assessment_previous'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_assessments_business_started', 'assessments', ['business_id', 'started_at'])

    op.create_table(
        'assessment_answers',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('assessment_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('question_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('selected_option_id', INTEGER(unsigned=True), nullable=True),
        sa.Column('numeric_answer', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('text_answer', sa.Text(), nullable=True),
        sa.Column('answered_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE', name='fk_answer_assessment'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='RESTRICT', name='fk_answer_question'),
        sa.ForeignKeyConstraint(['selected_option_id'], ['question_options.id'], ondelete='RESTRICT', name='fk_answer_option'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('assessment_id', 'question_id', name='uq_answer_assessment_question'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_assessment_answers_assessment', 'assessment_answers', ['assessment_id'])

    op.create_table(
        'assessment_scores',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('assessment_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('dimension_code', sa.String(length=50), nullable=False),
        sa.Column('raw_score', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('max_possible_score', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('computed_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('raw_score >= 0 AND raw_score <= max_possible_score', name='chk_score_range'),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE', name='fk_score_assessment'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('assessment_id', 'dimension_code', name='uq_score_assessment_dimension'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_assessment_scores_assessment', 'assessment_scores', ['assessment_id'])

    # ------------------------------------------------------------
    # 7. Rules and Recommendations (C2 2.10 - 2.12)
    # ------------------------------------------------------------
    op.create_table(
        'rules',
        sa.Column('id', INTEGER(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('rule_code', sa.String(length=50), nullable=False),
        sa.Column('version', INTEGER(unsigned=True), server_default=sa.text('1'), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('condition_json', JSON, nullable=False),
        sa.Column('target_rbdl_level', TINYINT(unsigned=True), nullable=False),
        sa.Column('priority', SMALLINT, server_default=sa.text('0'), nullable=False),
        sa.Column('rationale', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_by', BIGINT(unsigned=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL', name='fk_rule_creator'),
        sa.ForeignKeyConstraint(['target_rbdl_level'], ['rbdl_levels.id'], ondelete='RESTRICT', name='fk_rule_level'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('rule_code', 'version', name='uq_rule_code_version'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_rules_active_priority', 'rules', ['is_active', 'priority'])

    op.create_table(
        'recommendations',
        sa.Column('id', INTEGER(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('recommendation_code', sa.String(length=50), nullable=False),
        sa.Column('title_en', sa.String(length=255), nullable=False),
        sa.Column('title_hi', sa.String(length=255), nullable=False),
        sa.Column('description_en', sa.Text(), nullable=False),
        sa.Column('description_hi', sa.Text(), nullable=False),
        sa.Column('target_rbdl_level', TINYINT(unsigned=True), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('estimated_cost_level', ENUM('low', 'medium', 'high'), server_default='low', nullable=False),
        sa.Column('estimated_effort_level', ENUM('low', 'medium', 'high'), server_default='low', nullable=False),
        sa.Column('default_priority', SMALLINT, server_default=sa.text('0'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['target_rbdl_level'], ['rbdl_levels.id'], ondelete='RESTRICT', name='fk_recommendation_level'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('recommendation_code', name='uq_recommendation_code'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_recommendations_active_level', 'recommendations', ['is_active', 'target_rbdl_level'])

    op.create_table(
        'rule_recommendations',
        sa.Column('rule_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('recommendation_id', INTEGER(unsigned=True), nullable=False),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ondelete='CASCADE', name='fk_rr_recommendation'),
        sa.ForeignKeyConstraint(['rule_id'], ['rules.id'], ondelete='CASCADE', name='fk_rr_rule'),
        sa.PrimaryKeyConstraint('rule_id', 'recommendation_id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )

    # ------------------------------------------------------------
    # 8. ML Models (C2 2.19)
    # ------------------------------------------------------------
    op.create_table(
        'ml_models',
        sa.Column('id', INTEGER(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('version', sa.String(length=30), nullable=False),
        sa.Column('algorithm', sa.String(length=100), nullable=False),
        sa.Column('training_dataset_ref', sa.String(length=255), nullable=True),
        sa.Column('hyperparameters_json', JSON, nullable=True),
        sa.Column('metrics_json', JSON, nullable=True),
        sa.Column('artifact_path', sa.String(length=500), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('trained_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_name', 'version', name='uq_model_name_version'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )

    # ------------------------------------------------------------
    # 9. Classification Results, Evidence, Business Recommendations (C2 2.13-2.15, 2.20)
    # ------------------------------------------------------------
    op.create_table(
        'classification_results',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('assessment_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('method', ENUM('rule_based', 'ml'), nullable=False),
        sa.Column('rbdl_level', TINYINT(unsigned=True), nullable=False),
        sa.Column('confidence_score', sa.Numeric(precision=4, scale=3), nullable=True),
        sa.Column('ruleset_version', INTEGER(unsigned=True), nullable=True),
        sa.Column('ml_model_id', INTEGER(unsigned=True), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default=sa.text('0'), nullable=False),
        sa.Column('classified_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)', name='chk_confidence_range'),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE', name='fk_classification_assessment'),
        sa.ForeignKeyConstraint(['ml_model_id'], ['ml_models.id'], ondelete='RESTRICT', name='fk_classification_model'),
        sa.ForeignKeyConstraint(['rbdl_level'], ['rbdl_levels.id'], ondelete='RESTRICT', name='fk_classification_level'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_classification_results_assessment_primary', 'classification_results', ['assessment_id', 'is_primary'])

    op.create_table(
        'classification_evidence',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('classification_result_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('rule_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('rule_version_snapshot', INTEGER(unsigned=True), nullable=False),
        sa.Column('condition_snapshot_json', JSON, nullable=False),
        sa.Column('fired_order', SMALLINT(unsigned=True), nullable=False),
        sa.Column('matched_answers_snapshot_json', JSON, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['classification_result_id'], ['classification_results.id'], ondelete='CASCADE', name='fk_evidence_result'),
        sa.ForeignKeyConstraint(['rule_id'], ['rules.id'], ondelete='RESTRICT', name='fk_evidence_rule'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_classification_evidence_result', 'classification_evidence', ['classification_result_id'])

    op.create_table(
        'business_recommendations',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('business_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('classification_result_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('recommendation_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('rank_order', SMALLINT(unsigned=True), nullable=False),
        sa.Column('status', ENUM('suggested', 'accepted', 'dismissed'), server_default='suggested', nullable=False),
        sa.Column('generated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='RESTRICT', name='fk_bizrec_business'),
        sa.ForeignKeyConstraint(['classification_result_id'], ['classification_results.id'], ondelete='CASCADE', name='fk_bizrec_result'),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ondelete='RESTRICT', name='fk_bizrec_recommendation'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('classification_result_id', 'recommendation_id', name='uq_business_rec'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_business_recommendations_business_status', 'business_recommendations', ['business_id', 'status'])

    op.create_table(
        'ml_predictions',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('assessment_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('ml_model_id', INTEGER(unsigned=True), nullable=False),
        sa.Column('classification_result_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('predicted_rbdl_level', TINYINT(unsigned=True), nullable=False),
        sa.Column('confidence_score', sa.Numeric(precision=4, scale=3), nullable=False),
        sa.Column('feature_snapshot_json', JSON, nullable=False),
        sa.Column('predicted_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', name='chk_ml_confidence_range'),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE', name='fk_prediction_assessment'),
        sa.ForeignKeyConstraint(['classification_result_id'], ['classification_results.id'], ondelete='SET NULL', name='fk_prediction_result'),
        sa.ForeignKeyConstraint(['ml_model_id'], ['ml_models.id'], ondelete='RESTRICT', name='fk_prediction_model'),
        sa.ForeignKeyConstraint(['predicted_rbdl_level'], ['rbdl_levels.id'], ondelete='RESTRICT', name='fk_prediction_level'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_ml_predictions_assessment', 'ml_predictions', ['assessment_id'])

    # ------------------------------------------------------------
    # 10. Roadmaps, Roadmap Tasks, and Progress Logs (C2 2.16 - 2.18)
    # ------------------------------------------------------------
    op.create_table(
        'roadmaps',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('business_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('classification_result_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('version', INTEGER(unsigned=True), server_default=sa.text('1'), nullable=False),
        sa.Column('status', ENUM('active', 'superseded', 'completed'), server_default='active', nullable=False),
        sa.Column('generated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='RESTRICT', name='fk_roadmap_business'),
        sa.ForeignKeyConstraint(['classification_result_id'], ['classification_results.id'], ondelete='RESTRICT', name='fk_roadmap_result'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )

    op.create_table(
        'roadmap_tasks',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('roadmap_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('recommendation_id', INTEGER(unsigned=True), nullable=True),
        sa.Column('title_en', sa.String(length=255), nullable=False),
        sa.Column('title_hi', sa.String(length=255), nullable=False),
        sa.Column('phase_number', SMALLINT(unsigned=True), server_default=sa.text('1'), nullable=False),
        sa.Column('sequence_order', SMALLINT(unsigned=True), server_default=sa.text('0'), nullable=False),
        sa.Column('status', ENUM('pending', 'in_progress', 'completed', 'skipped'), server_default='pending', nullable=False),
        sa.Column('due_date_estimate', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ondelete='SET NULL', name='fk_task_recommendation'),
        sa.ForeignKeyConstraint(['roadmap_id'], ['roadmaps.id'], ondelete='CASCADE', name='fk_task_roadmap'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_roadmap_tasks_roadmap_status', 'roadmap_tasks', ['roadmap_id', 'status'])

    op.create_table(
        'progress_logs',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('roadmap_task_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('business_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('previous_status', ENUM('pending', 'in_progress', 'completed', 'skipped'), nullable=True),
        sa.Column('new_status', ENUM('pending', 'in_progress', 'completed', 'skipped'), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('logged_by_user_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('logged_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='RESTRICT', name='fk_progress_business'),
        sa.ForeignKeyConstraint(['logged_by_user_id'], ['users.id'], ondelete='SET NULL', name='fk_progress_logger'),
        sa.ForeignKeyConstraint(['roadmap_task_id'], ['roadmap_tasks.id'], ondelete='CASCADE', name='fk_progress_task'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_progress_logs_business_logged', 'progress_logs', ['business_id', 'logged_at'])

    # ------------------------------------------------------------
    # 11. Research Evaluation Records (C2 2.21)
    # ------------------------------------------------------------
    op.create_table(
        'research_evaluation_records',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('assessment_id', BIGINT(unsigned=True), nullable=False),
        sa.Column('rule_based_classification_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('ml_classification_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('levels_agree', sa.Boolean(), nullable=True),
        sa.Column('consultant_corrected_level', TINYINT(unsigned=True), nullable=True),
        sa.Column('corrected_by_user_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('corrected_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE', name='fk_research_assessment'),
        sa.ForeignKeyConstraint(['consultant_corrected_level'], ['rbdl_levels.id'], ondelete='RESTRICT', name='fk_research_corrected_level'),
        sa.ForeignKeyConstraint(['corrected_by_user_id'], ['users.id'], ondelete='SET NULL', name='fk_research_corrector'),
        sa.ForeignKeyConstraint(['ml_classification_id'], ['classification_results.id'], ondelete='SET NULL', name='fk_research_ml_result'),
        sa.ForeignKeyConstraint(['rule_based_classification_id'], ['classification_results.id'], ondelete='SET NULL', name='fk_research_rule_result'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )

    # ------------------------------------------------------------
    # 12. Governance: Audit Logs (C2 2.22)
    # ------------------------------------------------------------
    op.create_table(
        'audit_logs',
        sa.Column('id', BIGINT(unsigned=True), autoincrement=True, nullable=False),
        sa.Column('actor_user_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', BIGINT(unsigned=True), nullable=True),
        sa.Column('old_value_json', JSON, nullable=True),
        sa.Column('new_value_json', JSON, nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL', name='fk_audit_actor'),
        sa.PrimaryKeyConstraint('id'),
        mysql_engine='InnoDB',
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci',
    )
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity_type', 'entity_id'])
    op.create_index('idx_audit_logs_actor_created', 'audit_logs', ['actor_user_id', 'created_at'])

    # ------------------------------------------------------------
    # 13. Research Dataset SQL View (C2 Section 10 & 12.9)
    # ------------------------------------------------------------
    op.execute(
        """
        CREATE OR REPLACE VIEW research_dataset_view AS
        SELECT
            a.id            AS assessment_id,
            b.category_id,
            b.business_size,
            b.state,
            cr.method,
            cr.rbdl_level,
            cr.confidence_score,
            a.started_at,
            a.submitted_at
        FROM assessments a
        JOIN businesses b            ON a.business_id = b.id
        JOIN classification_results cr ON cr.assessment_id = a.id
        WHERE cr.is_primary = TRUE;
        """
    )


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS research_dataset_view;")
    op.execute("SET FOREIGN_KEY_CHECKS = 0;")
    op.execute("DROP TABLE IF EXISTS audit_logs;")
    op.execute("DROP TABLE IF EXISTS research_evaluation_records;")
    op.execute("DROP TABLE IF EXISTS progress_logs;")
    op.execute("DROP TABLE IF EXISTS roadmap_tasks;")
    op.execute("DROP TABLE IF EXISTS roadmaps;")
    op.execute("DROP TABLE IF EXISTS ml_predictions;")
    op.execute("DROP TABLE IF EXISTS business_recommendations;")
    op.execute("DROP TABLE IF EXISTS classification_evidence;")
    op.execute("DROP TABLE IF EXISTS classification_results;")
    op.execute("DROP TABLE IF EXISTS ml_models;")
    op.execute("DROP TABLE IF EXISTS rule_recommendations;")
    op.execute("DROP TABLE IF EXISTS recommendations;")
    op.execute("DROP TABLE IF EXISTS rules;")
    op.execute("DROP TABLE IF EXISTS assessment_scores;")
    op.execute("DROP TABLE IF EXISTS assessment_answers;")
    op.execute("DROP TABLE IF EXISTS assessments;")
    op.execute("DROP TABLE IF EXISTS question_options;")
    op.execute("DROP TABLE IF EXISTS questions;")
    op.execute("DROP TABLE IF EXISTS businesses;")
    op.execute("DROP TABLE IF EXISTS business_categories;")
    op.execute("DROP TABLE IF EXISTS users;")
    op.execute("DROP TABLE IF EXISTS rbdl_levels;")
    op.execute("SET FOREIGN_KEY_CHECKS = 1;")
