import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookies from "universal-cookie";
import merge from "deepmerge";
import isEqual from "lodash/isEqual";
import { useMemo } from "react";
import { GetServerSidePropsContext } from "next";
import { getMainDefinition } from "@apollo/client/utilities";
const cookies = new Cookies();
if (!process.env.NEXT_PUBLIC_GQL_API_URL) {
  throw "GRAPHQL API IS UNDEFINED ! ";
}
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GQL_API_URL,
});
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";

const wsLink =
  typeof window !== "undefined"
    ? new WebSocketLink(
        new SubscriptionClient(process.env.NEXT_PUBLIC_GQL_WS_URL, {
          connectionParams: {
            Authorization: `Bearer ${cookies.get("clickandwin_user_token")}`,
          },
        })
      )
    : null;

const splitLink = (req?: AuthLinkParam) =>
  typeof window !== "undefined"
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);

          const test =
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription";

          return test;
        },
        wsLink,
        authLink(req).concat(httpLink)
      )
    : authLink(req).concat(httpLink);
type AuthLinkParam = GetServerSidePropsContext["req"] | string;

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";
let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

const authLink = (req?: AuthLinkParam) => {
  return setContext((_, context) => {
    // Get the token from the client side
    let token = null;
    if (typeof window !== "undefined") {
      token = cookies.get("clickandwin_user_token") || null;
    } else if (req) {
      if (typeof req === "string") {
        token = req;
      } else {
        const cookies = new Cookies(req.headers.cookie);
        token = cookies.get("clickandwin_user_token") || null;
      }
    }
    // return the headers to the context so httpLink can read them
    if (!token) return context;
    return {
      ...context,
      headers: {
        ...(context.headers || {}),
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
};

const client = new ApolloClient({
  link: splitLink(),
  cache: new InMemoryCache({ addTypename: true }),
  ssrMode: true,
});

export default client;

function createApolloClient(req?: AuthLinkParam) {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: splitLink(req),
    cache: new InMemoryCache({ addTypename: true }),
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null,
  req?: AuthLinkParam
) {
  const _apolloClient = apolloClient ?? createApolloClient(req);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any
) {
  if (typeof pageProps?.props !== "undefined") {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: unknown) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}
