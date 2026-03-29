import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Text,
  TextField,
  Heading,
  View,
  Divider,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";

/**
 * Displays and manages comments for a single note.
 * Fetches comments by noteId using the LSI sorted by createdAt.
 * Allows authenticated users to post new comments.
 */

export default function Comments({ noteId }) {
  const [comments, setComments] = useState([]);
  const [authorEmail, setAuthorEmail] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    fetchComments();
  }, [noteId]);

  async function loadCurrentUser() {
    const attrs = await fetchUserAttributes();
    setAuthorEmail(attrs.email ?? "");
  }

  async function fetchComments() {
    const client = generateClient({ authMode: "userPool" });
    const { data } = await client.models.Comment.listCommentsByNoteId(
      { noteId },
      { sortDirection: "ASC" }
    );
    setComments((data ?? []).filter(Boolean));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const message = form.get("message");

    if (!message?.trim() || !authorEmail) return;

    const client = generateClient({ authMode: "userPool" });
    await client.models.Comment.create({
      noteId,
      userId: authorEmail,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    event.target.reset();
    fetchComments();
  }

  return (
    <View width="100%">
      <Divider marginBlock="0.75rem" />
      <Heading level={5} marginBottom="0.5rem">
        Comments
      </Heading>

      <View as="form" onSubmit={handleSubmit}>
        <Flex direction="row" gap="0.5rem" alignItems="flex-end">
          <TextField
            name="message"
            placeholder="Write a comment..."
            label="Comment"
            labelHidden
            variation="quiet"
            required
            flex={1}
          />
          <Button type="submit" size="small" variation="primary">
            Post
          </Button>
        </Flex>
      </View>

      <Flex direction="column" gap="0.5rem" marginTop="0.75rem">
        {comments.length === 0 && (
          <Text fontSize="0.85rem" color="var(--amplify-colors-neutral-60)">
            No comments yet.
          </Text>
        )}
        {comments.map((comment) => (
          <View
            key={comment.id}
            padding="0.5rem 0.75rem"
            backgroundColor="var(--amplify-colors-neutral-10)"
            borderRadius="6px"
          >
            <Text fontWeight="bold" fontSize="0.75rem" color="var(--amplify-colors-neutral-80)">
              {comment.userId}
            </Text>
            <Text fontSize="0.9rem" marginBlock="0.15rem">
              {comment.message}
            </Text>
            <Text fontSize="0.7rem" color="var(--amplify-colors-neutral-60)">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </Flex>
    </View>
  );
}
