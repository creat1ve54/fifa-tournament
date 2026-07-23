export interface PublicUser {
  id: number;
  username: string;
  fifaNickname: string;
  role: "ADMIN" | "PARTICIPANT";
  totalPoints: number;
  seasonsPlayed: number;
  createdAt?: string;
}

export interface User extends PublicUser {
  password: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface TeamReference {
  id: number;
  name: string;
  shortName: string;
  logo: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Season {
  id: number;
  name: string;
  isCurrent: boolean;
  roundsCount: number;
  calendarGenerationType: "AUTO" | "MANUAL";
  status: "SETUP" | "ACTIVE" | "FINISHED";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonTeam {
  id: number;
  seasonId: number;
  teamReferenceId: number;
  userId: number | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Match {
  id: number;
  seasonId: number;
  round: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
}

export interface SeasonResult {
  id: number;
  seasonId: number;
  userId: number;
  place: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface PublicUser {
  id: number;
  username: string;
  fifaNickname: string;
  role: "ADMIN" | "PARTICIPANT";
  totalPoints: number;
  seasonsPlayed: number;
  createdAt?: string;
}

export interface User extends PublicUser {
  password: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface TeamReference {
  id: number;
  name: string;
  shortName: string;
  logo: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface SeasonTeam {
  id: number;
  seasonId: number;
  teamReferenceId: number;
  userId: number | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  teamReference: TeamReference;
  user: PublicUser | null;
}

export interface Match {
  id: number;
  seasonId: number;
  round: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  isPlayed: boolean;
  homeTeam: {
    id: number;
    teamReference: TeamReference;
  };
  awayTeam: {
    id: number;
    teamReference: TeamReference;
  };
}

export interface Season {
  id: number;
  name: string;
  isCurrent: boolean;
  roundsCount: number;
  calendarGenerationType: "AUTO" | "MANUAL";
  status: "SETUP" | "ACTIVE" | "FINISHED";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  teams: SeasonTeam[];
  matches: Match[];
}

export interface SeasonResult {
  id: number;
  seasonId: number;
  userId: number;
  place: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}
