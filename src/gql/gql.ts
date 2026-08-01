/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "\n  query AdminOrdersPageQuery {\n    ordersCollection(orderBy: [{ created_at: DescNullsLast }]) {\n      edges {\n        node {\n          __typename\n          id\n          ...OrderColumnsFragment\n        }\n      }\n    }\n  }\n":
    types.AdminOrdersPageQueryDocument,
  "\n    query AdminProductsPageQuery {\n      productsCollection(orderBy: [{ created_at: DescNullsLast }]) {\n        edges {\n          node {\n            id\n            ...ProductColumnFragment\n          }\n        }\n      }\n    }\n  ":
    types.AdminProductsPageQueryDocument,
  "\n  query OrderPageQuery($first: Int!, $userId: UUID) {\n    ordersCollection(\n      first: $first\n      orderBy: [{ created_at: DescNullsLast }]\n      filter: { user_id: { eq: $userId } }\n    ) {\n      __typename\n      edges {\n        ...OrdersListFragment\n      }\n    }\n\n    productsCollection(first: 8) {\n      edges {\n        ...BuyAgainCardFragment\n      }\n    }\n  }\n":
    types.OrderPageQueryDocument,
  "\n  fragment CartItemCardFragment on products {\n    id\n    slug\n    name\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n":
    types.CartItemCardFragmentFragmentDoc,
  "\n  query FetchGuestCartQuery(\n    $cartItems: [String!]\n    $first: Int\n    $after: Cursor\n  ) {\n    productsCollection(\n      first: $first\n      after: $after\n      filter: { id: { in: $cartItems } }\n    ) {\n      edges {\n        node {\n          id\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n":
    types.FetchGuestCartQueryDocument,
  "\n  query FetchCartQuery($userId: UUID, $first: Int, $after: Cursor) {\n    cartsCollection(\n      first: $first\n      filter: { user_id: { eq: $userId } }\n      after: $after\n    ) {\n      __typename\n      edges {\n        __typename\n        node {\n          __typename\n          product_id\n          user_id\n          quantity\n          product: products {\n            ...CartItemCardFragment\n          }\n        }\n      }\n    }\n  }\n":
    types.FetchCartQueryDocument,
  "\n  mutation createCartMutation(\n    $productId: String\n    $userId: UUID\n    $quantity: Int\n  ) {\n    insertIntocartsCollection(\n      objects: { user_id: $userId, product_id: $productId, quantity: $quantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n":
    types.CreateCartMutationDocument,
  "\n  mutation RemoveCartsMutation($productId: String!, $userId: UUID!) {\n    deleteFromcartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n    ) {\n      affectedCount\n    }\n  }\n":
    types.RemoveCartsMutationDocument,
  "\n  mutation UpdateCartsMutation(\n    $userId: UUID\n    $productId: String\n    $newQuantity: Int\n  ) {\n    updatecartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n      set: { quantity: $newQuantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        nodeId\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n":
    types.UpdateCartsMutationDocument,
  "\n  query ListCartQuery($userId: UUID) {\n    cartsCollection(filter: { user_id: { eq: $userId } }) {\n      edges {\n        node {\n          __typename\n          quantity\n          user_id\n          product_id\n        }\n      }\n    }\n  }\n":
    types.ListCartQueryDocument,
  "\n  fragment ProductCommentsSectionFragment on comments {\n    id\n    comment\n    profile {\n      name\n    }\n  }\n":
    types.ProductCommentsSectionFragmentFragmentDoc,
  "\n  fragment ImageGridFragment on medias {\n    id\n    key\n    alt\n  }\n":
    types.ImageGridFragmentFragmentDoc,
  "\n  query FetchMediaQuery($mediaId: String) {\n    mediasCollection(filter: { id: { eq: $mediaId } }) {\n      edges {\n        node {\n          id\n          alt\n          key\n        }\n      }\n    }\n  }\n":
    types.FetchMediaQueryDocument,
  "\n  query MultiImageDialogMediasQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n":
    types.MultiImageDialogMediasQueryDocument,
  "\n  query MediasPageContentQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      __typename\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n      }\n    }\n  }\n":
    types.MediasPageContentQueryDocument,
  "\n  fragment BuyAgainCardFragment on productsEdge {\n    node {\n      id\n      featured\n      price\n      name\n      slug\n      featuredImage: medias {\n        id\n        key\n        alt\n      }\n    }\n  }\n":
    types.BuyAgainCardFragmentFragmentDoc,
  "\n  fragment OrdersListFragment on ordersEdge {\n    node {\n      id\n      amount\n      order_status\n      created_at\n      item: order_linesCollection {\n        edges {\n          node {\n            id\n            products {\n              id\n              featured\n              price\n              name\n              slug\n              featuredImage: medias {\n                id\n                key\n                alt\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.OrdersListFragmentFragmentDoc,
  "\n  fragment OrderColumnsFragment on orders {\n    id\n    order_status\n    payment_status\n    order_linesCollection {\n      edges {\n        node {\n          id\n          product_id\n        }\n      }\n    }\n  }\n":
    types.OrderColumnsFragmentFragmentDoc,
  "\n  fragment ProductCardFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n":
    types.ProductCardFragmentFragmentDoc,
  "\n  fragment ProductImageShowcaseFragment on products {\n    id\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n\n    images: product_mediasCollection(orderBy: [{ priority: DescNullsLast }]) {\n      edges {\n        node {\n          media {\n            id\n            key\n            alt\n          }\n        }\n      }\n    }\n  }\n":
    types.ProductImageShowcaseFragmentFragmentDoc,
  "\n  fragment CarouselImagesFragment on product_mediasEdge {\n    node {\n      id\n      media {\n        key\n        alt\n      }\n    }\n  }\n":
    types.CarouselImagesFragmentFragmentDoc,
  "\n  query RecomendationProductsQuery($first: Int!) {\n    recommendations: productsCollection(first: $first) {\n      edges {\n        node {\n          id\n          ...ProductCardFragment\n        }\n      }\n    }\n  }\n":
    types.RecomendationProductsQueryDocument,
  "\n  fragment ProductColumnFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    badge\n    featured\n    status\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n":
    types.ProductColumnFragmentFragmentDoc,
  "\n  mutation AddProductToWishList($productId: String, $userId: UUID) {\n    insertIntowishlistCollection(\n      objects: { user_id: $userId, product_id: $productId }\n    ) {\n      affectedCount\n      records {\n        __typename\n        user_id\n        product_id\n      }\n    }\n  }\n":
    types.AddProductToWishListDocument,
  "\n  mutation RemoveWishlistItemMutation($productId: String, $userId: UUID) {\n    deleteFromwishlistCollection(\n      filter: {\n        and: [{ user_id: { eq: $userId } }, { product_id: { eq: $productId } }]\n      }\n      atMost: 1\n    ) {\n      records {\n        __typename\n      }\n    }\n  }\n":
    types.RemoveWishlistItemMutationDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query AdminOrdersPageQuery {\n    ordersCollection(orderBy: [{ created_at: DescNullsLast }]) {\n      edges {\n        node {\n          __typename\n          id\n          ...OrderColumnsFragment\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query AdminOrdersPageQuery {\n    ordersCollection(orderBy: [{ created_at: DescNullsLast }]) {\n      edges {\n        node {\n          __typename\n          id\n          ...OrderColumnsFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n    query AdminProductsPageQuery {\n      productsCollection(orderBy: [{ created_at: DescNullsLast }]) {\n        edges {\n          node {\n            id\n            ...ProductColumnFragment\n          }\n        }\n      }\n    }\n  ",
): (typeof documents)["\n    query AdminProductsPageQuery {\n      productsCollection(orderBy: [{ created_at: DescNullsLast }]) {\n        edges {\n          node {\n            id\n            ...ProductColumnFragment\n          }\n        }\n      }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query OrderPageQuery($first: Int!, $userId: UUID) {\n    ordersCollection(\n      first: $first\n      orderBy: [{ created_at: DescNullsLast }]\n      filter: { user_id: { eq: $userId } }\n    ) {\n      __typename\n      edges {\n        ...OrdersListFragment\n      }\n    }\n\n    productsCollection(first: 8) {\n      edges {\n        ...BuyAgainCardFragment\n      }\n    }\n  }\n",
): (typeof documents)["\n  query OrderPageQuery($first: Int!, $userId: UUID) {\n    ordersCollection(\n      first: $first\n      orderBy: [{ created_at: DescNullsLast }]\n      filter: { user_id: { eq: $userId } }\n    ) {\n      __typename\n      edges {\n        ...OrdersListFragment\n      }\n    }\n\n    productsCollection(first: 8) {\n      edges {\n        ...BuyAgainCardFragment\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CartItemCardFragment on products {\n    id\n    slug\n    name\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n",
): (typeof documents)["\n  fragment CartItemCardFragment on products {\n    id\n    slug\n    name\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query FetchGuestCartQuery(\n    $cartItems: [String!]\n    $first: Int\n    $after: Cursor\n  ) {\n    productsCollection(\n      first: $first\n      after: $after\n      filter: { id: { in: $cartItems } }\n    ) {\n      edges {\n        node {\n          id\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query FetchGuestCartQuery(\n    $cartItems: [String!]\n    $first: Int\n    $after: Cursor\n  ) {\n    productsCollection(\n      first: $first\n      after: $after\n      filter: { id: { in: $cartItems } }\n    ) {\n      edges {\n        node {\n          id\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query FetchCartQuery($userId: UUID, $first: Int, $after: Cursor) {\n    cartsCollection(\n      first: $first\n      filter: { user_id: { eq: $userId } }\n      after: $after\n    ) {\n      __typename\n      edges {\n        __typename\n        node {\n          __typename\n          product_id\n          user_id\n          quantity\n          product: products {\n            ...CartItemCardFragment\n          }\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query FetchCartQuery($userId: UUID, $first: Int, $after: Cursor) {\n    cartsCollection(\n      first: $first\n      filter: { user_id: { eq: $userId } }\n      after: $after\n    ) {\n      __typename\n      edges {\n        __typename\n        node {\n          __typename\n          product_id\n          user_id\n          quantity\n          product: products {\n            ...CartItemCardFragment\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation createCartMutation(\n    $productId: String\n    $userId: UUID\n    $quantity: Int\n  ) {\n    insertIntocartsCollection(\n      objects: { user_id: $userId, product_id: $productId, quantity: $quantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation createCartMutation(\n    $productId: String\n    $userId: UUID\n    $quantity: Int\n  ) {\n    insertIntocartsCollection(\n      objects: { user_id: $userId, product_id: $productId, quantity: $quantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveCartsMutation($productId: String!, $userId: UUID!) {\n    deleteFromcartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n    ) {\n      affectedCount\n    }\n  }\n",
): (typeof documents)["\n  mutation RemoveCartsMutation($productId: String!, $userId: UUID!) {\n    deleteFromcartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n    ) {\n      affectedCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation UpdateCartsMutation(\n    $userId: UUID\n    $productId: String\n    $newQuantity: Int\n  ) {\n    updatecartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n      set: { quantity: $newQuantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        nodeId\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation UpdateCartsMutation(\n    $userId: UUID\n    $productId: String\n    $newQuantity: Int\n  ) {\n    updatecartsCollection(\n      filter: { product_id: { eq: $productId }, user_id: { eq: $userId } }\n      set: { quantity: $newQuantity }\n    ) {\n      affectedCount\n      records {\n        __typename\n        nodeId\n        product_id\n        user_id\n        quantity\n        product: products {\n          ...CartItemCardFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query ListCartQuery($userId: UUID) {\n    cartsCollection(filter: { user_id: { eq: $userId } }) {\n      edges {\n        node {\n          __typename\n          quantity\n          user_id\n          product_id\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query ListCartQuery($userId: UUID) {\n    cartsCollection(filter: { user_id: { eq: $userId } }) {\n      edges {\n        node {\n          __typename\n          quantity\n          user_id\n          product_id\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ProductCommentsSectionFragment on comments {\n    id\n    comment\n    profile {\n      name\n    }\n  }\n",
): (typeof documents)["\n  fragment ProductCommentsSectionFragment on comments {\n    id\n    comment\n    profile {\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ImageGridFragment on medias {\n    id\n    key\n    alt\n  }\n",
): (typeof documents)["\n  fragment ImageGridFragment on medias {\n    id\n    key\n    alt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query FetchMediaQuery($mediaId: String) {\n    mediasCollection(filter: { id: { eq: $mediaId } }) {\n      edges {\n        node {\n          id\n          alt\n          key\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query FetchMediaQuery($mediaId: String) {\n    mediasCollection(filter: { id: { eq: $mediaId } }) {\n      edges {\n        node {\n          id\n          alt\n          key\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query MultiImageDialogMediasQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query MultiImageDialogMediasQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query MediasPageContentQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      __typename\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n      }\n    }\n  }\n",
): (typeof documents)["\n  query MediasPageContentQuery($first: Int, $after: Cursor) {\n    mediasCollection(\n      first: $first\n      after: $after\n      orderBy: [{ created_at: DescNullsLast }]\n    ) {\n      __typename\n      edges {\n        node {\n          id\n          key\n          alt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment BuyAgainCardFragment on productsEdge {\n    node {\n      id\n      featured\n      price\n      name\n      slug\n      featuredImage: medias {\n        id\n        key\n        alt\n      }\n    }\n  }\n",
): (typeof documents)["\n  fragment BuyAgainCardFragment on productsEdge {\n    node {\n      id\n      featured\n      price\n      name\n      slug\n      featuredImage: medias {\n        id\n        key\n        alt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment OrdersListFragment on ordersEdge {\n    node {\n      id\n      amount\n      order_status\n      created_at\n      item: order_linesCollection {\n        edges {\n          node {\n            id\n            products {\n              id\n              featured\n              price\n              name\n              slug\n              featuredImage: medias {\n                id\n                key\n                alt\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  fragment OrdersListFragment on ordersEdge {\n    node {\n      id\n      amount\n      order_status\n      created_at\n      item: order_linesCollection {\n        edges {\n          node {\n            id\n            products {\n              id\n              featured\n              price\n              name\n              slug\n              featuredImage: medias {\n                id\n                key\n                alt\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment OrderColumnsFragment on orders {\n    id\n    order_status\n    payment_status\n    order_linesCollection {\n      edges {\n        node {\n          id\n          product_id\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  fragment OrderColumnsFragment on orders {\n    id\n    order_status\n    payment_status\n    order_linesCollection {\n      edges {\n        node {\n          id\n          product_id\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ProductCardFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n",
): (typeof documents)["\n  fragment ProductCardFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ProductImageShowcaseFragment on products {\n    id\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n\n    images: product_mediasCollection(orderBy: [{ priority: DescNullsLast }]) {\n      edges {\n        node {\n          media {\n            id\n            key\n            alt\n          }\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  fragment ProductImageShowcaseFragment on products {\n    id\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n\n    images: product_mediasCollection(orderBy: [{ priority: DescNullsLast }]) {\n      edges {\n        node {\n          media {\n            id\n            key\n            alt\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment CarouselImagesFragment on product_mediasEdge {\n    node {\n      id\n      media {\n        key\n        alt\n      }\n    }\n  }\n",
): (typeof documents)["\n  fragment CarouselImagesFragment on product_mediasEdge {\n    node {\n      id\n      media {\n        key\n        alt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  query RecomendationProductsQuery($first: Int!) {\n    recommendations: productsCollection(first: $first) {\n      edges {\n        node {\n          id\n          ...ProductCardFragment\n        }\n      }\n    }\n  }\n",
): (typeof documents)["\n  query RecomendationProductsQuery($first: Int!) {\n    recommendations: productsCollection(first: $first) {\n      edges {\n        node {\n          id\n          ...ProductCardFragment\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  fragment ProductColumnFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    badge\n    featured\n    status\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n",
): (typeof documents)["\n  fragment ProductColumnFragment on products {\n    id\n    name\n    rating\n    slug\n    badge\n    price\n    badge\n    featured\n    status\n    featuredImage: medias {\n      id\n      key\n      alt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation AddProductToWishList($productId: String, $userId: UUID) {\n    insertIntowishlistCollection(\n      objects: { user_id: $userId, product_id: $productId }\n    ) {\n      affectedCount\n      records {\n        __typename\n        user_id\n        product_id\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation AddProductToWishList($productId: String, $userId: UUID) {\n    insertIntowishlistCollection(\n      objects: { user_id: $userId, product_id: $productId }\n    ) {\n      affectedCount\n      records {\n        __typename\n        user_id\n        product_id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "\n  mutation RemoveWishlistItemMutation($productId: String, $userId: UUID) {\n    deleteFromwishlistCollection(\n      filter: {\n        and: [{ user_id: { eq: $userId } }, { product_id: { eq: $productId } }]\n      }\n      atMost: 1\n    ) {\n      records {\n        __typename\n      }\n    }\n  }\n",
): (typeof documents)["\n  mutation RemoveWishlistItemMutation($productId: String, $userId: UUID) {\n    deleteFromwishlistCollection(\n      filter: {\n        and: [{ user_id: { eq: $userId } }, { product_id: { eq: $productId } }]\n      }\n      atMost: 1\n    ) {\n      records {\n        __typename\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
