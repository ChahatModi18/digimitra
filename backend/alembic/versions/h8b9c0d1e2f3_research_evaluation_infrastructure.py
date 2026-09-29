"""Phase 8: Research Evaluation Infrastructure Schema (Additive).

Revision ID: h8b9c0d1e2f3
Revises: g7a8b9c0d1e2
Create Date: 2026-09-29 14:15:00.000000

Adds tables supporting C8/A11 Research Evaluation Infrastructure:
- research_studies
- research_participants
- consultant_profiles
- blinded_evaluation_packets
- consultant_evaluations
- test_retest_linkages
- recommendation_ablation_evaluations
- cognitive_interview_records
- comprehension_study_records
- research_experiments
- research_dataset_snapshots
- reproducibility_manifests
"""
from typing import Sequence, Union
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "h8b9c0d1e2f3"
down_revision: Union[str, None] = "g7a8b9c0d1e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. research_studies
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS research_studies (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_code VARCHAR(50) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            protocol_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
            description TEXT NULL,
            instrument_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            rbdl_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            question_bank_version INT NOT NULL DEFAULT 1,
            requirement_profile_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            recommendation_rules_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX idx_rs_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 2. research_participants
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS research_participants (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            business_id BIGINT UNSIGNED NULL,
            participant_code VARCHAR(50) NOT NULL UNIQUE,
            consent_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
            consent_timestamp DATETIME NULL,
            consent_version VARCHAR(20) NULL,
            language VARCHAR(10) NOT NULL DEFAULT 'en',
            respondent_role VARCHAR(50) NOT NULL DEFAULT 'owner',
            withdrawal_reason TEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            CONSTRAINT fk_rp_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_rp_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE SET NULL,
            INDEX idx_rp_study (study_id),
            INDEX idx_rp_business (business_id),
            INDEX idx_rp_consent (consent_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 3. consultant_profiles
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS consultant_profiles (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL UNIQUE,
            rater_code VARCHAR(50) NOT NULL UNIQUE,
            professional_years_experience INT NOT NULL DEFAULT 0,
            sector_specialization VARCHAR(100) NULL,
            language_capabilities_json JSON NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            conflict_of_interest_declared BOOLEAN NOT NULL DEFAULT FALSE,
            conflict_of_interest_details TEXT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 4. blinded_evaluation_packets
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS blinded_evaluation_packets (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            source_assessment_id BIGINT UNSIGNED NOT NULL,
            packet_code VARCHAR(50) NOT NULL UNIQUE,
            packet_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            randomized_order INT NOT NULL DEFAULT 0,
            status VARCHAR(30) NOT NULL DEFAULT 'UNASSIGNED',
            assigned_consultant_id BIGINT UNSIGNED NULL,
            sanitized_case_data_json JSON NOT NULL,
            assigned_at DATETIME NULL,
            submitted_at DATETIME NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_bep_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_bep_assessment FOREIGN KEY (source_assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            CONSTRAINT fk_bep_consultant FOREIGN KEY (assigned_consultant_id) REFERENCES users (id) ON DELETE SET NULL,
            INDEX idx_bep_study (study_id),
            INDEX idx_bep_assessment (source_assessment_id),
            INDEX idx_bep_consultant (assigned_consultant_id),
            INDEX idx_bep_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 5. consultant_evaluations
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS consultant_evaluations (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            packet_id BIGINT UNSIGNED NOT NULL,
            consultant_user_id BIGINT UNSIGNED NOT NULL,
            study_id BIGINT UNSIGNED NOT NULL,
            assigned_rbdl_level TINYINT UNSIGNED NOT NULL,
            primary_gap_dimension VARCHAR(50) NULL,
            confidence_score TINYINT UNSIGNED NOT NULL DEFAULT 3,
            requirement_profile_ratings_json JSON NULL,
            recommendation_ratings_json JSON NULL,
            rationales TEXT NULL,
            review_duration_seconds INT NULL,
            submitted_at DATETIME NOT NULL,
            CONSTRAINT fk_ce_packet FOREIGN KEY (packet_id) REFERENCES blinded_evaluation_packets (id) ON DELETE CASCADE,
            CONSTRAINT fk_ce_consultant FOREIGN KEY (consultant_user_id) REFERENCES users (id) ON DELETE RESTRICT,
            CONSTRAINT fk_ce_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            INDEX idx_ce_packet (packet_id),
            INDEX idx_ce_consultant (consultant_user_id),
            INDEX idx_ce_study (study_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 6. test_retest_linkages
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS test_retest_linkages (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            participant_id BIGINT UNSIGNED NULL,
            baseline_assessment_id BIGINT UNSIGNED NOT NULL,
            retest_assessment_id BIGINT UNSIGNED NOT NULL,
            planned_interval_days INT NOT NULL DEFAULT 14,
            actual_interval_hours FLOAT NULL,
            reassessment_reason VARCHAR(100) NULL,
            intervention_occurred BOOLEAN NOT NULL DEFAULT FALSE,
            instrument_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            language VARCHAR(10) NOT NULL DEFAULT 'en',
            validity_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
            exclusion_reason TEXT NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_trl_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_trl_participant FOREIGN KEY (participant_id) REFERENCES research_participants (id) ON DELETE CASCADE,
            CONSTRAINT fk_trl_baseline FOREIGN KEY (baseline_assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            CONSTRAINT fk_trl_retest FOREIGN KEY (retest_assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            INDEX idx_trl_study (study_id),
            INDEX idx_trl_status (validity_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 7. recommendation_ablation_evaluations
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS recommendation_ablation_evaluations (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            assessment_id BIGINT UNSIGNED NOT NULL,
            evaluator_user_id BIGINT UNSIGNED NOT NULL,
            presentation_order VARCHAR(30) NOT NULL DEFAULT 'MODEL_A_FIRST',
            arm_a_recommendations_json JSON NOT NULL,
            arm_b_recommendations_json JSON NOT NULL,
            arm_a_ratings_json JSON NULL,
            arm_b_ratings_json JSON NULL,
            preferred_arm VARCHAR(20) NULL,
            evaluator_comments TEXT NULL,
            submitted_at DATETIME NOT NULL,
            CONSTRAINT fk_rae_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_rae_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            CONSTRAINT fk_rae_evaluator FOREIGN KEY (evaluator_user_id) REFERENCES users (id) ON DELETE RESTRICT,
            INDEX idx_rae_study (study_id),
            INDEX idx_rae_assessment (assessment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 8. cognitive_interview_records
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS cognitive_interview_records (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            participant_code VARCHAR(50) NOT NULL,
            language VARCHAR(10) NOT NULL DEFAULT 'hi',
            instrument_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            interview_date DATETIME NOT NULL,
            interviewer_name VARCHAR(100) NOT NULL,
            item_code VARCHAR(50) NOT NULL,
            comprehension_issue BOOLEAN NOT NULL DEFAULT FALSE,
            retrieval_issue BOOLEAN NOT NULL DEFAULT FALSE,
            judgment_issue BOOLEAN NOT NULL DEFAULT FALSE,
            response_issue BOOLEAN NOT NULL DEFAULT FALSE,
            translation_drift_notes TEXT NULL,
            interviewer_notes TEXT NULL,
            resolution_status VARCHAR(30) NOT NULL DEFAULT 'OBSERVED',
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_cir_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            INDEX idx_cir_study (study_id),
            INDEX idx_cir_item (item_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 9. comprehension_study_records
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS comprehension_study_records (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            participant_code VARCHAR(50) NOT NULL,
            displayed_traceability_version VARCHAR(30) NOT NULL DEFAULT '1.0',
            comprehension_question_code VARCHAR(50) NOT NULL,
            expected_answer TEXT NOT NULL,
            participant_answer TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL DEFAULT FALSE,
            task_completion_time_seconds INT NULL,
            usability_rating TINYINT UNSIGNED NULL,
            sus_responses_json JSON NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_csr_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            INDEX idx_csr_study (study_id),
            INDEX idx_csr_question (comprehension_question_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 10. research_experiments
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS research_experiments (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            experiment_code VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            protocol_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            experiment_type VARCHAR(50) NOT NULL,
            parameters_json JSON NULL,
            analysis_method VARCHAR(100) NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'CONFIGURED',
            analyst_user_id BIGINT UNSIGNED NULL,
            execution_timestamp DATETIME NULL,
            code_commit_hash VARCHAR(50) NULL,
            result_artifact_uri VARCHAR(255) NULL,
            output_hash VARCHAR(64) NULL,
            metrics_summary_json JSON NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_re_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_re_analyst FOREIGN KEY (analyst_user_id) REFERENCES users (id) ON DELETE SET NULL,
            INDEX idx_re_study (study_id),
            INDEX idx_re_code (experiment_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 11. research_dataset_snapshots
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS research_dataset_snapshots (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NOT NULL,
            snapshot_code VARCHAR(50) NOT NULL UNIQUE,
            dataset_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            source_population_description TEXT NULL,
            record_count INT NOT NULL DEFAULT 0,
            anonymization_status VARCHAR(30) NOT NULL DEFAULT 'PSEUDONYMIZED',
            k_anonymity_achieved INT NULL,
            instrument_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            rbdl_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            recommendation_version VARCHAR(50) NOT NULL DEFAULT '1.0',
            code_commit_hash VARCHAR(50) NOT NULL,
            checksum_sha256 VARCHAR(64) NOT NULL,
            storage_path VARCHAR(255) NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
            created_by_user_id BIGINT UNSIGNED NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_rds_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE CASCADE,
            CONSTRAINT fk_rds_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
            INDEX idx_rds_study (study_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 12. reproducibility_manifests
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS reproducibility_manifests (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            study_id BIGINT UNSIGNED NULL,
            manifest_code VARCHAR(50) NOT NULL UNIQUE,
            git_commit_hash VARCHAR(50) NOT NULL,
            application_version VARCHAR(50) NOT NULL,
            migration_version VARCHAR(50) NOT NULL,
            python_version VARCHAR(50) NOT NULL,
            platform VARCHAR(100) NOT NULL,
            database_dialect VARCHAR(30) NOT NULL,
            dependency_versions_json JSON NULL,
            instrument_versions_json JSON NOT NULL,
            random_seed INT NULL,
            manifest_sha256 VARCHAR(64) NOT NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_rm_study FOREIGN KEY (study_id) REFERENCES research_studies (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS reproducibility_manifests;")
    op.execute("DROP TABLE IF EXISTS research_dataset_snapshots;")
    op.execute("DROP TABLE IF EXISTS research_experiments;")
    op.execute("DROP TABLE IF EXISTS comprehension_study_records;")
    op.execute("DROP TABLE IF EXISTS cognitive_interview_records;")
    op.execute("DROP TABLE IF EXISTS recommendation_ablation_evaluations;")
    op.execute("DROP TABLE IF EXISTS test_retest_linkages;")
    op.execute("DROP TABLE IF EXISTS consultant_evaluations;")
    op.execute("DROP TABLE IF EXISTS blinded_evaluation_packets;")
    op.execute("DROP TABLE IF EXISTS consultant_profiles;")
    op.execute("DROP TABLE IF EXISTS research_participants;")
    op.execute("DROP TABLE IF EXISTS research_studies;")
