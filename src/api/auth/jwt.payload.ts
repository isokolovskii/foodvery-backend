export interface JwtPayload {
  /**
   * User ID
   */
  uuid: string;
  /**
   * User email
   */
  email: string;
  /**
   * Session ID
   */
  sessionUuid: string;
}
