export const SECRET_KEY = 'tetch_token';
export const platform = process.env.REACT_APP_NODE_ENV;
let serverURL = {}
export let MIXPANEL_KEY = ''
export let STRIPE_TEST_KEY = process.env.REACT_APP_STRIPE_TEST_KEY
export let STRIPE_KEY = process.env.REACT_APP_STRIPE_KEY
export let GOOGLE_ANALYTICS_PROPERTY_ID = '';
export let guestData = { 'email': process.env.REACT_APP_GUEST_EMAIL, 'password': process.env.REACT_APP_GUEST_PASSWORD, 'user_password': process.env.REACT_APP_GUEST_PASSWORD }
export let VERSION = '1.3.19';
export let ITSupport = "soft_cf26a990-2cf6-11ec-8c4c-5346fd03eb93"
export let EmailOutlook = "soft_8d7523aa-6e55-11ec-8c4c-5346fd03eb93"
export let MERCHANT_ID = process.env.REACT_APP_MERCHANT
export const MAIN_APP_URL = process.env.REACT_APP_URL
export const TOTAL_FREE_SECONDS = 360
serverURL = {
  DEV: {
    API_BAES_URL: process.env.REACT_APP_API_BASE_URL,
  },
  ADMIN: {
    API_BAES_URL: process.env.REACT_APP_ADMIN_BASE_URL,
  },
  JITSI: {
    BASE_URL: process.env.REACT_APP_JITSI_BASE_URL,
    FULL_URL: `https://${process.env.REACT_APP_JITSI_BASE_URL}/`,
  },
  REACT_APP_URL: process.env.REACT_APP_URL,
  LANDING_PAGE: process.env.REACT_APP_LANDING_PAGE_URL
};
MIXPANEL_KEY = process.env.REACT_APP_MIXPANEL_KEY
GOOGLE_ANALYTICS_PROPERTY_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_PROPERTY_ID;

export const JITSI_URL = serverURL.JITSI
export const SERVER_URL = serverURL.DEV.API_BAES_URL
export const ADMIN_URL = serverURL.ADMIN.API_BAES_URL
export const APP_URL = serverURL.REACT_APP_URL
export const LANDING_PAGE_URL = serverURL.LANDING_PAGE
export const JOB_CHARACTERS_ALLOWED = 200
export const CUSTOMER = 'customer';
export const TECHNICIAN = 'technician';
export const ADMIN = 'admin';
export const PAID = 'paid';
export const FREE = 'free';
export const secretPassKey = process.env.REACT_APP_SECRET_PASSWORD_KEY
export const PLATFORM = platform;
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID
export const FB_APP_ID = ""
export const SESSION_EXPIRE_MESSAGE = "Your session has been expired. Please log in again."
export const SESSION_EXPIRE_URL = '/login?session_expire=yes'
export const INACTIVE_ACCOUNT_MESSAGE = "Your account is inactive due to payment issues.Please add card in Settings -> Add Card to activate your account."
export const QUICKBOOK_SOFTWARE_ID = process.env.REACT_APP_CERTIFIED_SOFTWARE_ID
export const CHAT_URL = process.env.REACT_APP_CHAT_URL
export const CHAT_PROJECT_PRIVATE_KEY = process.env.REACT_APP_CHAT_API_KEY
export const CHAT_PROJECT_KEY = process.env.REACT_APP_PROJECT_KEY
export const CHAT_APP_PASS = process.env.REACT_APP_CHAT_PASSWORD
export const LOGROCKET_KEY = process.env.REACT_APP_LOGROCKET_KEY
export const ROOT_HOSTNAME = process.env.REACT_APP_ROOT_HOSTNAME
export const AMBASSODOR_USERNAME = process.env.REACT_APP_AMB_USERNAME
export const AMBASSODOR_TOKEN = process.env.REACT_APP_AMB_TOKEN
export const AMBASSODOR_URL = 'https://getambassador.com/api/v2'
export const AMBASSODOR_CAMPAGIN_TOKEN = process.env.REACT_APP_AMB_CAMPAGIN_TOKEN
export const AMBASSODOR_SEGMENT_ID = process.env.REACT_APP_AMB_SEGMENT_ID
export const INACTIVE_ACCOUNT_STATUS_MSG = "Your account is inactive due to payment issues.Please contact admin to activate your account."
export const TALK_SECRET_CHAT_KEY = process.env.REACT_APP_TALK_SECRET_KEY
export const TALK_PROJECT_ID = process.env.REACT_APP_TALK_PROJECT_ID
export const TALK_PROJECT_URL = process.env.REACT_APP_TALK_PROJECT_URL
export const NotificationNumber = process.env.REACT_APP_NOTIFICATION_NUMBER
export const SERVER_MEETING_URL = process.env.REACT_APP_MEETING_PAGE_URL
export const CALENDLY_EVENT_URL_TEST = process.env.REACT_APP_CALENDLY_EVENT_URL_TEST
export const CALENDLY_EVENT_URL_LIVE = process.env.REACT_APP_CALENDLY_EVENT_URL
export const LAUNCHDARKLY_JAAS_INTEGRATION = process.env.REACT_APP_MEETING_SERVICE_SWITCHER
export const LAUNCHDARKLY_JOBSUMMARY_ESTIMATES_VISIBILITY = 'toggle-estimation-from-client'
export const languages = [
  ['Abkhazian', 'ab'],
  ['Afrikaans', 'af'],
  ['Akan', 'ak'],
  ['Albanian', 'sq'],
  ['Amharic', 'am'],
  ['Arabic', 'ar'],
  ['Aragonese', 'an'],
  ['Armenian', 'hy'],
  ['Assamese', 'as'],
  ['Avaric', 'av'],
  ['Avestan', 'ae'],
  ['Aymara', 'ay'],
  ['Azerbaijani', 'az'],
  ['Bambara', 'bm'],
  ['Bashkir', 'ba'],
  ['Basque', 'eu'],
  ['Belarusian', 'be'],
  ['Bengali (Bangla)', 'bn'],
  ['Bihari', 'bh'],
  ['Bislama', 'bi'],
  ['Bosnian', 'bs'],
  ['Breton', 'br'],
  ['Bulgarian', 'bg'],
  ['Burmese', 'my'],
  ['Catalan', 'ca'],
  ['Chamorro', 'ch'],
  ['Chechen', 'ce'],
  ['Chichewa, Chewa, Nyanja', 'ny'],
  ['Chinese', 'zh'],
  ['Chinese (Simplified)', 'zh-Hans'],
  ['Chinese (Traditional)', 'zh-Hant'],
  ['Chuvash', 'cv'],
  ['Cornish', 'kw'],
  ['Corsican', 'co'],
  ['Cree', 'cr'],
  ['Croatian', 'hr'],
  ['Czech', 'cs'],
  ['Danish', 'da'],
  ['Divehi, Dhivehi, Maldivian', 'dv'],
  ['Dutch', 'nl'],
  ['Dzongkha', 'dz'],
  ['English', 'en'],
  ['Esperanto', 'eo'],
  ['Estonian', 'et'],
  ['Ewe', 'ee'],
  ['Faroese', 'fo'],
  ['Fijian', 'fj'],
  ['Finnish', 'fi'],
  ['French', 'fr'],
  ['Fula, Fulah, Pulaar, Pular', 'ff'],
  ['Galician', 'gl'],
  ['Gaelic (Scottish)', 'gd'],
  ['Gaelic (Manx)', 'gv'],
  ['Georgian', 'ka'],
  ['German', 'de'],
  ['Greek', 'el'],
  ['Greenlandic', 'kl'],
  ['Guarani', 'gn'],
  ['Gujarati', 'gu'],
  ['Haitian Creole', 'ht'],
  ['Hausa', 'ha'],
  ['Hebrew', 'he'],
  ['Herero', 'hz'],
  ['Hindi', 'hi'],
  ['Hiri Motu', 'ho'],
  ['Hungarian', 'hu'],
  ['Icelandic', 'is'],
  ['Ido', 'io'],
  ['Igbo', 'ig'],
  ['Indonesian', 'id, in'],
  ['Interlingua', 'ia'],
  ['Interlingue', 'ie'],
  ['Inuktitut', 'iu'],
  ['Inupiak', 'ik'],
  ['Irish', 'ga'],
  ['Italian', 'it'],
  ['Japanese', 'ja'],
  ['Javanese', 'jv'],
  ['Kalaallisut, Greenlandic', 'kl'],
  ['Kannada', 'kn'],
  ['Kanuri', 'kr'],
  ['Kashmiri', 'ks'],
  ['Kazakh', 'kk'],
  ['Khmer', 'km'],
  ['Kikuyu', 'ki'],
  ['Kinyarwanda (Rwanda)', 'rw'],
  ['Kirundi', 'rn'],
  ['Kyrgyz', 'ky'],
  ['Komi', 'kv'],
  ['Kongo', 'kg'],
  ['Korean', 'ko'],
  ['Kurdish', 'ku'],
  ['Kwanyama', 'kj'],
  ['Lao', 'lo'],
  ['Latin', 'la'],
  ['Latvian (Lettish)', 'lv'],
  ['Limburgish ( Limburger)', 'li'],
  ['Lingala', 'ln'],
  ['Lithuanian', 'lt'],
  ['Luga-Katanga', 'lu'],
  ['Luganda, Ganda', 'lg'],
  ['Luxembourgish', 'lb'],
  ['Manx', 'gv'],
  ['Macedonian', 'mk'],
  ['Malagasy', 'mg'],
  ['Malay', 'ms'],
  ['Malayalam', 'ml'],
  ['Maltese', 'mt'],
  ['Maori', 'mi'],
  ['Marathi', 'mr'],
  ['Marshallese', 'mh'],
  ['Moldavian', 'mo'],
  ['Mongolian', 'mn'],
  ['Nauru', 'na'],
  ['Navajo', 'nv'],
  ['Ndonga', 'ng'],
  ['Northern Ndebele', 'nd'],
  ['Nepali', 'ne'],
  ['Norwegian', 'no'],
  ['Norwegian bokmål', 'nb'],
  ['Norwegian nynorsk', 'nn'],
  ['Nuosu', 'ii'],
  ['Occitan', 'oc'],
  ['Ojibwe', 'oj'],
  ['Old Church Slavonic, Old Bulgarian', 'cu'],
  ['Oriya', 'or'],
  ['Oromo (Afaan Oromo)', 'om'],
  ['Ossetian', 'os'],
  ['Pāli', 'pi'],
  ['Pashto, Pushto', 'ps'],
  ['Persian (Farsi)', 'fa'],
  ['Polish', 'pl'],
  ['Portuguese', 'pt'],
  ['Punjabi (Eastern)', 'pa'],
  ['Quechua', 'qu'],
  ['Romansh', 'rm'],
  ['Romanian', 'ro'],
  ['Russian', 'ru'],
  ['Sami', 'se'],
  ['Samoan', 'sm'],
  ['Sango', 'sg'],
  ['Sanskrit', 'sa'],
  ['Serbian', 'sr'],
  ['Serbo-Croatian', 'sh'],
  ['Sesotho', 'st'],
  ['Setswana', 'tn'],
  ['Shona', 'sn'],
  ['Sichuan Yi', 'ii'],
  ['Sindhi', 'sd'],
  ['Sinhalese', 'si'],
  ['Siswati', 'ss'],
  ['Slovak', 'sk'],
  ['Slovenian', 'sl'],
  ['Somali', 'so'],
  ['Southern Ndebele', 'nr'],
  ['Spanish', 'es'],
  ['Sundanese', 'su'],
  ['Swahili (Kiswahili)', 'sw'],
  ['Swati', 'ss'],
  ['Swedish', 'sv'],
  ['Tagalog', 'tl'],
  ['Tahitian', 'ty'],
  ['Tajik', 'tg'],
  ['Tamil', 'ta'],
  ['Tatar', 'tt'],
  ['Telugu', 'te'],
  ['Thai', 'th'],
  ['Tibetan', 'bo'],
  ['Tigrinya', 'ti'],
  ['Tonga', 'to'],
  ['Tsonga', 'ts'],
  ['Turkish', 'tr'],
  ['Turkmen', 'tk'],
  ['Twi', 'tw'],
  ['Uyghur', 'ug'],
  ['Ukrainian', 'uk'],
  ['Urdu', 'ur'],
  ['Uzbek', 'uz'],
  ['Venda', 've'],
  ['Vietnamese', 'vi'],
  ['Volapük', 'vo'],
  ['Wallon', 'wa'],
  ['Welsh', 'cy'],
  ['Wolof', 'wo'],
  ['Western Frisian', 'fy'],
  ['Xhosa', 'xh'],
  ['Yiddish', 'yi, ji'],
  ['Yoruba', 'yo'],
  ['Zhuang, Chuang', 'za'],
  ['Zulu', 'zu'],
];
export const timezoneList = {
  '(GMT-11:00) Pago Pago': 'Pacific/Pago_Pago',
  '(GMT-10:00) Hawaii Time': 'Pacific/Honolulu',
  '(GMT-08:00) Pacific Time': 'America/Los_Angeles',
  '(GMT-08:00) Pacific Time - Tijuana': 'America/Tijuana',
  '(GMT-07:00) Mountain Time': 'America/Denver',
  '(GMT-07:00) Mountain Time - Arizona': 'America/Phoenix',
  '(GMT-07:00) Mountain Time - Chihuahua, Mazatlan': 'America/Mazatlan',
  '(GMT-06:00) Central Time': 'America/Chicago',
  '(GMT-06:00) Central Time - Mexico City': 'America/Mexico_City',
  '(GMT-06:00) Central Time - Regina': 'America/Regina',
  '(GMT-06:00) Guatemala': 'America/Guatemala',
  '(GMT-05:00) Bogota': 'America/Bogota',
  '(GMT-05:00) Eastern Time': 'America/New_York',
  '(GMT-05:00) Lima': 'America/Lima',
  '(GMT-04:30) Caracas': 'America/Caracas',
  '(GMT-04:00) Atlantic Time - Halifax': 'America/Halifax',
  '(GMT-04:00) Guyana': 'America/Guyana',
  '(GMT-04:00) La Paz': 'America/La_Paz',
  '(GMT-03:00) Buenos Aires': 'America/Argentina/Buenos_Aires',
  '(GMT-03:00) Godthab': 'America/Godthab',
  '(GMT-03:00) Montevideo': 'America/Montevideo',
  '(GMT-03:30) Newfoundland Time - St. Johns': 'America/St_Johns',
  '(GMT-03:00) Santiago': 'America/Santiago',
  '(GMT-02:00) Sao Paulo': 'America/Sao_Paulo',
  '(GMT-02:00) South Georgia': 'Atlantic/South_Georgia',
  '(GMT-01:00) Azores': 'Atlantic/Azores',
  '(GMT-01:00) Cape Verde': 'Atlantic/Cape_Verde',
  '(GMT+00:00) Casablanca': 'Africa/Casablanca',
  '(GMT+00:00) Dublin': 'Europe/Dublin',
  '(GMT+00:00) Lisbon': 'Europe/Lisbon',
  '(GMT+00:00) London': 'Europe/London',
  '(GMT+00:00) Monrovia': 'Africa/Monrovia',
  '(GMT+01:00) Algiers': 'Africa/Algiers',
  '(GMT+01:00) Amsterdam': 'Europe/Amsterdam',
  '(GMT+01:00) Berlin': 'Europe/Berlin',
  '(GMT+01:00) Brussels': 'Europe/Brussels',
  '(GMT+01:00) Budapest': 'Europe/Budapest',
  '(GMT+01:00) Central European Time - Belgrade': 'Europe/Belgrade',
  '(GMT+01:00) Central European Time - Prague': 'Europe/Prague',
  '(GMT+01:00) Copenhagen': 'Europe/Copenhagen',
  '(GMT+01:00) Madrid': 'Europe/Madrid',
  '(GMT+01:00) Paris': 'Europe/Paris',
  '(GMT+01:00) Rome': 'Europe/Rome',
  '(GMT+01:00) Stockholm': 'Europe/Stockholm',
  '(GMT+01:00) Vienna': 'Europe/Vienna',
  '(GMT+01:00) Warsaw': 'Europe/Warsaw',
  '(GMT+02:00) Athens': 'Europe/Athens',
  '(GMT+02:00) Bucharest': 'Europe/Bucharest',
  '(GMT+02:00) Cairo': 'Africa/Cairo',
  '(GMT+02:00) Jerusalem': 'Asia/Jerusalem',
  '(GMT+02:00) Johannesburg': 'Africa/Johannesburg',
  '(GMT+02:00) Helsinki': 'Europe/Helsinki',
  '(GMT+02:00) Kiev': 'Europe/Kiev',
  '(GMT+02:00) Moscow-01 - Kaliningrad': 'Europe/Kaliningrad',
  '(GMT+02:00) Riga': 'Europe/Riga',
  '(GMT+02:00) Sofia': 'Europe/Sofia',
  '(GMT+02:00) Tallinn': 'Europe/Tallinn',
  '(GMT+02:00) Vilnius': 'Europe/Vilnius',
  '(GMT+03:00) Istanbul': 'Europe/Istanbul',
  '(GMT+03:00) Baghdad': 'Asia/Baghdad',
  '(GMT+03:00) Nairobi': 'Africa/Nairobi',
  '(GMT+03:00) Minsk': 'Europe/Minsk',
  '(GMT+03:00) Riyadh': 'Asia/Riyadh',
  '(GMT+03:00) Moscow+00 - Moscow': 'Europe/Moscow',
  '(GMT+03:30) Tehran': 'Asia/Tehran',
  '(GMT+04:00) Baku': 'Asia/Baku',
  '(GMT+04:00) Moscow+01 - Samara': 'Europe/Samara',
  '(GMT+04:00) Tbilisi': 'Asia/Tbilisi',
  '(GMT+04:00) Yerevan': 'Asia/Yerevan',
  '(GMT+04:30) Kabul': 'Asia/Kabul',
  '(GMT+05:00) Karachi': 'Asia/Karachi',
  '(GMT+05:00) Moscow+02 - Yekaterinburg': 'Asia/Yekaterinburg',
  '(GMT+05:00) Tashkent': 'Asia/Tashkent',
  '(GMT+05:30) Colombo': 'Asia/Colombo',
  '(GMT+06:00) Almaty': 'Asia/Almaty',
  '(GMT+06:00) Dhaka': 'Asia/Dhaka',
  '(GMT+06:30) Rangoon': 'Asia/Rangoon',
  '(GMT+07:00) Bangkok': 'Asia/Bangkok',
  '(GMT+07:00) Jakarta': 'Asia/Jakarta',
  '(GMT+07:00) Moscow+04 - Krasnoyarsk': 'Asia/Krasnoyarsk',
  '(GMT+08:00) China Time - Beijing': 'Asia/Shanghai',
  '(GMT+08:00) Hong Kong': 'Asia/Hong_Kong',
  '(GMT+08:00) Kuala Lumpur': 'Asia/Kuala_Lumpur',
  '(GMT+08:00) Moscow+05 - Irkutsk': 'Asia/Irkutsk',
  '(GMT+08:00) Singapore': 'Asia/Singapore',
  '(GMT+08:00) Taipei': 'Asia/Taipei',
  '(GMT+08:00) Ulaanbaatar': 'Asia/Ulaanbaatar',
  '(GMT+08:00) Western Time - Perth': 'Australia/Perth',
  '(GMT+09:00) Moscow+06 - Yakutsk': 'Asia/Yakutsk',
  '(GMT+09:00) Seoul': 'Asia/Seoul',
  '(GMT+09:00) Tokyo': 'Asia/Tokyo',
  '(GMT+09:30) Central Time - Darwin': 'Australia/Darwin',
  '(GMT+10:00) Eastern Time - Brisbane': 'Australia/Brisbane',
  '(GMT+10:00) Guam': 'Pacific/Guam',
  '(GMT+10:00) Moscow+07 - Magadan': 'Asia/Magadan',
  '(GMT+10:00) Moscow+07 - Yuzhno-Sakhalinsk': 'Asia/Vladivostok',
  '(GMT+10:00) Port Moresby': 'Pacific/Port_Moresby',
  '(GMT+10:30) Central Time - Adelaide': 'Australia/Adelaide',
  '(GMT+11:00) Eastern Time - Hobart': 'Australia/Hobart',
  '(GMT+11:00) Eastern Time - Melbourne, Sydney': 'Australia/Sydney',
  '(GMT+11:00) Guadalcanal': 'Pacific/Guadalcanal',
  '(GMT+11:00) Noumea': 'Pacific/Noumea',
  '(GMT+12:00) Majuro': 'Pacific/Majuro',
  '(GMT+12:00) Moscow+09 - Petropavlovsk-Kamchatskiy': 'Asia/Kamchatka',
  '(GMT+13:00) Auckland': 'Pacific/Auckland',
  '(GMT+13:00) Fakaofo': 'Pacific/Fakaofo',
  '(GMT+13:00) Fiji': 'Pacific/Fiji',
  '(GMT+13:00) Tongatapu': 'Pacific/Tongatapu',
  '(GMT+14:00) Apia': 'Pacific/Apia',
};

export const hourlyData = {
  tier1: {
    tech: 100,
    us: 115,
  },
  tier2: {
    tech: 120,
    us: 140,
  },
  it: {
    tech: 130,
    us: 150,
  },
};

export const JobTags = {
  DRAFT_JOB_CREATED: 'draft_job_created',
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  SCHEDULE: 'schedule_job_clicked',
  GET_HELP_NOW: 'get_help_now_clicked',
  DECLINED: 'declined_job',
  CARD_ADDED: 'card_added',
  HAVE_CARD: 'have_card',
  SCHEDULE_POST: 'schedule_job_posted',
  FINDTECH: 'finding_technician',
  TECH_ACCEPT_JOB: 'technician_accept_job',
  TECH_ACCEPT_SCHEDULE_JOB: 'tech_accept_schedule_job',
  TECH_DECLINED_JOB: 'technician_declined_job',
  DECLINED_AFTER_SEARCH: 'declined_after_search',
  SCHEDULE_AFTER_SEARCH: 'schedule_after_search',
  KEEP_SEARCHING: 'keep_searching',
  CUSTOMER_START_CALL: 'customer_start_call',
  CUSTOMER_START_SCHEDULE_CALL: 'customer_start_schedule_call',
  CUSTOMER_DECLINED_CALL: 'customer_declined_call',
  TECHNICIAN_START_CALL: 'technician_start_call',
  TECHNICIAN_SUBMIT_FEEDBACK: 'technician_submit_feedback',
  CUSTOMER_SUBMIT_FEEDBACK: 'customer_submit_feedback',
  TECH_SUBMIT_FOR_APPROVAL_WITHOUT_EDIT: 'technician_submit_for_approval_without_edit',
  TECH_SUBMIT_FOR_APPROVAL_WITH_EDIT: 'technician_submit_for_approval_with_edit',
  TECH_ADD_MORE_HOURS: 'technician_add_more_hours',
  CUSTOMER_ACCEPT_LONG_JOB_APPROVAL: 'customer_accept_long_job_approval',
  CUSTOMER_REJECT_LONG_JOB_APPROVAL: 'customer_reject_long_job_approval',
  CUSTOMER_ACCEPT_ADDITIONAL_HOURS: 'customer_accept_additional_hours',
  CUSTOMER_REJECT_ADDITIONAL_HOURS: 'customer_reject_additional_hours',
  GET_HELP_NOW_AFTER_TRANSFER: 'get_help_now_clicked_after_transfer',
  SCHEDULE_AFTER_TRANSFER: 'schedule_job_clicked_after_transfer',
  DECLINED_AFTER_TRANSFER: 'declined_job_after_transfer',
  CARD_ADDED_AFTER_TRANSFER: 'card_added_after_transfer',
  HAVE_CARD_AFTER_TRANSFER: 'have_card_after_transfer',
  SCHEDULE_POST_TRANSFER: 'schedule_job_posted_transferred_job',
  FINDTECH_AFTER_TRANSFER: 'finding_technician_transferred_job',
  TECHNICIAN_ACCEPT_AFTER_TRANSFER: 'technician_accept_transferred_job',
  TECHNICIAN_DECLINED_AFTER_TRANSFER: 'technician_declined_transferred_job',
  CUSTOMER_START_CALL_AFTER_TRANSFER: 'customer_start_call_after_transfer',
  TECHNICIAN_START_CALL_AFTER_TRANSFER: 'technician_start_call_transferred_job',
  TECHNICIAN_SUBMIT_FEEDBACK_AFTER_TRANSFER: 'technician_submit_feedback_transferred_job',
  CUSTOMER_SUBMIT_FEEDBACK_AFTER_TRANSFER: 'customer_submit_feedback_transferred_job',
  KEEP_SEARCH_AFTER_TRANSFER: 'keep_searching_transferred_job',
}

export const noNeedOfAdminReview = [
  "Out of my scope",
  "Issue was with third party"
]

export const FULLSTORY_KEY1 = process.env.FULLSTORY_KEY
export const FULLSTORY_KEY = 'o-1FAW8F-na1'
export const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const addTime = 2;

export const JOB_STATUS = {
  PENDING: 'Pending',
  WAITING: 'Waiting',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'Inprogress',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  DECLINED: 'Declined',
  LONGJOB: 'long-job',
  ACCEPTED: 'Accepted',
  DRAFT: 'Draft',
  SCHEDULED_EXPIRED: "ScheduledExpired"
}

export const TWILIO_CHAT_USERNAME = process.env.REACT_APP_TWILIO_CHAT_USERNAME
export const TWILIO_CHAT_PASSWORD = process.env.REACT_APP_TWILIO_CHAT_PASSWORD

export const PAYMENT_DETAILS_MESSAGE = {
  PAYMENT_DETAILS_MAIN_HEAD_SUBSCRIPTION: 'Please enter your credit card details to buy subscription',
  PAYMENT_DETAILS_MAIN_HEAD: 'Please fill out the details below so we can finalize your request',
  PAYMENT_DETAILS_SUB_HEAD: "Don't worry, you won't be charged now. Billing begins only when a Geeker starts helping you.",
  PAYMNET_DETAILS_TITLE: 'New user? Your first 6 minutes are free!'
}

export const INDUSTRY = [
  { value: 'Please Select', label: 'Please Select', disabled: true },
  { value: 'IT', label: 'IT' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Support', label: 'Support' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Others', label: 'Others' },
]

export const TEAM_SIZE = [
  { value: 'Please Choose', label: 'Please Choose', disabled: true },
  { value: '0-5', label: '0-5' },
  { value: '6-10', label: '6-10' },
  { value: '11-15', label: '11-15' },
  { value: '16-20', label: '16-20' },
  { value: '20+', label: '20+' },
]

export let GOOGLE_TAG_MANAGER_ID = process.env.REACT_APP_GOOGLE_TAG_MANAGER_ID;
export let GOOGLE_TAG_MANAGER_CUSTOM_DOMAIN = process.env.REACT_APP_GOOGLE_TAG_MANAGER_CUSTOM_DOMAIN;
export const popularSoftwareIdTest = "prod_L48RZC1LdX4T3i"
export const popularSoftwareIdLive = "prod_O9qO91lSM9dFe9"

export const soshanaContactDetails = {
  name: "Sarah Wolfson",
  email: "sarah@geeker.co",
  phoneNumber: "9736624040 ×1159"
}
