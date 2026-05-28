export const ID_ENDPOINT = 'id';
export const COUNT_ENDPOINT = 'count';
export const FILTER_ENDPOINT = 'filter';
export const SUMMARY_ENDPOINT = 'summaries';

export const POKEMON_ENDPOINT = 'pokemon';

export const EFFECTIVENESS_ENDPOINT = 'effectiveness';

export const LOGIN_ENDPOINT = 'login';
export const LOGOUT_ENDPOINT = 'logout';
export const REFRESH_ENDPOINT = 'refresh';
export const REGISTER_ENDPOINT = 'register';
export const PASSWORD_RESET_ENDPOINT = 'password-reset';
export const PASSWORD_RESET_REQUEST_ENDPOINT = 'password-reset-request';

export const USER_SELF_ENDPOINT = 'me';
export const USER_SELF_PASSWORD_ENDPOINT = 'me/password';

export const ADMIN_ENDPOINT = 'admin/';
export const BATCH_ENDPOINT = 'batch/';

export const ADMIN_ID_ENDPOINT = ADMIN_ENDPOINT + ID_ENDPOINT;
export const ADMIN_COUNT_ENDPOINT = ADMIN_ENDPOINT + COUNT_ENDPOINT;
export const ADMIN_FILTER_ENDPOINT = ADMIN_ENDPOINT + FILTER_ENDPOINT;
export const ADMIN_SUMMARY_ENDPOINT = ADMIN_ENDPOINT + SUMMARY_ENDPOINT;

export const ADMIN_DISABLE_ENDPOINT = 'disable';
export const ADMIN_HARD_DELETE_ENDPOINT = 'hard';
export const ADMIN_REACTIVATION_ENDPOINT = 'reactivate';
export const ADMIN_BATCH_DISABLE_ENDPOINT = `${ADMIN_ENDPOINT}${BATCH_ENDPOINT}${ADMIN_DISABLE_ENDPOINT}`;
export const ADMIN_BATCH_HARD_DELETE_ENDPOINT = `${ADMIN_ENDPOINT}${BATCH_ENDPOINT}${ADMIN_HARD_DELETE_ENDPOINT}`;
export const ADMIN_BATCH_REACTIVATION_ENDPOINT = `${ADMIN_ENDPOINT}${BATCH_ENDPOINT}${ADMIN_REACTIVATION_ENDPOINT}`;

export const SEED_ENDPOINT = 'seed';
export const SEED_LOG_FILTER_ENDPOINT = 'seed-logs/' + FILTER_ENDPOINT;
export const AUDIT_LOG_FILTER_ENDPOINT = 'audit-logs/' + FILTER_ENDPOINT;

export const TEAM_PUBLIC_ID_ENDPOINT = 'public/' + ID_ENDPOINT;
export const TEAM_PUBLIC_FILTER_ENDPOINT = 'public/' + FILTER_ENDPOINT;
export const TEAM_SELF_ENDPOINT = `${USER_SELF_ENDPOINT}/${ID_ENDPOINT}`;
export const TEAM_SELF_FILTER_ENDPOINT = `${USER_SELF_ENDPOINT}/${FILTER_ENDPOINT}`;
export const TEAM_LIKE_ENDPOINT = 'like';
