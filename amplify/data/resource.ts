import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Note: a
    .model({
      name: a.string(),
      description: a.string(),
      image: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Comment: a
    .model({
      noteId: a.id().required(),
      userId: a.string().required(),
      message: a.string().required(),
      createdAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [
      index('noteId').sortKeys(['createdAt']).queryField('listCommentsByNoteId'),
    ])
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});