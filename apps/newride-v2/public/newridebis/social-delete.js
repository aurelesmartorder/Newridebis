/* Kept separate so authorization/error behavior can be tested without a live deletion. */
async function deleteOwnedSocialPost(client, postId, userId) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(postId || '') || !uuid.test(userId || '')) throw new Error('Invalid deletion');
  const {data, error} = await client.from('posts').delete().eq('id',postId).eq('user_id',userId).select('id,photo_url');
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1 || data[0].id !== postId) throw new Error('Deletion not confirmed');
  return data[0];
}
