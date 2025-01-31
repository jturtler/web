import { setEnv } from './utils';

/** enum representing the keycloak roles */
export enum Roles {
  ROLE_EDIT_KEYCLOAK_USERS = 'ROLE_EDIT_KEYCLOAK_USERS',
  ROLE_VIEW_KEYCLOAK_USERS = 'ROLE_VIEW_KEYCLOAK_USERS',
}

const defaultRoles = {
  USERS: `${Roles.ROLE_EDIT_KEYCLOAK_USERS},${Roles.ROLE_VIEW_KEYCLOAK_USERS}`,
  PLANS: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  LOCATIONS: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  CARD_SUPPORT: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  INVENTORY: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  HEALTHCARE_SERVICE: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  TEAMS: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  PRODUCT_CATALOGUE: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  GROUP: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  FORM_CONFIGURATION: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  ORG_AFFILIATION: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  CARE_TEAM: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  SERVER_SETTINGS: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  QUEST: Roles.ROLE_VIEW_KEYCLOAK_USERS,
  COMMODITY: Roles.ROLE_VIEW_KEYCLOAK_USERS,
};

const rawOpenSrpRoles = setEnv('REACT_APP_OPENSRP_ROLES', JSON.stringify(defaultRoles));
export const OPENSRP_ROLES = JSON.parse(rawOpenSrpRoles);

export const WEBSITE_NAME = setEnv('REACT_APP_WEBSITE_NAME', 'OpenSRP Web');

export const ENABLE_CARD_SUPPORT = setEnv('REACT_APP_ENABLE_CARD_SUPPORT', 'false') === 'true';

export const ENABLE_PLANS = setEnv('REACT_APP_ENABLE_PLANS', 'false') === 'true';

/** Activate the teams menu */
export const ENABLE_TEAMS = setEnv('REACT_APP_ENABLE_TEAMS', 'false') === 'true';

/** Activate the healthcare menu */
export const ENABLE_HEALTHCARE_SERVICES =
  setEnv('REACT_APP_ENABLE_FHIR_HEALTHCARE_SERVICES', 'false') === 'true';

/** Activate the plans menu */
export const ENABLE_LOCATIONS = setEnv('REACT_APP_ENABLE_LOCATIONS', 'false') === 'true';
export const OPENSRP_OAUTH_SCOPES = setEnv('REACT_APP_OPENSRP_OAUTH_SCOPES', 'profile').split(',');

/** Activate the teams menu */
export const ENABLE_FHIR_GROUP = setEnv('REACT_APP_ENABLE_FHIR_GROUP', 'false') === 'true';

export const DEFAULT_ACTIVITY_DURATION_DAYS = Number(
  setEnv('REACT_APP_DEFAULT_ACTIVITY_DURATION_DAYS', 7)
);

export const PLAN_UUID_NAMESPACE = setEnv('REACT_APP_PLAN_UUID_NAMESPACE', '');

export const ACTION_UUID_NAMESPACE = setEnv('REACT_APP_ACTION_UUID_NAMESPACE', '');

export const DEFAULT_PLAN_VERSION = setEnv('REACT_APP_DEFAULT_PLAN_VERSION', '1');

export const TASK_GENERATION_STATUS = setEnv('REACT_APP_TASK_GENERATION_STATUS', 'False');

export const PLAN_ASSIGNMENT_AT_GEO_LEVEL = Number(
  setEnv('REACT_APP_PLAN_ASSIGNMENT_AT_GEO_LEVEL', 0)
);

export const MAIN_LOGO_SRC = setEnv(
  'REACT_APP_MAIN_LOGO_SRC',
  'https://github.com/OpenSRP/web/raw/master/app/src/assets/images/opensrp-logo-color.png'
);

export const DATE_FORMAT = setEnv('REACT_APP_DATE_FORMAT', 'yyyy-MM-DD');

export const DEFAULT_TIME = setEnv('REACT_APP_DEFAULT_TIME', 'T00:00:00+00:00');

export const DEFAULT_PLAN_DURATION_DAYS = Number(
  setEnv('REACT_APP_DEFAULT_PLAN_DURATION_DAYS', 20)
);

export const ENABLE_FHIR_TEAMS = setEnv('REACT_APP_ENABLE_FHIR_TEAMS', 'false') === 'true';

/** Default plan id */
export const DEFAULT_PLAN_ID = setEnv(
  'REACT_APP_DEFAULT_PLAN_ID',
  '27362060-0309-411a-910c-64f55ede3758'
);

/** Activate patients menu */
export const ENABLE_PATIENTS_MODULE = setEnv('REACT_APP_ENABLE_FHIR_PATIENTS', 'false') === 'true';

export const BACKEND_ACTIVE = setEnv('REACT_APP_BACKEND_ACTIVE', 'false') === 'true';

export const OPENSRP_LOGOUT_URL = setEnv('REACT_APP_OPENSRP_LOGOUT_URL', undefined);
export const OPENSRP_OAUTH_STATE = setEnv('REACT_APP_OPENSRP_OAUTH_STATE', 'opensrp');
export const ENABLE_OPENSRP_OAUTH = setEnv('REACT_APP_ENABLE_OPENSRP_OAUTH', 'false') === 'true';

// notice the ending is NOT / here
export const OPENSRP_ACCESS_TOKEN_URL = setEnv(
  'REACT_APP_OPENSRP_ACCESS_TOKEN_URL',
  'https://opensrp-stage.smartregister.org/opensrp/oauth/token'
);

// notice the ending is NOT / here
export const OPENSRP_AUTHORIZATION_URL = setEnv(
  'REACT_APP_OPENSRP_AUTHORIZATION_URL',
  'https://opensrp-stage.smartregister.org/opensrp/oauth/authorize'
);

export const OPENSRP_CLIENT_ID = setEnv('REACT_APP_OPENSRP_CLIENT_ID', '');

/** The domain name */
export const DOMAIN_NAME = setEnv('REACT_APP_DOMAIN_NAME', 'http://localhost:3000');

export const OPENSRP_USER_URL = setEnv(
  'REACT_APP_OPENSRP_USER_URL',
  'https://opensrp-stage.smartregister.org/opensrp/user-details'
);

export const NAVBAR_BRAND_IMG_SRC = setEnv(
  'REACT_APP_NAVBAR_BRAND_IMG_SRC',
  'https://github.com/OpenSRP/opensrp-web/raw/master/clients/core/src/assets/images/logo.png'
);

export const KEYCLOAK_LOGOUT_URL = setEnv(
  'REACT_APP_KEYCLOAK_LOGOUT_URL',
  'https://keycloak-stage.smartregister.org/auth/realms/opensrp-web-stage/protocol/openid-connect/logout'
);

export const OPENSRP_API_BASE_URL = setEnv(
  'REACT_APP_OPENSRP_API_BASE_URL',
  'https://opensrp-stage.smartregister.org/opensrp/rest/'
);

export const OPENSRP_API_V2_BASE_URL = setEnv(
  'REACT_APP_OPENSRP_API_V2_BASE_URL',
  'https://opensrp-stage.smartregister.org/opensrp/rest/v2/'
);

export const KEYCLOAK_API_BASE_URL = setEnv(
  'REACT_APP_KEYCLOAK_API_BASE_URL',
  'https://keycloak-stage.smartregister.org/auth/admin/realms/opensrp-web-stage'
);

/** Express server settings */
export const EXPRESS_OAUTH_GET_STATE_URL = setEnv(
  'REACT_APP_EXPRESS_OAUTH_GET_STATE_URL',
  'http://localhost:3000/oauth/state'
);

export const EXPRESS_OAUTH_LOGOUT_URL = setEnv(
  'REACT_APP_EXPRESS_OAUTH_LOGOUT_URL',
  'http://localhost:3000/logout'
);

/** Do you want to disable login protection? */
export const DISABLE_LOGIN_PROTECTION =
  setEnv('REACT_APP_DISABLE_LOGIN_PROTECTION', 'false') === 'true';

/** Activate the product-catalogue menu */
export const ENABLE_PRODUCT_CATALOGUE =
  setEnv('REACT_APP_ENABLE_PRODUCT_CATALOGUE', 'false') === 'true';

/** Activate the FHIR Care Team menu */
export const ENABLE_FHIR_CARE_TEAM = setEnv('REACT_APP_ENABLE_FHIR_CARE_TEAM', 'false') === 'true';

/** Activate form configuration */
export const ENABLE_FORM_CONFIGURATION =
  setEnv('REACT_APP_ENABLE_FORM_CONFIGURATION', 'false') === 'true';

export const LANGUAGE_CODE = setEnv('REACT_APP_LANGUAGE_CODE', 'en');

export const PROJECT_CODE = setEnv('REACT_APP_PROJECT_CODE', 'eusm');

export const ENABLE_INVENTORY = setEnv('REACT_APP_ENABLE_INVENTORY', 'false') === 'true';

export const SUPPORTED_LANGUAGES = setEnv('REACT_APP_SUPPORTED_LANGUAGES', '').split(',');

export const ENABLE_LANGUAGE_SWITCHER =
  setEnv('REACT_APP_ENABLE_LANGUAGE_SWITCHER', 'false') === 'true';

export const ENABLE_FHIR_LOCATIONS = setEnv('REACT_APP_ENABLE_FHIR_LOCATIONS', 'false') === 'true';

export const FILTER_BY_PARENT_ID = setEnv('REACT_APP_FILTER_BY_PARENT_ID', 'true') === 'true';

export const DEFAULT_HOME_MODE = setEnv('REACT_APP_DEFAULT_HOME_MODE', 'default');

export const ENABLE_USER_MANAGEMENT =
  setEnv('REACT_APP_ENABLE_USER_MANAGEMENT', 'false') === 'true';

export const ENABLE_FHIR_USER_MANAGEMENT =
  setEnv('REACT_APP_ENABLE_FHIR_USER_MANAGEMENT', 'false') === 'true';

export const FHIR_API_BASE_URL = setEnv(
  'REACT_APP_FHIR_API_BASE_URL',
  'https://fhir-auth.labs.smartregister.org/fhir'
);

export const ENABLE_TEAMS_ASSIGNMENT_MODULE =
  setEnv('REACT_APP_ENABLE_TEAMS_ASSIGNMENT_MODULE', 'false') === 'true';

export const KEYCLOAK_USERS_PAGE_SIZE = Number(setEnv('REACT_APP_KEYCLOAK_USERS_PAGE_SIZE', 20));

export const DISABLE_TEAM_MEMBER_REASSIGNMENT =
  setEnv('REACT_APP_DISABLE_TEAM_MEMBER_REASSIGNMENT', 'true') === 'true';

export const USER_FORM_HIDDEN_FIELDS = setEnv('REACT_APP_USER_FORM_HIDDEN_FIELDS', '').split(',');

export const USER_FORM_RENDER_FIELDS = setEnv('REACT_APP_USER_FORM_RENDER_FIELDS', '').split(',');

export const PAGINATION_SIZE = Number(setEnv('REACT_APP_PAGINATION_SIZE', 1000));

export const DEFAULTS_TABLE_PAGE_SIZE = Number(setEnv('REACT_APP_DEFAULTS_TABLE_PAGE_SIZE', 5));

export const FHIR_PATIENT_SORT_FIELDS = setEnv(
  'REACT_APP_FHIR_PATIENT_SORT_FIELDS',
  '-_lastUpdated'
).split(',');

export const FHIR_PATIENT_BUNDLE_SIZE = Number(setEnv('REACT_APP_FHIR_PATIENT_BUNDLE_SIZE', 5000));

export const FHIR_ROOT_LOCATION_IDENTIFIER = setEnv('REACT_APP_FHIR_ROOT_LOCATION_IDENTIFIER', '');

export const ENABLE_SERVER_SETTINGS = setEnv('REACT_APP_ENABLE_SERVER_SETTINGS', false) === 'true';

export const OPENSRP_WEB_VERSION = setEnv('REACT_APP_OPENSRP_WEB_VERSION', '');

export const SENTRY_CONFIGS = JSON.parse(setEnv('REACT_APP_SENTRY_CONFIG_JSON', '{}'));

export const ENABLE_QUEST = setEnv('REACT_APP_ENABLE_QUEST', 'false') === 'true';

export const ENABLE_REPORTS = setEnv('REACT_APP_ENABLE_REPORTS', 'false') === 'true';

export const ENABLE_FHIR_COMMODITY = setEnv('REACT_APP_ENABLE_FHIR_COMMODITY', 'false') === 'true';
