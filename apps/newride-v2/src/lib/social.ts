export type SocialAction =
  | "social-refresh"
  | "publish"
  | "like"
  | "comment"
  | "friend-request"
  | "friend-accept";
export function validSocialPayload(command: SocialAction, text = "", id = "") {
  if (command === "social-refresh") return true;
  if (command === "publish")
    return text.trim().length > 0 && text.length <= 4000;
  if (command === "friend-request")
    return text.trim().length >= 2 && text.trim().length <= 80;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return false;
  return (
    command !== "comment" || (text.trim().length > 0 && text.length <= 2000)
  );
}
