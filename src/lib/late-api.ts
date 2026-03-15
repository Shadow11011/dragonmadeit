import Late from "@getlatedev/node";

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

function createClient(): Late {
  const apiKey = process.env["LATE_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "LATE_API_KEY environment variable is not set. " +
        "Add it to your .env file to use the Late API.",
    );
  }
  return new Late({ apiKey });
}

let _client: Late | null = null;

function getClient(): Late {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}

// ---------------------------------------------------------------------------
// SDK response shapes (mirrored from @getlatedev/node declarations)
// The SDK depends on @hey-api/client-fetch which is not a runtime dependency,
// so its generic response types resolve to `unknown`. We define the expected
// response shapes here and assert them after the safety check in `unwrap`.
// ---------------------------------------------------------------------------

interface SdkProfile {
  _id?: string;
  name?: string;
  description?: string;
}

interface SdkProfileCreateResponse {
  message?: string;
  profile?: SdkProfile;
}

interface SdkProfileDeleteResponse {
  message?: string;
}

interface SdkConnectUrlResponse {
  authUrl?: string;
  state?: string;
}

interface SdkAccountHealthResponse {
  accountId?: string;
  platform?: string;
  username?: string;
  displayName?: string;
  status?: "healthy" | "warning" | "error";
  tokenStatus?: {
    valid?: boolean;
    expiresAt?: string;
    expiresIn?: string;
    needsRefresh?: boolean;
  };
  permissions?: {
    posting?: Array<{ scope?: string; granted?: boolean; required?: boolean }>;
    analytics?: Array<{ scope?: string; granted?: boolean; required?: boolean }>;
    optional?: Array<{ scope?: string; granted?: boolean; required?: boolean }>;
    canPost?: boolean;
    canFetchAnalytics?: boolean;
    missingRequired?: string[];
  };
  issues?: string[];
  recommendations?: string[];
}

interface SdkDeleteAccountResponse {
  message?: string;
}

interface SdkPresignedUrlResponse {
  uploadUrl?: string;
  publicUrl?: string;
  key?: string;
  type?: "image" | "video" | "document";
}

interface SdkPost {
  _id?: string;
  content?: string;
  status?: "draft" | "scheduled" | "publishing" | "published" | "failed" | "partial";
  scheduledFor?: string;
  createdAt?: string;
}

interface SdkPostCreateResponse {
  message?: string;
  post?: SdkPost;
}

// ---------------------------------------------------------------------------
// Exported return-type interfaces
// ---------------------------------------------------------------------------

export interface LateProfile {
  id: string;
}

export interface TikTokConnectUrl {
  authUrl: string;
  state: string;
}

export interface AccountHealthStatus {
  accountId: string;
  platform: string;
  username: string;
  displayName: string;
  status: "healthy" | "warning" | "error";
  tokenStatus: {
    valid: boolean;
    expiresAt: string | null;
    expiresIn: string | null;
    needsRefresh: boolean;
  };
  permissions: {
    canPost: boolean;
    canFetchAnalytics: boolean;
    missingRequired: string[];
  };
  issues: string[];
  recommendations: string[];
}

export interface PresignedMedia {
  uploadUrl: string;
  publicUrl: string;
}

export interface LateMediaItem {
  type: "image" | "video" | "gif" | "document";
  url: string;
}

export interface LatePlatformTarget {
  platform: string;
  accountId: string;
  customContent?: string;
  scheduledFor?: string;
}

export interface TikTokSettings {
  privacyLevel?: string;
  allowComment?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  contentPreviewConfirmed?: boolean;
  expressConsentGiven?: boolean;
  videoMadeWithAi?: boolean;
  draft?: boolean;
}

export interface CreatePostParams {
  content: string;
  mediaItems: LateMediaItem[];
  platforms: LatePlatformTarget[];
  scheduledFor?: string;
  publishNow?: boolean;
  tiktokSettings?: TikTokSettings;
  tags?: string[];
  hashtags?: string[];
}

export interface LatePost {
  id: string;
  content: string | null;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed" | "partial";
  scheduledFor: string | null;
  createdAt: string | null;
}

// ---------------------------------------------------------------------------
// Helper: extract `data` from SDK response or throw
// ---------------------------------------------------------------------------

function unwrap<T>(
  response: { data?: unknown; error?: unknown },
  context: string,
): T {
  if (response.error) {
    const err = response.error;
    const msg =
      typeof err === "object" && err !== null && "error" in err
        ? String((err as Record<string, unknown>).error)
        : JSON.stringify(err);
    throw new Error(`Late API error (${context}): ${msg}`);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(`Late API returned no data (${context})`);
  }
  return response.data as T;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Create a Late profile that acts as a workspace container for accounts.
 */
export async function createProfile(
  name: string,
  description?: string,
): Promise<LateProfile> {
  const client = getClient();
  const response = await client.profiles.createProfile({
    body: { name, description },
  });
  const data = unwrap<SdkProfileCreateResponse>(response, "createProfile");
  const profileId = data.profile?._id;
  if (!profileId) {
    throw new Error("Late API createProfile did not return a profile ID");
  }
  return { id: profileId };
}

/**
 * Permanently delete a Late profile.
 */
export async function deleteProfile(profileId: string): Promise<void> {
  const client = getClient();
  const response = await client.profiles.deleteProfile({
    path: { profileId },
  });
  unwrap<SdkProfileDeleteResponse>(response, "deleteProfile");
}

/**
 * Get the TikTok OAuth URL that the user should be redirected to.
 */
export async function getTikTokConnectUrl(
  profileId: string,
  redirectUrl: string,
): Promise<TikTokConnectUrl> {
  const client = getClient();
  const response = await client.connect.getConnectUrl({
    path: { platform: "tiktok" },
    query: { profileId, redirect_url: redirectUrl },
  });
  const data = unwrap<SdkConnectUrlResponse>(response, "getTikTokConnectUrl");
  if (!data.authUrl || !data.state) {
    throw new Error(
      "Late API getTikTokConnectUrl did not return authUrl or state",
    );
  }
  return { authUrl: data.authUrl, state: data.state };
}

/**
 * Check the health / token status of a connected social account.
 */
export async function getAccountHealth(
  accountId: string,
): Promise<AccountHealthStatus> {
  const client = getClient();
  const response = await client.accounts.getAccountHealth({
    path: { accountId },
  });
  const data = unwrap<SdkAccountHealthResponse>(response, "getAccountHealth");
  return {
    accountId: data.accountId ?? accountId,
    platform: data.platform ?? "unknown",
    username: data.username ?? "",
    displayName: data.displayName ?? "",
    status: data.status ?? "error",
    tokenStatus: {
      valid: data.tokenStatus?.valid ?? false,
      expiresAt: data.tokenStatus?.expiresAt ?? null,
      expiresIn: data.tokenStatus?.expiresIn ?? null,
      needsRefresh: data.tokenStatus?.needsRefresh ?? false,
    },
    permissions: {
      canPost: data.permissions?.canPost ?? false,
      canFetchAnalytics: data.permissions?.canFetchAnalytics ?? false,
      missingRequired: data.permissions?.missingRequired ?? [],
    },
    issues: data.issues ?? [],
    recommendations: data.recommendations ?? [],
  };
}

/**
 * Disconnect (delete) a social account from Late.
 */
export async function disconnectAccount(accountId: string): Promise<void> {
  const client = getClient();
  const response = await client.accounts.deleteAccount({
    path: { accountId },
  });
  unwrap<SdkDeleteAccountResponse>(response, "disconnectAccount");
}

/**
 * Get a presigned upload URL for media (video/image) to attach to posts.
 */
export async function presignMedia(
  fileName: string,
  contentType: string,
): Promise<PresignedMedia> {
  const client = getClient();
  const response = await client.media.getMediaPresignedUrl({
    body: {
      filename: fileName,
      contentType: contentType as
        | "image/jpeg"
        | "image/jpg"
        | "image/png"
        | "image/webp"
        | "image/gif"
        | "video/mp4"
        | "video/mpeg"
        | "video/quicktime"
        | "video/avi"
        | "video/x-msvideo"
        | "video/webm"
        | "video/x-m4v"
        | "application/pdf",
    },
  });
  const data = unwrap<SdkPresignedUrlResponse>(response, "presignMedia");
  if (!data.uploadUrl || !data.publicUrl) {
    throw new Error(
      "Late API presignMedia did not return uploadUrl or publicUrl",
    );
  }
  return { uploadUrl: data.uploadUrl, publicUrl: data.publicUrl };
}

/**
 * Create (and optionally schedule or publish) a social media post.
 * This is the main entry point the n8n pipeline will call.
 */
export async function createPost(params: CreatePostParams): Promise<LatePost> {
  const client = getClient();
  const response = await client.posts.createPost({
    body: {
      content: params.content,
      mediaItems: params.mediaItems.map((m) => ({
        type: m.type,
        url: m.url,
      })),
      platforms: params.platforms.map((p) => ({
        platform: p.platform,
        accountId: p.accountId,
        customContent: p.customContent,
        scheduledFor: p.scheduledFor,
      })),
      scheduledFor: params.scheduledFor,
      publishNow: params.publishNow,
      tiktokSettings: params.tiktokSettings
        ? {
            privacyLevel: params.tiktokSettings.privacyLevel,
            allowComment: params.tiktokSettings.allowComment,
            allowDuet: params.tiktokSettings.allowDuet,
            allowStitch: params.tiktokSettings.allowStitch,
            contentPreviewConfirmed:
              params.tiktokSettings.contentPreviewConfirmed,
            expressConsentGiven: params.tiktokSettings.expressConsentGiven,
            videoMadeWithAi: params.tiktokSettings.videoMadeWithAi,
            draft: params.tiktokSettings.draft,
          }
        : undefined,
      tags: params.tags,
      hashtags: params.hashtags,
    },
  });
  const data = unwrap<SdkPostCreateResponse>(response, "createPost");
  const post = data.post;
  if (!post?._id) {
    throw new Error("Late API createPost did not return a post ID");
  }
  return {
    id: post._id,
    content: post.content ?? null,
    status: post.status ?? "scheduled",
    scheduledFor: post.scheduledFor ?? null,
    createdAt: post.createdAt ?? null,
  };
}
