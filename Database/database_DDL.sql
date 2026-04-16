-- public.domains definition

-- Drop table

-- DROP TABLE public.domains;

CREATE TABLE public.domains (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT domains_name_key UNIQUE (name),
	CONSTRAINT domains_pkey PRIMARY KEY (id)
);


-- public.institution_types definition

-- Drop table

-- DROP TABLE public.institution_types;

CREATE TABLE public.institution_types (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT institution_types_name_key UNIQUE (name),
	CONSTRAINT institution_types_pkey PRIMARY KEY (id)
);


-- public.resource_types definition

-- Drop table

-- DROP TABLE public.resource_types;

CREATE TABLE public.resource_types (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	slug text NOT NULL,
	icon_key text NULL,
	allowed_formats _text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT resource_types_name_key UNIQUE (name),
	CONSTRAINT resource_types_pkey PRIMARY KEY (id),
	CONSTRAINT resource_types_slug_key UNIQUE (slug)
);


-- public.roles definition

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	CONSTRAINT roles_name_key UNIQUE (name),
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	full_name text NULL,
	email text NOT NULL,
	password_hash text NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	points int4 DEFAULT 0 NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trg_users_set_updated_at before
update
    on
    public.users for each row execute function sp_user_set_updated_at();


-- public.audit_logs definition

-- Drop table

-- DROP TABLE public.audit_logs;

CREATE TABLE public.audit_logs (
	id bigserial NOT NULL,
	user_id uuid NULL,
	"action" text NOT NULL,
	"resource_type" text NULL,
	resource_id text NULL,
	old_value jsonb NULL,
	new_value jsonb NULL,
	ip inet NULL,
	user_agent text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
	CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


-- public.institutions definition

-- Drop table

-- DROP TABLE public.institutions;

CREATE TABLE public.institutions (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	institution_type_id int8 NOT NULL,
	country text NULL,
	city text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT institutions_name_country_city_key UNIQUE (name, country, city),
	CONSTRAINT institutions_pkey PRIMARY KEY (id),
	CONSTRAINT institutions_institution_type_id_fkey FOREIGN KEY (institution_type_id) REFERENCES public.institution_types(id)
);


-- public.password_reset_tokens definition

-- Drop table

-- DROP TABLE public.password_reset_tokens;

CREATE TABLE public.password_reset_tokens (
	id bigserial NOT NULL,
	user_id uuid NOT NULL,
	token_hash text NOT NULL,
	expires_at timestamptz NOT NULL,
	used_at timestamptz NULL,
	created_ip inet NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_password_reset_tokens_active ON public.password_reset_tokens USING btree (user_id) WHERE (used_at IS NULL);
CREATE INDEX idx_password_reset_tokens_user_expires ON public.password_reset_tokens USING btree (user_id, expires_at DESC);
CREATE UNIQUE INDEX uq_password_reset_tokens_hash ON public.password_reset_tokens USING btree (token_hash);


-- public.programs definition

-- Drop table

-- DROP TABLE public.programs;

CREATE TABLE public.programs (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	domain_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT programs_domain_id_name_key UNIQUE (domain_id, name),
	CONSTRAINT programs_pkey PRIMARY KEY (id),
	CONSTRAINT programs_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id)
);


-- public.resource_rejections definition

-- Drop table

-- DROP TABLE public.resource_rejections;

CREATE TABLE public.resource_rejections (
	id bigserial NOT NULL,
	resource_id_original int8 NULL,
	uploader_id uuid NOT NULL,
	rejected_by uuid NOT NULL,
	reason text NOT NULL,
	resource_title text NOT NULL,
	resource_url text NULL,
	"resource_format" text NULL,
	"resource_educational_type" text NULL,
	resource_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT resource_rejections_pkey PRIMARY KEY (id),
	CONSTRAINT resource_rejections_reason_length CHECK ((char_length(TRIM(BOTH FROM reason)) >= 5)),
	CONSTRAINT resource_rejections_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT resource_rejections_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_resource_rejections_original_id ON public.resource_rejections USING btree (resource_id_original);
CREATE INDEX idx_resource_rejections_reviewer_created_at ON public.resource_rejections USING btree (rejected_by, created_at DESC);
CREATE INDEX idx_resource_rejections_uploader_created_at ON public.resource_rejections USING btree (uploader_id, created_at DESC);


-- public.resources definition

-- Drop table

-- DROP TABLE public.resources;

CREATE TABLE public.resources (
	id bigserial NOT NULL,
	title text NOT NULL,
	description text NULL,
	status public."resource_status" DEFAULT 'draft'::resource_status NOT NULL,
	url text NULL,
	"language" text NULL,
	license text NULL,
	created_by uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	educational_type public."resource_educational_type" NULL,
	format public."resource_format" NULL,
	resource_type_id int4 NULL,
	metadata jsonb DEFAULT '{}'::jsonb NULL,
	storage_provider text NULL,
	bucket text NULL,
	object_key text NULL,
	mime_type text NULL,
	size_bytes int8 NULL,
	checksum text NULL,
	original_filename text NULL,
	is_public bool DEFAULT false NULL,
	upload_status text DEFAULT 'uploaded'::text NULL,
	CONSTRAINT resources_pkey PRIMARY KEY (id),
	CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT resources_resource_type_id_fkey FOREIGN KEY (resource_type_id) REFERENCES public.resource_types(id)
);
CREATE INDEX idx_resources_created_at ON public.resources USING btree (created_at DESC);
CREATE INDEX idx_resources_created_by ON public.resources USING btree (created_by);
CREATE INDEX idx_resources_created_by_status ON public.resources USING btree (created_by, status);
CREATE INDEX idx_resources_created_by_type ON public.resources USING btree (created_by, resource_type_id);
CREATE INDEX idx_resources_educational_type ON public.resources USING btree (educational_type);
CREATE INDEX idx_resources_format ON public.resources USING btree (format);
CREATE INDEX idx_resources_object_key ON public.resources USING btree (object_key);
CREATE INDEX idx_resources_status ON public.resources USING btree (status);

-- Table Triggers

create trigger trg_resources_set_updated_at before
update
    on
    public.resources for each row execute function sp_resource_set_updated_at();


-- public.tags definition

-- Drop table

-- DROP TABLE public.tags;

CREATE TABLE public.tags (
	id bigserial NOT NULL,
	"name" text NOT NULL,
	slug text NOT NULL,
	category text DEFAULT 'topic'::text NOT NULL,
	description text NULL,
	is_active bool DEFAULT true NOT NULL,
	created_by uuid NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT tags_name_length CHECK ((char_length(TRIM(BOTH FROM name)) >= 2)),
	CONSTRAINT tags_pkey PRIMARY KEY (id),
	CONSTRAINT tags_slug_length CHECK ((char_length(TRIM(BOTH FROM slug)) >= 2)),
	CONSTRAINT tags_slug_unique UNIQUE (slug),
	CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_tags_category_active ON public.tags USING btree (category, is_active);
CREATE INDEX idx_tags_name ON public.tags USING btree (name);
CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);

-- Table Triggers

create trigger trg_tags_set_updated_at before
update
    on
    public.tags for each row execute function sp_tag_set_updated_at();


-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	user_id uuid NOT NULL,
	role_id int8 NOT NULL,
	assigned_at timestamptz DEFAULT now() NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
	CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
	CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_roles_composite ON public.user_roles USING btree (user_id, role_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


-- public.user_settings definition

-- Drop table

-- DROP TABLE public.user_settings;

CREATE TABLE public.user_settings (
	user_id uuid NOT NULL,
	theme_mode text DEFAULT 'light'::text NOT NULL,
	font_size text DEFAULT 'medium'::text NOT NULL,
	"language" text DEFAULT 'en'::text NOT NULL,
	timezone text DEFAULT 'Africa/Casablanca'::text NOT NULL,
	date_format text DEFAULT 'DD/MM/YYYY'::text NOT NULL,
	email_notifications bool DEFAULT true NOT NULL,
	push_notifications bool DEFAULT true NOT NULL,
	resource_alerts bool DEFAULT true NOT NULL,
	weekly_digest bool DEFAULT false NOT NULL,
	show_activity_status bool DEFAULT true NOT NULL,
	show_profile bool DEFAULT true NOT NULL,
	two_factor_enabled bool DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
	CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trg_user_settings_set_updated_at before
update
    on
    public.user_settings for each row execute function sp_user_settings_set_updated_at();


-- public.favorites definition

-- Drop table

-- DROP TABLE public.favorites;

CREATE TABLE public.favorites (
	user_id uuid NOT NULL,
	resource_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT favorites_pkey PRIMARY KEY (user_id, resource_id),
	CONSTRAINT favorites_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_favorites_resource_created_by ON public.favorites USING btree (resource_id);
CREATE INDEX idx_favorites_resource_id ON public.favorites USING btree (resource_id);
CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);
CREATE INDEX idx_favorites_user_resource ON public.favorites USING btree (user_id, resource_id);


-- public.institution_programs definition

-- Drop table

-- DROP TABLE public.institution_programs;

CREATE TABLE public.institution_programs (
	institution_id int8 NOT NULL,
	program_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT institution_programs_pkey PRIMARY KEY (institution_id, program_id),
	CONSTRAINT institution_programs_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE,
	CONSTRAINT institution_programs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE
);


-- public.levels definition

-- Drop table

-- DROP TABLE public.levels;

CREATE TABLE public.levels (
	id bigserial NOT NULL,
	program_id int8 NOT NULL,
	"name" text NOT NULL,
	sort_order int4 DEFAULT 1 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT levels_pkey PRIMARY KEY (id),
	CONSTRAINT levels_program_id_name_key UNIQUE (program_id, name),
	CONSTRAINT levels_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE CASCADE
);


-- public.ratings definition

-- Drop table

-- DROP TABLE public.ratings;

CREATE TABLE public.ratings (
	user_id uuid NOT NULL,
	resource_id int8 NOT NULL,
	score int4 NOT NULL,
	"comment" text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT ratings_pkey PRIMARY KEY (user_id, resource_id),
	CONSTRAINT ratings_score_check CHECK (((score >= 1) AND (score <= 5))),
	CONSTRAINT ratings_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_ratings_resource_created_by ON public.ratings USING btree (resource_id);
CREATE INDEX idx_ratings_resource_id ON public.ratings USING btree (resource_id);
CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);


-- public.resource_confusion_signals definition

-- Drop table

-- DROP TABLE public.resource_confusion_signals;

CREATE TABLE public.resource_confusion_signals (
	id bigserial NOT NULL,
	resource_id int8 NOT NULL,
	user_id uuid NOT NULL,
	note text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT resource_confusion_note_length CHECK (((note IS NULL) OR (char_length(TRIM(BOTH FROM note)) >= 3))),
	CONSTRAINT resource_confusion_signals_pkey PRIMARY KEY (id),
	CONSTRAINT resource_confusion_signals_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT resource_confusion_signals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_confusion_created_at ON public.resource_confusion_signals USING btree (created_at DESC);
CREATE INDEX idx_confusion_resource_created_at ON public.resource_confusion_signals USING btree (resource_id, created_at DESC);
CREATE INDEX idx_confusion_user_resource_created_at ON public.resource_confusion_signals USING btree (user_id, resource_id, created_at DESC);


-- public.resource_downloads definition

-- Drop table

-- DROP TABLE public.resource_downloads;

CREATE TABLE public.resource_downloads (
	id bigserial NOT NULL,
	user_id uuid NOT NULL,
	resource_id int8 NOT NULL,
	downloaded_at timestamptz DEFAULT now() NULL,
	CONSTRAINT resource_downloads_pkey PRIMARY KEY (id),
	CONSTRAINT unique_user_resource_download UNIQUE (user_id, resource_id),
	CONSTRAINT resource_downloads_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT resource_downloads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);


-- public.resource_tags definition

-- Drop table

-- DROP TABLE public.resource_tags;

CREATE TABLE public.resource_tags (
	resource_id int8 NOT NULL,
	tag_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT resource_tags_pkey PRIMARY KEY (resource_id, tag_id),
	CONSTRAINT resource_tags_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT resource_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE
);
CREATE INDEX idx_resource_tags_resource ON public.resource_tags USING btree (resource_id);
CREATE INDEX idx_resource_tags_tag ON public.resource_tags USING btree (tag_id);


-- public.semesters definition

-- Drop table

-- DROP TABLE public.semesters;

CREATE TABLE public.semesters (
	id bigserial NOT NULL,
	level_id int8 NOT NULL,
	"name" text NOT NULL,
	sort_order int4 DEFAULT 1 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT semesters_level_id_name_key UNIQUE (level_id, name),
	CONSTRAINT semesters_pkey PRIMARY KEY (id),
	CONSTRAINT semesters_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE
);


-- public.student_profiles definition

-- Drop table

-- DROP TABLE public.student_profiles;

CREATE TABLE public.student_profiles (
	user_id uuid NOT NULL,
	institution_id int8 NULL,
	program_id int8 NULL,
	current_semester_id int8 NULL,
	contribution_mode text DEFAULT 'contributor'::text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT student_profiles_contribution_mode_check CHECK ((contribution_mode = ANY (ARRAY['learner'::text, 'contributor'::text]))),
	CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id),
	CONSTRAINT student_profiles_current_semester_id_fkey FOREIGN KEY (current_semester_id) REFERENCES public.semesters(id),
	CONSTRAINT student_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
	CONSTRAINT student_profiles_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
	CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_student_profiles_current_semester_id ON public.student_profiles USING btree (current_semester_id);
CREATE INDEX idx_student_profiles_institution_id ON public.student_profiles USING btree (institution_id);
CREATE INDEX idx_student_profiles_program_id ON public.student_profiles USING btree (program_id);

-- Table Triggers

create trigger trg_student_profiles_set_updated_at before
update
    on
    public.student_profiles for each row execute function sp_student_profile_set_updated_at();


-- public.modules definition

-- Drop table

-- DROP TABLE public.modules;

CREATE TABLE public.modules (
	id bigserial NOT NULL,
	semester_id int8 NOT NULL,
	code text NULL,
	title text NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT modules_pkey PRIMARY KEY (id),
	CONSTRAINT modules_semester_id_title_key UNIQUE (semester_id, title),
	CONSTRAINT modules_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id) ON DELETE CASCADE
);


-- public.qa_questions definition

-- Drop table

-- DROP TABLE public.qa_questions;

CREATE TABLE public.qa_questions (
	id bigserial NOT NULL,
	module_id int8 NOT NULL,
	resource_id int8 NOT NULL,
	user_id uuid NOT NULL,
	title text NOT NULL,
	body text NOT NULL,
	is_anonymous bool DEFAULT false NOT NULL,
	status public."qa_question_status" DEFAULT 'open'::qa_question_status NOT NULL,
	moderation_status public."qa_moderation_status" DEFAULT 'active'::qa_moderation_status NOT NULL,
	moderated_by uuid NULL,
	moderated_at timestamptz NULL,
	moderation_reason text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT qa_questions_body_length CHECK ((char_length(TRIM(BOTH FROM body)) >= 10)),
	CONSTRAINT qa_questions_moderation_reason_check CHECK (((moderation_status = 'active'::qa_moderation_status) OR (moderation_reason IS NOT NULL))),
	CONSTRAINT qa_questions_pkey PRIMARY KEY (id),
	CONSTRAINT qa_questions_title_length CHECK ((char_length(TRIM(BOTH FROM title)) >= 5)),
	CONSTRAINT qa_questions_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT qa_questions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE RESTRICT,
	CONSTRAINT qa_questions_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE SET NULL,
	CONSTRAINT qa_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_qa_questions_created_at ON public.qa_questions USING btree (created_at DESC);
CREATE INDEX idx_qa_questions_moderation_status ON public.qa_questions USING btree (moderation_status);
CREATE INDEX idx_qa_questions_module_id ON public.qa_questions USING btree (module_id);
CREATE INDEX idx_qa_questions_resource_id ON public.qa_questions USING btree (resource_id);
CREATE INDEX idx_qa_questions_status ON public.qa_questions USING btree (status);
CREATE INDEX idx_qa_questions_user_id ON public.qa_questions USING btree (user_id, created_at DESC);

-- Table Triggers

create trigger trg_qa_question_validate_resource_module_link before
insert
    or
update
    of module_id,
    resource_id on
    public.qa_questions for each row execute function trg_validate_qa_question_resource_module_link();
create trigger trg_qa_questions_set_updated_at before
update
    on
    public.qa_questions for each row execute function set_updated_at_column();


-- public.resource_module_map definition

-- Drop table

-- DROP TABLE public.resource_module_map;

CREATE TABLE public.resource_module_map (
	module_id int8 NOT NULL,
	resource_id int8 NOT NULL,
	chapter text NULL,
	exam_related bool DEFAULT false NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	difficulty public."difficulty_level" NULL,
	CONSTRAINT resource_module_map_pkey PRIMARY KEY (module_id, resource_id),
	CONSTRAINT resource_module_map_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE,
	CONSTRAINT resource_module_map_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE
);


-- public.qa_answers definition

-- Drop table

-- DROP TABLE public.qa_answers;

CREATE TABLE public.qa_answers (
	id bigserial NOT NULL,
	question_id int8 NOT NULL,
	user_id uuid NOT NULL,
	body text NOT NULL,
	explanation text NULL,
	example text NULL,
	is_official bool DEFAULT false NOT NULL,
	is_accepted bool DEFAULT false NOT NULL,
	accepted_by uuid NULL,
	accepted_at timestamptz NULL,
	moderation_status public."qa_moderation_status" DEFAULT 'active'::qa_moderation_status NOT NULL,
	moderated_by uuid NULL,
	moderated_at timestamptz NULL,
	moderation_reason text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT qa_answers_body_length CHECK ((char_length(TRIM(BOTH FROM body)) >= 10)),
	CONSTRAINT qa_answers_moderation_reason_check CHECK (((moderation_status = 'active'::qa_moderation_status) OR (moderation_reason IS NOT NULL))),
	CONSTRAINT qa_answers_pkey PRIMARY KEY (id),
	CONSTRAINT qa_official_requires_example CHECK (((NOT is_official) OR ((example IS NOT NULL) AND (char_length(TRIM(BOTH FROM example)) >= 10)))),
	CONSTRAINT qa_official_requires_explanation CHECK (((NOT is_official) OR ((explanation IS NOT NULL) AND (char_length(TRIM(BOTH FROM explanation)) >= 50)))),
	CONSTRAINT qa_answers_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT qa_answers_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT qa_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.qa_questions(id) ON DELETE CASCADE,
	CONSTRAINT qa_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_qa_answers_created_at ON public.qa_answers USING btree (created_at DESC);
CREATE INDEX idx_qa_answers_is_official ON public.qa_answers USING btree (is_official);
CREATE INDEX idx_qa_answers_moderation_status ON public.qa_answers USING btree (moderation_status);
CREATE INDEX idx_qa_answers_question_id ON public.qa_answers USING btree (question_id);
CREATE INDEX idx_qa_answers_user_id ON public.qa_answers USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX uq_qa_answers_one_accepted_per_question ON public.qa_answers USING btree (question_id) WHERE (is_accepted = true);

-- Table Triggers

create trigger trg_qa_answers_set_updated_at before
update
    on
    public.qa_answers for each row execute function set_updated_at_column();


-- public.qa_comments definition

-- Drop table

-- DROP TABLE public.qa_comments;

CREATE TABLE public.qa_comments (
	id bigserial NOT NULL,
	question_id int8 NULL,
	answer_id int8 NULL,
	user_id uuid NOT NULL,
	body text NOT NULL,
	moderation_status public."qa_moderation_status" DEFAULT 'active'::qa_moderation_status NOT NULL,
	moderated_by uuid NULL,
	moderated_at timestamptz NULL,
	moderation_reason text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT qa_comments_body_length CHECK ((char_length(TRIM(BOTH FROM body)) >= 2)),
	CONSTRAINT qa_comments_moderation_reason_check CHECK (((moderation_status = 'active'::qa_moderation_status) OR (moderation_reason IS NOT NULL))),
	CONSTRAINT qa_comments_pkey PRIMARY KEY (id),
	CONSTRAINT qa_comments_target_check CHECK ((((question_id IS NOT NULL) AND (answer_id IS NULL)) OR ((question_id IS NULL) AND (answer_id IS NOT NULL)))),
	CONSTRAINT qa_comments_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.qa_answers(id) ON DELETE CASCADE,
	CONSTRAINT qa_comments_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT qa_comments_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.qa_questions(id) ON DELETE CASCADE,
	CONSTRAINT qa_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_qa_comments_answer_id ON public.qa_comments USING btree (answer_id, created_at);
CREATE INDEX idx_qa_comments_moderation_status ON public.qa_comments USING btree (moderation_status);
CREATE INDEX idx_qa_comments_question_id ON public.qa_comments USING btree (question_id, created_at);
CREATE INDEX idx_qa_comments_user_id ON public.qa_comments USING btree (user_id, created_at DESC);

-- Table Triggers

create trigger trg_qa_comments_set_updated_at before
update
    on
    public.qa_comments for each row execute function set_updated_at_column();


-- public.confusion_case_status enum definition

-- DROP TYPE public.confusion_case_status;

CREATE TYPE public.confusion_case_status AS ENUM (
	'nouveau',
	'assigne',
	'en_cours',
	'repondu_officiel',
	'resolu'
);


-- public.confusion_case_priority enum definition

-- DROP TYPE public.confusion_case_priority;

CREATE TYPE public.confusion_case_priority AS ENUM (
	'basse',
	'normale',
	'haute',
	'critique'
);


-- public.module_staff_assignments definition

-- Drop table

-- DROP TABLE public.module_staff_assignments;

CREATE TABLE public.module_staff_assignments (
	id bigserial NOT NULL,
	module_id int8 NOT NULL,
	user_id uuid NOT NULL,
	assignment_role text NOT NULL,
	is_primary bool DEFAULT false NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT module_staff_assignments_assignment_role_check CHECK ((assignment_role = ANY (ARRAY['teacher_referent'::text, 'admin_referent'::text]))),
	CONSTRAINT module_staff_assignments_module_id_user_id_assignment_role_key UNIQUE (module_id, user_id, assignment_role),
	CONSTRAINT module_staff_assignments_pkey PRIMARY KEY (id),
	CONSTRAINT module_staff_assignments_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE,
	CONSTRAINT module_staff_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_module_staff_module_role_active ON public.module_staff_assignments USING btree (module_id, assignment_role, is_active);
CREATE UNIQUE INDEX uq_module_staff_primary_active ON public.module_staff_assignments USING btree (module_id, assignment_role) WHERE ((is_primary = true) AND (is_active = true));


-- public.resource_confusion_cases definition

-- Drop table

-- DROP TABLE public.resource_confusion_cases;

CREATE TABLE public.resource_confusion_cases (
	id bigserial NOT NULL,
	resource_id int8 NOT NULL,
	module_id int8 NOT NULL,
	student_id uuid NOT NULL,
	status public."confusion_case_status" DEFAULT 'nouveau'::confusion_case_status NOT NULL,
	priority public."confusion_case_priority" DEFAULT 'normale'::confusion_case_priority NOT NULL,
	assigned_to_user_id uuid NULL,
	assigned_by_user_id uuid NULL,
	official_answer_id int8 NULL,
	first_signal_at timestamptz DEFAULT now() NOT NULL,
	last_signal_at timestamptz DEFAULT now() NOT NULL,
	resolved_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT resource_confusion_cases_pkey PRIMARY KEY (id),
	CONSTRAINT resource_confusion_cases_assigned_by_user_id_fkey FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT resource_confusion_cases_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT resource_confusion_cases_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE RESTRICT,
	CONSTRAINT resource_confusion_cases_official_answer_id_fkey FOREIGN KEY (official_answer_id) REFERENCES public.qa_answers(id) ON DELETE SET NULL,
	CONSTRAINT resource_confusion_cases_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE,
	CONSTRAINT resource_confusion_cases_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_confusion_cases_assignee_status_updated ON public.resource_confusion_cases USING btree (assigned_to_user_id, status, updated_at DESC);
CREATE INDEX idx_confusion_cases_module_status_updated ON public.resource_confusion_cases USING btree (module_id, status, updated_at DESC);
CREATE INDEX idx_confusion_cases_student_updated ON public.resource_confusion_cases USING btree (student_id, updated_at DESC);
CREATE UNIQUE INDEX uq_confusion_case_open ON public.resource_confusion_cases USING btree (student_id, resource_id, module_id) WHERE (status <> 'resolu'::confusion_case_status);

-- Table Triggers

-- DROP FUNCTION public.set_confusion_case_updated_at();

CREATE OR REPLACE FUNCTION public.set_confusion_case_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$
;

create trigger trg_confusion_cases_set_updated_at before
update
    on
    public.resource_confusion_cases for each row execute function set_confusion_case_updated_at();


-- public.resource_confusion_case_events definition

-- Drop table

-- DROP TABLE public.resource_confusion_case_events;

CREATE TABLE public.resource_confusion_case_events (
	id bigserial NOT NULL,
	case_id int8 NOT NULL,
	event_type text NOT NULL,
	actor_user_id uuid NULL,
	payload jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT resource_confusion_case_events_event_type_check CHECK ((event_type = ANY (ARRAY['case_created'::text, 'signal_attached'::text, 'auto_assigned'::text, 'admin_assigned'::text, 'status_changed'::text, 'official_answer_linked'::text, 'resolved'::text, 'reopened'::text]))),
	CONSTRAINT resource_confusion_case_events_pkey PRIMARY KEY (id),
	CONSTRAINT resource_confusion_case_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT resource_confusion_case_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.resource_confusion_cases(id) ON DELETE CASCADE
);
CREATE INDEX idx_confusion_case_events_case_created ON public.resource_confusion_case_events USING btree (case_id, created_at DESC);


-- public.user_notifications definition

-- Drop table

-- DROP TABLE public.user_notifications;

CREATE TABLE public.user_notifications (
	id bigserial NOT NULL,
	recipient_user_id uuid NOT NULL,
	"type" text NOT NULL,
	title text NOT NULL,
	body text NOT NULL,
	payload jsonb NULL,
	is_read bool DEFAULT false NOT NULL,
	read_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT user_notifications_pkey PRIMARY KEY (id),
	CONSTRAINT user_notifications_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_recipient_unread_created ON public.user_notifications USING btree (recipient_user_id, is_read, created_at DESC);


-- public.user_push_devices definition

-- Drop table

-- DROP TABLE public.user_push_devices;

CREATE TABLE public.user_push_devices (
	id bigserial NOT NULL,
	user_id uuid NOT NULL,
	device_token text NOT NULL,
	platform text NOT NULL,
	device_name text NULL,
	is_active bool DEFAULT true NOT NULL,
	last_seen_at timestamptz DEFAULT now() NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT user_push_devices_pkey PRIMARY KEY (id),
	CONSTRAINT user_push_devices_platform_check CHECK ((platform = ANY (ARRAY['web'::text, 'android'::text, 'ios'::text]))),
	CONSTRAINT user_push_devices_user_id_device_token_key UNIQUE (user_id, device_token),
	CONSTRAINT user_push_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_push_devices_token ON public.user_push_devices USING btree (device_token);
CREATE INDEX idx_user_push_devices_user_active ON public.user_push_devices USING btree (user_id, is_active, updated_at DESC);

-- Table Triggers

-- DROP FUNCTION public.set_user_push_device_updated_at();

CREATE OR REPLACE FUNCTION public.set_user_push_device_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$
;

create trigger trg_user_push_devices_set_updated_at before
update
    on
    public.user_push_devices for each row execute function set_user_push_device_updated_at();


-- public.notification_deliveries definition

-- Drop table

-- DROP TABLE public.notification_deliveries;

CREATE TABLE public.notification_deliveries (
	id bigserial NOT NULL,
	notification_id int8 NOT NULL,
	channel text NOT NULL,
	destination text NULL,
	status text NOT NULL,
	provider_message_id text NULL,
	error_message text NULL,
	attempts int4 DEFAULT 1 NOT NULL,
	sent_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT notification_deliveries_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'push'::text]))),
	CONSTRAINT notification_deliveries_pkey PRIMARY KEY (id),
	CONSTRAINT notification_deliveries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'skipped'::text]))),
	CONSTRAINT notification_deliveries_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.user_notifications(id) ON DELETE CASCADE
);
CREATE INDEX idx_notification_deliveries_channel_status ON public.notification_deliveries USING btree (channel, status, created_at DESC);
CREATE INDEX idx_notification_deliveries_notification ON public.notification_deliveries USING btree (notification_id, created_at DESC);

-- Table Triggers

-- DROP FUNCTION public.set_notification_delivery_updated_at();

CREATE OR REPLACE FUNCTION public.set_notification_delivery_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$
;

create trigger trg_notification_deliveries_set_updated_at before
update
    on
    public.notification_deliveries for each row execute function set_notification_delivery_updated_at();
