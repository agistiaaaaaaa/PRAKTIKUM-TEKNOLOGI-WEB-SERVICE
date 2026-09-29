import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request } from 'express';
import { GraphQLFormattedError } from 'graphql';

// NestJS hanya memetakan 400/401/403/422 ke kode GraphQL; status lain menjadi
// INTERNAL_SERVER_ERROR. Tabel ini melengkapi status yang dipakai WisataKu.
const STATUS_CODES: Record<number, string> = {
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  503: 'SERVICE_UNAVAILABLE',
};

export function formatGraphqlError(error: GraphQLFormattedError): GraphQLFormattedError {
  const status = error.extensions?.status;
  const code = typeof status === 'number' ? STATUS_CODES[status] : undefined;
  if (!code) {
    return error;
  }
  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
    extensions: { ...error.extensions, code },
  };
}

/**
 * Opsi GraphQL code-first yang dipakai wisataku-api dan gateway.
 * Di production (Docker) skema dibuat di memori karena folder src tidak ikut ke image.
 */
export function graphqlOptions(schemaFile: string): ApolloDriverConfig {
  return {
    driver: ApolloDriver,
    autoSchemaFile: process.env.NODE_ENV === 'production' ? true : schemaFile,
    sortSchema: true,
    playground: false,
    // Introspection tetap aktif agar Apollo Sandbox bisa dipakai saat demo, termasuk di Docker
    introspection: true,
    includeStacktraceInErrorResponses: false,
    formatError: formatGraphqlError,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    context: ({ req }: { req: Request }) => ({ req }),
  };
}
