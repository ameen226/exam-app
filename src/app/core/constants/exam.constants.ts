// constants/exam.constants.ts

/**
 * Exam-related constants used throughout the application
 */
export const ExamConstants = {
  
  // Time-related constants
  TIME: {
    WARNING_THRESHOLD_SECONDS: 300, // 5 minutes
    AUTO_SAVE_INTERVAL_MS: 30000,   // 30 seconds
    TIMER_UPDATE_INTERVAL_MS: 1000,  // 1 second
    SESSION_TIMEOUT_MS: 7200000,     // 2 hours
  },

  // UI-related constants
  UI: {
    MAX_QUESTIONS_PER_GRID_ROW: 10,
    LOADING_DELAY_MS: 500,
    SUCCESS_MESSAGE_DURATION_MS: 5000,
    ERROR_MESSAGE_DURATION_MS: 10000,
    MODAL_ANIMATION_DURATION_MS: 300,
  },

  // Validation constants
  VALIDATION: {
    MIN_QUESTION_TEXT_LENGTH: 10,
    MAX_QUESTION_TEXT_LENGTH: 1000,
    MIN_ANSWER_TEXT_LENGTH: 1,
    MAX_ANSWER_TEXT_LENGTH: 200,
    MIN_ANSWERS_PER_QUESTION: 2,
    MAX_ANSWERS_PER_QUESTION: 6,
  },

  // API-related constants
  API: {
    REQUEST_TIMEOUT_MS: 30000,       // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },

  // Local storage keys
  STORAGE_KEYS: {
    EXAM_STATE: 'exam_state',
    USER_ANSWERS: 'user_answers',
    CURRENT_QUESTION: 'current_question',
    EXAM_START_TIME: 'exam_start_time',
    LAST_ACTIVITY: 'last_activity',
  },

  // Exam statuses
  EXAM_STATUS: {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    TIMED_OUT: 'timed_out',
    CANCELLED: 'cancelled',
  },

  // Screen types
  SCREENS: {
    SUBJECT_SELECTION: 'subject',
    EXAM: 'exam',
    RESULTS: 'results',
  },

  // Event names for analytics
  EVENTS: {
    EXAM_STARTED: 'exam_started',
    EXAM_SUBMITTED: 'exam_submitted',
    EXAM_TIMED_OUT: 'exam_timed_out',
    QUESTION_ANSWERED: 'question_answered',
    QUESTION_CHANGED: 'question_changed',
    EXAM_PAUSED: 'exam_paused',
    EXAM_RESUMED: 'exam_resumed',
    WARNING_SHOWN: 'warning_shown',
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to access this exam.',
    EXAM_NOT_FOUND: 'The requested exam could not be found.',
    EXAM_EXPIRED: 'This exam has expired and can no longer be accessed.',
    SUBMISSION_FAILED: 'Failed to submit exam. Please try again.',
    INVALID_SUBJECT: 'Please select a valid subject to continue.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    SERVER_ERROR: 'A server error occurred. Please try again later.',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    EXAM_STARTED: 'Exam started successfully!',
    EXAM_SUBMITTED: 'Exam submitted successfully!',
    ANSWERS_SAVED: 'Your answers have been saved.',
    EXAM_RESUMED: 'Your exam has been resumed from where you left off.',
  },

  // Warning messages
  WARNING_MESSAGES: {
    TIME_RUNNING_OUT: 'Warning: Less than 5 minutes remaining!',
    UNANSWERED_QUESTIONS: 'You have unanswered questions. They will be marked as incorrect.',
    LEAVE_EXAM: 'Are you sure you want to leave? Your progress may be lost.',
    SUBMIT_CONFIRMATION: 'Are you sure you want to submit your exam? This action cannot be undone.',
  },

  // Accessibility
  ACCESSIBILITY: {
    ANNOUNCEMENTS: {
      EXAM_STARTED: 'Exam has started. Good luck!',
      QUESTION_CHANGED: 'Moved to question {questionNumber} of {totalQuestions}',
      ANSWER_SELECTED: 'Answer {choiceLetter} selected for question {questionNumber}',
      TIME_WARNING: 'Warning: {timeLeft} remaining in exam',
      EXAM_SUBMITTED: 'Exam has been submitted successfully',
    },
    LABELS: {
      TIMER: 'Exam timer',
      PROGRESS: 'Exam progress',
      QUESTION_NAVIGATION: 'Question navigation',
      ANSWER_CHOICES: 'Answer choices',
      SUBMIT_BUTTON: 'Submit exam',
    },
  },

  // Responsive breakpoints (matching Bootstrap)
  BREAKPOINTS: {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400,
  },

  // Animation durations
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Question types (if you expand to different question types)
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    ESSAY: 'essay',
    FILL_IN_BLANK: 'fill_in_blank',
  },

  // Difficulty levels
  DIFFICULTY_LEVELS: {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    EXPERT: 4,
  },

  // Regular expressions for validation
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    POSITIVE_INTEGER: /^\d+$/,
  },

} as const;

/**
 * Type definitions for constants
 */
export type ExamScreen = typeof ExamConstants.SCREENS[keyof typeof ExamConstants.SCREENS];
export type ExamStatus = typeof ExamConstants.EXAM_STATUS[keyof typeof ExamConstants.EXAM_STATUS];
export type ExamEvent = typeof ExamConstants.EVENTS[keyof typeof ExamConstants.EVENTS];
export type DifficultyLevel = typeof ExamConstants.DIFFICULTY_LEVELS[keyof typeof ExamConstants.DIFFICULTY_LEVELS];
export type QuestionType = typeof ExamConstants.QUESTION_TYPES[keyof typeof ExamConstants.QUESTION_TYPES];