export {
  DETERMINISTIC_RECOMMENDATION_POLICY_VERSION,
  DISTANCE_ABOVE_10_KM_WEIGHT,
  DISTANCE_UP_TO_10_KM_WEIGHT,
  DISTANCE_UP_TO_2_KM_WEIGHT,
  DISTANCE_UP_TO_5_KM_WEIGHT,
  distanceWeight,
  generateDeterministicPlaceRecommendations,
  INTEREST_MATCH_WEIGHT,
  SUPPORTED_INTEREST_CATEGORY_MAP,
  unsupportedTravelerInterests,
} from "./deterministic-recommendations";

export type {
  DeterministicRecommendationContext,
  GeneratedPlaceRecommendation,
  GenerateDeterministicRecommendationsInput,
  TravelerInterest,
} from "./deterministic-recommendations";

export {
  createRecommendationContextFingerprint,
  fingerprintRecommendation,
} from "./recommendation-fingerprint";
export type { RecommendationContextFingerprintInput } from "./recommendation-fingerprint";

export {
  acceptRecommendation,
  createDecisionId,
  createRecommendation,
  createRecommendationId,
  expireRecommendation,
  invalidateRecommendation,
  isRecommendationExpiredAt,
  presentRecommendation,
  RecommendationTransitionError,
  RecommendationValidationError,
  recommendationStatuses,
  rejectRecommendation,
  supersedeRecommendation,
} from "./recommendation";

export type {
  CreateRecommendationInput,
  DecisionContextSnapshot,
  DecisionId,
  Recommendation,
  RecommendationConfidence,
  RecommendationConfidenceLevel,
  RecommendationEvidenceValue,
  RecommendationGenerationMetadata,
  RecommendationId,
  RecommendationLimitation,
  RecommendationReason,
  RecommendationScore,
  RecommendationStatus,
  RecommendationTarget,
  RecommendationValidity,
} from "./recommendation";

export { createDecision, DecisionValidationError } from "./decision";
export type {
  AddToItineraryDecisionOption,
  CreateDecisionInput,
  Decision,
  DecisionEffect,
  DecisionOption,
  DecisionType,
  SavePlaceDecisionOption,
} from "./decision";

export { RecommendationRepositoryError } from "./repository";
export type { RecommendationRepository, SaveGeneratedRecommendationMode } from "./repository";
