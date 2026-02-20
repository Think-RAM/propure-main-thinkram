/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_absBuildingApproval from "../functions/absBuildingApproval.js";
import type * as functions_absMarketData from "../functions/absMarketData.js";
import type * as functions_absPopulationProjections from "../functions/absPopulationProjections.js";
import type * as functions_chat from "../functions/chat.js";
import type * as functions_properties from "../functions/properties.js";
import type * as functions_sa2geocode from "../functions/sa2geocode.js";
import type * as functions_scrapingLocations from "../functions/scrapingLocations.js";
import type * as functions_strategy from "../functions/strategy.js";
import type * as functions_suburb from "../functions/suburb.js";
import type * as functions_suburbMetrics from "../functions/suburbMetrics.js";
import type * as functions_user from "../functions/user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/absBuildingApproval": typeof functions_absBuildingApproval;
  "functions/absMarketData": typeof functions_absMarketData;
  "functions/absPopulationProjections": typeof functions_absPopulationProjections;
  "functions/chat": typeof functions_chat;
  "functions/properties": typeof functions_properties;
  "functions/sa2geocode": typeof functions_sa2geocode;
  "functions/scrapingLocations": typeof functions_scrapingLocations;
  "functions/strategy": typeof functions_strategy;
  "functions/suburb": typeof functions_suburb;
  "functions/suburbMetrics": typeof functions_suburbMetrics;
  "functions/user": typeof functions_user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
