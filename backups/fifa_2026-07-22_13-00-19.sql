--
-- PostgreSQL database dump
--

\restrict DAdsK4gPcHWHNpGP8qotxzkAkd7PWYx1jRIWeejJZtlzrQFP4XDv1sZXINndYt6

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CalendarType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CalendarType" AS ENUM (
    'AUTO',
    'MANUAL'
);


ALTER TYPE public."CalendarType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'PARTICIPANT'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SeasonStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SeasonStatus" AS ENUM (
    'SETUP',
    'ACTIVE',
    'FINISHED'
);


ALTER TYPE public."SeasonStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Match" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    round integer NOT NULL,
    "homeTeamId" integer NOT NULL,
    "awayTeamId" integer NOT NULL,
    "homeScore" integer,
    "awayScore" integer,
    "isPlayed" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Match" OWNER TO postgres;

--
-- Name: Match_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Match_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Match_id_seq" OWNER TO postgres;

--
-- Name: Match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Match_id_seq" OWNED BY public."Match".id;


--
-- Name: Season; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Season" (
    id integer NOT NULL,
    name text NOT NULL,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "roundsCount" integer DEFAULT 1 NOT NULL,
    "calendarGenerationType" public."CalendarType" DEFAULT 'AUTO'::public."CalendarType" NOT NULL,
    status public."SeasonStatus" DEFAULT 'SETUP'::public."SeasonStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Season" OWNER TO postgres;

--
-- Name: SeasonResult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SeasonResult" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    "userId" integer NOT NULL,
    place integer NOT NULL,
    points integer NOT NULL,
    wins integer DEFAULT 0 NOT NULL,
    draws integer DEFAULT 0 NOT NULL,
    losses integer DEFAULT 0 NOT NULL,
    "goalsFor" integer DEFAULT 0 NOT NULL,
    "goalsAgainst" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."SeasonResult" OWNER TO postgres;

--
-- Name: SeasonResult_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SeasonResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SeasonResult_id_seq" OWNER TO postgres;

--
-- Name: SeasonResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SeasonResult_id_seq" OWNED BY public."SeasonResult".id;


--
-- Name: SeasonTeam; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SeasonTeam" (
    id integer NOT NULL,
    "seasonId" integer NOT NULL,
    "teamReferenceId" integer NOT NULL,
    "userId" integer,
    played integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    "goalsFor" integer DEFAULT 0 NOT NULL,
    "goalsAgainst" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."SeasonTeam" OWNER TO postgres;

--
-- Name: SeasonTeam_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SeasonTeam_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SeasonTeam_id_seq" OWNER TO postgres;

--
-- Name: SeasonTeam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SeasonTeam_id_seq" OWNED BY public."SeasonTeam".id;


--
-- Name: Season_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Season_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Season_id_seq" OWNER TO postgres;

--
-- Name: Season_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Season_id_seq" OWNED BY public."Season".id;


--
-- Name: TeamReference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TeamReference" (
    id integer NOT NULL,
    name text NOT NULL,
    "shortName" text NOT NULL,
    logo text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeamReference" OWNER TO postgres;

--
-- Name: TeamReference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TeamReference_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TeamReference_id_seq" OWNER TO postgres;

--
-- Name: TeamReference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TeamReference_id_seq" OWNED BY public."TeamReference".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "fifaNickname" text NOT NULL,
    role public."Role" DEFAULT 'PARTICIPANT'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "totalPoints" integer DEFAULT 0 NOT NULL,
    "seasonsPlayed" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Match id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Match" ALTER COLUMN id SET DEFAULT nextval('public."Match_id_seq"'::regclass);


--
-- Name: Season id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Season" ALTER COLUMN id SET DEFAULT nextval('public."Season_id_seq"'::regclass);


--
-- Name: SeasonResult id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonResult" ALTER COLUMN id SET DEFAULT nextval('public."SeasonResult_id_seq"'::regclass);


--
-- Name: SeasonTeam id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonTeam" ALTER COLUMN id SET DEFAULT nextval('public."SeasonTeam_id_seq"'::regclass);


--
-- Name: TeamReference id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeamReference" ALTER COLUMN id SET DEFAULT nextval('public."TeamReference_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Match; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Match" (id, "seasonId", round, "homeTeamId", "awayTeamId", "homeScore", "awayScore", "isPlayed") FROM stdin;
\.


--
-- Data for Name: Season; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Season" (id, name, "isCurrent", "roundsCount", "calendarGenerationType", status, "startDate", "endDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SeasonResult; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SeasonResult" (id, "seasonId", "userId", place, points, wins, draws, losses, "goalsFor", "goalsAgainst") FROM stdin;
\.


--
-- Data for Name: SeasonTeam; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SeasonTeam" (id, "seasonId", "teamReferenceId", "userId", played, won, drawn, lost, "goalsFor", "goalsAgainst", points) FROM stdin;
\.


--
-- Data for Name: TeamReference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TeamReference" (id, name, "shortName", logo, "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, password, "fifaNickname", role, "isActive", "totalPoints", "seasonsPlayed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Match_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Match_id_seq"', 1, false);


--
-- Name: SeasonResult_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SeasonResult_id_seq"', 1, false);


--
-- Name: SeasonTeam_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SeasonTeam_id_seq"', 1, false);


--
-- Name: Season_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Season_id_seq"', 1, false);


--
-- Name: TeamReference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TeamReference_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: Match Match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY (id);


--
-- Name: SeasonResult SeasonResult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonResult"
    ADD CONSTRAINT "SeasonResult_pkey" PRIMARY KEY (id);


--
-- Name: SeasonTeam SeasonTeam_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonTeam"
    ADD CONSTRAINT "SeasonTeam_pkey" PRIMARY KEY (id);


--
-- Name: Season Season_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Season"
    ADD CONSTRAINT "Season_pkey" PRIMARY KEY (id);


--
-- Name: TeamReference TeamReference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeamReference"
    ADD CONSTRAINT "TeamReference_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Match_seasonId_round_awayTeamId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Match_seasonId_round_awayTeamId_key" ON public."Match" USING btree ("seasonId", round, "awayTeamId");


--
-- Name: Match_seasonId_round_homeTeamId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Match_seasonId_round_homeTeamId_key" ON public."Match" USING btree ("seasonId", round, "homeTeamId");


--
-- Name: SeasonResult_seasonId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SeasonResult_seasonId_userId_key" ON public."SeasonResult" USING btree ("seasonId", "userId");


--
-- Name: SeasonTeam_seasonId_teamReferenceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SeasonTeam_seasonId_teamReferenceId_key" ON public."SeasonTeam" USING btree ("seasonId", "teamReferenceId");


--
-- Name: SeasonTeam_seasonId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SeasonTeam_seasonId_userId_key" ON public."SeasonTeam" USING btree ("seasonId", "userId");


--
-- Name: Season_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Season_name_key" ON public."Season" USING btree (name);


--
-- Name: TeamReference_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TeamReference_name_key" ON public."TeamReference" USING btree (name);


--
-- Name: TeamReference_shortName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TeamReference_shortName_key" ON public."TeamReference" USING btree ("shortName");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Match Match_awayTeamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES public."SeasonTeam"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Match Match_homeTeamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES public."SeasonTeam"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Match Match_seasonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES public."Season"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SeasonResult SeasonResult_seasonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonResult"
    ADD CONSTRAINT "SeasonResult_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES public."Season"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SeasonResult SeasonResult_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonResult"
    ADD CONSTRAINT "SeasonResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SeasonTeam SeasonTeam_seasonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonTeam"
    ADD CONSTRAINT "SeasonTeam_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES public."Season"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SeasonTeam SeasonTeam_teamReferenceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonTeam"
    ADD CONSTRAINT "SeasonTeam_teamReferenceId_fkey" FOREIGN KEY ("teamReferenceId") REFERENCES public."TeamReference"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SeasonTeam SeasonTeam_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SeasonTeam"
    ADD CONSTRAINT "SeasonTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict DAdsK4gPcHWHNpGP8qotxzkAkd7PWYx1jRIWeejJZtlzrQFP4XDv1sZXINndYt6

