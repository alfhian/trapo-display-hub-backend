--
-- PostgreSQL database dump
--

\restrict pENEeeOp8KcdS0U4eRM6xFb6ja68zr3kM7WYUUuxktZWcGPGGhocy1bkdOgW8un

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-15 17:40:37

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 24754)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 57521)
-- Name: admin_assignments_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_assignments_audit (
    id bigint NOT NULL,
    admin_sub text,
    screen_id text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_assignments_audit OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 57520)
-- Name: admin_assignments_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_assignments_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_assignments_audit_id_seq OWNER TO postgres;

--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 223
-- Name: admin_assignments_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_assignments_audit_id_seq OWNED BY public.admin_assignments_audit.id;


--
-- TOC entry 222 (class 1259 OID 24828)
-- Name: assignment_events; Type: TABLE; Schema: public; Owner: tvdash
--

CREATE TABLE public.assignment_events (
    id bigint NOT NULL,
    screen_id uuid NOT NULL,
    payload jsonb NOT NULL,
    actor text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assignment_events OWNER TO tvdash;

--
-- TOC entry 221 (class 1259 OID 24827)
-- Name: assignment_events_id_seq; Type: SEQUENCE; Schema: public; Owner: tvdash
--

CREATE SEQUENCE public.assignment_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_events_id_seq OWNER TO tvdash;

--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 221
-- Name: assignment_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tvdash
--

ALTER SEQUENCE public.assignment_events_id_seq OWNED BY public.assignment_events.id;


--
-- TOC entry 227 (class 1259 OID 82114)
-- Name: assignment_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_logs (
    id bigint NOT NULL,
    screen_id text,
    user_id uuid,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.assignment_logs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 82113)
-- Name: assignment_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_logs_id_seq OWNER TO postgres;

--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 226
-- Name: assignment_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_logs_id_seq OWNED BY public.assignment_logs.id;


--
-- TOC entry 220 (class 1259 OID 24814)
-- Name: screen_payloads; Type: TABLE; Schema: public; Owner: tvdash
--

CREATE TABLE public.screen_payloads (
    screen_id uuid NOT NULL,
    payload jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.screen_payloads OWNER TO tvdash;

--
-- TOC entry 219 (class 1259 OID 24800)
-- Name: screen_tokens; Type: TABLE; Schema: public; Owner: tvdash
--

CREATE TABLE public.screen_tokens (
    screen_id uuid NOT NULL,
    token text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.screen_tokens OWNER TO tvdash;

--
-- TOC entry 218 (class 1259 OID 24791)
-- Name: screens; Type: TABLE; Schema: public; Owner: tvdash
--

CREATE TABLE public.screens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.screens OWNER TO tvdash;

--
-- TOC entry 225 (class 1259 OID 82099)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'admin'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4714 (class 2604 OID 57524)
-- Name: admin_assignments_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_assignments_audit ALTER COLUMN id SET DEFAULT nextval('public.admin_assignments_audit_id_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 24831)
-- Name: assignment_events id; Type: DEFAULT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.assignment_events ALTER COLUMN id SET DEFAULT nextval('public.assignment_events_id_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 82117)
-- Name: assignment_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_logs ALTER COLUMN id SET DEFAULT nextval('public.assignment_logs_id_seq'::regclass);


--
-- TOC entry 4892 (class 0 OID 57521)
-- Dependencies: 224
-- Data for Name: admin_assignments_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_assignments_audit (id, admin_sub, screen_id, payload, created_at) FROM stdin;
\.


--
-- TOC entry 4890 (class 0 OID 24828)
-- Dependencies: 222
-- Data for Name: assignment_events; Type: TABLE DATA; Schema: public; Owner: tvdash
--

COPY public.assignment_events (id, screen_id, payload, actor, created_at) FROM stdin;
1	00000000-0000-0000-0000-000000000001	{"eta": "15:30", "plate": "B1234XYZ", "customer": "Jane Doe"}	admin@yourdomain.com	2025-10-09 17:34:57.36091+07
2	00000000-0000-0000-0000-000000000001	{"eta": "16:30", "type": "Avanza", "brand": "Toyota", "plate": "B1234XYZ", "service": "Oil Change", "customer": "John Doe"}	3762d4c8-9ce4-4097-86fb-3760d04e4a93	2025-10-13 13:42:15.599221+07
3	00000000-0000-0000-0000-000000000002	{"eta": "12:30", "type": "Xpander", "brand": "Mitsubishi", "plate": "B0040MAT", "service": "Coating", "customer": "Relix Fey"}	3762d4c8-9ce4-4097-86fb-3760d04e4a93	2025-10-13 14:28:22.887652+07
\.


--
-- TOC entry 4895 (class 0 OID 82114)
-- Dependencies: 227
-- Data for Name: assignment_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_logs (id, screen_id, user_id, payload, created_at) FROM stdin;
1	00000000-0000-0000-0000-000000000001	3762d4c8-9ce4-4097-86fb-3760d04e4a93	{"eta": "16:30", "type": "Avanza", "brand": "Toyota", "plate": "B1234XYZ", "service": "Oil Change", "customer": "John Doe"}	2025-10-13 13:42:15.633322+07
2	00000000-0000-0000-0000-000000000002	3762d4c8-9ce4-4097-86fb-3760d04e4a93	{"eta": "12:30", "type": "Xpander", "brand": "Mitsubishi", "plate": "B0040MAT", "service": "Coating", "customer": "Relix Fey"}	2025-10-13 14:28:22.899686+07
3	00000000-0000-0000-0000-000000000001	\N	{"eta": "10:00", "plate": "B1111XYZ", "customer": "Sample"}	2025-10-13 14:48:19.555976+07
\.


--
-- TOC entry 4888 (class 0 OID 24814)
-- Dependencies: 220
-- Data for Name: screen_payloads; Type: TABLE DATA; Schema: public; Owner: tvdash
--

COPY public.screen_payloads (screen_id, payload, updated_at, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	{"eta": "16:30", "type": "Avanza", "brand": "Toyota", "plate": "B1234XYZ", "service": "Oil Change", "customer": "John Doe"}	2025-10-13 13:42:15.589914+07	2025-10-13 14:48:09.275512+07
00000000-0000-0000-0000-000000000002	{"eta": "12:30", "type": "Xpander", "brand": "Mitsubishi", "plate": "B0040MAT", "service": "Coating", "customer": "Relix Fey"}	2025-10-13 14:28:22.873545+07	2025-10-13 14:48:09.275512+07
\.


--
-- TOC entry 4887 (class 0 OID 24800)
-- Dependencies: 219
-- Data for Name: screen_tokens; Type: TABLE DATA; Schema: public; Owner: tvdash
--

COPY public.screen_tokens (screen_id, token, active, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	SECRETTOKEN123	t	2025-09-29 14:40:28.017673+07
\.


--
-- TOC entry 4886 (class 0 OID 24791)
-- Dependencies: 218
-- Data for Name: screens; Type: TABLE DATA; Schema: public; Owner: tvdash
--

COPY public.screens (id, name, created_at) FROM stdin;
00000000-0000-0000-0000-000000000002	Bay 2 TV	2025-10-13 14:07:25.192781+07
00000000-0000-0000-0000-000000000001	Bay 1 TV	2025-09-29 14:40:28.017673+07
00000000-0000-0000-0000-000000000003	Bay 3 TV	2025-10-13 14:07:25.192781+07
00000000-0000-0000-0000-000000000004	Bay 4 TV	2025-10-13 14:07:25.192781+07
\.


--
-- TOC entry 4893 (class 0 OID 82099)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin1	$2b$10$Z48uPS64XOVmuI3n7.yCz.3BAT.dXkXlycbLf8a7tEUik0ueT8u.G	user	2025-10-10 10:30:08.08598+07
3762d4c8-9ce4-4097-86fb-3760d04e4a93	admin	$2b$10$qbiUdKS4b2fKzPLqEhdbFeSbT25V5Tg3oL3elmfXClU0m95dY1sP.	admin	2025-10-10 10:51:51.061465+07
0ceb4177-b804-4bc5-a456-e6fb21e4a293	dummy	$2b$10$NldpmBjFkeyXnaFE8qn/jOaMcCmoSNEem3plqgVyrtpx1ZxrsAizO	admin	2025-10-10 10:52:41.045373+07
\.


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 223
-- Name: admin_assignments_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_assignments_audit_id_seq', 1, false);


--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 221
-- Name: assignment_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tvdash
--

SELECT pg_catalog.setval('public.assignment_events_id_seq', 3, true);


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 226
-- Name: assignment_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_logs_id_seq', 3, true);


--
-- TOC entry 4730 (class 2606 OID 57529)
-- Name: admin_assignments_audit admin_assignments_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_assignments_audit
    ADD CONSTRAINT admin_assignments_audit_pkey PRIMARY KEY (id);


--
-- TOC entry 4728 (class 2606 OID 24836)
-- Name: assignment_events assignment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.assignment_events
    ADD CONSTRAINT assignment_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 82122)
-- Name: assignment_logs assignment_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_logs
    ADD CONSTRAINT assignment_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4726 (class 2606 OID 24821)
-- Name: screen_payloads screen_payloads_pkey; Type: CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.screen_payloads
    ADD CONSTRAINT screen_payloads_pkey PRIMARY KEY (screen_id);


--
-- TOC entry 4724 (class 2606 OID 24808)
-- Name: screen_tokens screen_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.screen_tokens
    ADD CONSTRAINT screen_tokens_pkey PRIMARY KEY (screen_id, token);


--
-- TOC entry 4722 (class 2606 OID 24799)
-- Name: screens screens_pkey; Type: CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 82108)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 82110)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4739 (class 2606 OID 24837)
-- Name: assignment_events assignment_events_screen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.assignment_events
    ADD CONSTRAINT assignment_events_screen_id_fkey FOREIGN KEY (screen_id) REFERENCES public.screens(id);


--
-- TOC entry 4740 (class 2606 OID 82123)
-- Name: assignment_logs assignment_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_logs
    ADD CONSTRAINT assignment_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4738 (class 2606 OID 24822)
-- Name: screen_payloads screen_payloads_screen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.screen_payloads
    ADD CONSTRAINT screen_payloads_screen_id_fkey FOREIGN KEY (screen_id) REFERENCES public.screens(id) ON DELETE CASCADE;


--
-- TOC entry 4737 (class 2606 OID 24809)
-- Name: screen_tokens screen_tokens_screen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tvdash
--

ALTER TABLE ONLY public.screen_tokens
    ADD CONSTRAINT screen_tokens_screen_id_fkey FOREIGN KEY (screen_id) REFERENCES public.screens(id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO tvdash;


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE admin_assignments_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.admin_assignments_audit TO tvdash;


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE admin_assignments_audit_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.admin_assignments_audit_id_seq TO tvdash;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE assignment_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.assignment_logs TO tvdash;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE assignment_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.assignment_logs_id_seq TO tvdash;


--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO tvdash;


--
-- TOC entry 2108 (class 826 OID 82112)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO tvdash;


--
-- TOC entry 2107 (class 826 OID 82111)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO tvdash;


-- Completed on 2025-10-15 17:40:37

--
-- PostgreSQL database dump complete
--

\unrestrict pENEeeOp8KcdS0U4eRM6xFb6ja68zr3kM7WYUUuxktZWcGPGGhocy1bkdOgW8un

