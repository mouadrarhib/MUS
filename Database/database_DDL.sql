-- public.domains definition

-- Drop table

-- DROP TABLE public.domains;

-- ddl db

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
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trg_users_set_updated_at before
update
    on
    public.users for each row execute function sp_user_set_updated_at();


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


-- public.resources definition

-- Drop table

-- DROP TABLE public.resources;

CREATE TABLE public.resources (
	id bigserial NOT NULL,
	title text NOT NULL,
	description text NULL,
	"type" public."resource_type" DEFAULT 'other'::resource_type NOT NULL,
	status public."resource_status" DEFAULT 'draft'::resource_status NOT NULL,
	url text NULL,
	"language" text NULL,
	license text NULL,
	created_by uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT resources_pkey PRIMARY KEY (id),
	CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Table Triggers

create trigger trg_resources_set_updated_at before
update
    on
    public.resources for each row execute function sp_resource_set_updated_at();


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
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT student_profiles_pkey PRIMARY KEY (user_id),
	CONSTRAINT student_profiles_current_semester_id_fkey FOREIGN KEY (current_semester_id) REFERENCES public.semesters(id),
	CONSTRAINT student_profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
	CONSTRAINT student_profiles_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
	CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

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


-- public.resource_module_map definition

-- Drop table

-- DROP TABLE public.resource_module_map;

CREATE TABLE public.resource_module_map (
	module_id int8 NOT NULL,
	resource_id int8 NOT NULL,
	chapter text NULL,
	difficulty int4 NULL,
	exam_related bool DEFAULT false NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT resource_module_map_difficulty_check CHECK (((difficulty >= 1) AND (difficulty <= 5))),
	CONSTRAINT resource_module_map_pkey PRIMARY KEY (module_id, resource_id),
	CONSTRAINT resource_module_map_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE,
	CONSTRAINT resource_module_map_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE
);


-- public.user_settings definition

-- Drop table

-- DROP TABLE public.user_settings;

CREATE TABLE public.user_settings (
	user_id uuid NOT NULL,
	theme_mode text DEFAULT 'light'::text NOT NULL,
	font_size text DEFAULT 'medium'::text NOT NULL,
	language text DEFAULT 'en'::text NOT NULL,
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
