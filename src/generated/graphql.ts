import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  json: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  timestamptz: { input: string; output: string; }
  timetz: { input: any; output: any; }
  uuid: { input: string; output: string; }
};

/** Addresses */
export type Addresses = {
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** An object relationship */
  User: Users;
  city: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_default: Scalars['Boolean']['output'];
  latitude: Scalars['String']['output'];
  longitude: Scalars['String']['output'];
  postal_code?: Maybe<Scalars['String']['output']>;
  street: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['uuid']['output'];
};


/** Addresses */
export type AddressesOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Addresses */
export type AddressesOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** aggregated selection of "Addresses" */
export type Addresses_Aggregate = {
  aggregate?: Maybe<Addresses_Aggregate_Fields>;
  nodes: Array<Addresses>;
};

export type Addresses_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Addresses_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Addresses_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Addresses_Aggregate_Bool_Exp_Count>;
};

export type Addresses_Aggregate_Bool_Exp_Bool_And = {
  arguments: Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Addresses_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Addresses_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Addresses" */
export type Addresses_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Addresses_Max_Fields>;
  min?: Maybe<Addresses_Min_Fields>;
};


/** aggregate fields of "Addresses" */
export type Addresses_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Addresses" */
export type Addresses_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Addresses_Max_Order_By>;
  min?: InputMaybe<Addresses_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Addresses" */
export type Addresses_Arr_Rel_Insert_Input = {
  data: Array<Addresses_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Addresses_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Addresses". All fields are combined with a logical 'AND'. */
export type Addresses_Bool_Exp = {
  Orders?: InputMaybe<Orders_Bool_Exp>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Addresses_Bool_Exp>>;
  _not?: InputMaybe<Addresses_Bool_Exp>;
  _or?: InputMaybe<Array<Addresses_Bool_Exp>>;
  city?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_default?: InputMaybe<Boolean_Comparison_Exp>;
  latitude?: InputMaybe<String_Comparison_Exp>;
  longitude?: InputMaybe<String_Comparison_Exp>;
  postal_code?: InputMaybe<String_Comparison_Exp>;
  street?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Addresses" */
export type Addresses_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Addresses_pkey';

/** input type for inserting data into table "Addresses" */
export type Addresses_Insert_Input = {
  Orders?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  city?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Addresses_Max_Fields = {
  city?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Addresses" */
export type Addresses_Max_Order_By = {
  city?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  postal_code?: InputMaybe<Order_By>;
  street?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Addresses_Min_Fields = {
  city?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Addresses" */
export type Addresses_Min_Order_By = {
  city?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  postal_code?: InputMaybe<Order_By>;
  street?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Addresses" */
export type Addresses_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Addresses>;
};

/** input type for inserting object relation for remote table "Addresses" */
export type Addresses_Obj_Rel_Insert_Input = {
  data: Addresses_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Addresses_On_Conflict>;
};

/** on_conflict condition type for table "Addresses" */
export type Addresses_On_Conflict = {
  constraint: Addresses_Constraint;
  update_columns?: Array<Addresses_Update_Column>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

/** Ordering options when selecting data from "Addresses". */
export type Addresses_Order_By = {
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  city?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_default?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  postal_code?: InputMaybe<Order_By>;
  street?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Addresses */
export type Addresses_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Addresses" */
export type Addresses_Select_Column =
  /** column name */
  | 'city'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_default'
  /** column name */
  | 'latitude'
  /** column name */
  | 'longitude'
  /** column name */
  | 'postal_code'
  /** column name */
  | 'street'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

/** select "Addresses_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Addresses" */
export type Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_default';

/** select "Addresses_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Addresses" */
export type Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_default';

/** input type for updating data in table "Addresses" */
export type Addresses_Set_Input = {
  city?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Addresses" */
export type Addresses_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Addresses_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Addresses_Stream_Cursor_Value_Input = {
  city?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Addresses" */
export type Addresses_Update_Column =
  /** column name */
  | 'city'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_default'
  /** column name */
  | 'latitude'
  /** column name */
  | 'longitude'
  /** column name */
  | 'postal_code'
  /** column name */
  | 'street'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

export type Addresses_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Addresses_Set_Input>;
  /** filter the rows which have to be updated */
  where: Addresses_Bool_Exp;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Cart Items */
export type Cart_Items = {
  /** An object relationship */
  Cart: Carts;
  /** An object relationship */
  Product: Products;
  cart_id: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  price: Scalars['String']['output'];
  product_id: Scalars['uuid']['output'];
  quantity: Scalars['Int']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "Cart_Items" */
export type Cart_Items_Aggregate = {
  aggregate?: Maybe<Cart_Items_Aggregate_Fields>;
  nodes: Array<Cart_Items>;
};

export type Cart_Items_Aggregate_Bool_Exp = {
  count?: InputMaybe<Cart_Items_Aggregate_Bool_Exp_Count>;
};

export type Cart_Items_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Cart_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Cart_Items_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Cart_Items" */
export type Cart_Items_Aggregate_Fields = {
  avg?: Maybe<Cart_Items_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Cart_Items_Max_Fields>;
  min?: Maybe<Cart_Items_Min_Fields>;
  stddev?: Maybe<Cart_Items_Stddev_Fields>;
  stddev_pop?: Maybe<Cart_Items_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Cart_Items_Stddev_Samp_Fields>;
  sum?: Maybe<Cart_Items_Sum_Fields>;
  var_pop?: Maybe<Cart_Items_Var_Pop_Fields>;
  var_samp?: Maybe<Cart_Items_Var_Samp_Fields>;
  variance?: Maybe<Cart_Items_Variance_Fields>;
};


/** aggregate fields of "Cart_Items" */
export type Cart_Items_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Cart_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Cart_Items" */
export type Cart_Items_Aggregate_Order_By = {
  avg?: InputMaybe<Cart_Items_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Cart_Items_Max_Order_By>;
  min?: InputMaybe<Cart_Items_Min_Order_By>;
  stddev?: InputMaybe<Cart_Items_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Cart_Items_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Cart_Items_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Cart_Items_Sum_Order_By>;
  var_pop?: InputMaybe<Cart_Items_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Cart_Items_Var_Samp_Order_By>;
  variance?: InputMaybe<Cart_Items_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Cart_Items" */
export type Cart_Items_Arr_Rel_Insert_Input = {
  data: Array<Cart_Items_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Cart_Items_On_Conflict>;
};

/** aggregate avg on columns */
export type Cart_Items_Avg_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Cart_Items" */
export type Cart_Items_Avg_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Cart_Items". All fields are combined with a logical 'AND'. */
export type Cart_Items_Bool_Exp = {
  Cart?: InputMaybe<Carts_Bool_Exp>;
  Product?: InputMaybe<Products_Bool_Exp>;
  _and?: InputMaybe<Array<Cart_Items_Bool_Exp>>;
  _not?: InputMaybe<Cart_Items_Bool_Exp>;
  _or?: InputMaybe<Array<Cart_Items_Bool_Exp>>;
  cart_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  price?: InputMaybe<String_Comparison_Exp>;
  product_id?: InputMaybe<Uuid_Comparison_Exp>;
  quantity?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Cart_Items" */
export type Cart_Items_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Cart_Items_pkey';

/** input type for incrementing numeric columns in table "Cart_Items" */
export type Cart_Items_Inc_Input = {
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Cart_Items" */
export type Cart_Items_Insert_Input = {
  Cart?: InputMaybe<Carts_Obj_Rel_Insert_Input>;
  Product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  cart_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Cart_Items_Max_Fields = {
  cart_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Cart_Items" */
export type Cart_Items_Max_Order_By = {
  cart_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Cart_Items_Min_Fields = {
  cart_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Cart_Items" */
export type Cart_Items_Min_Order_By = {
  cart_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Cart_Items" */
export type Cart_Items_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Cart_Items>;
};

/** on_conflict condition type for table "Cart_Items" */
export type Cart_Items_On_Conflict = {
  constraint: Cart_Items_Constraint;
  update_columns?: Array<Cart_Items_Update_Column>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

/** Ordering options when selecting data from "Cart_Items". */
export type Cart_Items_Order_By = {
  Cart?: InputMaybe<Carts_Order_By>;
  Product?: InputMaybe<Products_Order_By>;
  cart_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Cart_Items */
export type Cart_Items_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Cart_Items" */
export type Cart_Items_Select_Column =
  /** column name */
  | 'cart_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'price'
  /** column name */
  | 'product_id'
  /** column name */
  | 'quantity'
  /** column name */
  | 'updated_at';

/** input type for updating data in table "Cart_Items" */
export type Cart_Items_Set_Input = {
  cart_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Cart_Items_Stddev_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Cart_Items" */
export type Cart_Items_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Cart_Items_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Cart_Items" */
export type Cart_Items_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Cart_Items_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Cart_Items" */
export type Cart_Items_Stddev_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Cart_Items" */
export type Cart_Items_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Cart_Items_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Cart_Items_Stream_Cursor_Value_Input = {
  cart_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Cart_Items_Sum_Fields = {
  quantity?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Cart_Items" */
export type Cart_Items_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** update columns of table "Cart_Items" */
export type Cart_Items_Update_Column =
  /** column name */
  | 'cart_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'price'
  /** column name */
  | 'product_id'
  /** column name */
  | 'quantity'
  /** column name */
  | 'updated_at';

export type Cart_Items_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Cart_Items_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Cart_Items_Set_Input>;
  /** filter the rows which have to be updated */
  where: Cart_Items_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Cart_Items_Var_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Cart_Items" */
export type Cart_Items_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Cart_Items_Var_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Cart_Items" */
export type Cart_Items_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Cart_Items_Variance_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Cart_Items" */
export type Cart_Items_Variance_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** Carts */
export type Carts = {
  /** An array relationship */
  Cart_Items: Array<Cart_Items>;
  /** An aggregate relationship */
  Cart_Items_aggregate: Cart_Items_Aggregate;
  /** An object relationship */
  Shop: Shops;
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  shop_id: Scalars['uuid']['output'];
  total: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['uuid']['output'];
};


/** Carts */
export type CartsCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


/** Carts */
export type CartsCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

/** aggregated selection of "Carts" */
export type Carts_Aggregate = {
  aggregate?: Maybe<Carts_Aggregate_Fields>;
  nodes: Array<Carts>;
};

export type Carts_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Carts_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Carts_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Carts_Aggregate_Bool_Exp_Count>;
};

export type Carts_Aggregate_Bool_Exp_Bool_And = {
  arguments: Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Carts_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Carts_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Carts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Carts" */
export type Carts_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Carts_Max_Fields>;
  min?: Maybe<Carts_Min_Fields>;
};


/** aggregate fields of "Carts" */
export type Carts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Carts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Carts" */
export type Carts_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Carts_Max_Order_By>;
  min?: InputMaybe<Carts_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Carts" */
export type Carts_Arr_Rel_Insert_Input = {
  data: Array<Carts_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Carts_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Carts". All fields are combined with a logical 'AND'. */
export type Carts_Bool_Exp = {
  Cart_Items?: InputMaybe<Cart_Items_Bool_Exp>;
  Cart_Items_aggregate?: InputMaybe<Cart_Items_Aggregate_Bool_Exp>;
  Shop?: InputMaybe<Shops_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Carts_Bool_Exp>>;
  _not?: InputMaybe<Carts_Bool_Exp>;
  _or?: InputMaybe<Array<Carts_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  shop_id?: InputMaybe<Uuid_Comparison_Exp>;
  total?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Carts" */
export type Carts_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Carts_pkey';

/** input type for inserting data into table "Carts" */
export type Carts_Insert_Input = {
  Cart_Items?: InputMaybe<Cart_Items_Arr_Rel_Insert_Input>;
  Shop?: InputMaybe<Shops_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Carts_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  total?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Carts" */
export type Carts_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Carts_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  total?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Carts" */
export type Carts_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Carts" */
export type Carts_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Carts>;
};

/** input type for inserting object relation for remote table "Carts" */
export type Carts_Obj_Rel_Insert_Input = {
  data: Carts_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Carts_On_Conflict>;
};

/** on_conflict condition type for table "Carts" */
export type Carts_On_Conflict = {
  constraint: Carts_Constraint;
  update_columns?: Array<Carts_Update_Column>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

/** Ordering options when selecting data from "Carts". */
export type Carts_Order_By = {
  Cart_Items_aggregate?: InputMaybe<Cart_Items_Aggregate_Order_By>;
  Shop?: InputMaybe<Shops_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Carts */
export type Carts_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Carts" */
export type Carts_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_active'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'total'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

/** select "Carts_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Carts" */
export type Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_active';

/** select "Carts_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Carts" */
export type Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_active';

/** input type for updating data in table "Carts" */
export type Carts_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Carts" */
export type Carts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Carts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Carts_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Carts" */
export type Carts_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_active'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'total'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

export type Carts_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Carts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Carts_Bool_Exp;
};

/** columns and relationships of "Categories" */
export type Categories = {
  /** An array relationship */
  Shops: Array<Shops>;
  /** An aggregate relationship */
  Shops_aggregate: Shops_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  image: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};


/** columns and relationships of "Categories" */
export type CategoriesShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


/** columns and relationships of "Categories" */
export type CategoriesShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

/** aggregated selection of "Categories" */
export type Categories_Aggregate = {
  aggregate?: Maybe<Categories_Aggregate_Fields>;
  nodes: Array<Categories>;
};

/** aggregate fields of "Categories" */
export type Categories_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Categories_Max_Fields>;
  min?: Maybe<Categories_Min_Fields>;
};


/** aggregate fields of "Categories" */
export type Categories_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Categories_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "Categories". All fields are combined with a logical 'AND'. */
export type Categories_Bool_Exp = {
  Shops?: InputMaybe<Shops_Bool_Exp>;
  Shops_aggregate?: InputMaybe<Shops_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Categories_Bool_Exp>>;
  _not?: InputMaybe<Categories_Bool_Exp>;
  _or?: InputMaybe<Array<Categories_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Categories" */
export type Categories_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Categories_pkey';

/** input type for inserting data into table "Categories" */
export type Categories_Insert_Input = {
  Shops?: InputMaybe<Shops_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Categories_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Categories_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "Categories" */
export type Categories_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Categories>;
};

/** input type for inserting object relation for remote table "Categories" */
export type Categories_Obj_Rel_Insert_Input = {
  data: Categories_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Categories_On_Conflict>;
};

/** on_conflict condition type for table "Categories" */
export type Categories_On_Conflict = {
  constraint: Categories_Constraint;
  update_columns?: Array<Categories_Update_Column>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

/** Ordering options when selecting data from "Categories". */
export type Categories_Order_By = {
  Shops_aggregate?: InputMaybe<Shops_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Categories */
export type Categories_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Categories" */
export type Categories_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'name';

/** input type for updating data in table "Categories" */
export type Categories_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Categories" */
export type Categories_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Categories_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Categories_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Categories" */
export type Categories_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'name';

export type Categories_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Categories_Set_Input>;
  /** filter the rows which have to be updated */
  where: Categories_Bool_Exp;
};

/** Delivery Issues */
export type Delivery_Issues = {
  /** An object relationship */
  Order: Orders;
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  issue_type: Scalars['String']['output'];
  order_id: Scalars['uuid']['output'];
  priority: Scalars['String']['output'];
  shopper_id: Scalars['uuid']['output'];
  status: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregated selection of "Delivery_Issues" */
export type Delivery_Issues_Aggregate = {
  aggregate?: Maybe<Delivery_Issues_Aggregate_Fields>;
  nodes: Array<Delivery_Issues>;
};

export type Delivery_Issues_Aggregate_Bool_Exp = {
  count?: InputMaybe<Delivery_Issues_Aggregate_Bool_Exp_Count>;
};

export type Delivery_Issues_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Delivery_Issues_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Delivery_Issues" */
export type Delivery_Issues_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Delivery_Issues_Max_Fields>;
  min?: Maybe<Delivery_Issues_Min_Fields>;
};


/** aggregate fields of "Delivery_Issues" */
export type Delivery_Issues_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Delivery_Issues" */
export type Delivery_Issues_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Delivery_Issues_Max_Order_By>;
  min?: InputMaybe<Delivery_Issues_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Delivery_Issues" */
export type Delivery_Issues_Arr_Rel_Insert_Input = {
  data: Array<Delivery_Issues_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Delivery_Issues_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Delivery_Issues". All fields are combined with a logical 'AND'. */
export type Delivery_Issues_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Delivery_Issues_Bool_Exp>>;
  _not?: InputMaybe<Delivery_Issues_Bool_Exp>;
  _or?: InputMaybe<Array<Delivery_Issues_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  issue_type?: InputMaybe<String_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  priority?: InputMaybe<String_Comparison_Exp>;
  shopper_id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "Delivery_Issues" */
export type Delivery_Issues_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Delivery_Issues_pkey';

/** input type for inserting data into table "Delivery_Issues" */
export type Delivery_Issues_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  issue_type?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Delivery_Issues_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  issue_type?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "Delivery_Issues" */
export type Delivery_Issues_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  issue_type?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Delivery_Issues_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  issue_type?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "Delivery_Issues" */
export type Delivery_Issues_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  issue_type?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Delivery_Issues" */
export type Delivery_Issues_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Delivery_Issues>;
};

/** on_conflict condition type for table "Delivery_Issues" */
export type Delivery_Issues_On_Conflict = {
  constraint: Delivery_Issues_Constraint;
  update_columns?: Array<Delivery_Issues_Update_Column>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

/** Ordering options when selecting data from "Delivery_Issues". */
export type Delivery_Issues_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  issue_type?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Delivery_Issues */
export type Delivery_Issues_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Delivery_Issues" */
export type Delivery_Issues_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'issue_type'
  /** column name */
  | 'order_id'
  /** column name */
  | 'priority'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'status'
  /** column name */
  | 'updated_at';

/** input type for updating data in table "Delivery_Issues" */
export type Delivery_Issues_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  issue_type?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "Delivery_Issues" */
export type Delivery_Issues_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Delivery_Issues_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Delivery_Issues_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  issue_type?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "Delivery_Issues" */
export type Delivery_Issues_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'issue_type'
  /** column name */
  | 'order_id'
  /** column name */
  | 'priority'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'status'
  /** column name */
  | 'updated_at';

export type Delivery_Issues_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Delivery_Issues_Set_Input>;
  /** filter the rows which have to be updated */
  where: Delivery_Issues_Bool_Exp;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** columns and relationships of "Invoices" */
export type Invoices = {
  /** An object relationship */
  Order: Orders;
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  customer_id: Scalars['uuid']['output'];
  delivery_fee: Scalars['String']['output'];
  discount: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  invoice_items: Scalars['jsonb']['output'];
  invoice_number: Scalars['String']['output'];
  order_id: Scalars['uuid']['output'];
  service_fee: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subtotal: Scalars['String']['output'];
  tax: Scalars['String']['output'];
  total_amount: Scalars['String']['output'];
};


/** columns and relationships of "Invoices" */
export type InvoicesInvoice_ItemsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "Invoices" */
export type Invoices_Aggregate = {
  aggregate?: Maybe<Invoices_Aggregate_Fields>;
  nodes: Array<Invoices>;
};

export type Invoices_Aggregate_Bool_Exp = {
  count?: InputMaybe<Invoices_Aggregate_Bool_Exp_Count>;
};

export type Invoices_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Invoices_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Invoices_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Invoices" */
export type Invoices_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Invoices_Max_Fields>;
  min?: Maybe<Invoices_Min_Fields>;
};


/** aggregate fields of "Invoices" */
export type Invoices_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Invoices_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Invoices" */
export type Invoices_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Invoices_Max_Order_By>;
  min?: InputMaybe<Invoices_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Invoices_Append_Input = {
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "Invoices" */
export type Invoices_Arr_Rel_Insert_Input = {
  data: Array<Invoices_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Invoices_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Invoices". All fields are combined with a logical 'AND'. */
export type Invoices_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Invoices_Bool_Exp>>;
  _not?: InputMaybe<Invoices_Bool_Exp>;
  _or?: InputMaybe<Array<Invoices_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  customer_id?: InputMaybe<Uuid_Comparison_Exp>;
  delivery_fee?: InputMaybe<String_Comparison_Exp>;
  discount?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  invoice_items?: InputMaybe<Jsonb_Comparison_Exp>;
  invoice_number?: InputMaybe<String_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  service_fee?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  subtotal?: InputMaybe<String_Comparison_Exp>;
  tax?: InputMaybe<String_Comparison_Exp>;
  total_amount?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Invoices" */
export type Invoices_Constraint =
  /** unique or primary key constraint on columns "order_id" */
  | 'Invoices_order_id_key'
  /** unique or primary key constraint on columns "id" */
  | 'Invoices_pkey';

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Invoices_Delete_At_Path_Input = {
  invoice_items?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Invoices_Delete_Elem_Input = {
  invoice_items?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Invoices_Delete_Key_Input = {
  invoice_items?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "Invoices" */
export type Invoices_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
  invoice_number?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  total_amount?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Invoices_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  customer_id?: Maybe<Scalars['uuid']['output']>;
  delivery_fee?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  invoice_number?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  service_fee?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Scalars['String']['output']>;
  total_amount?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Invoices" */
export type Invoices_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invoice_number?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtotal?: InputMaybe<Order_By>;
  tax?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Invoices_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  customer_id?: Maybe<Scalars['uuid']['output']>;
  delivery_fee?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  invoice_number?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  service_fee?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Scalars['String']['output']>;
  total_amount?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Invoices" */
export type Invoices_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invoice_number?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtotal?: InputMaybe<Order_By>;
  tax?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Invoices" */
export type Invoices_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Invoices>;
};

/** input type for inserting object relation for remote table "Invoices" */
export type Invoices_Obj_Rel_Insert_Input = {
  data: Invoices_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Invoices_On_Conflict>;
};

/** on_conflict condition type for table "Invoices" */
export type Invoices_On_Conflict = {
  constraint: Invoices_Constraint;
  update_columns?: Array<Invoices_Update_Column>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};

/** Ordering options when selecting data from "Invoices". */
export type Invoices_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invoice_items?: InputMaybe<Order_By>;
  invoice_number?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtotal?: InputMaybe<Order_By>;
  tax?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Invoices */
export type Invoices_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Invoices_Prepend_Input = {
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "Invoices" */
export type Invoices_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'customer_id'
  /** column name */
  | 'delivery_fee'
  /** column name */
  | 'discount'
  /** column name */
  | 'id'
  /** column name */
  | 'invoice_items'
  /** column name */
  | 'invoice_number'
  /** column name */
  | 'order_id'
  /** column name */
  | 'service_fee'
  /** column name */
  | 'status'
  /** column name */
  | 'subtotal'
  /** column name */
  | 'tax'
  /** column name */
  | 'total_amount';

/** input type for updating data in table "Invoices" */
export type Invoices_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
  invoice_number?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  total_amount?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Invoices" */
export type Invoices_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Invoices_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Invoices_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
  invoice_number?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  total_amount?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Invoices" */
export type Invoices_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'customer_id'
  /** column name */
  | 'delivery_fee'
  /** column name */
  | 'discount'
  /** column name */
  | 'id'
  /** column name */
  | 'invoice_items'
  /** column name */
  | 'invoice_number'
  /** column name */
  | 'order_id'
  /** column name */
  | 'service_fee'
  /** column name */
  | 'status'
  /** column name */
  | 'subtotal'
  /** column name */
  | 'tax'
  /** column name */
  | 'total_amount';

export type Invoices_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Invoices_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Invoices_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Invoices_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Invoices_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Invoices_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Invoices_Set_Input>;
  /** filter the rows which have to be updated */
  where: Invoices_Bool_Exp;
};

/** Notifications */
export type Notifications = {
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_read: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  type: Scalars['String']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "Notifications" */
export type Notifications_Aggregate = {
  aggregate?: Maybe<Notifications_Aggregate_Fields>;
  nodes: Array<Notifications>;
};

export type Notifications_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Notifications_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Notifications_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Notifications_Aggregate_Bool_Exp_Count>;
};

export type Notifications_Aggregate_Bool_Exp_Bool_And = {
  arguments: Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Notifications_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Notifications_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Notifications" */
export type Notifications_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Notifications_Max_Fields>;
  min?: Maybe<Notifications_Min_Fields>;
};


/** aggregate fields of "Notifications" */
export type Notifications_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Notifications" */
export type Notifications_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Notifications_Max_Order_By>;
  min?: InputMaybe<Notifications_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Notifications" */
export type Notifications_Arr_Rel_Insert_Input = {
  data: Array<Notifications_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Notifications". All fields are combined with a logical 'AND'. */
export type Notifications_Bool_Exp = {
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Notifications_Bool_Exp>>;
  _not?: InputMaybe<Notifications_Bool_Exp>;
  _or?: InputMaybe<Array<Notifications_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_read?: InputMaybe<Boolean_Comparison_Exp>;
  message?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Notifications" */
export type Notifications_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Notifications_pkey';

/** input type for inserting data into table "Notifications" */
export type Notifications_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Notifications_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Notifications" */
export type Notifications_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Notifications_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Notifications" */
export type Notifications_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Notifications" */
export type Notifications_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Notifications>;
};

/** on_conflict condition type for table "Notifications" */
export type Notifications_On_Conflict = {
  constraint: Notifications_Constraint;
  update_columns?: Array<Notifications_Update_Column>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

/** Ordering options when selecting data from "Notifications". */
export type Notifications_Order_By = {
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_read?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Notifications */
export type Notifications_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Notifications" */
export type Notifications_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_read'
  /** column name */
  | 'message'
  /** column name */
  | 'type'
  /** column name */
  | 'user_id';

/** select "Notifications_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Notifications" */
export type Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_read';

/** select "Notifications_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Notifications" */
export type Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_read';

/** input type for updating data in table "Notifications" */
export type Notifications_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Notifications" */
export type Notifications_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Notifications_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Notifications_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Notifications" */
export type Notifications_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_read'
  /** column name */
  | 'message'
  /** column name */
  | 'type'
  /** column name */
  | 'user_id';

export type Notifications_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Notifications_Set_Input>;
  /** filter the rows which have to be updated */
  where: Notifications_Bool_Exp;
};

/** Order Items */
export type Order_Items = {
  /** An object relationship */
  Order: Orders;
  /** An object relationship */
  Product: Products;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  order_id: Scalars['uuid']['output'];
  price: Scalars['String']['output'];
  product_id: Scalars['uuid']['output'];
  quantity: Scalars['Int']['output'];
};

/** aggregated selection of "Order_Items" */
export type Order_Items_Aggregate = {
  aggregate?: Maybe<Order_Items_Aggregate_Fields>;
  nodes: Array<Order_Items>;
};

export type Order_Items_Aggregate_Bool_Exp = {
  count?: InputMaybe<Order_Items_Aggregate_Bool_Exp_Count>;
};

export type Order_Items_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Order_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Order_Items_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Order_Items" */
export type Order_Items_Aggregate_Fields = {
  avg?: Maybe<Order_Items_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Order_Items_Max_Fields>;
  min?: Maybe<Order_Items_Min_Fields>;
  stddev?: Maybe<Order_Items_Stddev_Fields>;
  stddev_pop?: Maybe<Order_Items_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Order_Items_Stddev_Samp_Fields>;
  sum?: Maybe<Order_Items_Sum_Fields>;
  var_pop?: Maybe<Order_Items_Var_Pop_Fields>;
  var_samp?: Maybe<Order_Items_Var_Samp_Fields>;
  variance?: Maybe<Order_Items_Variance_Fields>;
};


/** aggregate fields of "Order_Items" */
export type Order_Items_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Order_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Order_Items" */
export type Order_Items_Aggregate_Order_By = {
  avg?: InputMaybe<Order_Items_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Order_Items_Max_Order_By>;
  min?: InputMaybe<Order_Items_Min_Order_By>;
  stddev?: InputMaybe<Order_Items_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Order_Items_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Order_Items_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Order_Items_Sum_Order_By>;
  var_pop?: InputMaybe<Order_Items_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Order_Items_Var_Samp_Order_By>;
  variance?: InputMaybe<Order_Items_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Order_Items" */
export type Order_Items_Arr_Rel_Insert_Input = {
  data: Array<Order_Items_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};

/** aggregate avg on columns */
export type Order_Items_Avg_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Order_Items" */
export type Order_Items_Avg_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Order_Items". All fields are combined with a logical 'AND'. */
export type Order_Items_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  Product?: InputMaybe<Products_Bool_Exp>;
  _and?: InputMaybe<Array<Order_Items_Bool_Exp>>;
  _not?: InputMaybe<Order_Items_Bool_Exp>;
  _or?: InputMaybe<Array<Order_Items_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  price?: InputMaybe<String_Comparison_Exp>;
  product_id?: InputMaybe<Uuid_Comparison_Exp>;
  quantity?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "Order_Items" */
export type Order_Items_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Order_Items_pkey';

/** input type for incrementing numeric columns in table "Order_Items" */
export type Order_Items_Inc_Input = {
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Order_Items" */
export type Order_Items_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  Product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Order_Items_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "Order_Items" */
export type Order_Items_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Order_Items_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "Order_Items" */
export type Order_Items_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Order_Items" */
export type Order_Items_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Order_Items>;
};

/** on_conflict condition type for table "Order_Items" */
export type Order_Items_On_Conflict = {
  constraint: Order_Items_Constraint;
  update_columns?: Array<Order_Items_Update_Column>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** Ordering options when selecting data from "Order_Items". */
export type Order_Items_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  Product?: InputMaybe<Products_Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Order_Items */
export type Order_Items_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Order_Items" */
export type Order_Items_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'price'
  /** column name */
  | 'product_id'
  /** column name */
  | 'quantity';

/** input type for updating data in table "Order_Items" */
export type Order_Items_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Order_Items_Stddev_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Order_Items" */
export type Order_Items_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Order_Items_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Order_Items" */
export type Order_Items_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Order_Items_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Order_Items" */
export type Order_Items_Stddev_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Order_Items" */
export type Order_Items_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Order_Items_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Order_Items_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Order_Items_Sum_Fields = {
  quantity?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Order_Items" */
export type Order_Items_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** update columns of table "Order_Items" */
export type Order_Items_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'price'
  /** column name */
  | 'product_id'
  /** column name */
  | 'quantity';

export type Order_Items_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Order_Items_Set_Input>;
  /** filter the rows which have to be updated */
  where: Order_Items_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Order_Items_Var_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Order_Items" */
export type Order_Items_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Order_Items_Var_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Order_Items" */
export type Order_Items_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Order_Items_Variance_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Order_Items" */
export type Order_Items_Variance_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** columns and relationships of "Orders" */
export type Orders = {
  /** An object relationship */
  Address: Addresses;
  /** An array relationship */
  Delivery_Issues: Array<Delivery_Issues>;
  /** An aggregate relationship */
  Delivery_Issues_aggregate: Delivery_Issues_Aggregate;
  /** An object relationship */
  Invoice?: Maybe<Invoices>;
  OrderID: Scalars['Int']['output'];
  /** An array relationship */
  Order_Items: Array<Order_Items>;
  /** An aggregate relationship */
  Order_Items_aggregate: Order_Items_Aggregate;
  /** An array relationship */
  Ratings: Array<Ratings>;
  /** An aggregate relationship */
  Ratings_aggregate: Ratings_Aggregate;
  /** An object relationship */
  Refund?: Maybe<Refunds>;
  /** An array relationship */
  Revenues: Array<Revenue>;
  /** An aggregate relationship */
  Revenues_aggregate: Revenue_Aggregate;
  /** An object relationship */
  Shop: Shops;
  /** An object relationship */
  User?: Maybe<Users>;
  /** An array relationship */
  Wallet_Transactions: Array<Wallet_Transactions>;
  /** An aggregate relationship */
  Wallet_Transactions_aggregate: Wallet_Transactions_Aggregate;
  combined_order_id?: Maybe<Scalars['uuid']['output']>;
  created_at: Scalars['timestamptz']['output'];
  delivery_address_id: Scalars['uuid']['output'];
  delivery_fee: Scalars['String']['output'];
  delivery_notes?: Maybe<Scalars['String']['output']>;
  delivery_photo_url?: Maybe<Scalars['String']['output']>;
  delivery_time?: Maybe<Scalars['timestamptz']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  found: Scalars['Boolean']['output'];
  id: Scalars['uuid']['output'];
  service_fee: Scalars['String']['output'];
  shop_id: Scalars['uuid']['output'];
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  status: Scalars['String']['output'];
  total: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  userByUserId: Users;
  user_id: Scalars['uuid']['output'];
  voucher_code?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "Orders" */
export type OrdersDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersRatingsArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersRatings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersRevenuesArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersRevenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersWallet_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


/** columns and relationships of "Orders" */
export type OrdersWallet_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};

/** aggregated selection of "Orders" */
export type Orders_Aggregate = {
  aggregate?: Maybe<Orders_Aggregate_Fields>;
  nodes: Array<Orders>;
};

export type Orders_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Orders_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Orders_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Orders_Aggregate_Bool_Exp_Count>;
};

export type Orders_Aggregate_Bool_Exp_Bool_And = {
  arguments: Orders_Select_Column_Orders_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orders_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orders_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Orders_Select_Column_Orders_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orders_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orders_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orders_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orders_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Orders" */
export type Orders_Aggregate_Fields = {
  avg?: Maybe<Orders_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Orders_Max_Fields>;
  min?: Maybe<Orders_Min_Fields>;
  stddev?: Maybe<Orders_Stddev_Fields>;
  stddev_pop?: Maybe<Orders_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Orders_Stddev_Samp_Fields>;
  sum?: Maybe<Orders_Sum_Fields>;
  var_pop?: Maybe<Orders_Var_Pop_Fields>;
  var_samp?: Maybe<Orders_Var_Samp_Fields>;
  variance?: Maybe<Orders_Variance_Fields>;
};


/** aggregate fields of "Orders" */
export type Orders_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Orders_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Orders" */
export type Orders_Aggregate_Order_By = {
  avg?: InputMaybe<Orders_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orders_Max_Order_By>;
  min?: InputMaybe<Orders_Min_Order_By>;
  stddev?: InputMaybe<Orders_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orders_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orders_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orders_Sum_Order_By>;
  var_pop?: InputMaybe<Orders_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orders_Var_Samp_Order_By>;
  variance?: InputMaybe<Orders_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Orders" */
export type Orders_Arr_Rel_Insert_Input = {
  data: Array<Orders_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};

/** aggregate avg on columns */
export type Orders_Avg_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Orders" */
export type Orders_Avg_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Orders". All fields are combined with a logical 'AND'. */
export type Orders_Bool_Exp = {
  Address?: InputMaybe<Addresses_Bool_Exp>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Bool_Exp>;
  Delivery_Issues_aggregate?: InputMaybe<Delivery_Issues_Aggregate_Bool_Exp>;
  Invoice?: InputMaybe<Invoices_Bool_Exp>;
  OrderID?: InputMaybe<Int_Comparison_Exp>;
  Order_Items?: InputMaybe<Order_Items_Bool_Exp>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  Ratings?: InputMaybe<Ratings_Bool_Exp>;
  Ratings_aggregate?: InputMaybe<Ratings_Aggregate_Bool_Exp>;
  Refund?: InputMaybe<Refunds_Bool_Exp>;
  Revenues?: InputMaybe<Revenue_Bool_Exp>;
  Revenues_aggregate?: InputMaybe<Revenue_Aggregate_Bool_Exp>;
  Shop?: InputMaybe<Shops_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  Wallet_Transactions?: InputMaybe<Wallet_Transactions_Bool_Exp>;
  Wallet_Transactions_aggregate?: InputMaybe<Wallet_Transactions_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Orders_Bool_Exp>>;
  _not?: InputMaybe<Orders_Bool_Exp>;
  _or?: InputMaybe<Array<Orders_Bool_Exp>>;
  combined_order_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  delivery_address_id?: InputMaybe<Uuid_Comparison_Exp>;
  delivery_fee?: InputMaybe<String_Comparison_Exp>;
  delivery_notes?: InputMaybe<String_Comparison_Exp>;
  delivery_photo_url?: InputMaybe<String_Comparison_Exp>;
  delivery_time?: InputMaybe<Timestamptz_Comparison_Exp>;
  discount?: InputMaybe<String_Comparison_Exp>;
  found?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  service_fee?: InputMaybe<String_Comparison_Exp>;
  shop_id?: InputMaybe<Uuid_Comparison_Exp>;
  shopper_id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  total?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  userByUserId?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  voucher_code?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Orders" */
export type Orders_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Orders_id_key'
  /** unique or primary key constraint on columns "id" */
  | 'Orders_pkey';

/** input type for incrementing numeric columns in table "Orders" */
export type Orders_Inc_Input = {
  OrderID?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Orders" */
export type Orders_Insert_Input = {
  Address?: InputMaybe<Addresses_Obj_Rel_Insert_Input>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Arr_Rel_Insert_Input>;
  Invoice?: InputMaybe<Invoices_Obj_Rel_Insert_Input>;
  OrderID?: InputMaybe<Scalars['Int']['input']>;
  Order_Items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  Ratings?: InputMaybe<Ratings_Arr_Rel_Insert_Input>;
  Refund?: InputMaybe<Refunds_Obj_Rel_Insert_Input>;
  Revenues?: InputMaybe<Revenue_Arr_Rel_Insert_Input>;
  Shop?: InputMaybe<Shops_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  Wallet_Transactions?: InputMaybe<Wallet_Transactions_Arr_Rel_Insert_Input>;
  combined_order_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  delivery_address_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  delivery_notes?: InputMaybe<Scalars['String']['input']>;
  delivery_photo_url?: InputMaybe<Scalars['String']['input']>;
  delivery_time?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  found?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  userByUserId?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  voucher_code?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Orders_Max_Fields = {
  OrderID?: Maybe<Scalars['Int']['output']>;
  combined_order_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  delivery_address_id?: Maybe<Scalars['uuid']['output']>;
  delivery_fee?: Maybe<Scalars['String']['output']>;
  delivery_notes?: Maybe<Scalars['String']['output']>;
  delivery_photo_url?: Maybe<Scalars['String']['output']>;
  delivery_time?: Maybe<Scalars['timestamptz']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  service_fee?: Maybe<Scalars['String']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  voucher_code?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Orders" */
export type Orders_Max_Order_By = {
  OrderID?: InputMaybe<Order_By>;
  combined_order_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  delivery_address_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  delivery_notes?: InputMaybe<Order_By>;
  delivery_photo_url?: InputMaybe<Order_By>;
  delivery_time?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  voucher_code?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Orders_Min_Fields = {
  OrderID?: Maybe<Scalars['Int']['output']>;
  combined_order_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  delivery_address_id?: Maybe<Scalars['uuid']['output']>;
  delivery_fee?: Maybe<Scalars['String']['output']>;
  delivery_notes?: Maybe<Scalars['String']['output']>;
  delivery_photo_url?: Maybe<Scalars['String']['output']>;
  delivery_time?: Maybe<Scalars['timestamptz']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  service_fee?: Maybe<Scalars['String']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  voucher_code?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Orders" */
export type Orders_Min_Order_By = {
  OrderID?: InputMaybe<Order_By>;
  combined_order_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  delivery_address_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  delivery_notes?: InputMaybe<Order_By>;
  delivery_photo_url?: InputMaybe<Order_By>;
  delivery_time?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  voucher_code?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Orders" */
export type Orders_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Orders>;
};

/** input type for inserting object relation for remote table "Orders" */
export type Orders_Obj_Rel_Insert_Input = {
  data: Orders_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};

/** on_conflict condition type for table "Orders" */
export type Orders_On_Conflict = {
  constraint: Orders_Constraint;
  update_columns?: Array<Orders_Update_Column>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** Ordering options when selecting data from "Orders". */
export type Orders_Order_By = {
  Address?: InputMaybe<Addresses_Order_By>;
  Delivery_Issues_aggregate?: InputMaybe<Delivery_Issues_Aggregate_Order_By>;
  Invoice?: InputMaybe<Invoices_Order_By>;
  OrderID?: InputMaybe<Order_By>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  Ratings_aggregate?: InputMaybe<Ratings_Aggregate_Order_By>;
  Refund?: InputMaybe<Refunds_Order_By>;
  Revenues_aggregate?: InputMaybe<Revenue_Aggregate_Order_By>;
  Shop?: InputMaybe<Shops_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  Wallet_Transactions_aggregate?: InputMaybe<Wallet_Transactions_Aggregate_Order_By>;
  combined_order_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  delivery_address_id?: InputMaybe<Order_By>;
  delivery_fee?: InputMaybe<Order_By>;
  delivery_notes?: InputMaybe<Order_By>;
  delivery_photo_url?: InputMaybe<Order_By>;
  delivery_time?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  found?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  service_fee?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  total?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  userByUserId?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  voucher_code?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Orders */
export type Orders_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Orders" */
export type Orders_Select_Column =
  /** column name */
  | 'OrderID'
  /** column name */
  | 'combined_order_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'delivery_address_id'
  /** column name */
  | 'delivery_fee'
  /** column name */
  | 'delivery_notes'
  /** column name */
  | 'delivery_photo_url'
  /** column name */
  | 'delivery_time'
  /** column name */
  | 'discount'
  /** column name */
  | 'found'
  /** column name */
  | 'id'
  /** column name */
  | 'service_fee'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'status'
  /** column name */
  | 'total'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id'
  /** column name */
  | 'voucher_code';

/** select "Orders_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Orders" */
export type Orders_Select_Column_Orders_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'found';

/** select "Orders_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Orders" */
export type Orders_Select_Column_Orders_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'found';

/** input type for updating data in table "Orders" */
export type Orders_Set_Input = {
  OrderID?: InputMaybe<Scalars['Int']['input']>;
  combined_order_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  delivery_address_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  delivery_notes?: InputMaybe<Scalars['String']['input']>;
  delivery_photo_url?: InputMaybe<Scalars['String']['input']>;
  delivery_time?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  found?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  voucher_code?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Orders_Stddev_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Orders" */
export type Orders_Stddev_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Orders_Stddev_Pop_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Orders" */
export type Orders_Stddev_Pop_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Orders_Stddev_Samp_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Orders" */
export type Orders_Stddev_Samp_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Orders" */
export type Orders_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orders_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orders_Stream_Cursor_Value_Input = {
  OrderID?: InputMaybe<Scalars['Int']['input']>;
  combined_order_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  delivery_address_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  delivery_notes?: InputMaybe<Scalars['String']['input']>;
  delivery_photo_url?: InputMaybe<Scalars['String']['input']>;
  delivery_time?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  found?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  voucher_code?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Orders_Sum_Fields = {
  OrderID?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Orders" */
export type Orders_Sum_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** update columns of table "Orders" */
export type Orders_Update_Column =
  /** column name */
  | 'OrderID'
  /** column name */
  | 'combined_order_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'delivery_address_id'
  /** column name */
  | 'delivery_fee'
  /** column name */
  | 'delivery_notes'
  /** column name */
  | 'delivery_photo_url'
  /** column name */
  | 'delivery_time'
  /** column name */
  | 'discount'
  /** column name */
  | 'found'
  /** column name */
  | 'id'
  /** column name */
  | 'service_fee'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'status'
  /** column name */
  | 'total'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id'
  /** column name */
  | 'voucher_code';

export type Orders_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Orders_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Orders_Set_Input>;
  /** filter the rows which have to be updated */
  where: Orders_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Orders_Var_Pop_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Orders" */
export type Orders_Var_Pop_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Orders_Var_Samp_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Orders" */
export type Orders_Var_Samp_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Orders_Variance_Fields = {
  OrderID?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Orders" */
export type Orders_Variance_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** columns and relationships of "Payment_Methods" */
export type Payment_Methods = {
  CCV?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  User: Users;
  create_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_default: Scalars['Boolean']['output'];
  method: Scalars['String']['output'];
  names: Scalars['String']['output'];
  number: Scalars['String']['output'];
  update_on?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['uuid']['output'];
  validity?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "Payment_Methods" */
export type Payment_Methods_Aggregate = {
  aggregate?: Maybe<Payment_Methods_Aggregate_Fields>;
  nodes: Array<Payment_Methods>;
};

export type Payment_Methods_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Payment_Methods_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Payment_Methods_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Payment_Methods_Aggregate_Bool_Exp_Count>;
};

export type Payment_Methods_Aggregate_Bool_Exp_Bool_And = {
  arguments: Payment_Methods_Select_Column_Payment_Methods_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Payment_Methods_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Payment_Methods_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Payment_Methods_Select_Column_Payment_Methods_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Payment_Methods_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Payment_Methods_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Payment_Methods_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Payment_Methods" */
export type Payment_Methods_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Payment_Methods_Max_Fields>;
  min?: Maybe<Payment_Methods_Min_Fields>;
};


/** aggregate fields of "Payment_Methods" */
export type Payment_Methods_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Payment_Methods" */
export type Payment_Methods_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Payment_Methods_Max_Order_By>;
  min?: InputMaybe<Payment_Methods_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Payment_Methods" */
export type Payment_Methods_Arr_Rel_Insert_Input = {
  data: Array<Payment_Methods_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Payment_Methods_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Payment_Methods". All fields are combined with a logical 'AND'. */
export type Payment_Methods_Bool_Exp = {
  CCV?: InputMaybe<String_Comparison_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Payment_Methods_Bool_Exp>>;
  _not?: InputMaybe<Payment_Methods_Bool_Exp>;
  _or?: InputMaybe<Array<Payment_Methods_Bool_Exp>>;
  create_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_default?: InputMaybe<Boolean_Comparison_Exp>;
  method?: InputMaybe<String_Comparison_Exp>;
  names?: InputMaybe<String_Comparison_Exp>;
  number?: InputMaybe<String_Comparison_Exp>;
  update_on?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  validity?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Payment_Methods" */
export type Payment_Methods_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Payment_Methods_pkey';

/** input type for inserting data into table "Payment_Methods" */
export type Payment_Methods_Insert_Input = {
  CCV?: InputMaybe<Scalars['String']['input']>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  names?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  validity?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Payment_Methods_Max_Fields = {
  CCV?: Maybe<Scalars['String']['output']>;
  create_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  method?: Maybe<Scalars['String']['output']>;
  names?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  validity?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Payment_Methods" */
export type Payment_Methods_Max_Order_By = {
  CCV?: InputMaybe<Order_By>;
  create_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  method?: InputMaybe<Order_By>;
  names?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  validity?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Payment_Methods_Min_Fields = {
  CCV?: Maybe<Scalars['String']['output']>;
  create_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  method?: Maybe<Scalars['String']['output']>;
  names?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  validity?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Payment_Methods" */
export type Payment_Methods_Min_Order_By = {
  CCV?: InputMaybe<Order_By>;
  create_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  method?: InputMaybe<Order_By>;
  names?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  validity?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Payment_Methods" */
export type Payment_Methods_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Payment_Methods>;
};

/** on_conflict condition type for table "Payment_Methods" */
export type Payment_Methods_On_Conflict = {
  constraint: Payment_Methods_Constraint;
  update_columns?: Array<Payment_Methods_Update_Column>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

/** Ordering options when selecting data from "Payment_Methods". */
export type Payment_Methods_Order_By = {
  CCV?: InputMaybe<Order_By>;
  User?: InputMaybe<Users_Order_By>;
  create_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_default?: InputMaybe<Order_By>;
  method?: InputMaybe<Order_By>;
  names?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  validity?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Payment_Methods */
export type Payment_Methods_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Payment_Methods" */
export type Payment_Methods_Select_Column =
  /** column name */
  | 'CCV'
  /** column name */
  | 'create_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_default'
  /** column name */
  | 'method'
  /** column name */
  | 'names'
  /** column name */
  | 'number'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id'
  /** column name */
  | 'validity';

/** select "Payment_Methods_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Payment_Methods" */
export type Payment_Methods_Select_Column_Payment_Methods_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_default';

/** select "Payment_Methods_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Payment_Methods" */
export type Payment_Methods_Select_Column_Payment_Methods_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_default';

/** input type for updating data in table "Payment_Methods" */
export type Payment_Methods_Set_Input = {
  CCV?: InputMaybe<Scalars['String']['input']>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  names?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  validity?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Payment_Methods" */
export type Payment_Methods_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Payment_Methods_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Payment_Methods_Stream_Cursor_Value_Input = {
  CCV?: InputMaybe<Scalars['String']['input']>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  names?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  validity?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Payment_Methods" */
export type Payment_Methods_Update_Column =
  /** column name */
  | 'CCV'
  /** column name */
  | 'create_at'
  /** column name */
  | 'id'
  /** column name */
  | 'is_default'
  /** column name */
  | 'method'
  /** column name */
  | 'names'
  /** column name */
  | 'number'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id'
  /** column name */
  | 'validity';

export type Payment_Methods_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Payment_Methods_Set_Input>;
  /** filter the rows which have to be updated */
  where: Payment_Methods_Bool_Exp;
};

/** Platform Settings */
export type Platform_Settings = {
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  key: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  value: Scalars['json']['output'];
};


/** Platform Settings */
export type Platform_SettingsValueArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "Platform_Settings" */
export type Platform_Settings_Aggregate = {
  aggregate?: Maybe<Platform_Settings_Aggregate_Fields>;
  nodes: Array<Platform_Settings>;
};

/** aggregate fields of "Platform_Settings" */
export type Platform_Settings_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Platform_Settings_Max_Fields>;
  min?: Maybe<Platform_Settings_Min_Fields>;
};


/** aggregate fields of "Platform_Settings" */
export type Platform_Settings_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "Platform_Settings". All fields are combined with a logical 'AND'. */
export type Platform_Settings_Bool_Exp = {
  _and?: InputMaybe<Array<Platform_Settings_Bool_Exp>>;
  _not?: InputMaybe<Platform_Settings_Bool_Exp>;
  _or?: InputMaybe<Array<Platform_Settings_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  key?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  value?: InputMaybe<Json_Comparison_Exp>;
};

/** unique or primary key constraints on table "Platform_Settings" */
export type Platform_Settings_Constraint =
  /** unique or primary key constraint on columns "key" */
  | 'Platform_Settings_key_key'
  /** unique or primary key constraint on columns "id" */
  | 'Platform_Settings_pkey';

/** input type for inserting data into table "Platform_Settings" */
export type Platform_Settings_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['json']['input']>;
};

/** aggregate max on columns */
export type Platform_Settings_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Platform_Settings_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "Platform_Settings" */
export type Platform_Settings_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Platform_Settings>;
};

/** on_conflict condition type for table "Platform_Settings" */
export type Platform_Settings_On_Conflict = {
  constraint: Platform_Settings_Constraint;
  update_columns?: Array<Platform_Settings_Update_Column>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

/** Ordering options when selecting data from "Platform_Settings". */
export type Platform_Settings_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  key?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Platform_Settings */
export type Platform_Settings_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Platform_Settings" */
export type Platform_Settings_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'key'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'value';

/** input type for updating data in table "Platform_Settings" */
export type Platform_Settings_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['json']['input']>;
};

/** Streaming cursor of the table "Platform_Settings" */
export type Platform_Settings_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Platform_Settings_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Platform_Settings_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['json']['input']>;
};

/** update columns of table "Platform_Settings" */
export type Platform_Settings_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'key'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'value';

export type Platform_Settings_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Platform_Settings_Set_Input>;
  /** filter the rows which have to be updated */
  where: Platform_Settings_Bool_Exp;
};

/** Products */
export type Products = {
  /** An array relationship */
  Cart_Items: Array<Cart_Items>;
  /** An aggregate relationship */
  Cart_Items_aggregate: Cart_Items_Aggregate;
  /** An array relationship */
  Order_Items: Array<Order_Items>;
  /** An aggregate relationship */
  Order_Items_aggregate: Order_Items_Aggregate;
  /** An object relationship */
  Shop: Shops;
  barcode?: Maybe<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  final_price?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  image?: Maybe<Scalars['String']['output']>;
  is_active: Scalars['Boolean']['output'];
  measurement_unit: Scalars['String']['output'];
  name: Scalars['String']['output'];
  price: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  reorder_point?: Maybe<Scalars['Int']['output']>;
  shop_id: Scalars['uuid']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};


/** Products */
export type ProductsCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


/** Products */
export type ProductsCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


/** Products */
export type ProductsOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** Products */
export type ProductsOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** aggregated selection of "Products" */
export type Products_Aggregate = {
  aggregate?: Maybe<Products_Aggregate_Fields>;
  nodes: Array<Products>;
};

export type Products_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Products_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Products_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Products_Aggregate_Bool_Exp_Count>;
};

export type Products_Aggregate_Bool_Exp_Bool_And = {
  arguments: Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Products_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Products_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Products_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Products" */
export type Products_Aggregate_Fields = {
  avg?: Maybe<Products_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Products_Max_Fields>;
  min?: Maybe<Products_Min_Fields>;
  stddev?: Maybe<Products_Stddev_Fields>;
  stddev_pop?: Maybe<Products_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Products_Stddev_Samp_Fields>;
  sum?: Maybe<Products_Sum_Fields>;
  var_pop?: Maybe<Products_Var_Pop_Fields>;
  var_samp?: Maybe<Products_Var_Samp_Fields>;
  variance?: Maybe<Products_Variance_Fields>;
};


/** aggregate fields of "Products" */
export type Products_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Products_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Products" */
export type Products_Aggregate_Order_By = {
  avg?: InputMaybe<Products_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Products_Max_Order_By>;
  min?: InputMaybe<Products_Min_Order_By>;
  stddev?: InputMaybe<Products_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Products_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Products_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Products_Sum_Order_By>;
  var_pop?: InputMaybe<Products_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Products_Var_Samp_Order_By>;
  variance?: InputMaybe<Products_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Products" */
export type Products_Arr_Rel_Insert_Input = {
  data: Array<Products_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Products_On_Conflict>;
};

/** aggregate avg on columns */
export type Products_Avg_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Products" */
export type Products_Avg_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Products". All fields are combined with a logical 'AND'. */
export type Products_Bool_Exp = {
  Cart_Items?: InputMaybe<Cart_Items_Bool_Exp>;
  Cart_Items_aggregate?: InputMaybe<Cart_Items_Aggregate_Bool_Exp>;
  Order_Items?: InputMaybe<Order_Items_Bool_Exp>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  Shop?: InputMaybe<Shops_Bool_Exp>;
  _and?: InputMaybe<Array<Products_Bool_Exp>>;
  _not?: InputMaybe<Products_Bool_Exp>;
  _or?: InputMaybe<Array<Products_Bool_Exp>>;
  barcode?: InputMaybe<String_Comparison_Exp>;
  category?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  final_price?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  measurement_unit?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<String_Comparison_Exp>;
  quantity?: InputMaybe<Int_Comparison_Exp>;
  reorder_point?: InputMaybe<Int_Comparison_Exp>;
  shop_id?: InputMaybe<Uuid_Comparison_Exp>;
  sku?: InputMaybe<String_Comparison_Exp>;
  supplier?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Products" */
export type Products_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Products_pkey';

/** input type for incrementing numeric columns in table "Products" */
export type Products_Inc_Input = {
  quantity?: InputMaybe<Scalars['Int']['input']>;
  reorder_point?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Products" */
export type Products_Insert_Input = {
  Cart_Items?: InputMaybe<Cart_Items_Arr_Rel_Insert_Input>;
  Order_Items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  Shop?: InputMaybe<Shops_Obj_Rel_Insert_Input>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  final_price?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  measurement_unit?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  reorder_point?: InputMaybe<Scalars['Int']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Products_Max_Fields = {
  barcode?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  final_price?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  measurement_unit?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  reorder_point?: Maybe<Scalars['Int']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Products" */
export type Products_Max_Order_By = {
  barcode?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  final_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  supplier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Products_Min_Fields = {
  barcode?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  final_price?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  measurement_unit?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  reorder_point?: Maybe<Scalars['Int']['output']>;
  shop_id?: Maybe<Scalars['uuid']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Products" */
export type Products_Min_Order_By = {
  barcode?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  final_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  supplier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Products" */
export type Products_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Products>;
};

/** input type for inserting object relation for remote table "Products" */
export type Products_Obj_Rel_Insert_Input = {
  data: Products_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Products_On_Conflict>;
};

/** on_conflict condition type for table "Products" */
export type Products_On_Conflict = {
  constraint: Products_Constraint;
  update_columns?: Array<Products_Update_Column>;
  where?: InputMaybe<Products_Bool_Exp>;
};

/** Ordering options when selecting data from "Products". */
export type Products_Order_By = {
  Cart_Items_aggregate?: InputMaybe<Cart_Items_Aggregate_Order_By>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  Shop?: InputMaybe<Shops_Order_By>;
  barcode?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  final_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  supplier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Products */
export type Products_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Products" */
export type Products_Select_Column =
  /** column name */
  | 'barcode'
  /** column name */
  | 'category'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'final_price'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'measurement_unit'
  /** column name */
  | 'name'
  /** column name */
  | 'price'
  /** column name */
  | 'quantity'
  /** column name */
  | 'reorder_point'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'sku'
  /** column name */
  | 'supplier'
  /** column name */
  | 'updated_at';

/** select "Products_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Products" */
export type Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_active';

/** select "Products_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Products" */
export type Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_active';

/** input type for updating data in table "Products" */
export type Products_Set_Input = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  final_price?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  measurement_unit?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  reorder_point?: InputMaybe<Scalars['Int']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Products_Stddev_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Products" */
export type Products_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Products_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Products" */
export type Products_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Products_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Products" */
export type Products_Stddev_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Products" */
export type Products_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Products_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Products_Stream_Cursor_Value_Input = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  final_price?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  measurement_unit?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  reorder_point?: InputMaybe<Scalars['Int']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Products_Sum_Fields = {
  quantity?: Maybe<Scalars['Int']['output']>;
  reorder_point?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Products" */
export type Products_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** update columns of table "Products" */
export type Products_Update_Column =
  /** column name */
  | 'barcode'
  /** column name */
  | 'category'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'final_price'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'measurement_unit'
  /** column name */
  | 'name'
  /** column name */
  | 'price'
  /** column name */
  | 'quantity'
  /** column name */
  | 'reorder_point'
  /** column name */
  | 'shop_id'
  /** column name */
  | 'sku'
  /** column name */
  | 'supplier'
  /** column name */
  | 'updated_at';

export type Products_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Products_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Products_Set_Input>;
  /** filter the rows which have to be updated */
  where: Products_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Products_Var_Pop_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Products" */
export type Products_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Products_Var_Samp_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Products" */
export type Products_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Products_Variance_Fields = {
  quantity?: Maybe<Scalars['Float']['output']>;
  reorder_point?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Products" */
export type Products_Variance_Order_By = {
  quantity?: InputMaybe<Order_By>;
  reorder_point?: InputMaybe<Order_By>;
};

/** columns and relationships of "Ratings" */
export type Ratings = {
  /** An object relationship */
  Order: Orders;
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  customer_id: Scalars['uuid']['output'];
  delivery_experience?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  order_id: Scalars['uuid']['output'];
  packaging_quality?: Maybe<Scalars['String']['output']>;
  professionalism?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Int']['output'];
  review: Scalars['String']['output'];
  reviewed_at?: Maybe<Scalars['timestamptz']['output']>;
  shopper_id: Scalars['uuid']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  userByShopperId: Users;
};

/** aggregated selection of "Ratings" */
export type Ratings_Aggregate = {
  aggregate?: Maybe<Ratings_Aggregate_Fields>;
  nodes: Array<Ratings>;
};

export type Ratings_Aggregate_Bool_Exp = {
  count?: InputMaybe<Ratings_Aggregate_Bool_Exp_Count>;
};

export type Ratings_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Ratings_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Ratings_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Ratings" */
export type Ratings_Aggregate_Fields = {
  avg?: Maybe<Ratings_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Ratings_Max_Fields>;
  min?: Maybe<Ratings_Min_Fields>;
  stddev?: Maybe<Ratings_Stddev_Fields>;
  stddev_pop?: Maybe<Ratings_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Ratings_Stddev_Samp_Fields>;
  sum?: Maybe<Ratings_Sum_Fields>;
  var_pop?: Maybe<Ratings_Var_Pop_Fields>;
  var_samp?: Maybe<Ratings_Var_Samp_Fields>;
  variance?: Maybe<Ratings_Variance_Fields>;
};


/** aggregate fields of "Ratings" */
export type Ratings_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Ratings_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Ratings" */
export type Ratings_Aggregate_Order_By = {
  avg?: InputMaybe<Ratings_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Ratings_Max_Order_By>;
  min?: InputMaybe<Ratings_Min_Order_By>;
  stddev?: InputMaybe<Ratings_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Ratings_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Ratings_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Ratings_Sum_Order_By>;
  var_pop?: InputMaybe<Ratings_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Ratings_Var_Samp_Order_By>;
  variance?: InputMaybe<Ratings_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Ratings" */
export type Ratings_Arr_Rel_Insert_Input = {
  data: Array<Ratings_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Ratings_On_Conflict>;
};

/** aggregate avg on columns */
export type Ratings_Avg_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Ratings" */
export type Ratings_Avg_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Ratings". All fields are combined with a logical 'AND'. */
export type Ratings_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Ratings_Bool_Exp>>;
  _not?: InputMaybe<Ratings_Bool_Exp>;
  _or?: InputMaybe<Array<Ratings_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  customer_id?: InputMaybe<Uuid_Comparison_Exp>;
  delivery_experience?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  packaging_quality?: InputMaybe<String_Comparison_Exp>;
  professionalism?: InputMaybe<String_Comparison_Exp>;
  rating?: InputMaybe<Int_Comparison_Exp>;
  review?: InputMaybe<String_Comparison_Exp>;
  reviewed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  shopper_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  userByShopperId?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "Ratings" */
export type Ratings_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Ratings_pkey';

/** input type for incrementing numeric columns in table "Ratings" */
export type Ratings_Inc_Input = {
  rating?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Ratings" */
export type Ratings_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_experience?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  packaging_quality?: InputMaybe<Scalars['String']['input']>;
  professionalism?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  review?: InputMaybe<Scalars['String']['input']>;
  reviewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  userByShopperId?: InputMaybe<Users_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Ratings_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  customer_id?: Maybe<Scalars['uuid']['output']>;
  delivery_experience?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  packaging_quality?: Maybe<Scalars['String']['output']>;
  professionalism?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['Int']['output']>;
  review?: Maybe<Scalars['String']['output']>;
  reviewed_at?: Maybe<Scalars['timestamptz']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "Ratings" */
export type Ratings_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_experience?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  packaging_quality?: InputMaybe<Order_By>;
  professionalism?: InputMaybe<Order_By>;
  rating?: InputMaybe<Order_By>;
  review?: InputMaybe<Order_By>;
  reviewed_at?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Ratings_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  customer_id?: Maybe<Scalars['uuid']['output']>;
  delivery_experience?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  packaging_quality?: Maybe<Scalars['String']['output']>;
  professionalism?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['Int']['output']>;
  review?: Maybe<Scalars['String']['output']>;
  reviewed_at?: Maybe<Scalars['timestamptz']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "Ratings" */
export type Ratings_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_experience?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  packaging_quality?: InputMaybe<Order_By>;
  professionalism?: InputMaybe<Order_By>;
  rating?: InputMaybe<Order_By>;
  review?: InputMaybe<Order_By>;
  reviewed_at?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Ratings" */
export type Ratings_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Ratings>;
};

/** on_conflict condition type for table "Ratings" */
export type Ratings_On_Conflict = {
  constraint: Ratings_Constraint;
  update_columns?: Array<Ratings_Update_Column>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};

/** Ordering options when selecting data from "Ratings". */
export type Ratings_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  customer_id?: InputMaybe<Order_By>;
  delivery_experience?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  packaging_quality?: InputMaybe<Order_By>;
  professionalism?: InputMaybe<Order_By>;
  rating?: InputMaybe<Order_By>;
  review?: InputMaybe<Order_By>;
  reviewed_at?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  userByShopperId?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: Ratings */
export type Ratings_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Ratings" */
export type Ratings_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'customer_id'
  /** column name */
  | 'delivery_experience'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'packaging_quality'
  /** column name */
  | 'professionalism'
  /** column name */
  | 'rating'
  /** column name */
  | 'review'
  /** column name */
  | 'reviewed_at'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'updated_at';

/** input type for updating data in table "Ratings" */
export type Ratings_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_experience?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  packaging_quality?: InputMaybe<Scalars['String']['input']>;
  professionalism?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  review?: InputMaybe<Scalars['String']['input']>;
  reviewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Ratings_Stddev_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Ratings" */
export type Ratings_Stddev_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Ratings_Stddev_Pop_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Ratings" */
export type Ratings_Stddev_Pop_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Ratings_Stddev_Samp_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Ratings" */
export type Ratings_Stddev_Samp_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Ratings" */
export type Ratings_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Ratings_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Ratings_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_experience?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  packaging_quality?: InputMaybe<Scalars['String']['input']>;
  professionalism?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  review?: InputMaybe<Scalars['String']['input']>;
  reviewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Ratings_Sum_Fields = {
  rating?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Ratings" */
export type Ratings_Sum_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** update columns of table "Ratings" */
export type Ratings_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'customer_id'
  /** column name */
  | 'delivery_experience'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'packaging_quality'
  /** column name */
  | 'professionalism'
  /** column name */
  | 'rating'
  /** column name */
  | 'review'
  /** column name */
  | 'reviewed_at'
  /** column name */
  | 'shopper_id'
  /** column name */
  | 'updated_at';

export type Ratings_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Ratings_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Ratings_Set_Input>;
  /** filter the rows which have to be updated */
  where: Ratings_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Ratings_Var_Pop_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Ratings" */
export type Ratings_Var_Pop_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Ratings_Var_Samp_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Ratings" */
export type Ratings_Var_Samp_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Ratings_Variance_Fields = {
  rating?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Ratings" */
export type Ratings_Variance_Order_By = {
  rating?: InputMaybe<Order_By>;
};

/** columns and relationships of "Reels" */
export type Reels = {
  /** An array relationship */
  Reels_comments: Array<Reels_Comments>;
  /** An aggregate relationship */
  Reels_comments_aggregate: Reels_Comments_Aggregate;
  /** An object relationship */
  Restaurant: Restaurants;
  /** An object relationship */
  User: Users;
  category: Scalars['String']['output'];
  created_on: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  isLiked: Scalars['Boolean']['output'];
  likes: Scalars['String']['output'];
  restaurant_id: Scalars['uuid']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  user_id: Scalars['uuid']['output'];
  video_url: Scalars['String']['output'];
};


/** columns and relationships of "Reels" */
export type ReelsReels_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


/** columns and relationships of "Reels" */
export type ReelsReels_Comments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};

/** aggregated selection of "Reels" */
export type Reels_Aggregate = {
  aggregate?: Maybe<Reels_Aggregate_Fields>;
  nodes: Array<Reels>;
};

export type Reels_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Reels_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Reels_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Reels_Aggregate_Bool_Exp_Count>;
};

export type Reels_Aggregate_Bool_Exp_Bool_And = {
  arguments: Reels_Select_Column_Reels_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Reels_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Reels_Select_Column_Reels_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Reels_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Reels_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Reels" */
export type Reels_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Reels_Max_Fields>;
  min?: Maybe<Reels_Min_Fields>;
};


/** aggregate fields of "Reels" */
export type Reels_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reels_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Reels" */
export type Reels_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Reels_Max_Order_By>;
  min?: InputMaybe<Reels_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Reels" */
export type Reels_Arr_Rel_Insert_Input = {
  data: Array<Reels_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Reels_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Reels". All fields are combined with a logical 'AND'. */
export type Reels_Bool_Exp = {
  Reels_comments?: InputMaybe<Reels_Comments_Bool_Exp>;
  Reels_comments_aggregate?: InputMaybe<Reels_Comments_Aggregate_Bool_Exp>;
  Restaurant?: InputMaybe<Restaurants_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Reels_Bool_Exp>>;
  _not?: InputMaybe<Reels_Bool_Exp>;
  _or?: InputMaybe<Array<Reels_Bool_Exp>>;
  category?: InputMaybe<String_Comparison_Exp>;
  created_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  isLiked?: InputMaybe<Boolean_Comparison_Exp>;
  likes?: InputMaybe<String_Comparison_Exp>;
  restaurant_id?: InputMaybe<Uuid_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  video_url?: InputMaybe<String_Comparison_Exp>;
};

/** columns and relationships of "Reels_comments" */
export type Reels_Comments = {
  /** An object relationship */
  Reel: Reels;
  /** An object relationship */
  User: Users;
  created_on: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  isLiked: Scalars['Boolean']['output'];
  likes: Scalars['String']['output'];
  reel_id: Scalars['uuid']['output'];
  text: Scalars['String']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "Reels_comments" */
export type Reels_Comments_Aggregate = {
  aggregate?: Maybe<Reels_Comments_Aggregate_Fields>;
  nodes: Array<Reels_Comments>;
};

export type Reels_Comments_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Reels_Comments_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Reels_Comments_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Reels_Comments_Aggregate_Bool_Exp_Count>;
};

export type Reels_Comments_Aggregate_Bool_Exp_Bool_And = {
  arguments: Reels_Comments_Select_Column_Reels_Comments_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Comments_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Reels_Comments_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Reels_Comments_Select_Column_Reels_Comments_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Comments_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Reels_Comments_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reels_Comments_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Reels_comments" */
export type Reels_Comments_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Reels_Comments_Max_Fields>;
  min?: Maybe<Reels_Comments_Min_Fields>;
};


/** aggregate fields of "Reels_comments" */
export type Reels_Comments_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Reels_comments" */
export type Reels_Comments_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Reels_Comments_Max_Order_By>;
  min?: InputMaybe<Reels_Comments_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Reels_comments" */
export type Reels_Comments_Arr_Rel_Insert_Input = {
  data: Array<Reels_Comments_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Reels_Comments_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Reels_comments". All fields are combined with a logical 'AND'. */
export type Reels_Comments_Bool_Exp = {
  Reel?: InputMaybe<Reels_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Reels_Comments_Bool_Exp>>;
  _not?: InputMaybe<Reels_Comments_Bool_Exp>;
  _or?: InputMaybe<Array<Reels_Comments_Bool_Exp>>;
  created_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  isLiked?: InputMaybe<Boolean_Comparison_Exp>;
  likes?: InputMaybe<String_Comparison_Exp>;
  reel_id?: InputMaybe<Uuid_Comparison_Exp>;
  text?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Reels_comments" */
export type Reels_Comments_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Reels_comments_pkey';

/** input type for inserting data into table "Reels_comments" */
export type Reels_Comments_Insert_Input = {
  Reel?: InputMaybe<Reels_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  reel_id?: InputMaybe<Scalars['uuid']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Reels_Comments_Max_Fields = {
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  likes?: Maybe<Scalars['String']['output']>;
  reel_id?: Maybe<Scalars['uuid']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Reels_comments" */
export type Reels_Comments_Max_Order_By = {
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  reel_id?: InputMaybe<Order_By>;
  text?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Reels_Comments_Min_Fields = {
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  likes?: Maybe<Scalars['String']['output']>;
  reel_id?: Maybe<Scalars['uuid']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Reels_comments" */
export type Reels_Comments_Min_Order_By = {
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  reel_id?: InputMaybe<Order_By>;
  text?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Reels_comments" */
export type Reels_Comments_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Reels_Comments>;
};

/** on_conflict condition type for table "Reels_comments" */
export type Reels_Comments_On_Conflict = {
  constraint: Reels_Comments_Constraint;
  update_columns?: Array<Reels_Comments_Update_Column>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};

/** Ordering options when selecting data from "Reels_comments". */
export type Reels_Comments_Order_By = {
  Reel?: InputMaybe<Reels_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  isLiked?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  reel_id?: InputMaybe<Order_By>;
  text?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Reels_comments */
export type Reels_Comments_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Reels_comments" */
export type Reels_Comments_Select_Column =
  /** column name */
  | 'created_on'
  /** column name */
  | 'id'
  /** column name */
  | 'isLiked'
  /** column name */
  | 'likes'
  /** column name */
  | 'reel_id'
  /** column name */
  | 'text'
  /** column name */
  | 'user_id';

/** select "Reels_comments_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Reels_comments" */
export type Reels_Comments_Select_Column_Reels_Comments_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'isLiked';

/** select "Reels_comments_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Reels_comments" */
export type Reels_Comments_Select_Column_Reels_Comments_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'isLiked';

/** input type for updating data in table "Reels_comments" */
export type Reels_Comments_Set_Input = {
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  reel_id?: InputMaybe<Scalars['uuid']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Reels_comments" */
export type Reels_Comments_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Reels_Comments_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Reels_Comments_Stream_Cursor_Value_Input = {
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  reel_id?: InputMaybe<Scalars['uuid']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Reels_comments" */
export type Reels_Comments_Update_Column =
  /** column name */
  | 'created_on'
  /** column name */
  | 'id'
  /** column name */
  | 'isLiked'
  /** column name */
  | 'likes'
  /** column name */
  | 'reel_id'
  /** column name */
  | 'text'
  /** column name */
  | 'user_id';

export type Reels_Comments_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Reels_Comments_Set_Input>;
  /** filter the rows which have to be updated */
  where: Reels_Comments_Bool_Exp;
};

/** unique or primary key constraints on table "Reels" */
export type Reels_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Reels_pkey';

/** input type for inserting data into table "Reels" */
export type Reels_Insert_Input = {
  Reels_comments?: InputMaybe<Reels_Comments_Arr_Rel_Insert_Input>;
  Restaurant?: InputMaybe<Restaurants_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['uuid']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Reels_Max_Fields = {
  category?: Maybe<Scalars['String']['output']>;
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  likes?: Maybe<Scalars['String']['output']>;
  restaurant_id?: Maybe<Scalars['uuid']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_url?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Reels" */
export type Reels_Max_Order_By = {
  category?: InputMaybe<Order_By>;
  created_on?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  restaurant_id?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_url?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Reels_Min_Fields = {
  category?: Maybe<Scalars['String']['output']>;
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  likes?: Maybe<Scalars['String']['output']>;
  restaurant_id?: Maybe<Scalars['uuid']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_url?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Reels" */
export type Reels_Min_Order_By = {
  category?: InputMaybe<Order_By>;
  created_on?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  restaurant_id?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_url?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Reels" */
export type Reels_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Reels>;
};

/** input type for inserting object relation for remote table "Reels" */
export type Reels_Obj_Rel_Insert_Input = {
  data: Reels_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Reels_On_Conflict>;
};

/** on_conflict condition type for table "Reels" */
export type Reels_On_Conflict = {
  constraint: Reels_Constraint;
  update_columns?: Array<Reels_Update_Column>;
  where?: InputMaybe<Reels_Bool_Exp>;
};

/** Ordering options when selecting data from "Reels". */
export type Reels_Order_By = {
  Reels_comments_aggregate?: InputMaybe<Reels_Comments_Aggregate_Order_By>;
  Restaurant?: InputMaybe<Restaurants_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  category?: InputMaybe<Order_By>;
  created_on?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  isLiked?: InputMaybe<Order_By>;
  likes?: InputMaybe<Order_By>;
  restaurant_id?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_url?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Reels */
export type Reels_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Reels" */
export type Reels_Select_Column =
  /** column name */
  | 'category'
  /** column name */
  | 'created_on'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'isLiked'
  /** column name */
  | 'likes'
  /** column name */
  | 'restaurant_id'
  /** column name */
  | 'title'
  /** column name */
  | 'type'
  /** column name */
  | 'user_id'
  /** column name */
  | 'video_url';

/** select "Reels_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Reels" */
export type Reels_Select_Column_Reels_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'isLiked';

/** select "Reels_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Reels" */
export type Reels_Select_Column_Reels_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'isLiked';

/** input type for updating data in table "Reels" */
export type Reels_Set_Input = {
  category?: InputMaybe<Scalars['String']['input']>;
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['uuid']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Reels" */
export type Reels_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Reels_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Reels_Stream_Cursor_Value_Input = {
  category?: InputMaybe<Scalars['String']['input']>;
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isLiked?: InputMaybe<Scalars['Boolean']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['uuid']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Reels" */
export type Reels_Update_Column =
  /** column name */
  | 'category'
  /** column name */
  | 'created_on'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'isLiked'
  /** column name */
  | 'likes'
  /** column name */
  | 'restaurant_id'
  /** column name */
  | 'title'
  /** column name */
  | 'type'
  /** column name */
  | 'user_id'
  /** column name */
  | 'video_url';

export type Reels_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Reels_Set_Input>;
  /** filter the rows which have to be updated */
  where: Reels_Bool_Exp;
};

/** columns and relationships of "Refunds" */
export type Refunds = {
  /** An object relationship */
  Order: Orders;
  /** An object relationship */
  User: Users;
  amount: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  generated_by: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  order_id: Scalars['uuid']['output'];
  paid: Scalars['Boolean']['output'];
  reason: Scalars['String']['output'];
  status: Scalars['String']['output'];
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "Refunds" */
export type Refunds_Aggregate = {
  aggregate?: Maybe<Refunds_Aggregate_Fields>;
  nodes: Array<Refunds>;
};

export type Refunds_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Refunds_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Refunds_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Refunds_Aggregate_Bool_Exp_Count>;
};

export type Refunds_Aggregate_Bool_Exp_Bool_And = {
  arguments: Refunds_Select_Column_Refunds_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Refunds_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Refunds_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Refunds_Select_Column_Refunds_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Refunds_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Refunds_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Refunds_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Refunds_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Refunds" */
export type Refunds_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Refunds_Max_Fields>;
  min?: Maybe<Refunds_Min_Fields>;
};


/** aggregate fields of "Refunds" */
export type Refunds_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Refunds_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Refunds" */
export type Refunds_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Refunds_Max_Order_By>;
  min?: InputMaybe<Refunds_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Refunds" */
export type Refunds_Arr_Rel_Insert_Input = {
  data: Array<Refunds_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Refunds_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Refunds". All fields are combined with a logical 'AND'. */
export type Refunds_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Refunds_Bool_Exp>>;
  _not?: InputMaybe<Refunds_Bool_Exp>;
  _or?: InputMaybe<Array<Refunds_Bool_Exp>>;
  amount?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  generated_by?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  paid?: InputMaybe<Boolean_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  update_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Refunds" */
export type Refunds_Constraint =
  /** unique or primary key constraint on columns "order_id" */
  | 'Refunds_order_id_key'
  /** unique or primary key constraint on columns "id" */
  | 'Refunds_pkey';

/** input type for inserting data into table "Refunds" */
export type Refunds_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  generated_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  paid?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Refunds_Max_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  generated_by?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Refunds" */
export type Refunds_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  generated_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Refunds_Min_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  generated_by?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Refunds" */
export type Refunds_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  generated_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Refunds" */
export type Refunds_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Refunds>;
};

/** input type for inserting object relation for remote table "Refunds" */
export type Refunds_Obj_Rel_Insert_Input = {
  data: Refunds_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Refunds_On_Conflict>;
};

/** on_conflict condition type for table "Refunds" */
export type Refunds_On_Conflict = {
  constraint: Refunds_Constraint;
  update_columns?: Array<Refunds_Update_Column>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};

/** Ordering options when selecting data from "Refunds". */
export type Refunds_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  User?: InputMaybe<Users_Order_By>;
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  generated_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  paid?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Refunds */
export type Refunds_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Refunds" */
export type Refunds_Select_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'generated_by'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'paid'
  /** column name */
  | 'reason'
  /** column name */
  | 'status'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

/** select "Refunds_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Refunds" */
export type Refunds_Select_Column_Refunds_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'paid';

/** select "Refunds_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Refunds" */
export type Refunds_Select_Column_Refunds_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'paid';

/** input type for updating data in table "Refunds" */
export type Refunds_Set_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  generated_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  paid?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Refunds" */
export type Refunds_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Refunds_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Refunds_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  generated_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  paid?: InputMaybe<Scalars['Boolean']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Refunds" */
export type Refunds_Update_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'generated_by'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'paid'
  /** column name */
  | 'reason'
  /** column name */
  | 'status'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

export type Refunds_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Refunds_Set_Input>;
  /** filter the rows which have to be updated */
  where: Refunds_Bool_Exp;
};

/** columns and relationships of "Restaurants" */
export type Restaurants = {
  /** An array relationship */
  Reels: Array<Reels>;
  /** An aggregate relationship */
  Reels_aggregate: Reels_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  email: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  lat: Scalars['String']['output'];
  location: Scalars['String']['output'];
  long: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  profile: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};


/** columns and relationships of "Restaurants" */
export type RestaurantsReelsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


/** columns and relationships of "Restaurants" */
export type RestaurantsReels_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};

/** aggregated selection of "Restaurants" */
export type Restaurants_Aggregate = {
  aggregate?: Maybe<Restaurants_Aggregate_Fields>;
  nodes: Array<Restaurants>;
};

/** aggregate fields of "Restaurants" */
export type Restaurants_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Restaurants_Max_Fields>;
  min?: Maybe<Restaurants_Min_Fields>;
};


/** aggregate fields of "Restaurants" */
export type Restaurants_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Restaurants_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "Restaurants". All fields are combined with a logical 'AND'. */
export type Restaurants_Bool_Exp = {
  Reels?: InputMaybe<Reels_Bool_Exp>;
  Reels_aggregate?: InputMaybe<Reels_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Restaurants_Bool_Exp>>;
  _not?: InputMaybe<Restaurants_Bool_Exp>;
  _or?: InputMaybe<Array<Restaurants_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  lat?: InputMaybe<String_Comparison_Exp>;
  location?: InputMaybe<String_Comparison_Exp>;
  long?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  profile?: InputMaybe<String_Comparison_Exp>;
  verified?: InputMaybe<Boolean_Comparison_Exp>;
};

/** unique or primary key constraints on table "Restaurants" */
export type Restaurants_Constraint =
  /** unique or primary key constraint on columns "name" */
  | 'Restaurants_name_key'
  /** unique or primary key constraint on columns "id" */
  | 'Restaurants_pkey';

/** input type for inserting data into table "Restaurants" */
export type Restaurants_Insert_Input = {
  Reels?: InputMaybe<Reels_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lat?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  long?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate max on columns */
export type Restaurants_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lat?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  long?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Restaurants_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lat?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  long?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "Restaurants" */
export type Restaurants_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Restaurants>;
};

/** input type for inserting object relation for remote table "Restaurants" */
export type Restaurants_Obj_Rel_Insert_Input = {
  data: Restaurants_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Restaurants_On_Conflict>;
};

/** on_conflict condition type for table "Restaurants" */
export type Restaurants_On_Conflict = {
  constraint: Restaurants_Constraint;
  update_columns?: Array<Restaurants_Update_Column>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};

/** Ordering options when selecting data from "Restaurants". */
export type Restaurants_Order_By = {
  Reels_aggregate?: InputMaybe<Reels_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lat?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  long?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  phone?: InputMaybe<Order_By>;
  profile?: InputMaybe<Order_By>;
  verified?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Restaurants */
export type Restaurants_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Restaurants" */
export type Restaurants_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'id'
  /** column name */
  | 'lat'
  /** column name */
  | 'location'
  /** column name */
  | 'long'
  /** column name */
  | 'name'
  /** column name */
  | 'phone'
  /** column name */
  | 'profile'
  /** column name */
  | 'verified';

/** input type for updating data in table "Restaurants" */
export type Restaurants_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lat?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  long?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Streaming cursor of the table "Restaurants" */
export type Restaurants_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Restaurants_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Restaurants_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lat?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  long?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile?: InputMaybe<Scalars['String']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

/** update columns of table "Restaurants" */
export type Restaurants_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'id'
  /** column name */
  | 'lat'
  /** column name */
  | 'location'
  /** column name */
  | 'long'
  /** column name */
  | 'name'
  /** column name */
  | 'phone'
  /** column name */
  | 'profile'
  /** column name */
  | 'verified';

export type Restaurants_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Restaurants_Set_Input>;
  /** filter the rows which have to be updated */
  where: Restaurants_Bool_Exp;
};

/** columns and relationships of "Revenue" */
export type Revenue = {
  /** An object relationship */
  Order: Orders;
  amount: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  order_id: Scalars['uuid']['output'];
  type: Scalars['String']['output'];
};

/** aggregated selection of "Revenue" */
export type Revenue_Aggregate = {
  aggregate?: Maybe<Revenue_Aggregate_Fields>;
  nodes: Array<Revenue>;
};

export type Revenue_Aggregate_Bool_Exp = {
  count?: InputMaybe<Revenue_Aggregate_Bool_Exp_Count>;
};

export type Revenue_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Revenue_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Revenue_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Revenue" */
export type Revenue_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Revenue_Max_Fields>;
  min?: Maybe<Revenue_Min_Fields>;
};


/** aggregate fields of "Revenue" */
export type Revenue_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Revenue_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Revenue" */
export type Revenue_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Revenue_Max_Order_By>;
  min?: InputMaybe<Revenue_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Revenue" */
export type Revenue_Arr_Rel_Insert_Input = {
  data: Array<Revenue_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Revenue_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Revenue". All fields are combined with a logical 'AND'. */
export type Revenue_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  _and?: InputMaybe<Array<Revenue_Bool_Exp>>;
  _not?: InputMaybe<Revenue_Bool_Exp>;
  _or?: InputMaybe<Array<Revenue_Bool_Exp>>;
  amount?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Revenue" */
export type Revenue_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Revenue_pkey';

/** input type for inserting data into table "Revenue" */
export type Revenue_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Revenue_Max_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Revenue" */
export type Revenue_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Revenue_Min_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Revenue" */
export type Revenue_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Revenue" */
export type Revenue_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Revenue>;
};

/** on_conflict condition type for table "Revenue" */
export type Revenue_On_Conflict = {
  constraint: Revenue_Constraint;
  update_columns?: Array<Revenue_Update_Column>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};

/** Ordering options when selecting data from "Revenue". */
export type Revenue_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Revenue */
export type Revenue_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Revenue" */
export type Revenue_Select_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'type';

/** input type for updating data in table "Revenue" */
export type Revenue_Set_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Revenue" */
export type Revenue_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Revenue_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Revenue_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Revenue" */
export type Revenue_Update_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'order_id'
  /** column name */
  | 'type';

export type Revenue_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Revenue_Set_Input>;
  /** filter the rows which have to be updated */
  where: Revenue_Bool_Exp;
};

/** columns and relationships of "Shopper_Availability" */
export type Shopper_Availability = {
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  day_of_week: Scalars['Int']['output'];
  end_time: Scalars['timetz']['output'];
  id: Scalars['uuid']['output'];
  is_available: Scalars['Boolean']['output'];
  start_time: Scalars['timetz']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "Shopper_Availability" */
export type Shopper_Availability_Aggregate = {
  aggregate?: Maybe<Shopper_Availability_Aggregate_Fields>;
  nodes: Array<Shopper_Availability>;
};

export type Shopper_Availability_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Shopper_Availability_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Shopper_Availability_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Shopper_Availability_Aggregate_Bool_Exp_Count>;
};

export type Shopper_Availability_Aggregate_Bool_Exp_Bool_And = {
  arguments: Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shopper_Availability_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shopper_Availability_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Shopper_Availability" */
export type Shopper_Availability_Aggregate_Fields = {
  avg?: Maybe<Shopper_Availability_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Shopper_Availability_Max_Fields>;
  min?: Maybe<Shopper_Availability_Min_Fields>;
  stddev?: Maybe<Shopper_Availability_Stddev_Fields>;
  stddev_pop?: Maybe<Shopper_Availability_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Shopper_Availability_Stddev_Samp_Fields>;
  sum?: Maybe<Shopper_Availability_Sum_Fields>;
  var_pop?: Maybe<Shopper_Availability_Var_Pop_Fields>;
  var_samp?: Maybe<Shopper_Availability_Var_Samp_Fields>;
  variance?: Maybe<Shopper_Availability_Variance_Fields>;
};


/** aggregate fields of "Shopper_Availability" */
export type Shopper_Availability_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Shopper_Availability" */
export type Shopper_Availability_Aggregate_Order_By = {
  avg?: InputMaybe<Shopper_Availability_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Shopper_Availability_Max_Order_By>;
  min?: InputMaybe<Shopper_Availability_Min_Order_By>;
  stddev?: InputMaybe<Shopper_Availability_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Shopper_Availability_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Shopper_Availability_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Shopper_Availability_Sum_Order_By>;
  var_pop?: InputMaybe<Shopper_Availability_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Shopper_Availability_Var_Samp_Order_By>;
  variance?: InputMaybe<Shopper_Availability_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "Shopper_Availability" */
export type Shopper_Availability_Arr_Rel_Insert_Input = {
  data: Array<Shopper_Availability_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Shopper_Availability_On_Conflict>;
};

/** aggregate avg on columns */
export type Shopper_Availability_Avg_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Avg_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "Shopper_Availability". All fields are combined with a logical 'AND'. */
export type Shopper_Availability_Bool_Exp = {
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Shopper_Availability_Bool_Exp>>;
  _not?: InputMaybe<Shopper_Availability_Bool_Exp>;
  _or?: InputMaybe<Array<Shopper_Availability_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  day_of_week?: InputMaybe<Int_Comparison_Exp>;
  end_time?: InputMaybe<Timetz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_available?: InputMaybe<Boolean_Comparison_Exp>;
  start_time?: InputMaybe<Timetz_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Shopper_Availability" */
export type Shopper_Availability_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Shopper_Availability_pkey';

/** input type for incrementing numeric columns in table "Shopper_Availability" */
export type Shopper_Availability_Inc_Input = {
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "Shopper_Availability" */
export type Shopper_Availability_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_available?: InputMaybe<Scalars['Boolean']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Shopper_Availability_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  day_of_week?: Maybe<Scalars['Int']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  day_of_week?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Shopper_Availability_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  day_of_week?: Maybe<Scalars['Int']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  day_of_week?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Shopper_Availability" */
export type Shopper_Availability_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Shopper_Availability>;
};

/** on_conflict condition type for table "Shopper_Availability" */
export type Shopper_Availability_On_Conflict = {
  constraint: Shopper_Availability_Constraint;
  update_columns?: Array<Shopper_Availability_Update_Column>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

/** Ordering options when selecting data from "Shopper_Availability". */
export type Shopper_Availability_Order_By = {
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  day_of_week?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_available?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Shopper_Availability */
export type Shopper_Availability_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'day_of_week'
  /** column name */
  | 'end_time'
  /** column name */
  | 'id'
  /** column name */
  | 'is_available'
  /** column name */
  | 'start_time'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

/** select "Shopper_Availability_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_available';

/** select "Shopper_Availability_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_available';

/** input type for updating data in table "Shopper_Availability" */
export type Shopper_Availability_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_available?: InputMaybe<Scalars['Boolean']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Shopper_Availability_Stddev_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Stddev_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Shopper_Availability_Stddev_Pop_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Stddev_Pop_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Shopper_Availability_Stddev_Samp_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Stddev_Samp_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "Shopper_Availability" */
export type Shopper_Availability_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Shopper_Availability_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Shopper_Availability_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_available?: InputMaybe<Scalars['Boolean']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Shopper_Availability_Sum_Fields = {
  day_of_week?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Sum_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** update columns of table "Shopper_Availability" */
export type Shopper_Availability_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'day_of_week'
  /** column name */
  | 'end_time'
  /** column name */
  | 'id'
  /** column name */
  | 'is_available'
  /** column name */
  | 'start_time'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

export type Shopper_Availability_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Shopper_Availability_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Shopper_Availability_Set_Input>;
  /** filter the rows which have to be updated */
  where: Shopper_Availability_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Shopper_Availability_Var_Pop_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Var_Pop_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Shopper_Availability_Var_Samp_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Var_Samp_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Shopper_Availability_Variance_Fields = {
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Variance_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** Shops */
export type Shops = {
  /** An array relationship */
  Carts: Array<Carts>;
  /** An aggregate relationship */
  Carts_aggregate: Carts_Aggregate;
  /** An object relationship */
  Category: Categories;
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** An array relationship */
  Products: Array<Products>;
  /** An aggregate relationship */
  Products_aggregate: Products_Aggregate;
  address: Scalars['String']['output'];
  category_id: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  image: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
  latitude: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  longitude: Scalars['String']['output'];
  name: Scalars['String']['output'];
  operating_hours: Scalars['json']['output'];
  updated_at?: Maybe<Scalars['String']['output']>;
};


/** Shops */
export type ShopsCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


/** Shops */
export type ShopsCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


/** Shops */
export type ShopsOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Shops */
export type ShopsOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Shops */
export type ShopsProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


/** Shops */
export type ShopsProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


/** Shops */
export type ShopsOperating_HoursArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "Shops" */
export type Shops_Aggregate = {
  aggregate?: Maybe<Shops_Aggregate_Fields>;
  nodes: Array<Shops>;
};

export type Shops_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Shops_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Shops_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Shops_Aggregate_Bool_Exp_Count>;
};

export type Shops_Aggregate_Bool_Exp_Bool_And = {
  arguments: Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shops_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shops_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Shops_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Shops" */
export type Shops_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Shops_Max_Fields>;
  min?: Maybe<Shops_Min_Fields>;
};


/** aggregate fields of "Shops" */
export type Shops_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Shops_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Shops" */
export type Shops_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Shops_Max_Order_By>;
  min?: InputMaybe<Shops_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Shops" */
export type Shops_Arr_Rel_Insert_Input = {
  data: Array<Shops_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Shops_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Shops". All fields are combined with a logical 'AND'. */
export type Shops_Bool_Exp = {
  Carts?: InputMaybe<Carts_Bool_Exp>;
  Carts_aggregate?: InputMaybe<Carts_Aggregate_Bool_Exp>;
  Category?: InputMaybe<Categories_Bool_Exp>;
  Orders?: InputMaybe<Orders_Bool_Exp>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Bool_Exp>;
  Products?: InputMaybe<Products_Bool_Exp>;
  Products_aggregate?: InputMaybe<Products_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Shops_Bool_Exp>>;
  _not?: InputMaybe<Shops_Bool_Exp>;
  _or?: InputMaybe<Array<Shops_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  category_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  latitude?: InputMaybe<String_Comparison_Exp>;
  logo?: InputMaybe<String_Comparison_Exp>;
  longitude?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  operating_hours?: InputMaybe<Json_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Shops" */
export type Shops_Constraint =
  /** unique or primary key constraint on columns "name" */
  | 'Shops_name_key'
  /** unique or primary key constraint on columns "id" */
  | 'Shops_pkey';

/** input type for inserting data into table "Shops" */
export type Shops_Insert_Input = {
  Carts?: InputMaybe<Carts_Arr_Rel_Insert_Input>;
  Category?: InputMaybe<Categories_Obj_Rel_Insert_Input>;
  Orders?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  Products?: InputMaybe<Products_Arr_Rel_Insert_Input>;
  address?: InputMaybe<Scalars['String']['input']>;
  category_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operating_hours?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Shops_Max_Fields = {
  address?: Maybe<Scalars['String']['output']>;
  category_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "Shops" */
export type Shops_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  category_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Shops_Min_Fields = {
  address?: Maybe<Scalars['String']['output']>;
  category_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "Shops" */
export type Shops_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  category_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Shops" */
export type Shops_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Shops>;
};

/** input type for inserting object relation for remote table "Shops" */
export type Shops_Obj_Rel_Insert_Input = {
  data: Shops_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Shops_On_Conflict>;
};

/** on_conflict condition type for table "Shops" */
export type Shops_On_Conflict = {
  constraint: Shops_Constraint;
  update_columns?: Array<Shops_Update_Column>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

/** Ordering options when selecting data from "Shops". */
export type Shops_Order_By = {
  Carts_aggregate?: InputMaybe<Carts_Aggregate_Order_By>;
  Category?: InputMaybe<Categories_Order_By>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Order_By>;
  Products_aggregate?: InputMaybe<Products_Aggregate_Order_By>;
  address?: InputMaybe<Order_By>;
  category_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  operating_hours?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Shops */
export type Shops_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Shops" */
export type Shops_Select_Column =
  /** column name */
  | 'address'
  /** column name */
  | 'category_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'latitude'
  /** column name */
  | 'logo'
  /** column name */
  | 'longitude'
  /** column name */
  | 'name'
  /** column name */
  | 'operating_hours'
  /** column name */
  | 'updated_at';

/** select "Shops_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Shops" */
export type Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  | 'is_active';

/** select "Shops_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Shops" */
export type Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  | 'is_active';

/** input type for updating data in table "Shops" */
export type Shops_Set_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  category_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operating_hours?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Shops" */
export type Shops_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Shops_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Shops_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  category_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operating_hours?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Shops" */
export type Shops_Update_Column =
  /** column name */
  | 'address'
  /** column name */
  | 'category_id'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'is_active'
  /** column name */
  | 'latitude'
  /** column name */
  | 'logo'
  /** column name */
  | 'longitude'
  /** column name */
  | 'name'
  /** column name */
  | 'operating_hours'
  /** column name */
  | 'updated_at';

export type Shops_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Shops_Set_Input>;
  /** filter the rows which have to be updated */
  where: Shops_Bool_Exp;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** columns and relationships of "System_Logs" */
export type System_Logs = {
  component: Scalars['String']['output'];
  create_at: Scalars['timestamptz']['output'];
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  message?: Maybe<Scalars['String']['output']>;
  time: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

/** aggregated selection of "System_Logs" */
export type System_Logs_Aggregate = {
  aggregate?: Maybe<System_Logs_Aggregate_Fields>;
  nodes: Array<System_Logs>;
};

/** aggregate fields of "System_Logs" */
export type System_Logs_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<System_Logs_Max_Fields>;
  min?: Maybe<System_Logs_Min_Fields>;
};


/** aggregate fields of "System_Logs" */
export type System_Logs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<System_Logs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "System_Logs". All fields are combined with a logical 'AND'. */
export type System_Logs_Bool_Exp = {
  _and?: InputMaybe<Array<System_Logs_Bool_Exp>>;
  _not?: InputMaybe<System_Logs_Bool_Exp>;
  _or?: InputMaybe<Array<System_Logs_Bool_Exp>>;
  component?: InputMaybe<String_Comparison_Exp>;
  create_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  details?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  message?: InputMaybe<String_Comparison_Exp>;
  time?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "System_Logs" */
export type System_Logs_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'System_Logs_pkey';

/** input type for inserting data into table "System_Logs" */
export type System_Logs_Insert_Input = {
  component?: InputMaybe<Scalars['String']['input']>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type System_Logs_Max_Fields = {
  component?: Maybe<Scalars['String']['output']>;
  create_at?: Maybe<Scalars['timestamptz']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type System_Logs_Min_Fields = {
  component?: Maybe<Scalars['String']['output']>;
  create_at?: Maybe<Scalars['timestamptz']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "System_Logs" */
export type System_Logs_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<System_Logs>;
};

/** on_conflict condition type for table "System_Logs" */
export type System_Logs_On_Conflict = {
  constraint: System_Logs_Constraint;
  update_columns?: Array<System_Logs_Update_Column>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};

/** Ordering options when selecting data from "System_Logs". */
export type System_Logs_Order_By = {
  component?: InputMaybe<Order_By>;
  create_at?: InputMaybe<Order_By>;
  details?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  time?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: System_Logs */
export type System_Logs_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "System_Logs" */
export type System_Logs_Select_Column =
  /** column name */
  | 'component'
  /** column name */
  | 'create_at'
  /** column name */
  | 'details'
  /** column name */
  | 'id'
  /** column name */
  | 'message'
  /** column name */
  | 'time'
  /** column name */
  | 'type';

/** input type for updating data in table "System_Logs" */
export type System_Logs_Set_Input = {
  component?: InputMaybe<Scalars['String']['input']>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "System_Logs" */
export type System_Logs_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: System_Logs_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type System_Logs_Stream_Cursor_Value_Input = {
  component?: InputMaybe<Scalars['String']['input']>;
  create_at?: InputMaybe<Scalars['timestamptz']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "System_Logs" */
export type System_Logs_Update_Column =
  /** column name */
  | 'component'
  /** column name */
  | 'create_at'
  /** column name */
  | 'details'
  /** column name */
  | 'id'
  /** column name */
  | 'message'
  /** column name */
  | 'time'
  /** column name */
  | 'type';

export type System_Logs_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<System_Logs_Set_Input>;
  /** filter the rows which have to be updated */
  where: System_Logs_Bool_Exp;
};

/** columns and relationships of "System_configuratioins" */
export type System_Configuratioins = {
  allowScheduledDeliveries: Scalars['Boolean']['output'];
  baseDeliveryFee: Scalars['String']['output'];
  cappedDistanceFee: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  deliveryCommissionPercentage: Scalars['String']['output'];
  discounts: Scalars['Boolean']['output'];
  distanceSurcharge: Scalars['String']['output'];
  enableRush: Scalars['Boolean']['output'];
  extraUnits: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  productCommissionPercentage: Scalars['String']['output'];
  rushHourSurcharge: Scalars['String']['output'];
  rushHours?: Maybe<Scalars['String']['output']>;
  serviceFee: Scalars['String']['output'];
  shoppingTime: Scalars['String']['output'];
  suggestedMinimumTip: Scalars['String']['output'];
  unitsSurcharge: Scalars['String']['output'];
};

/** aggregated selection of "System_configuratioins" */
export type System_Configuratioins_Aggregate = {
  aggregate?: Maybe<System_Configuratioins_Aggregate_Fields>;
  nodes: Array<System_Configuratioins>;
};

/** aggregate fields of "System_configuratioins" */
export type System_Configuratioins_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<System_Configuratioins_Max_Fields>;
  min?: Maybe<System_Configuratioins_Min_Fields>;
};


/** aggregate fields of "System_configuratioins" */
export type System_Configuratioins_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<System_Configuratioins_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "System_configuratioins". All fields are combined with a logical 'AND'. */
export type System_Configuratioins_Bool_Exp = {
  _and?: InputMaybe<Array<System_Configuratioins_Bool_Exp>>;
  _not?: InputMaybe<System_Configuratioins_Bool_Exp>;
  _or?: InputMaybe<Array<System_Configuratioins_Bool_Exp>>;
  allowScheduledDeliveries?: InputMaybe<Boolean_Comparison_Exp>;
  baseDeliveryFee?: InputMaybe<String_Comparison_Exp>;
  cappedDistanceFee?: InputMaybe<String_Comparison_Exp>;
  currency?: InputMaybe<String_Comparison_Exp>;
  deliveryCommissionPercentage?: InputMaybe<String_Comparison_Exp>;
  discounts?: InputMaybe<Boolean_Comparison_Exp>;
  distanceSurcharge?: InputMaybe<String_Comparison_Exp>;
  enableRush?: InputMaybe<Boolean_Comparison_Exp>;
  extraUnits?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  productCommissionPercentage?: InputMaybe<String_Comparison_Exp>;
  rushHourSurcharge?: InputMaybe<String_Comparison_Exp>;
  rushHours?: InputMaybe<String_Comparison_Exp>;
  serviceFee?: InputMaybe<String_Comparison_Exp>;
  shoppingTime?: InputMaybe<String_Comparison_Exp>;
  suggestedMinimumTip?: InputMaybe<String_Comparison_Exp>;
  unitsSurcharge?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "System_configuratioins" */
export type System_Configuratioins_Constraint =
  /** unique or primary key constraint on columns "currency" */
  | 'System_configuratioins_currency_key'
  /** unique or primary key constraint on columns "id" */
  | 'System_configuratioins_pkey';

/** input type for inserting data into table "System_configuratioins" */
export type System_Configuratioins_Insert_Input = {
  allowScheduledDeliveries?: InputMaybe<Scalars['Boolean']['input']>;
  baseDeliveryFee?: InputMaybe<Scalars['String']['input']>;
  cappedDistanceFee?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  deliveryCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  discounts?: InputMaybe<Scalars['Boolean']['input']>;
  distanceSurcharge?: InputMaybe<Scalars['String']['input']>;
  enableRush?: InputMaybe<Scalars['Boolean']['input']>;
  extraUnits?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  productCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  rushHourSurcharge?: InputMaybe<Scalars['String']['input']>;
  rushHours?: InputMaybe<Scalars['String']['input']>;
  serviceFee?: InputMaybe<Scalars['String']['input']>;
  shoppingTime?: InputMaybe<Scalars['String']['input']>;
  suggestedMinimumTip?: InputMaybe<Scalars['String']['input']>;
  unitsSurcharge?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type System_Configuratioins_Max_Fields = {
  baseDeliveryFee?: Maybe<Scalars['String']['output']>;
  cappedDistanceFee?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  deliveryCommissionPercentage?: Maybe<Scalars['String']['output']>;
  distanceSurcharge?: Maybe<Scalars['String']['output']>;
  extraUnits?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  productCommissionPercentage?: Maybe<Scalars['String']['output']>;
  rushHourSurcharge?: Maybe<Scalars['String']['output']>;
  rushHours?: Maybe<Scalars['String']['output']>;
  serviceFee?: Maybe<Scalars['String']['output']>;
  shoppingTime?: Maybe<Scalars['String']['output']>;
  suggestedMinimumTip?: Maybe<Scalars['String']['output']>;
  unitsSurcharge?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type System_Configuratioins_Min_Fields = {
  baseDeliveryFee?: Maybe<Scalars['String']['output']>;
  cappedDistanceFee?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  deliveryCommissionPercentage?: Maybe<Scalars['String']['output']>;
  distanceSurcharge?: Maybe<Scalars['String']['output']>;
  extraUnits?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  productCommissionPercentage?: Maybe<Scalars['String']['output']>;
  rushHourSurcharge?: Maybe<Scalars['String']['output']>;
  rushHours?: Maybe<Scalars['String']['output']>;
  serviceFee?: Maybe<Scalars['String']['output']>;
  shoppingTime?: Maybe<Scalars['String']['output']>;
  suggestedMinimumTip?: Maybe<Scalars['String']['output']>;
  unitsSurcharge?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "System_configuratioins" */
export type System_Configuratioins_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<System_Configuratioins>;
};

/** on_conflict condition type for table "System_configuratioins" */
export type System_Configuratioins_On_Conflict = {
  constraint: System_Configuratioins_Constraint;
  update_columns?: Array<System_Configuratioins_Update_Column>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};

/** Ordering options when selecting data from "System_configuratioins". */
export type System_Configuratioins_Order_By = {
  allowScheduledDeliveries?: InputMaybe<Order_By>;
  baseDeliveryFee?: InputMaybe<Order_By>;
  cappedDistanceFee?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  deliveryCommissionPercentage?: InputMaybe<Order_By>;
  discounts?: InputMaybe<Order_By>;
  distanceSurcharge?: InputMaybe<Order_By>;
  enableRush?: InputMaybe<Order_By>;
  extraUnits?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  productCommissionPercentage?: InputMaybe<Order_By>;
  rushHourSurcharge?: InputMaybe<Order_By>;
  rushHours?: InputMaybe<Order_By>;
  serviceFee?: InputMaybe<Order_By>;
  shoppingTime?: InputMaybe<Order_By>;
  suggestedMinimumTip?: InputMaybe<Order_By>;
  unitsSurcharge?: InputMaybe<Order_By>;
};

/** primary key columns input for table: System_configuratioins */
export type System_Configuratioins_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "System_configuratioins" */
export type System_Configuratioins_Select_Column =
  /** column name */
  | 'allowScheduledDeliveries'
  /** column name */
  | 'baseDeliveryFee'
  /** column name */
  | 'cappedDistanceFee'
  /** column name */
  | 'currency'
  /** column name */
  | 'deliveryCommissionPercentage'
  /** column name */
  | 'discounts'
  /** column name */
  | 'distanceSurcharge'
  /** column name */
  | 'enableRush'
  /** column name */
  | 'extraUnits'
  /** column name */
  | 'id'
  /** column name */
  | 'productCommissionPercentage'
  /** column name */
  | 'rushHourSurcharge'
  /** column name */
  | 'rushHours'
  /** column name */
  | 'serviceFee'
  /** column name */
  | 'shoppingTime'
  /** column name */
  | 'suggestedMinimumTip'
  /** column name */
  | 'unitsSurcharge';

/** input type for updating data in table "System_configuratioins" */
export type System_Configuratioins_Set_Input = {
  allowScheduledDeliveries?: InputMaybe<Scalars['Boolean']['input']>;
  baseDeliveryFee?: InputMaybe<Scalars['String']['input']>;
  cappedDistanceFee?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  deliveryCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  discounts?: InputMaybe<Scalars['Boolean']['input']>;
  distanceSurcharge?: InputMaybe<Scalars['String']['input']>;
  enableRush?: InputMaybe<Scalars['Boolean']['input']>;
  extraUnits?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  productCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  rushHourSurcharge?: InputMaybe<Scalars['String']['input']>;
  rushHours?: InputMaybe<Scalars['String']['input']>;
  serviceFee?: InputMaybe<Scalars['String']['input']>;
  shoppingTime?: InputMaybe<Scalars['String']['input']>;
  suggestedMinimumTip?: InputMaybe<Scalars['String']['input']>;
  unitsSurcharge?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "System_configuratioins" */
export type System_Configuratioins_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: System_Configuratioins_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type System_Configuratioins_Stream_Cursor_Value_Input = {
  allowScheduledDeliveries?: InputMaybe<Scalars['Boolean']['input']>;
  baseDeliveryFee?: InputMaybe<Scalars['String']['input']>;
  cappedDistanceFee?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  deliveryCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  discounts?: InputMaybe<Scalars['Boolean']['input']>;
  distanceSurcharge?: InputMaybe<Scalars['String']['input']>;
  enableRush?: InputMaybe<Scalars['Boolean']['input']>;
  extraUnits?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  productCommissionPercentage?: InputMaybe<Scalars['String']['input']>;
  rushHourSurcharge?: InputMaybe<Scalars['String']['input']>;
  rushHours?: InputMaybe<Scalars['String']['input']>;
  serviceFee?: InputMaybe<Scalars['String']['input']>;
  shoppingTime?: InputMaybe<Scalars['String']['input']>;
  suggestedMinimumTip?: InputMaybe<Scalars['String']['input']>;
  unitsSurcharge?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "System_configuratioins" */
export type System_Configuratioins_Update_Column =
  /** column name */
  | 'allowScheduledDeliveries'
  /** column name */
  | 'baseDeliveryFee'
  /** column name */
  | 'cappedDistanceFee'
  /** column name */
  | 'currency'
  /** column name */
  | 'deliveryCommissionPercentage'
  /** column name */
  | 'discounts'
  /** column name */
  | 'distanceSurcharge'
  /** column name */
  | 'enableRush'
  /** column name */
  | 'extraUnits'
  /** column name */
  | 'id'
  /** column name */
  | 'productCommissionPercentage'
  /** column name */
  | 'rushHourSurcharge'
  /** column name */
  | 'rushHours'
  /** column name */
  | 'serviceFee'
  /** column name */
  | 'shoppingTime'
  /** column name */
  | 'suggestedMinimumTip'
  /** column name */
  | 'unitsSurcharge';

export type System_Configuratioins_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<System_Configuratioins_Set_Input>;
  /** filter the rows which have to be updated */
  where: System_Configuratioins_Bool_Exp;
};

/** Users */
export type Users = {
  /** An array relationship */
  Addresses: Array<Addresses>;
  /** An aggregate relationship */
  Addresses_aggregate: Addresses_Aggregate;
  /** An array relationship */
  Carts: Array<Carts>;
  /** An aggregate relationship */
  Carts_aggregate: Carts_Aggregate;
  /** An array relationship */
  Delivery_Issues: Array<Delivery_Issues>;
  /** An aggregate relationship */
  Delivery_Issues_aggregate: Delivery_Issues_Aggregate;
  /** An array relationship */
  Invoices: Array<Invoices>;
  /** An aggregate relationship */
  Invoices_aggregate: Invoices_Aggregate;
  /** An array relationship */
  Notifications: Array<Notifications>;
  /** An aggregate relationship */
  Notifications_aggregate: Notifications_Aggregate;
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** An array relationship */
  Payment_Methods: Array<Payment_Methods>;
  /** An aggregate relationship */
  Payment_Methods_aggregate: Payment_Methods_Aggregate;
  /** An array relationship */
  Ratings: Array<Ratings>;
  /** An aggregate relationship */
  Ratings_aggregate: Ratings_Aggregate;
  /** An array relationship */
  Reels: Array<Reels>;
  /** An aggregate relationship */
  Reels_aggregate: Reels_Aggregate;
  /** An array relationship */
  Reels_comments: Array<Reels_Comments>;
  /** An aggregate relationship */
  Reels_comments_aggregate: Reels_Comments_Aggregate;
  /** An array relationship */
  Refunds: Array<Refunds>;
  /** An aggregate relationship */
  Refunds_aggregate: Refunds_Aggregate;
  /** An array relationship */
  Shopper_Availabilities: Array<Shopper_Availability>;
  /** An aggregate relationship */
  Shopper_Availabilities_aggregate: Shopper_Availability_Aggregate;
  /** An array relationship */
  Wallets: Array<Wallets>;
  /** An aggregate relationship */
  Wallets_aggregate: Wallets_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  email: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** An array relationship */
  ordersByUserId: Array<Orders>;
  /** An aggregate relationship */
  ordersByUserId_aggregate: Orders_Aggregate;
  password_hash: Scalars['String']['output'];
  /** An array relationship */
  paymentCards: Array<PaymentCards>;
  /** An aggregate relationship */
  paymentCards_aggregate: PaymentCards_Aggregate;
  phone: Scalars['String']['output'];
  profile_picture?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  ratingsByShopperId: Array<Ratings>;
  /** An aggregate relationship */
  ratingsByShopperId_aggregate: Ratings_Aggregate;
  role: Scalars['String']['output'];
  /** An object relationship */
  shopper?: Maybe<Shoppers>;
  /** An array relationship */
  tickets: Array<Tickets>;
  /** An aggregate relationship */
  tickets_aggregate: Tickets_Aggregate;
  updated_at?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  vehicle?: Maybe<Vehicles>;
};


/** Users */
export type UsersAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


/** Users */
export type UsersAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


/** Users */
export type UsersCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


/** Users */
export type UsersCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


/** Users */
export type UsersDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


/** Users */
export type UsersDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


/** Users */
export type UsersInvoicesArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


/** Users */
export type UsersInvoices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


/** Users */
export type UsersNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


/** Users */
export type UsersNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


/** Users */
export type UsersOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Users */
export type UsersOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Users */
export type UsersPayment_MethodsArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


/** Users */
export type UsersPayment_Methods_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


/** Users */
export type UsersRatingsArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** Users */
export type UsersRatings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** Users */
export type UsersReelsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


/** Users */
export type UsersReels_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


/** Users */
export type UsersReels_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


/** Users */
export type UsersReels_Comments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


/** Users */
export type UsersRefundsArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


/** Users */
export type UsersRefunds_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


/** Users */
export type UsersShopper_AvailabilitiesArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


/** Users */
export type UsersShopper_Availabilities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


/** Users */
export type UsersWalletsArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


/** Users */
export type UsersWallets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


/** Users */
export type UsersOrdersByUserIdArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Users */
export type UsersOrdersByUserId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


/** Users */
export type UsersPaymentCardsArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


/** Users */
export type UsersPaymentCards_AggregateArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


/** Users */
export type UsersRatingsByShopperIdArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** Users */
export type UsersRatingsByShopperId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


/** Users */
export type UsersTicketsArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


/** Users */
export type UsersTickets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};

/** aggregated selection of "Users" */
export type Users_Aggregate = {
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "Users" */
export type Users_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
};


/** aggregate fields of "Users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "Users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  Addresses?: InputMaybe<Addresses_Bool_Exp>;
  Addresses_aggregate?: InputMaybe<Addresses_Aggregate_Bool_Exp>;
  Carts?: InputMaybe<Carts_Bool_Exp>;
  Carts_aggregate?: InputMaybe<Carts_Aggregate_Bool_Exp>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Bool_Exp>;
  Delivery_Issues_aggregate?: InputMaybe<Delivery_Issues_Aggregate_Bool_Exp>;
  Invoices?: InputMaybe<Invoices_Bool_Exp>;
  Invoices_aggregate?: InputMaybe<Invoices_Aggregate_Bool_Exp>;
  Notifications?: InputMaybe<Notifications_Bool_Exp>;
  Notifications_aggregate?: InputMaybe<Notifications_Aggregate_Bool_Exp>;
  Orders?: InputMaybe<Orders_Bool_Exp>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Bool_Exp>;
  Payment_Methods?: InputMaybe<Payment_Methods_Bool_Exp>;
  Payment_Methods_aggregate?: InputMaybe<Payment_Methods_Aggregate_Bool_Exp>;
  Ratings?: InputMaybe<Ratings_Bool_Exp>;
  Ratings_aggregate?: InputMaybe<Ratings_Aggregate_Bool_Exp>;
  Reels?: InputMaybe<Reels_Bool_Exp>;
  Reels_aggregate?: InputMaybe<Reels_Aggregate_Bool_Exp>;
  Reels_comments?: InputMaybe<Reels_Comments_Bool_Exp>;
  Reels_comments_aggregate?: InputMaybe<Reels_Comments_Aggregate_Bool_Exp>;
  Refunds?: InputMaybe<Refunds_Bool_Exp>;
  Refunds_aggregate?: InputMaybe<Refunds_Aggregate_Bool_Exp>;
  Shopper_Availabilities?: InputMaybe<Shopper_Availability_Bool_Exp>;
  Shopper_Availabilities_aggregate?: InputMaybe<Shopper_Availability_Aggregate_Bool_Exp>;
  Wallets?: InputMaybe<Wallets_Bool_Exp>;
  Wallets_aggregate?: InputMaybe<Wallets_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  gender?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  ordersByUserId?: InputMaybe<Orders_Bool_Exp>;
  ordersByUserId_aggregate?: InputMaybe<Orders_Aggregate_Bool_Exp>;
  password_hash?: InputMaybe<String_Comparison_Exp>;
  paymentCards?: InputMaybe<PaymentCards_Bool_Exp>;
  paymentCards_aggregate?: InputMaybe<PaymentCards_Aggregate_Bool_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  profile_picture?: InputMaybe<String_Comparison_Exp>;
  ratingsByShopperId?: InputMaybe<Ratings_Bool_Exp>;
  ratingsByShopperId_aggregate?: InputMaybe<Ratings_Aggregate_Bool_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  shopper?: InputMaybe<Shoppers_Bool_Exp>;
  tickets?: InputMaybe<Tickets_Bool_Exp>;
  tickets_aggregate?: InputMaybe<Tickets_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
  vehicle?: InputMaybe<Vehicles_Bool_Exp>;
};

/** unique or primary key constraints on table "Users" */
export type Users_Constraint =
  /** unique or primary key constraint on columns "email" */
  | 'Users_email_key'
  /** unique or primary key constraint on columns "phone" */
  | 'Users_phone_key'
  /** unique or primary key constraint on columns "id" */
  | 'Users_pkey';

/** input type for inserting data into table "Users" */
export type Users_Insert_Input = {
  Addresses?: InputMaybe<Addresses_Arr_Rel_Insert_Input>;
  Carts?: InputMaybe<Carts_Arr_Rel_Insert_Input>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Arr_Rel_Insert_Input>;
  Invoices?: InputMaybe<Invoices_Arr_Rel_Insert_Input>;
  Notifications?: InputMaybe<Notifications_Arr_Rel_Insert_Input>;
  Orders?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  Payment_Methods?: InputMaybe<Payment_Methods_Arr_Rel_Insert_Input>;
  Ratings?: InputMaybe<Ratings_Arr_Rel_Insert_Input>;
  Reels?: InputMaybe<Reels_Arr_Rel_Insert_Input>;
  Reels_comments?: InputMaybe<Reels_Comments_Arr_Rel_Insert_Input>;
  Refunds?: InputMaybe<Refunds_Arr_Rel_Insert_Input>;
  Shopper_Availabilities?: InputMaybe<Shopper_Availability_Arr_Rel_Insert_Input>;
  Wallets?: InputMaybe<Wallets_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ordersByUserId?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  paymentCards?: InputMaybe<PaymentCards_Arr_Rel_Insert_Input>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  ratingsByShopperId?: InputMaybe<Ratings_Arr_Rel_Insert_Input>;
  role?: InputMaybe<Scalars['String']['input']>;
  shopper?: InputMaybe<Shoppers_Obj_Rel_Insert_Input>;
  tickets?: InputMaybe<Tickets_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
  vehicle?: InputMaybe<Vehicles_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  password_hash?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profile_picture?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  password_hash?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profile_picture?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "Users" */
export type Users_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "Users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "Users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "Users". */
export type Users_Order_By = {
  Addresses_aggregate?: InputMaybe<Addresses_Aggregate_Order_By>;
  Carts_aggregate?: InputMaybe<Carts_Aggregate_Order_By>;
  Delivery_Issues_aggregate?: InputMaybe<Delivery_Issues_Aggregate_Order_By>;
  Invoices_aggregate?: InputMaybe<Invoices_Aggregate_Order_By>;
  Notifications_aggregate?: InputMaybe<Notifications_Aggregate_Order_By>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Order_By>;
  Payment_Methods_aggregate?: InputMaybe<Payment_Methods_Aggregate_Order_By>;
  Ratings_aggregate?: InputMaybe<Ratings_Aggregate_Order_By>;
  Reels_aggregate?: InputMaybe<Reels_Aggregate_Order_By>;
  Reels_comments_aggregate?: InputMaybe<Reels_Comments_Aggregate_Order_By>;
  Refunds_aggregate?: InputMaybe<Refunds_Aggregate_Order_By>;
  Shopper_Availabilities_aggregate?: InputMaybe<Shopper_Availability_Aggregate_Order_By>;
  Wallets_aggregate?: InputMaybe<Wallets_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  ordersByUserId_aggregate?: InputMaybe<Orders_Aggregate_Order_By>;
  password_hash?: InputMaybe<Order_By>;
  paymentCards_aggregate?: InputMaybe<PaymentCards_Aggregate_Order_By>;
  phone?: InputMaybe<Order_By>;
  profile_picture?: InputMaybe<Order_By>;
  ratingsByShopperId_aggregate?: InputMaybe<Ratings_Aggregate_Order_By>;
  role?: InputMaybe<Order_By>;
  shopper?: InputMaybe<Shoppers_Order_By>;
  tickets_aggregate?: InputMaybe<Tickets_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  vehicle?: InputMaybe<Vehicles_Order_By>;
};

/** primary key columns input for table: Users */
export type Users_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Users" */
export type Users_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'gender'
  /** column name */
  | 'id'
  /** column name */
  | 'is_active'
  /** column name */
  | 'name'
  /** column name */
  | 'password_hash'
  /** column name */
  | 'phone'
  /** column name */
  | 'profile_picture'
  /** column name */
  | 'role'
  /** column name */
  | 'updated_at';

/** input type for updating data in table "Users" */
export type Users_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "Users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password_hash?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profile_picture?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "Users" */
export type Users_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'email'
  /** column name */
  | 'gender'
  /** column name */
  | 'id'
  /** column name */
  | 'is_active'
  /** column name */
  | 'name'
  /** column name */
  | 'password_hash'
  /** column name */
  | 'phone'
  /** column name */
  | 'profile_picture'
  /** column name */
  | 'role'
  /** column name */
  | 'updated_at';

export type Users_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** columns and relationships of "Wallet_Transactions" */
export type Wallet_Transactions = {
  /** An object relationship */
  Order?: Maybe<Orders>;
  /** An object relationship */
  Wallet: Wallets;
  amount: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  related_order_id?: Maybe<Scalars['uuid']['output']>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  wallet_id: Scalars['uuid']['output'];
};

/** aggregated selection of "Wallet_Transactions" */
export type Wallet_Transactions_Aggregate = {
  aggregate?: Maybe<Wallet_Transactions_Aggregate_Fields>;
  nodes: Array<Wallet_Transactions>;
};

export type Wallet_Transactions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Wallet_Transactions_Aggregate_Bool_Exp_Count>;
};

export type Wallet_Transactions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Wallet_Transactions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Wallet_Transactions" */
export type Wallet_Transactions_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Wallet_Transactions_Max_Fields>;
  min?: Maybe<Wallet_Transactions_Min_Fields>;
};


/** aggregate fields of "Wallet_Transactions" */
export type Wallet_Transactions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Wallet_Transactions" */
export type Wallet_Transactions_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Wallet_Transactions_Max_Order_By>;
  min?: InputMaybe<Wallet_Transactions_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Wallet_Transactions" */
export type Wallet_Transactions_Arr_Rel_Insert_Input = {
  data: Array<Wallet_Transactions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Wallet_Transactions_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Wallet_Transactions". All fields are combined with a logical 'AND'. */
export type Wallet_Transactions_Bool_Exp = {
  Order?: InputMaybe<Orders_Bool_Exp>;
  Wallet?: InputMaybe<Wallets_Bool_Exp>;
  _and?: InputMaybe<Array<Wallet_Transactions_Bool_Exp>>;
  _not?: InputMaybe<Wallet_Transactions_Bool_Exp>;
  _or?: InputMaybe<Array<Wallet_Transactions_Bool_Exp>>;
  amount?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  related_order_id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  wallet_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Wallet_Transactions" */
export type Wallet_Transactions_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Wallet_Transactions_pkey';

/** input type for inserting data into table "Wallet_Transactions" */
export type Wallet_Transactions_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  Wallet?: InputMaybe<Wallets_Obj_Rel_Insert_Input>;
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  related_order_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  wallet_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Wallet_Transactions_Max_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  related_order_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  wallet_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Wallet_Transactions" */
export type Wallet_Transactions_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  related_order_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  wallet_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Wallet_Transactions_Min_Fields = {
  amount?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  related_order_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  wallet_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Wallet_Transactions" */
export type Wallet_Transactions_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  related_order_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  wallet_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Wallet_Transactions" */
export type Wallet_Transactions_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Wallet_Transactions>;
};

/** on_conflict condition type for table "Wallet_Transactions" */
export type Wallet_Transactions_On_Conflict = {
  constraint: Wallet_Transactions_Constraint;
  update_columns?: Array<Wallet_Transactions_Update_Column>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};

/** Ordering options when selecting data from "Wallet_Transactions". */
export type Wallet_Transactions_Order_By = {
  Order?: InputMaybe<Orders_Order_By>;
  Wallet?: InputMaybe<Wallets_Order_By>;
  amount?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  related_order_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  wallet_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Wallet_Transactions */
export type Wallet_Transactions_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Wallet_Transactions" */
export type Wallet_Transactions_Select_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'related_order_id'
  /** column name */
  | 'status'
  /** column name */
  | 'type'
  /** column name */
  | 'wallet_id';

/** input type for updating data in table "Wallet_Transactions" */
export type Wallet_Transactions_Set_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  related_order_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  wallet_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Wallet_Transactions" */
export type Wallet_Transactions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Wallet_Transactions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Wallet_Transactions_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  related_order_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  wallet_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Wallet_Transactions" */
export type Wallet_Transactions_Update_Column =
  /** column name */
  | 'amount'
  /** column name */
  | 'created_at'
  /** column name */
  | 'description'
  /** column name */
  | 'id'
  /** column name */
  | 'related_order_id'
  /** column name */
  | 'status'
  /** column name */
  | 'type'
  /** column name */
  | 'wallet_id';

export type Wallet_Transactions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Wallet_Transactions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Wallet_Transactions_Bool_Exp;
};

/** plasa wallet */
export type Wallets = {
  /** An object relationship */
  User: Users;
  /** An array relationship */
  Wallet_Transactions: Array<Wallet_Transactions>;
  /** An aggregate relationship */
  Wallet_Transactions_aggregate: Wallet_Transactions_Aggregate;
  available_balance: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  last_updated: Scalars['timestamptz']['output'];
  reserved_balance: Scalars['String']['output'];
  shopper_id: Scalars['uuid']['output'];
};


/** plasa wallet */
export type WalletsWallet_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


/** plasa wallet */
export type WalletsWallet_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};

/** aggregated selection of "Wallets" */
export type Wallets_Aggregate = {
  aggregate?: Maybe<Wallets_Aggregate_Fields>;
  nodes: Array<Wallets>;
};

export type Wallets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Wallets_Aggregate_Bool_Exp_Count>;
};

export type Wallets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Wallets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Wallets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Wallets" */
export type Wallets_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Wallets_Max_Fields>;
  min?: Maybe<Wallets_Min_Fields>;
};


/** aggregate fields of "Wallets" */
export type Wallets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Wallets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "Wallets" */
export type Wallets_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Wallets_Max_Order_By>;
  min?: InputMaybe<Wallets_Min_Order_By>;
};

/** input type for inserting array relation for remote table "Wallets" */
export type Wallets_Arr_Rel_Insert_Input = {
  data: Array<Wallets_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Wallets_On_Conflict>;
};

/** Boolean expression to filter rows from the table "Wallets". All fields are combined with a logical 'AND'. */
export type Wallets_Bool_Exp = {
  User?: InputMaybe<Users_Bool_Exp>;
  Wallet_Transactions?: InputMaybe<Wallet_Transactions_Bool_Exp>;
  Wallet_Transactions_aggregate?: InputMaybe<Wallet_Transactions_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Wallets_Bool_Exp>>;
  _not?: InputMaybe<Wallets_Bool_Exp>;
  _or?: InputMaybe<Array<Wallets_Bool_Exp>>;
  available_balance?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_updated?: InputMaybe<Timestamptz_Comparison_Exp>;
  reserved_balance?: InputMaybe<String_Comparison_Exp>;
  shopper_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "Wallets" */
export type Wallets_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'Wallets_pkey';

/** input type for inserting data into table "Wallets" */
export type Wallets_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  Wallet_Transactions?: InputMaybe<Wallet_Transactions_Arr_Rel_Insert_Input>;
  available_balance?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_updated?: InputMaybe<Scalars['timestamptz']['input']>;
  reserved_balance?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Wallets_Max_Fields = {
  available_balance?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_updated?: Maybe<Scalars['timestamptz']['output']>;
  reserved_balance?: Maybe<Scalars['String']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "Wallets" */
export type Wallets_Max_Order_By = {
  available_balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_updated?: InputMaybe<Order_By>;
  reserved_balance?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Wallets_Min_Fields = {
  available_balance?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_updated?: Maybe<Scalars['timestamptz']['output']>;
  reserved_balance?: Maybe<Scalars['String']['output']>;
  shopper_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "Wallets" */
export type Wallets_Min_Order_By = {
  available_balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_updated?: InputMaybe<Order_By>;
  reserved_balance?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Wallets" */
export type Wallets_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Wallets>;
};

/** input type for inserting object relation for remote table "Wallets" */
export type Wallets_Obj_Rel_Insert_Input = {
  data: Wallets_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Wallets_On_Conflict>;
};

/** on_conflict condition type for table "Wallets" */
export type Wallets_On_Conflict = {
  constraint: Wallets_Constraint;
  update_columns?: Array<Wallets_Update_Column>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};

/** Ordering options when selecting data from "Wallets". */
export type Wallets_Order_By = {
  User?: InputMaybe<Users_Order_By>;
  Wallet_Transactions_aggregate?: InputMaybe<Wallet_Transactions_Aggregate_Order_By>;
  available_balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_updated?: InputMaybe<Order_By>;
  reserved_balance?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Wallets */
export type Wallets_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "Wallets" */
export type Wallets_Select_Column =
  /** column name */
  | 'available_balance'
  /** column name */
  | 'id'
  /** column name */
  | 'last_updated'
  /** column name */
  | 'reserved_balance'
  /** column name */
  | 'shopper_id';

/** input type for updating data in table "Wallets" */
export type Wallets_Set_Input = {
  available_balance?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_updated?: InputMaybe<Scalars['timestamptz']['input']>;
  reserved_balance?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "Wallets" */
export type Wallets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Wallets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Wallets_Stream_Cursor_Value_Input = {
  available_balance?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_updated?: InputMaybe<Scalars['timestamptz']['input']>;
  reserved_balance?: InputMaybe<Scalars['String']['input']>;
  shopper_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "Wallets" */
export type Wallets_Update_Column =
  /** column name */
  | 'available_balance'
  /** column name */
  | 'id'
  /** column name */
  | 'last_updated'
  /** column name */
  | 'reserved_balance'
  /** column name */
  | 'shopper_id';

export type Wallets_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Wallets_Set_Input>;
  /** filter the rows which have to be updated */
  where: Wallets_Bool_Exp;
};

/** ordering argument of a cursor */
export type Cursor_Ordering =
  /** ascending ordering of the cursor */
  | 'ASC'
  /** descending ordering of the cursor */
  | 'DESC';

/** Boolean expression to compare columns of type "json". All fields are combined with logical 'AND'. */
export type Json_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['json']['input']>;
  _gt?: InputMaybe<Scalars['json']['input']>;
  _gte?: InputMaybe<Scalars['json']['input']>;
  _in?: InputMaybe<Array<Scalars['json']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['json']['input']>;
  _lte?: InputMaybe<Scalars['json']['input']>;
  _neq?: InputMaybe<Scalars['json']['input']>;
  _nin?: InputMaybe<Array<Scalars['json']['input']>>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  /** delete data from the table: "Addresses" */
  delete_Addresses?: Maybe<Addresses_Mutation_Response>;
  /** delete single row from the table: "Addresses" */
  delete_Addresses_by_pk?: Maybe<Addresses>;
  /** delete data from the table: "Cart_Items" */
  delete_Cart_Items?: Maybe<Cart_Items_Mutation_Response>;
  /** delete single row from the table: "Cart_Items" */
  delete_Cart_Items_by_pk?: Maybe<Cart_Items>;
  /** delete data from the table: "Carts" */
  delete_Carts?: Maybe<Carts_Mutation_Response>;
  /** delete single row from the table: "Carts" */
  delete_Carts_by_pk?: Maybe<Carts>;
  /** delete data from the table: "Categories" */
  delete_Categories?: Maybe<Categories_Mutation_Response>;
  /** delete single row from the table: "Categories" */
  delete_Categories_by_pk?: Maybe<Categories>;
  /** delete data from the table: "Delivery_Issues" */
  delete_Delivery_Issues?: Maybe<Delivery_Issues_Mutation_Response>;
  /** delete single row from the table: "Delivery_Issues" */
  delete_Delivery_Issues_by_pk?: Maybe<Delivery_Issues>;
  /** delete data from the table: "Invoices" */
  delete_Invoices?: Maybe<Invoices_Mutation_Response>;
  /** delete single row from the table: "Invoices" */
  delete_Invoices_by_pk?: Maybe<Invoices>;
  /** delete data from the table: "Notifications" */
  delete_Notifications?: Maybe<Notifications_Mutation_Response>;
  /** delete single row from the table: "Notifications" */
  delete_Notifications_by_pk?: Maybe<Notifications>;
  /** delete data from the table: "Order_Items" */
  delete_Order_Items?: Maybe<Order_Items_Mutation_Response>;
  /** delete single row from the table: "Order_Items" */
  delete_Order_Items_by_pk?: Maybe<Order_Items>;
  /** delete data from the table: "Orders" */
  delete_Orders?: Maybe<Orders_Mutation_Response>;
  /** delete single row from the table: "Orders" */
  delete_Orders_by_pk?: Maybe<Orders>;
  /** delete data from the table: "Payment_Methods" */
  delete_Payment_Methods?: Maybe<Payment_Methods_Mutation_Response>;
  /** delete single row from the table: "Payment_Methods" */
  delete_Payment_Methods_by_pk?: Maybe<Payment_Methods>;
  /** delete data from the table: "Platform_Settings" */
  delete_Platform_Settings?: Maybe<Platform_Settings_Mutation_Response>;
  /** delete single row from the table: "Platform_Settings" */
  delete_Platform_Settings_by_pk?: Maybe<Platform_Settings>;
  /** delete data from the table: "Products" */
  delete_Products?: Maybe<Products_Mutation_Response>;
  /** delete single row from the table: "Products" */
  delete_Products_by_pk?: Maybe<Products>;
  /** delete data from the table: "Ratings" */
  delete_Ratings?: Maybe<Ratings_Mutation_Response>;
  /** delete single row from the table: "Ratings" */
  delete_Ratings_by_pk?: Maybe<Ratings>;
  /** delete data from the table: "Reels" */
  delete_Reels?: Maybe<Reels_Mutation_Response>;
  /** delete single row from the table: "Reels" */
  delete_Reels_by_pk?: Maybe<Reels>;
  /** delete data from the table: "Reels_comments" */
  delete_Reels_comments?: Maybe<Reels_Comments_Mutation_Response>;
  /** delete single row from the table: "Reels_comments" */
  delete_Reels_comments_by_pk?: Maybe<Reels_Comments>;
  /** delete data from the table: "Refunds" */
  delete_Refunds?: Maybe<Refunds_Mutation_Response>;
  /** delete single row from the table: "Refunds" */
  delete_Refunds_by_pk?: Maybe<Refunds>;
  /** delete data from the table: "Restaurants" */
  delete_Restaurants?: Maybe<Restaurants_Mutation_Response>;
  /** delete single row from the table: "Restaurants" */
  delete_Restaurants_by_pk?: Maybe<Restaurants>;
  /** delete data from the table: "Revenue" */
  delete_Revenue?: Maybe<Revenue_Mutation_Response>;
  /** delete single row from the table: "Revenue" */
  delete_Revenue_by_pk?: Maybe<Revenue>;
  /** delete data from the table: "Shopper_Availability" */
  delete_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** delete single row from the table: "Shopper_Availability" */
  delete_Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** delete data from the table: "Shops" */
  delete_Shops?: Maybe<Shops_Mutation_Response>;
  /** delete single row from the table: "Shops" */
  delete_Shops_by_pk?: Maybe<Shops>;
  /** delete data from the table: "System_Logs" */
  delete_System_Logs?: Maybe<System_Logs_Mutation_Response>;
  /** delete single row from the table: "System_Logs" */
  delete_System_Logs_by_pk?: Maybe<System_Logs>;
  /** delete data from the table: "System_configuratioins" */
  delete_System_configuratioins?: Maybe<System_Configuratioins_Mutation_Response>;
  /** delete single row from the table: "System_configuratioins" */
  delete_System_configuratioins_by_pk?: Maybe<System_Configuratioins>;
  /** delete data from the table: "Users" */
  delete_Users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "Users" */
  delete_Users_by_pk?: Maybe<Users>;
  /** delete data from the table: "Wallet_Transactions" */
  delete_Wallet_Transactions?: Maybe<Wallet_Transactions_Mutation_Response>;
  /** delete single row from the table: "Wallet_Transactions" */
  delete_Wallet_Transactions_by_pk?: Maybe<Wallet_Transactions>;
  /** delete data from the table: "Wallets" */
  delete_Wallets?: Maybe<Wallets_Mutation_Response>;
  /** delete single row from the table: "Wallets" */
  delete_Wallets_by_pk?: Maybe<Wallets>;
  /** delete data from the table: "paymentCards" */
  delete_paymentCards?: Maybe<PaymentCards_Mutation_Response>;
  /** delete single row from the table: "paymentCards" */
  delete_paymentCards_by_pk?: Maybe<PaymentCards>;
  /** delete data from the table: "promotions" */
  delete_promotions?: Maybe<Promotions_Mutation_Response>;
  /** delete single row from the table: "promotions" */
  delete_promotions_by_pk?: Maybe<Promotions>;
  /** delete data from the table: "shoppers" */
  delete_shoppers?: Maybe<Shoppers_Mutation_Response>;
  /** delete single row from the table: "shoppers" */
  delete_shoppers_by_pk?: Maybe<Shoppers>;
  /** delete data from the table: "tickets" */
  delete_tickets?: Maybe<Tickets_Mutation_Response>;
  /** delete single row from the table: "tickets" */
  delete_tickets_by_pk?: Maybe<Tickets>;
  /** delete data from the table: "vehicles" */
  delete_vehicles?: Maybe<Vehicles_Mutation_Response>;
  /** delete single row from the table: "vehicles" */
  delete_vehicles_by_pk?: Maybe<Vehicles>;
  /** insert data into the table: "Addresses" */
  insert_Addresses?: Maybe<Addresses_Mutation_Response>;
  /** insert a single row into the table: "Addresses" */
  insert_Addresses_one?: Maybe<Addresses>;
  /** insert data into the table: "Cart_Items" */
  insert_Cart_Items?: Maybe<Cart_Items_Mutation_Response>;
  /** insert a single row into the table: "Cart_Items" */
  insert_Cart_Items_one?: Maybe<Cart_Items>;
  /** insert data into the table: "Carts" */
  insert_Carts?: Maybe<Carts_Mutation_Response>;
  /** insert a single row into the table: "Carts" */
  insert_Carts_one?: Maybe<Carts>;
  /** insert data into the table: "Categories" */
  insert_Categories?: Maybe<Categories_Mutation_Response>;
  /** insert a single row into the table: "Categories" */
  insert_Categories_one?: Maybe<Categories>;
  /** insert data into the table: "Delivery_Issues" */
  insert_Delivery_Issues?: Maybe<Delivery_Issues_Mutation_Response>;
  /** insert a single row into the table: "Delivery_Issues" */
  insert_Delivery_Issues_one?: Maybe<Delivery_Issues>;
  /** insert data into the table: "Invoices" */
  insert_Invoices?: Maybe<Invoices_Mutation_Response>;
  /** insert a single row into the table: "Invoices" */
  insert_Invoices_one?: Maybe<Invoices>;
  /** insert data into the table: "Notifications" */
  insert_Notifications?: Maybe<Notifications_Mutation_Response>;
  /** insert a single row into the table: "Notifications" */
  insert_Notifications_one?: Maybe<Notifications>;
  /** insert data into the table: "Order_Items" */
  insert_Order_Items?: Maybe<Order_Items_Mutation_Response>;
  /** insert a single row into the table: "Order_Items" */
  insert_Order_Items_one?: Maybe<Order_Items>;
  /** insert data into the table: "Orders" */
  insert_Orders?: Maybe<Orders_Mutation_Response>;
  /** insert a single row into the table: "Orders" */
  insert_Orders_one?: Maybe<Orders>;
  /** insert data into the table: "Payment_Methods" */
  insert_Payment_Methods?: Maybe<Payment_Methods_Mutation_Response>;
  /** insert a single row into the table: "Payment_Methods" */
  insert_Payment_Methods_one?: Maybe<Payment_Methods>;
  /** insert data into the table: "Platform_Settings" */
  insert_Platform_Settings?: Maybe<Platform_Settings_Mutation_Response>;
  /** insert a single row into the table: "Platform_Settings" */
  insert_Platform_Settings_one?: Maybe<Platform_Settings>;
  /** insert data into the table: "Products" */
  insert_Products?: Maybe<Products_Mutation_Response>;
  /** insert a single row into the table: "Products" */
  insert_Products_one?: Maybe<Products>;
  /** insert data into the table: "Ratings" */
  insert_Ratings?: Maybe<Ratings_Mutation_Response>;
  /** insert a single row into the table: "Ratings" */
  insert_Ratings_one?: Maybe<Ratings>;
  /** insert data into the table: "Reels" */
  insert_Reels?: Maybe<Reels_Mutation_Response>;
  /** insert data into the table: "Reels_comments" */
  insert_Reels_comments?: Maybe<Reels_Comments_Mutation_Response>;
  /** insert a single row into the table: "Reels_comments" */
  insert_Reels_comments_one?: Maybe<Reels_Comments>;
  /** insert a single row into the table: "Reels" */
  insert_Reels_one?: Maybe<Reels>;
  /** insert data into the table: "Refunds" */
  insert_Refunds?: Maybe<Refunds_Mutation_Response>;
  /** insert a single row into the table: "Refunds" */
  insert_Refunds_one?: Maybe<Refunds>;
  /** insert data into the table: "Restaurants" */
  insert_Restaurants?: Maybe<Restaurants_Mutation_Response>;
  /** insert a single row into the table: "Restaurants" */
  insert_Restaurants_one?: Maybe<Restaurants>;
  /** insert data into the table: "Revenue" */
  insert_Revenue?: Maybe<Revenue_Mutation_Response>;
  /** insert a single row into the table: "Revenue" */
  insert_Revenue_one?: Maybe<Revenue>;
  /** insert data into the table: "Shopper_Availability" */
  insert_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** insert a single row into the table: "Shopper_Availability" */
  insert_Shopper_Availability_one?: Maybe<Shopper_Availability>;
  /** insert data into the table: "Shops" */
  insert_Shops?: Maybe<Shops_Mutation_Response>;
  /** insert a single row into the table: "Shops" */
  insert_Shops_one?: Maybe<Shops>;
  /** insert data into the table: "System_Logs" */
  insert_System_Logs?: Maybe<System_Logs_Mutation_Response>;
  /** insert a single row into the table: "System_Logs" */
  insert_System_Logs_one?: Maybe<System_Logs>;
  /** insert data into the table: "System_configuratioins" */
  insert_System_configuratioins?: Maybe<System_Configuratioins_Mutation_Response>;
  /** insert a single row into the table: "System_configuratioins" */
  insert_System_configuratioins_one?: Maybe<System_Configuratioins>;
  /** insert data into the table: "Users" */
  insert_Users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "Users" */
  insert_Users_one?: Maybe<Users>;
  /** insert data into the table: "Wallet_Transactions" */
  insert_Wallet_Transactions?: Maybe<Wallet_Transactions_Mutation_Response>;
  /** insert a single row into the table: "Wallet_Transactions" */
  insert_Wallet_Transactions_one?: Maybe<Wallet_Transactions>;
  /** insert data into the table: "Wallets" */
  insert_Wallets?: Maybe<Wallets_Mutation_Response>;
  /** insert a single row into the table: "Wallets" */
  insert_Wallets_one?: Maybe<Wallets>;
  /** insert data into the table: "paymentCards" */
  insert_paymentCards?: Maybe<PaymentCards_Mutation_Response>;
  /** insert a single row into the table: "paymentCards" */
  insert_paymentCards_one?: Maybe<PaymentCards>;
  /** insert data into the table: "promotions" */
  insert_promotions?: Maybe<Promotions_Mutation_Response>;
  /** insert a single row into the table: "promotions" */
  insert_promotions_one?: Maybe<Promotions>;
  /** insert data into the table: "shoppers" */
  insert_shoppers?: Maybe<Shoppers_Mutation_Response>;
  /** insert a single row into the table: "shoppers" */
  insert_shoppers_one?: Maybe<Shoppers>;
  /** insert data into the table: "tickets" */
  insert_tickets?: Maybe<Tickets_Mutation_Response>;
  /** insert a single row into the table: "tickets" */
  insert_tickets_one?: Maybe<Tickets>;
  /** insert data into the table: "vehicles" */
  insert_vehicles?: Maybe<Vehicles_Mutation_Response>;
  /** insert a single row into the table: "vehicles" */
  insert_vehicles_one?: Maybe<Vehicles>;
  /** update data of the table: "Addresses" */
  update_Addresses?: Maybe<Addresses_Mutation_Response>;
  /** update single row of the table: "Addresses" */
  update_Addresses_by_pk?: Maybe<Addresses>;
  /** update multiples rows of table: "Addresses" */
  update_Addresses_many?: Maybe<Array<Maybe<Addresses_Mutation_Response>>>;
  /** update data of the table: "Cart_Items" */
  update_Cart_Items?: Maybe<Cart_Items_Mutation_Response>;
  /** update single row of the table: "Cart_Items" */
  update_Cart_Items_by_pk?: Maybe<Cart_Items>;
  /** update multiples rows of table: "Cart_Items" */
  update_Cart_Items_many?: Maybe<Array<Maybe<Cart_Items_Mutation_Response>>>;
  /** update data of the table: "Carts" */
  update_Carts?: Maybe<Carts_Mutation_Response>;
  /** update single row of the table: "Carts" */
  update_Carts_by_pk?: Maybe<Carts>;
  /** update multiples rows of table: "Carts" */
  update_Carts_many?: Maybe<Array<Maybe<Carts_Mutation_Response>>>;
  /** update data of the table: "Categories" */
  update_Categories?: Maybe<Categories_Mutation_Response>;
  /** update single row of the table: "Categories" */
  update_Categories_by_pk?: Maybe<Categories>;
  /** update multiples rows of table: "Categories" */
  update_Categories_many?: Maybe<Array<Maybe<Categories_Mutation_Response>>>;
  /** update data of the table: "Delivery_Issues" */
  update_Delivery_Issues?: Maybe<Delivery_Issues_Mutation_Response>;
  /** update single row of the table: "Delivery_Issues" */
  update_Delivery_Issues_by_pk?: Maybe<Delivery_Issues>;
  /** update multiples rows of table: "Delivery_Issues" */
  update_Delivery_Issues_many?: Maybe<Array<Maybe<Delivery_Issues_Mutation_Response>>>;
  /** update data of the table: "Invoices" */
  update_Invoices?: Maybe<Invoices_Mutation_Response>;
  /** update single row of the table: "Invoices" */
  update_Invoices_by_pk?: Maybe<Invoices>;
  /** update multiples rows of table: "Invoices" */
  update_Invoices_many?: Maybe<Array<Maybe<Invoices_Mutation_Response>>>;
  /** update data of the table: "Notifications" */
  update_Notifications?: Maybe<Notifications_Mutation_Response>;
  /** update single row of the table: "Notifications" */
  update_Notifications_by_pk?: Maybe<Notifications>;
  /** update multiples rows of table: "Notifications" */
  update_Notifications_many?: Maybe<Array<Maybe<Notifications_Mutation_Response>>>;
  /** update data of the table: "Order_Items" */
  update_Order_Items?: Maybe<Order_Items_Mutation_Response>;
  /** update single row of the table: "Order_Items" */
  update_Order_Items_by_pk?: Maybe<Order_Items>;
  /** update multiples rows of table: "Order_Items" */
  update_Order_Items_many?: Maybe<Array<Maybe<Order_Items_Mutation_Response>>>;
  /** update data of the table: "Orders" */
  update_Orders?: Maybe<Orders_Mutation_Response>;
  /** update single row of the table: "Orders" */
  update_Orders_by_pk?: Maybe<Orders>;
  /** update multiples rows of table: "Orders" */
  update_Orders_many?: Maybe<Array<Maybe<Orders_Mutation_Response>>>;
  /** update data of the table: "Payment_Methods" */
  update_Payment_Methods?: Maybe<Payment_Methods_Mutation_Response>;
  /** update single row of the table: "Payment_Methods" */
  update_Payment_Methods_by_pk?: Maybe<Payment_Methods>;
  /** update multiples rows of table: "Payment_Methods" */
  update_Payment_Methods_many?: Maybe<Array<Maybe<Payment_Methods_Mutation_Response>>>;
  /** update data of the table: "Platform_Settings" */
  update_Platform_Settings?: Maybe<Platform_Settings_Mutation_Response>;
  /** update single row of the table: "Platform_Settings" */
  update_Platform_Settings_by_pk?: Maybe<Platform_Settings>;
  /** update multiples rows of table: "Platform_Settings" */
  update_Platform_Settings_many?: Maybe<Array<Maybe<Platform_Settings_Mutation_Response>>>;
  /** update data of the table: "Products" */
  update_Products?: Maybe<Products_Mutation_Response>;
  /** update single row of the table: "Products" */
  update_Products_by_pk?: Maybe<Products>;
  /** update multiples rows of table: "Products" */
  update_Products_many?: Maybe<Array<Maybe<Products_Mutation_Response>>>;
  /** update data of the table: "Ratings" */
  update_Ratings?: Maybe<Ratings_Mutation_Response>;
  /** update single row of the table: "Ratings" */
  update_Ratings_by_pk?: Maybe<Ratings>;
  /** update multiples rows of table: "Ratings" */
  update_Ratings_many?: Maybe<Array<Maybe<Ratings_Mutation_Response>>>;
  /** update data of the table: "Reels" */
  update_Reels?: Maybe<Reels_Mutation_Response>;
  /** update single row of the table: "Reels" */
  update_Reels_by_pk?: Maybe<Reels>;
  /** update data of the table: "Reels_comments" */
  update_Reels_comments?: Maybe<Reels_Comments_Mutation_Response>;
  /** update single row of the table: "Reels_comments" */
  update_Reels_comments_by_pk?: Maybe<Reels_Comments>;
  /** update multiples rows of table: "Reels_comments" */
  update_Reels_comments_many?: Maybe<Array<Maybe<Reels_Comments_Mutation_Response>>>;
  /** update multiples rows of table: "Reels" */
  update_Reels_many?: Maybe<Array<Maybe<Reels_Mutation_Response>>>;
  /** update data of the table: "Refunds" */
  update_Refunds?: Maybe<Refunds_Mutation_Response>;
  /** update single row of the table: "Refunds" */
  update_Refunds_by_pk?: Maybe<Refunds>;
  /** update multiples rows of table: "Refunds" */
  update_Refunds_many?: Maybe<Array<Maybe<Refunds_Mutation_Response>>>;
  /** update data of the table: "Restaurants" */
  update_Restaurants?: Maybe<Restaurants_Mutation_Response>;
  /** update single row of the table: "Restaurants" */
  update_Restaurants_by_pk?: Maybe<Restaurants>;
  /** update multiples rows of table: "Restaurants" */
  update_Restaurants_many?: Maybe<Array<Maybe<Restaurants_Mutation_Response>>>;
  /** update data of the table: "Revenue" */
  update_Revenue?: Maybe<Revenue_Mutation_Response>;
  /** update single row of the table: "Revenue" */
  update_Revenue_by_pk?: Maybe<Revenue>;
  /** update multiples rows of table: "Revenue" */
  update_Revenue_many?: Maybe<Array<Maybe<Revenue_Mutation_Response>>>;
  /** update data of the table: "Shopper_Availability" */
  update_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** update single row of the table: "Shopper_Availability" */
  update_Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** update multiples rows of table: "Shopper_Availability" */
  update_Shopper_Availability_many?: Maybe<Array<Maybe<Shopper_Availability_Mutation_Response>>>;
  /** update data of the table: "Shops" */
  update_Shops?: Maybe<Shops_Mutation_Response>;
  /** update single row of the table: "Shops" */
  update_Shops_by_pk?: Maybe<Shops>;
  /** update multiples rows of table: "Shops" */
  update_Shops_many?: Maybe<Array<Maybe<Shops_Mutation_Response>>>;
  /** update data of the table: "System_Logs" */
  update_System_Logs?: Maybe<System_Logs_Mutation_Response>;
  /** update single row of the table: "System_Logs" */
  update_System_Logs_by_pk?: Maybe<System_Logs>;
  /** update multiples rows of table: "System_Logs" */
  update_System_Logs_many?: Maybe<Array<Maybe<System_Logs_Mutation_Response>>>;
  /** update data of the table: "System_configuratioins" */
  update_System_configuratioins?: Maybe<System_Configuratioins_Mutation_Response>;
  /** update single row of the table: "System_configuratioins" */
  update_System_configuratioins_by_pk?: Maybe<System_Configuratioins>;
  /** update multiples rows of table: "System_configuratioins" */
  update_System_configuratioins_many?: Maybe<Array<Maybe<System_Configuratioins_Mutation_Response>>>;
  /** update data of the table: "Users" */
  update_Users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "Users" */
  update_Users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "Users" */
  update_Users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
  /** update data of the table: "Wallet_Transactions" */
  update_Wallet_Transactions?: Maybe<Wallet_Transactions_Mutation_Response>;
  /** update single row of the table: "Wallet_Transactions" */
  update_Wallet_Transactions_by_pk?: Maybe<Wallet_Transactions>;
  /** update multiples rows of table: "Wallet_Transactions" */
  update_Wallet_Transactions_many?: Maybe<Array<Maybe<Wallet_Transactions_Mutation_Response>>>;
  /** update data of the table: "Wallets" */
  update_Wallets?: Maybe<Wallets_Mutation_Response>;
  /** update single row of the table: "Wallets" */
  update_Wallets_by_pk?: Maybe<Wallets>;
  /** update multiples rows of table: "Wallets" */
  update_Wallets_many?: Maybe<Array<Maybe<Wallets_Mutation_Response>>>;
  /** update data of the table: "paymentCards" */
  update_paymentCards?: Maybe<PaymentCards_Mutation_Response>;
  /** update single row of the table: "paymentCards" */
  update_paymentCards_by_pk?: Maybe<PaymentCards>;
  /** update multiples rows of table: "paymentCards" */
  update_paymentCards_many?: Maybe<Array<Maybe<PaymentCards_Mutation_Response>>>;
  /** update data of the table: "promotions" */
  update_promotions?: Maybe<Promotions_Mutation_Response>;
  /** update single row of the table: "promotions" */
  update_promotions_by_pk?: Maybe<Promotions>;
  /** update multiples rows of table: "promotions" */
  update_promotions_many?: Maybe<Array<Maybe<Promotions_Mutation_Response>>>;
  /** update data of the table: "shoppers" */
  update_shoppers?: Maybe<Shoppers_Mutation_Response>;
  /** update single row of the table: "shoppers" */
  update_shoppers_by_pk?: Maybe<Shoppers>;
  /** update multiples rows of table: "shoppers" */
  update_shoppers_many?: Maybe<Array<Maybe<Shoppers_Mutation_Response>>>;
  /** update data of the table: "tickets" */
  update_tickets?: Maybe<Tickets_Mutation_Response>;
  /** update single row of the table: "tickets" */
  update_tickets_by_pk?: Maybe<Tickets>;
  /** update multiples rows of table: "tickets" */
  update_tickets_many?: Maybe<Array<Maybe<Tickets_Mutation_Response>>>;
  /** update data of the table: "vehicles" */
  update_vehicles?: Maybe<Vehicles_Mutation_Response>;
  /** update single row of the table: "vehicles" */
  update_vehicles_by_pk?: Maybe<Vehicles>;
  /** update multiples rows of table: "vehicles" */
  update_vehicles_many?: Maybe<Array<Maybe<Vehicles_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_AddressesArgs = {
  where: Addresses_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Addresses_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Cart_ItemsArgs = {
  where: Cart_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Cart_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_CartsArgs = {
  where: Carts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Carts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_CategoriesArgs = {
  where: Categories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Categories_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Delivery_IssuesArgs = {
  where: Delivery_Issues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Delivery_Issues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_InvoicesArgs = {
  where: Invoices_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Invoices_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_NotificationsArgs = {
  where: Notifications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Notifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Order_ItemsArgs = {
  where: Order_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Order_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_OrdersArgs = {
  where: Orders_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Orders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Payment_MethodsArgs = {
  where: Payment_Methods_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Payment_Methods_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Platform_SettingsArgs = {
  where: Platform_Settings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Platform_Settings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ProductsArgs = {
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Products_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_RatingsArgs = {
  where: Ratings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Ratings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ReelsArgs = {
  where: Reels_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Reels_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Reels_CommentsArgs = {
  where: Reels_Comments_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Reels_Comments_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_RefundsArgs = {
  where: Refunds_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Refunds_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_RestaurantsArgs = {
  where: Restaurants_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Restaurants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_RevenueArgs = {
  where: Revenue_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Revenue_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Shopper_AvailabilityArgs = {
  where: Shopper_Availability_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Shopper_Availability_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ShopsArgs = {
  where: Shops_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Shops_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_System_LogsArgs = {
  where: System_Logs_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_System_Logs_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_System_ConfiguratioinsArgs = {
  where: System_Configuratioins_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_System_Configuratioins_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Wallet_TransactionsArgs = {
  where: Wallet_Transactions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Wallet_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_WalletsArgs = {
  where: Wallets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Wallets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PaymentCardsArgs = {
  where: PaymentCards_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_PaymentCards_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PromotionsArgs = {
  where: Promotions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Promotions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ShoppersArgs = {
  where: Shoppers_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Shoppers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TicketsArgs = {
  where: Tickets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Tickets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_VehiclesArgs = {
  where: Vehicles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Vehicles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_AddressesArgs = {
  objects: Array<Addresses_Insert_Input>;
  on_conflict?: InputMaybe<Addresses_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Addresses_OneArgs = {
  object: Addresses_Insert_Input;
  on_conflict?: InputMaybe<Addresses_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Cart_ItemsArgs = {
  objects: Array<Cart_Items_Insert_Input>;
  on_conflict?: InputMaybe<Cart_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Cart_Items_OneArgs = {
  object: Cart_Items_Insert_Input;
  on_conflict?: InputMaybe<Cart_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_CartsArgs = {
  objects: Array<Carts_Insert_Input>;
  on_conflict?: InputMaybe<Carts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Carts_OneArgs = {
  object: Carts_Insert_Input;
  on_conflict?: InputMaybe<Carts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_CategoriesArgs = {
  objects: Array<Categories_Insert_Input>;
  on_conflict?: InputMaybe<Categories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Categories_OneArgs = {
  object: Categories_Insert_Input;
  on_conflict?: InputMaybe<Categories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Delivery_IssuesArgs = {
  objects: Array<Delivery_Issues_Insert_Input>;
  on_conflict?: InputMaybe<Delivery_Issues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Delivery_Issues_OneArgs = {
  object: Delivery_Issues_Insert_Input;
  on_conflict?: InputMaybe<Delivery_Issues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_InvoicesArgs = {
  objects: Array<Invoices_Insert_Input>;
  on_conflict?: InputMaybe<Invoices_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Invoices_OneArgs = {
  object: Invoices_Insert_Input;
  on_conflict?: InputMaybe<Invoices_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_NotificationsArgs = {
  objects: Array<Notifications_Insert_Input>;
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Notifications_OneArgs = {
  object: Notifications_Insert_Input;
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_ItemsArgs = {
  objects: Array<Order_Items_Insert_Input>;
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_Items_OneArgs = {
  object: Order_Items_Insert_Input;
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_OrdersArgs = {
  objects: Array<Orders_Insert_Input>;
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Orders_OneArgs = {
  object: Orders_Insert_Input;
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Payment_MethodsArgs = {
  objects: Array<Payment_Methods_Insert_Input>;
  on_conflict?: InputMaybe<Payment_Methods_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Payment_Methods_OneArgs = {
  object: Payment_Methods_Insert_Input;
  on_conflict?: InputMaybe<Payment_Methods_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Platform_SettingsArgs = {
  objects: Array<Platform_Settings_Insert_Input>;
  on_conflict?: InputMaybe<Platform_Settings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Platform_Settings_OneArgs = {
  object: Platform_Settings_Insert_Input;
  on_conflict?: InputMaybe<Platform_Settings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ProductsArgs = {
  objects: Array<Products_Insert_Input>;
  on_conflict?: InputMaybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Products_OneArgs = {
  object: Products_Insert_Input;
  on_conflict?: InputMaybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RatingsArgs = {
  objects: Array<Ratings_Insert_Input>;
  on_conflict?: InputMaybe<Ratings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Ratings_OneArgs = {
  object: Ratings_Insert_Input;
  on_conflict?: InputMaybe<Ratings_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ReelsArgs = {
  objects: Array<Reels_Insert_Input>;
  on_conflict?: InputMaybe<Reels_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reels_CommentsArgs = {
  objects: Array<Reels_Comments_Insert_Input>;
  on_conflict?: InputMaybe<Reels_Comments_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reels_Comments_OneArgs = {
  object: Reels_Comments_Insert_Input;
  on_conflict?: InputMaybe<Reels_Comments_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reels_OneArgs = {
  object: Reels_Insert_Input;
  on_conflict?: InputMaybe<Reels_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RefundsArgs = {
  objects: Array<Refunds_Insert_Input>;
  on_conflict?: InputMaybe<Refunds_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Refunds_OneArgs = {
  object: Refunds_Insert_Input;
  on_conflict?: InputMaybe<Refunds_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RestaurantsArgs = {
  objects: Array<Restaurants_Insert_Input>;
  on_conflict?: InputMaybe<Restaurants_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Restaurants_OneArgs = {
  object: Restaurants_Insert_Input;
  on_conflict?: InputMaybe<Restaurants_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RevenueArgs = {
  objects: Array<Revenue_Insert_Input>;
  on_conflict?: InputMaybe<Revenue_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Revenue_OneArgs = {
  object: Revenue_Insert_Input;
  on_conflict?: InputMaybe<Revenue_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Shopper_AvailabilityArgs = {
  objects: Array<Shopper_Availability_Insert_Input>;
  on_conflict?: InputMaybe<Shopper_Availability_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Shopper_Availability_OneArgs = {
  object: Shopper_Availability_Insert_Input;
  on_conflict?: InputMaybe<Shopper_Availability_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ShopsArgs = {
  objects: Array<Shops_Insert_Input>;
  on_conflict?: InputMaybe<Shops_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Shops_OneArgs = {
  object: Shops_Insert_Input;
  on_conflict?: InputMaybe<Shops_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_LogsArgs = {
  objects: Array<System_Logs_Insert_Input>;
  on_conflict?: InputMaybe<System_Logs_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_Logs_OneArgs = {
  object: System_Logs_Insert_Input;
  on_conflict?: InputMaybe<System_Logs_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_ConfiguratioinsArgs = {
  objects: Array<System_Configuratioins_Insert_Input>;
  on_conflict?: InputMaybe<System_Configuratioins_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_System_Configuratioins_OneArgs = {
  object: System_Configuratioins_Insert_Input;
  on_conflict?: InputMaybe<System_Configuratioins_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Wallet_TransactionsArgs = {
  objects: Array<Wallet_Transactions_Insert_Input>;
  on_conflict?: InputMaybe<Wallet_Transactions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Wallet_Transactions_OneArgs = {
  object: Wallet_Transactions_Insert_Input;
  on_conflict?: InputMaybe<Wallet_Transactions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_WalletsArgs = {
  objects: Array<Wallets_Insert_Input>;
  on_conflict?: InputMaybe<Wallets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Wallets_OneArgs = {
  object: Wallets_Insert_Input;
  on_conflict?: InputMaybe<Wallets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PaymentCardsArgs = {
  objects: Array<PaymentCards_Insert_Input>;
  on_conflict?: InputMaybe<PaymentCards_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PaymentCards_OneArgs = {
  object: PaymentCards_Insert_Input;
  on_conflict?: InputMaybe<PaymentCards_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PromotionsArgs = {
  objects: Array<Promotions_Insert_Input>;
  on_conflict?: InputMaybe<Promotions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Promotions_OneArgs = {
  object: Promotions_Insert_Input;
  on_conflict?: InputMaybe<Promotions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ShoppersArgs = {
  objects: Array<Shoppers_Insert_Input>;
  on_conflict?: InputMaybe<Shoppers_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Shoppers_OneArgs = {
  object: Shoppers_Insert_Input;
  on_conflict?: InputMaybe<Shoppers_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TicketsArgs = {
  objects: Array<Tickets_Insert_Input>;
  on_conflict?: InputMaybe<Tickets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Tickets_OneArgs = {
  object: Tickets_Insert_Input;
  on_conflict?: InputMaybe<Tickets_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_VehiclesArgs = {
  objects: Array<Vehicles_Insert_Input>;
  on_conflict?: InputMaybe<Vehicles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Vehicles_OneArgs = {
  object: Vehicles_Insert_Input;
  on_conflict?: InputMaybe<Vehicles_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_AddressesArgs = {
  _set?: InputMaybe<Addresses_Set_Input>;
  where: Addresses_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Addresses_By_PkArgs = {
  _set?: InputMaybe<Addresses_Set_Input>;
  pk_columns: Addresses_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Addresses_ManyArgs = {
  updates: Array<Addresses_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Cart_ItemsArgs = {
  _inc?: InputMaybe<Cart_Items_Inc_Input>;
  _set?: InputMaybe<Cart_Items_Set_Input>;
  where: Cart_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Cart_Items_By_PkArgs = {
  _inc?: InputMaybe<Cart_Items_Inc_Input>;
  _set?: InputMaybe<Cart_Items_Set_Input>;
  pk_columns: Cart_Items_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Cart_Items_ManyArgs = {
  updates: Array<Cart_Items_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_CartsArgs = {
  _set?: InputMaybe<Carts_Set_Input>;
  where: Carts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Carts_By_PkArgs = {
  _set?: InputMaybe<Carts_Set_Input>;
  pk_columns: Carts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Carts_ManyArgs = {
  updates: Array<Carts_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_CategoriesArgs = {
  _set?: InputMaybe<Categories_Set_Input>;
  where: Categories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Categories_By_PkArgs = {
  _set?: InputMaybe<Categories_Set_Input>;
  pk_columns: Categories_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Categories_ManyArgs = {
  updates: Array<Categories_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Delivery_IssuesArgs = {
  _set?: InputMaybe<Delivery_Issues_Set_Input>;
  where: Delivery_Issues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Delivery_Issues_By_PkArgs = {
  _set?: InputMaybe<Delivery_Issues_Set_Input>;
  pk_columns: Delivery_Issues_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Delivery_Issues_ManyArgs = {
  updates: Array<Delivery_Issues_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_InvoicesArgs = {
  _append?: InputMaybe<Invoices_Append_Input>;
  _delete_at_path?: InputMaybe<Invoices_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Invoices_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Invoices_Delete_Key_Input>;
  _prepend?: InputMaybe<Invoices_Prepend_Input>;
  _set?: InputMaybe<Invoices_Set_Input>;
  where: Invoices_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Invoices_By_PkArgs = {
  _append?: InputMaybe<Invoices_Append_Input>;
  _delete_at_path?: InputMaybe<Invoices_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Invoices_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Invoices_Delete_Key_Input>;
  _prepend?: InputMaybe<Invoices_Prepend_Input>;
  _set?: InputMaybe<Invoices_Set_Input>;
  pk_columns: Invoices_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Invoices_ManyArgs = {
  updates: Array<Invoices_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_NotificationsArgs = {
  _set?: InputMaybe<Notifications_Set_Input>;
  where: Notifications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Notifications_By_PkArgs = {
  _set?: InputMaybe<Notifications_Set_Input>;
  pk_columns: Notifications_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Notifications_ManyArgs = {
  updates: Array<Notifications_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Order_ItemsArgs = {
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  _set?: InputMaybe<Order_Items_Set_Input>;
  where: Order_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Items_By_PkArgs = {
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  _set?: InputMaybe<Order_Items_Set_Input>;
  pk_columns: Order_Items_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Items_ManyArgs = {
  updates: Array<Order_Items_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_OrdersArgs = {
  _inc?: InputMaybe<Orders_Inc_Input>;
  _set?: InputMaybe<Orders_Set_Input>;
  where: Orders_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Orders_By_PkArgs = {
  _inc?: InputMaybe<Orders_Inc_Input>;
  _set?: InputMaybe<Orders_Set_Input>;
  pk_columns: Orders_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Orders_ManyArgs = {
  updates: Array<Orders_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Payment_MethodsArgs = {
  _set?: InputMaybe<Payment_Methods_Set_Input>;
  where: Payment_Methods_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Payment_Methods_By_PkArgs = {
  _set?: InputMaybe<Payment_Methods_Set_Input>;
  pk_columns: Payment_Methods_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Payment_Methods_ManyArgs = {
  updates: Array<Payment_Methods_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Platform_SettingsArgs = {
  _set?: InputMaybe<Platform_Settings_Set_Input>;
  where: Platform_Settings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Platform_Settings_By_PkArgs = {
  _set?: InputMaybe<Platform_Settings_Set_Input>;
  pk_columns: Platform_Settings_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Platform_Settings_ManyArgs = {
  updates: Array<Platform_Settings_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ProductsArgs = {
  _inc?: InputMaybe<Products_Inc_Input>;
  _set?: InputMaybe<Products_Set_Input>;
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Products_By_PkArgs = {
  _inc?: InputMaybe<Products_Inc_Input>;
  _set?: InputMaybe<Products_Set_Input>;
  pk_columns: Products_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Products_ManyArgs = {
  updates: Array<Products_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_RatingsArgs = {
  _inc?: InputMaybe<Ratings_Inc_Input>;
  _set?: InputMaybe<Ratings_Set_Input>;
  where: Ratings_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Ratings_By_PkArgs = {
  _inc?: InputMaybe<Ratings_Inc_Input>;
  _set?: InputMaybe<Ratings_Set_Input>;
  pk_columns: Ratings_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Ratings_ManyArgs = {
  updates: Array<Ratings_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ReelsArgs = {
  _set?: InputMaybe<Reels_Set_Input>;
  where: Reels_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Reels_By_PkArgs = {
  _set?: InputMaybe<Reels_Set_Input>;
  pk_columns: Reels_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Reels_CommentsArgs = {
  _set?: InputMaybe<Reels_Comments_Set_Input>;
  where: Reels_Comments_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Reels_Comments_By_PkArgs = {
  _set?: InputMaybe<Reels_Comments_Set_Input>;
  pk_columns: Reels_Comments_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Reels_Comments_ManyArgs = {
  updates: Array<Reels_Comments_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Reels_ManyArgs = {
  updates: Array<Reels_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_RefundsArgs = {
  _set?: InputMaybe<Refunds_Set_Input>;
  where: Refunds_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Refunds_By_PkArgs = {
  _set?: InputMaybe<Refunds_Set_Input>;
  pk_columns: Refunds_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Refunds_ManyArgs = {
  updates: Array<Refunds_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_RestaurantsArgs = {
  _set?: InputMaybe<Restaurants_Set_Input>;
  where: Restaurants_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Restaurants_By_PkArgs = {
  _set?: InputMaybe<Restaurants_Set_Input>;
  pk_columns: Restaurants_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Restaurants_ManyArgs = {
  updates: Array<Restaurants_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_RevenueArgs = {
  _set?: InputMaybe<Revenue_Set_Input>;
  where: Revenue_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Revenue_By_PkArgs = {
  _set?: InputMaybe<Revenue_Set_Input>;
  pk_columns: Revenue_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Revenue_ManyArgs = {
  updates: Array<Revenue_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Shopper_AvailabilityArgs = {
  _inc?: InputMaybe<Shopper_Availability_Inc_Input>;
  _set?: InputMaybe<Shopper_Availability_Set_Input>;
  where: Shopper_Availability_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Shopper_Availability_By_PkArgs = {
  _inc?: InputMaybe<Shopper_Availability_Inc_Input>;
  _set?: InputMaybe<Shopper_Availability_Set_Input>;
  pk_columns: Shopper_Availability_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Shopper_Availability_ManyArgs = {
  updates: Array<Shopper_Availability_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ShopsArgs = {
  _set?: InputMaybe<Shops_Set_Input>;
  where: Shops_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Shops_By_PkArgs = {
  _set?: InputMaybe<Shops_Set_Input>;
  pk_columns: Shops_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Shops_ManyArgs = {
  updates: Array<Shops_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_System_LogsArgs = {
  _set?: InputMaybe<System_Logs_Set_Input>;
  where: System_Logs_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_System_Logs_By_PkArgs = {
  _set?: InputMaybe<System_Logs_Set_Input>;
  pk_columns: System_Logs_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_System_Logs_ManyArgs = {
  updates: Array<System_Logs_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_System_ConfiguratioinsArgs = {
  _set?: InputMaybe<System_Configuratioins_Set_Input>;
  where: System_Configuratioins_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_System_Configuratioins_By_PkArgs = {
  _set?: InputMaybe<System_Configuratioins_Set_Input>;
  pk_columns: System_Configuratioins_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_System_Configuratioins_ManyArgs = {
  updates: Array<System_Configuratioins_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Wallet_TransactionsArgs = {
  _set?: InputMaybe<Wallet_Transactions_Set_Input>;
  where: Wallet_Transactions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Wallet_Transactions_By_PkArgs = {
  _set?: InputMaybe<Wallet_Transactions_Set_Input>;
  pk_columns: Wallet_Transactions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Wallet_Transactions_ManyArgs = {
  updates: Array<Wallet_Transactions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_WalletsArgs = {
  _set?: InputMaybe<Wallets_Set_Input>;
  where: Wallets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Wallets_By_PkArgs = {
  _set?: InputMaybe<Wallets_Set_Input>;
  pk_columns: Wallets_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Wallets_ManyArgs = {
  updates: Array<Wallets_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PaymentCardsArgs = {
  _set?: InputMaybe<PaymentCards_Set_Input>;
  where: PaymentCards_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_PaymentCards_By_PkArgs = {
  _set?: InputMaybe<PaymentCards_Set_Input>;
  pk_columns: PaymentCards_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_PaymentCards_ManyArgs = {
  updates: Array<PaymentCards_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PromotionsArgs = {
  _set?: InputMaybe<Promotions_Set_Input>;
  where: Promotions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Promotions_By_PkArgs = {
  _set?: InputMaybe<Promotions_Set_Input>;
  pk_columns: Promotions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Promotions_ManyArgs = {
  updates: Array<Promotions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ShoppersArgs = {
  _inc?: InputMaybe<Shoppers_Inc_Input>;
  _set?: InputMaybe<Shoppers_Set_Input>;
  where: Shoppers_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Shoppers_By_PkArgs = {
  _inc?: InputMaybe<Shoppers_Inc_Input>;
  _set?: InputMaybe<Shoppers_Set_Input>;
  pk_columns: Shoppers_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Shoppers_ManyArgs = {
  updates: Array<Shoppers_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_TicketsArgs = {
  _inc?: InputMaybe<Tickets_Inc_Input>;
  _set?: InputMaybe<Tickets_Set_Input>;
  where: Tickets_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Tickets_By_PkArgs = {
  _inc?: InputMaybe<Tickets_Inc_Input>;
  _set?: InputMaybe<Tickets_Set_Input>;
  pk_columns: Tickets_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Tickets_ManyArgs = {
  updates: Array<Tickets_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_VehiclesArgs = {
  _set?: InputMaybe<Vehicles_Set_Input>;
  where: Vehicles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Vehicles_By_PkArgs = {
  _set?: InputMaybe<Vehicles_Set_Input>;
  pk_columns: Vehicles_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Vehicles_ManyArgs = {
  updates: Array<Vehicles_Updates>;
};

/** column ordering options */
export type Order_By =
  /** in ascending order, nulls last */
  | 'asc'
  /** in ascending order, nulls first */
  | 'asc_nulls_first'
  /** in ascending order, nulls last */
  | 'asc_nulls_last'
  /** in descending order, nulls first */
  | 'desc'
  /** in descending order, nulls first */
  | 'desc_nulls_first'
  /** in descending order, nulls last */
  | 'desc_nulls_last';

/** columns and relationships of "paymentCards" */
export type PaymentCards = {
  CVV: Scalars['String']['output'];
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  expiry_date: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  number: Scalars['String']['output'];
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "paymentCards" */
export type PaymentCards_Aggregate = {
  aggregate?: Maybe<PaymentCards_Aggregate_Fields>;
  nodes: Array<PaymentCards>;
};

export type PaymentCards_Aggregate_Bool_Exp = {
  count?: InputMaybe<PaymentCards_Aggregate_Bool_Exp_Count>;
};

export type PaymentCards_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<PaymentCards_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<PaymentCards_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "paymentCards" */
export type PaymentCards_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<PaymentCards_Max_Fields>;
  min?: Maybe<PaymentCards_Min_Fields>;
};


/** aggregate fields of "paymentCards" */
export type PaymentCards_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<PaymentCards_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "paymentCards" */
export type PaymentCards_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<PaymentCards_Max_Order_By>;
  min?: InputMaybe<PaymentCards_Min_Order_By>;
};

/** input type for inserting array relation for remote table "paymentCards" */
export type PaymentCards_Arr_Rel_Insert_Input = {
  data: Array<PaymentCards_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<PaymentCards_On_Conflict>;
};

/** Boolean expression to filter rows from the table "paymentCards". All fields are combined with a logical 'AND'. */
export type PaymentCards_Bool_Exp = {
  CVV?: InputMaybe<String_Comparison_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<PaymentCards_Bool_Exp>>;
  _not?: InputMaybe<PaymentCards_Bool_Exp>;
  _or?: InputMaybe<Array<PaymentCards_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  expiry_date?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  number?: InputMaybe<String_Comparison_Exp>;
  update_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "paymentCards" */
export type PaymentCards_Constraint =
  /** unique or primary key constraint on columns "number" */
  | 'paymentCards_number_key'
  /** unique or primary key constraint on columns "id" */
  | 'paymentCards_pkey';

/** input type for inserting data into table "paymentCards" */
export type PaymentCards_Insert_Input = {
  CVV?: InputMaybe<Scalars['String']['input']>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expiry_date?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type PaymentCards_Max_Fields = {
  CVV?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  expiry_date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "paymentCards" */
export type PaymentCards_Max_Order_By = {
  CVV?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  expiry_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type PaymentCards_Min_Fields = {
  CVV?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  expiry_date?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "paymentCards" */
export type PaymentCards_Min_Order_By = {
  CVV?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  expiry_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "paymentCards" */
export type PaymentCards_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<PaymentCards>;
};

/** on_conflict condition type for table "paymentCards" */
export type PaymentCards_On_Conflict = {
  constraint: PaymentCards_Constraint;
  update_columns?: Array<PaymentCards_Update_Column>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};

/** Ordering options when selecting data from "paymentCards". */
export type PaymentCards_Order_By = {
  CVV?: InputMaybe<Order_By>;
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  expiry_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  number?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: paymentCards */
export type PaymentCards_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "paymentCards" */
export type PaymentCards_Select_Column =
  /** column name */
  | 'CVV'
  /** column name */
  | 'created_at'
  /** column name */
  | 'expiry_date'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'name'
  /** column name */
  | 'number'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

/** input type for updating data in table "paymentCards" */
export type PaymentCards_Set_Input = {
  CVV?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expiry_date?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "paymentCards" */
export type PaymentCards_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: PaymentCards_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type PaymentCards_Stream_Cursor_Value_Input = {
  CVV?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expiry_date?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "paymentCards" */
export type PaymentCards_Update_Column =
  /** column name */
  | 'CVV'
  /** column name */
  | 'created_at'
  /** column name */
  | 'expiry_date'
  /** column name */
  | 'id'
  /** column name */
  | 'image'
  /** column name */
  | 'name'
  /** column name */
  | 'number'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

export type PaymentCards_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<PaymentCards_Set_Input>;
  /** filter the rows which have to be updated */
  where: PaymentCards_Bool_Exp;
};

/** columns and relationships of "promotions" */
export type Promotions = {
  code: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  discount: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  period: Scalars['String']['output'];
  status: Scalars['String']['output'];
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  usage: Scalars['String']['output'];
};

/** aggregated selection of "promotions" */
export type Promotions_Aggregate = {
  aggregate?: Maybe<Promotions_Aggregate_Fields>;
  nodes: Array<Promotions>;
};

/** aggregate fields of "promotions" */
export type Promotions_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Promotions_Max_Fields>;
  min?: Maybe<Promotions_Min_Fields>;
};


/** aggregate fields of "promotions" */
export type Promotions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Promotions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "promotions". All fields are combined with a logical 'AND'. */
export type Promotions_Bool_Exp = {
  _and?: InputMaybe<Array<Promotions_Bool_Exp>>;
  _not?: InputMaybe<Promotions_Bool_Exp>;
  _or?: InputMaybe<Array<Promotions_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  discount?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  period?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  update_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  usage?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "promotions" */
export type Promotions_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'promotions_pkey';

/** input type for inserting data into table "promotions" */
export type Promotions_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  usage?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Promotions_Max_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  usage?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Promotions_Min_Fields = {
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  usage?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "promotions" */
export type Promotions_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Promotions>;
};

/** on_conflict condition type for table "promotions" */
export type Promotions_On_Conflict = {
  constraint: Promotions_Constraint;
  update_columns?: Array<Promotions_Update_Column>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};

/** Ordering options when selecting data from "promotions". */
export type Promotions_Order_By = {
  code?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  discount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  period?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  usage?: InputMaybe<Order_By>;
};

/** primary key columns input for table: promotions */
export type Promotions_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "promotions" */
export type Promotions_Select_Column =
  /** column name */
  | 'code'
  /** column name */
  | 'created_at'
  /** column name */
  | 'discount'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'period'
  /** column name */
  | 'status'
  /** column name */
  | 'update_on'
  /** column name */
  | 'usage';

/** input type for updating data in table "promotions" */
export type Promotions_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  usage?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "promotions" */
export type Promotions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Promotions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Promotions_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  usage?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "promotions" */
export type Promotions_Update_Column =
  /** column name */
  | 'code'
  /** column name */
  | 'created_at'
  /** column name */
  | 'discount'
  /** column name */
  | 'id'
  /** column name */
  | 'name'
  /** column name */
  | 'period'
  /** column name */
  | 'status'
  /** column name */
  | 'update_on'
  /** column name */
  | 'usage';

export type Promotions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Promotions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Promotions_Bool_Exp;
};

export type Query_Root = {
  /** An array relationship */
  Addresses: Array<Addresses>;
  /** An aggregate relationship */
  Addresses_aggregate: Addresses_Aggregate;
  /** fetch data from the table: "Addresses" using primary key columns */
  Addresses_by_pk?: Maybe<Addresses>;
  /** An array relationship */
  Cart_Items: Array<Cart_Items>;
  /** An aggregate relationship */
  Cart_Items_aggregate: Cart_Items_Aggregate;
  /** fetch data from the table: "Cart_Items" using primary key columns */
  Cart_Items_by_pk?: Maybe<Cart_Items>;
  /** An array relationship */
  Carts: Array<Carts>;
  /** An aggregate relationship */
  Carts_aggregate: Carts_Aggregate;
  /** fetch data from the table: "Carts" using primary key columns */
  Carts_by_pk?: Maybe<Carts>;
  /** fetch data from the table: "Categories" */
  Categories: Array<Categories>;
  /** fetch aggregated fields from the table: "Categories" */
  Categories_aggregate: Categories_Aggregate;
  /** fetch data from the table: "Categories" using primary key columns */
  Categories_by_pk?: Maybe<Categories>;
  /** An array relationship */
  Delivery_Issues: Array<Delivery_Issues>;
  /** An aggregate relationship */
  Delivery_Issues_aggregate: Delivery_Issues_Aggregate;
  /** fetch data from the table: "Delivery_Issues" using primary key columns */
  Delivery_Issues_by_pk?: Maybe<Delivery_Issues>;
  /** An array relationship */
  Invoices: Array<Invoices>;
  /** An aggregate relationship */
  Invoices_aggregate: Invoices_Aggregate;
  /** fetch data from the table: "Invoices" using primary key columns */
  Invoices_by_pk?: Maybe<Invoices>;
  /** An array relationship */
  Notifications: Array<Notifications>;
  /** An aggregate relationship */
  Notifications_aggregate: Notifications_Aggregate;
  /** fetch data from the table: "Notifications" using primary key columns */
  Notifications_by_pk?: Maybe<Notifications>;
  /** An array relationship */
  Order_Items: Array<Order_Items>;
  /** An aggregate relationship */
  Order_Items_aggregate: Order_Items_Aggregate;
  /** fetch data from the table: "Order_Items" using primary key columns */
  Order_Items_by_pk?: Maybe<Order_Items>;
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** fetch data from the table: "Orders" using primary key columns */
  Orders_by_pk?: Maybe<Orders>;
  /** An array relationship */
  Payment_Methods: Array<Payment_Methods>;
  /** An aggregate relationship */
  Payment_Methods_aggregate: Payment_Methods_Aggregate;
  /** fetch data from the table: "Payment_Methods" using primary key columns */
  Payment_Methods_by_pk?: Maybe<Payment_Methods>;
  /** fetch data from the table: "Platform_Settings" */
  Platform_Settings: Array<Platform_Settings>;
  /** fetch aggregated fields from the table: "Platform_Settings" */
  Platform_Settings_aggregate: Platform_Settings_Aggregate;
  /** fetch data from the table: "Platform_Settings" using primary key columns */
  Platform_Settings_by_pk?: Maybe<Platform_Settings>;
  /** An array relationship */
  Products: Array<Products>;
  /** An aggregate relationship */
  Products_aggregate: Products_Aggregate;
  /** fetch data from the table: "Products" using primary key columns */
  Products_by_pk?: Maybe<Products>;
  /** An array relationship */
  Ratings: Array<Ratings>;
  /** An aggregate relationship */
  Ratings_aggregate: Ratings_Aggregate;
  /** fetch data from the table: "Ratings" using primary key columns */
  Ratings_by_pk?: Maybe<Ratings>;
  /** An array relationship */
  Reels: Array<Reels>;
  /** An aggregate relationship */
  Reels_aggregate: Reels_Aggregate;
  /** fetch data from the table: "Reels" using primary key columns */
  Reels_by_pk?: Maybe<Reels>;
  /** An array relationship */
  Reels_comments: Array<Reels_Comments>;
  /** An aggregate relationship */
  Reels_comments_aggregate: Reels_Comments_Aggregate;
  /** fetch data from the table: "Reels_comments" using primary key columns */
  Reels_comments_by_pk?: Maybe<Reels_Comments>;
  /** An array relationship */
  Refunds: Array<Refunds>;
  /** An aggregate relationship */
  Refunds_aggregate: Refunds_Aggregate;
  /** fetch data from the table: "Refunds" using primary key columns */
  Refunds_by_pk?: Maybe<Refunds>;
  /** fetch data from the table: "Restaurants" */
  Restaurants: Array<Restaurants>;
  /** fetch aggregated fields from the table: "Restaurants" */
  Restaurants_aggregate: Restaurants_Aggregate;
  /** fetch data from the table: "Restaurants" using primary key columns */
  Restaurants_by_pk?: Maybe<Restaurants>;
  /** fetch data from the table: "Revenue" */
  Revenue: Array<Revenue>;
  /** fetch aggregated fields from the table: "Revenue" */
  Revenue_aggregate: Revenue_Aggregate;
  /** fetch data from the table: "Revenue" using primary key columns */
  Revenue_by_pk?: Maybe<Revenue>;
  /** fetch data from the table: "Shopper_Availability" */
  Shopper_Availability: Array<Shopper_Availability>;
  /** fetch aggregated fields from the table: "Shopper_Availability" */
  Shopper_Availability_aggregate: Shopper_Availability_Aggregate;
  /** fetch data from the table: "Shopper_Availability" using primary key columns */
  Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** An array relationship */
  Shops: Array<Shops>;
  /** An aggregate relationship */
  Shops_aggregate: Shops_Aggregate;
  /** fetch data from the table: "Shops" using primary key columns */
  Shops_by_pk?: Maybe<Shops>;
  /** fetch data from the table: "System_Logs" */
  System_Logs: Array<System_Logs>;
  /** fetch aggregated fields from the table: "System_Logs" */
  System_Logs_aggregate: System_Logs_Aggregate;
  /** fetch data from the table: "System_Logs" using primary key columns */
  System_Logs_by_pk?: Maybe<System_Logs>;
  /** fetch data from the table: "System_configuratioins" */
  System_configuratioins: Array<System_Configuratioins>;
  /** fetch aggregated fields from the table: "System_configuratioins" */
  System_configuratioins_aggregate: System_Configuratioins_Aggregate;
  /** fetch data from the table: "System_configuratioins" using primary key columns */
  System_configuratioins_by_pk?: Maybe<System_Configuratioins>;
  /** fetch data from the table: "Users" */
  Users: Array<Users>;
  /** fetch aggregated fields from the table: "Users" */
  Users_aggregate: Users_Aggregate;
  /** fetch data from the table: "Users" using primary key columns */
  Users_by_pk?: Maybe<Users>;
  /** An array relationship */
  Wallet_Transactions: Array<Wallet_Transactions>;
  /** An aggregate relationship */
  Wallet_Transactions_aggregate: Wallet_Transactions_Aggregate;
  /** fetch data from the table: "Wallet_Transactions" using primary key columns */
  Wallet_Transactions_by_pk?: Maybe<Wallet_Transactions>;
  /** An array relationship */
  Wallets: Array<Wallets>;
  /** An aggregate relationship */
  Wallets_aggregate: Wallets_Aggregate;
  /** fetch data from the table: "Wallets" using primary key columns */
  Wallets_by_pk?: Maybe<Wallets>;
  /** An array relationship */
  paymentCards: Array<PaymentCards>;
  /** An aggregate relationship */
  paymentCards_aggregate: PaymentCards_Aggregate;
  /** fetch data from the table: "paymentCards" using primary key columns */
  paymentCards_by_pk?: Maybe<PaymentCards>;
  /** fetch data from the table: "promotions" */
  promotions: Array<Promotions>;
  /** fetch aggregated fields from the table: "promotions" */
  promotions_aggregate: Promotions_Aggregate;
  /** fetch data from the table: "promotions" using primary key columns */
  promotions_by_pk?: Maybe<Promotions>;
  /** fetch data from the table: "shoppers" */
  shoppers: Array<Shoppers>;
  /** fetch aggregated fields from the table: "shoppers" */
  shoppers_aggregate: Shoppers_Aggregate;
  /** fetch data from the table: "shoppers" using primary key columns */
  shoppers_by_pk?: Maybe<Shoppers>;
  /** An array relationship */
  tickets: Array<Tickets>;
  /** An aggregate relationship */
  tickets_aggregate: Tickets_Aggregate;
  /** fetch data from the table: "tickets" using primary key columns */
  tickets_by_pk?: Maybe<Tickets>;
  /** fetch data from the table: "vehicles" */
  vehicles: Array<Vehicles>;
  /** fetch aggregated fields from the table: "vehicles" */
  vehicles_aggregate: Vehicles_Aggregate;
  /** fetch data from the table: "vehicles" using primary key columns */
  vehicles_by_pk?: Maybe<Vehicles>;
};


export type Query_RootAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


export type Query_RootAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


export type Query_RootAddresses_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


export type Query_RootCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


export type Query_RootCart_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


export type Query_RootCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


export type Query_RootCarts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootCategoriesArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};


export type Query_RootCategories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};


export type Query_RootCategories_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


export type Query_RootDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


export type Query_RootDelivery_Issues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootInvoicesArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


export type Query_RootInvoices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


export type Query_RootInvoices_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Query_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Query_RootNotifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Query_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Query_RootOrder_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Query_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Query_RootOrders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPayment_MethodsArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


export type Query_RootPayment_Methods_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


export type Query_RootPayment_Methods_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPlatform_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};


export type Query_RootPlatform_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};


export type Query_RootPlatform_Settings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Query_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Query_RootProducts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootRatingsArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


export type Query_RootRatings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


export type Query_RootRatings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootReelsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


export type Query_RootReels_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


export type Query_RootReels_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootReels_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


export type Query_RootReels_Comments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


export type Query_RootReels_Comments_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootRefundsArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


export type Query_RootRefunds_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


export type Query_RootRefunds_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootRestaurantsArgs = {
  distinct_on?: InputMaybe<Array<Restaurants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Restaurants_Order_By>>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};


export type Query_RootRestaurants_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Restaurants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Restaurants_Order_By>>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};


export type Query_RootRestaurants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootRevenueArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


export type Query_RootRevenue_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


export type Query_RootRevenue_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootShopper_AvailabilityArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


export type Query_RootShopper_Availability_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


export type Query_RootShopper_Availability_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


export type Query_RootShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


export type Query_RootShops_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootSystem_LogsArgs = {
  distinct_on?: InputMaybe<Array<System_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Logs_Order_By>>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};


export type Query_RootSystem_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Logs_Order_By>>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};


export type Query_RootSystem_Logs_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootSystem_ConfiguratioinsArgs = {
  distinct_on?: InputMaybe<Array<System_Configuratioins_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Configuratioins_Order_By>>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};


export type Query_RootSystem_Configuratioins_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Configuratioins_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Configuratioins_Order_By>>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};


export type Query_RootSystem_Configuratioins_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootWallet_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


export type Query_RootWallet_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


export type Query_RootWallet_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootWalletsArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


export type Query_RootWallets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


export type Query_RootWallets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPaymentCardsArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


export type Query_RootPaymentCards_AggregateArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


export type Query_RootPaymentCards_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPromotionsArgs = {
  distinct_on?: InputMaybe<Array<Promotions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Promotions_Order_By>>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};


export type Query_RootPromotions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Promotions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Promotions_Order_By>>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};


export type Query_RootPromotions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootShoppersArgs = {
  distinct_on?: InputMaybe<Array<Shoppers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shoppers_Order_By>>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};


export type Query_RootShoppers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shoppers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shoppers_Order_By>>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};


export type Query_RootShoppers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTicketsArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


export type Query_RootTickets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


export type Query_RootTickets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVehiclesArgs = {
  distinct_on?: InputMaybe<Array<Vehicles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Vehicles_Order_By>>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};


export type Query_RootVehicles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Vehicles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Vehicles_Order_By>>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};


export type Query_RootVehicles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** columns and relationships of "shoppers" */
export type Shoppers = {
  Employment_id: Scalars['Int']['output'];
  /** An object relationship */
  User: Users;
  active: Scalars['Boolean']['output'];
  address: Scalars['String']['output'];
  background_check_completed: Scalars['Boolean']['output'];
  created_at: Scalars['timestamptz']['output'];
  driving_license?: Maybe<Scalars['String']['output']>;
  full_name: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  national_id: Scalars['String']['output'];
  onboarding_step: Scalars['String']['output'];
  phone_number: Scalars['String']['output'];
  profile_photo: Scalars['String']['output'];
  status: Scalars['String']['output'];
  transport_mode: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "shoppers" */
export type Shoppers_Aggregate = {
  aggregate?: Maybe<Shoppers_Aggregate_Fields>;
  nodes: Array<Shoppers>;
};

/** aggregate fields of "shoppers" */
export type Shoppers_Aggregate_Fields = {
  avg?: Maybe<Shoppers_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Shoppers_Max_Fields>;
  min?: Maybe<Shoppers_Min_Fields>;
  stddev?: Maybe<Shoppers_Stddev_Fields>;
  stddev_pop?: Maybe<Shoppers_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Shoppers_Stddev_Samp_Fields>;
  sum?: Maybe<Shoppers_Sum_Fields>;
  var_pop?: Maybe<Shoppers_Var_Pop_Fields>;
  var_samp?: Maybe<Shoppers_Var_Samp_Fields>;
  variance?: Maybe<Shoppers_Variance_Fields>;
};


/** aggregate fields of "shoppers" */
export type Shoppers_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Shoppers_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Shoppers_Avg_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "shoppers". All fields are combined with a logical 'AND'. */
export type Shoppers_Bool_Exp = {
  Employment_id?: InputMaybe<Int_Comparison_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Shoppers_Bool_Exp>>;
  _not?: InputMaybe<Shoppers_Bool_Exp>;
  _or?: InputMaybe<Array<Shoppers_Bool_Exp>>;
  active?: InputMaybe<Boolean_Comparison_Exp>;
  address?: InputMaybe<String_Comparison_Exp>;
  background_check_completed?: InputMaybe<Boolean_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  driving_license?: InputMaybe<String_Comparison_Exp>;
  full_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  national_id?: InputMaybe<String_Comparison_Exp>;
  onboarding_step?: InputMaybe<String_Comparison_Exp>;
  phone_number?: InputMaybe<String_Comparison_Exp>;
  profile_photo?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  transport_mode?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "shoppers" */
export type Shoppers_Constraint =
  /** unique or primary key constraint on columns "Employment_id" */
  | 'shoppers_Employment_id_key'
  /** unique or primary key constraint on columns "phone_number" */
  | 'shoppers_phone_number_key'
  /** unique or primary key constraint on columns "id" */
  | 'shoppers_pkey'
  /** unique or primary key constraint on columns "user_id" */
  | 'shoppers_user_id_key';

/** input type for incrementing numeric columns in table "shoppers" */
export type Shoppers_Inc_Input = {
  Employment_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "shoppers" */
export type Shoppers_Insert_Input = {
  Employment_id?: InputMaybe<Scalars['Int']['input']>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  background_check_completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  driving_license?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  national_id?: InputMaybe<Scalars['String']['input']>;
  onboarding_step?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_photo?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transport_mode?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Shoppers_Max_Fields = {
  Employment_id?: Maybe<Scalars['Int']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  driving_license?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  national_id?: Maybe<Scalars['String']['output']>;
  onboarding_step?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_photo?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transport_mode?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Shoppers_Min_Fields = {
  Employment_id?: Maybe<Scalars['Int']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  driving_license?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  national_id?: Maybe<Scalars['String']['output']>;
  onboarding_step?: Maybe<Scalars['String']['output']>;
  phone_number?: Maybe<Scalars['String']['output']>;
  profile_photo?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transport_mode?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "shoppers" */
export type Shoppers_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Shoppers>;
};

/** input type for inserting object relation for remote table "shoppers" */
export type Shoppers_Obj_Rel_Insert_Input = {
  data: Shoppers_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Shoppers_On_Conflict>;
};

/** on_conflict condition type for table "shoppers" */
export type Shoppers_On_Conflict = {
  constraint: Shoppers_Constraint;
  update_columns?: Array<Shoppers_Update_Column>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};

/** Ordering options when selecting data from "shoppers". */
export type Shoppers_Order_By = {
  Employment_id?: InputMaybe<Order_By>;
  User?: InputMaybe<Users_Order_By>;
  active?: InputMaybe<Order_By>;
  address?: InputMaybe<Order_By>;
  background_check_completed?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  driving_license?: InputMaybe<Order_By>;
  full_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  national_id?: InputMaybe<Order_By>;
  onboarding_step?: InputMaybe<Order_By>;
  phone_number?: InputMaybe<Order_By>;
  profile_photo?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  transport_mode?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: shoppers */
export type Shoppers_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "shoppers" */
export type Shoppers_Select_Column =
  /** column name */
  | 'Employment_id'
  /** column name */
  | 'active'
  /** column name */
  | 'address'
  /** column name */
  | 'background_check_completed'
  /** column name */
  | 'created_at'
  /** column name */
  | 'driving_license'
  /** column name */
  | 'full_name'
  /** column name */
  | 'id'
  /** column name */
  | 'national_id'
  /** column name */
  | 'onboarding_step'
  /** column name */
  | 'phone_number'
  /** column name */
  | 'profile_photo'
  /** column name */
  | 'status'
  /** column name */
  | 'transport_mode'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

/** input type for updating data in table "shoppers" */
export type Shoppers_Set_Input = {
  Employment_id?: InputMaybe<Scalars['Int']['input']>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  background_check_completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  driving_license?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  national_id?: InputMaybe<Scalars['String']['input']>;
  onboarding_step?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_photo?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transport_mode?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Shoppers_Stddev_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Shoppers_Stddev_Pop_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Shoppers_Stddev_Samp_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "shoppers" */
export type Shoppers_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Shoppers_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Shoppers_Stream_Cursor_Value_Input = {
  Employment_id?: InputMaybe<Scalars['Int']['input']>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  background_check_completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  driving_license?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  national_id?: InputMaybe<Scalars['String']['input']>;
  onboarding_step?: InputMaybe<Scalars['String']['input']>;
  phone_number?: InputMaybe<Scalars['String']['input']>;
  profile_photo?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  transport_mode?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Shoppers_Sum_Fields = {
  Employment_id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "shoppers" */
export type Shoppers_Update_Column =
  /** column name */
  | 'Employment_id'
  /** column name */
  | 'active'
  /** column name */
  | 'address'
  /** column name */
  | 'background_check_completed'
  /** column name */
  | 'created_at'
  /** column name */
  | 'driving_license'
  /** column name */
  | 'full_name'
  /** column name */
  | 'id'
  /** column name */
  | 'national_id'
  /** column name */
  | 'onboarding_step'
  /** column name */
  | 'phone_number'
  /** column name */
  | 'profile_photo'
  /** column name */
  | 'status'
  /** column name */
  | 'transport_mode'
  /** column name */
  | 'updated_at'
  /** column name */
  | 'user_id';

export type Shoppers_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Shoppers_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Shoppers_Set_Input>;
  /** filter the rows which have to be updated */
  where: Shoppers_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Shoppers_Var_Pop_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Shoppers_Var_Samp_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Shoppers_Variance_Fields = {
  Employment_id?: Maybe<Scalars['Float']['output']>;
};

export type Subscription_Root = {
  /** An array relationship */
  Addresses: Array<Addresses>;
  /** An aggregate relationship */
  Addresses_aggregate: Addresses_Aggregate;
  /** fetch data from the table: "Addresses" using primary key columns */
  Addresses_by_pk?: Maybe<Addresses>;
  /** fetch data from the table in a streaming manner: "Addresses" */
  Addresses_stream: Array<Addresses>;
  /** An array relationship */
  Cart_Items: Array<Cart_Items>;
  /** An aggregate relationship */
  Cart_Items_aggregate: Cart_Items_Aggregate;
  /** fetch data from the table: "Cart_Items" using primary key columns */
  Cart_Items_by_pk?: Maybe<Cart_Items>;
  /** fetch data from the table in a streaming manner: "Cart_Items" */
  Cart_Items_stream: Array<Cart_Items>;
  /** An array relationship */
  Carts: Array<Carts>;
  /** An aggregate relationship */
  Carts_aggregate: Carts_Aggregate;
  /** fetch data from the table: "Carts" using primary key columns */
  Carts_by_pk?: Maybe<Carts>;
  /** fetch data from the table in a streaming manner: "Carts" */
  Carts_stream: Array<Carts>;
  /** fetch data from the table: "Categories" */
  Categories: Array<Categories>;
  /** fetch aggregated fields from the table: "Categories" */
  Categories_aggregate: Categories_Aggregate;
  /** fetch data from the table: "Categories" using primary key columns */
  Categories_by_pk?: Maybe<Categories>;
  /** fetch data from the table in a streaming manner: "Categories" */
  Categories_stream: Array<Categories>;
  /** An array relationship */
  Delivery_Issues: Array<Delivery_Issues>;
  /** An aggregate relationship */
  Delivery_Issues_aggregate: Delivery_Issues_Aggregate;
  /** fetch data from the table: "Delivery_Issues" using primary key columns */
  Delivery_Issues_by_pk?: Maybe<Delivery_Issues>;
  /** fetch data from the table in a streaming manner: "Delivery_Issues" */
  Delivery_Issues_stream: Array<Delivery_Issues>;
  /** An array relationship */
  Invoices: Array<Invoices>;
  /** An aggregate relationship */
  Invoices_aggregate: Invoices_Aggregate;
  /** fetch data from the table: "Invoices" using primary key columns */
  Invoices_by_pk?: Maybe<Invoices>;
  /** fetch data from the table in a streaming manner: "Invoices" */
  Invoices_stream: Array<Invoices>;
  /** An array relationship */
  Notifications: Array<Notifications>;
  /** An aggregate relationship */
  Notifications_aggregate: Notifications_Aggregate;
  /** fetch data from the table: "Notifications" using primary key columns */
  Notifications_by_pk?: Maybe<Notifications>;
  /** fetch data from the table in a streaming manner: "Notifications" */
  Notifications_stream: Array<Notifications>;
  /** An array relationship */
  Order_Items: Array<Order_Items>;
  /** An aggregate relationship */
  Order_Items_aggregate: Order_Items_Aggregate;
  /** fetch data from the table: "Order_Items" using primary key columns */
  Order_Items_by_pk?: Maybe<Order_Items>;
  /** fetch data from the table in a streaming manner: "Order_Items" */
  Order_Items_stream: Array<Order_Items>;
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** fetch data from the table: "Orders" using primary key columns */
  Orders_by_pk?: Maybe<Orders>;
  /** fetch data from the table in a streaming manner: "Orders" */
  Orders_stream: Array<Orders>;
  /** An array relationship */
  Payment_Methods: Array<Payment_Methods>;
  /** An aggregate relationship */
  Payment_Methods_aggregate: Payment_Methods_Aggregate;
  /** fetch data from the table: "Payment_Methods" using primary key columns */
  Payment_Methods_by_pk?: Maybe<Payment_Methods>;
  /** fetch data from the table in a streaming manner: "Payment_Methods" */
  Payment_Methods_stream: Array<Payment_Methods>;
  /** fetch data from the table: "Platform_Settings" */
  Platform_Settings: Array<Platform_Settings>;
  /** fetch aggregated fields from the table: "Platform_Settings" */
  Platform_Settings_aggregate: Platform_Settings_Aggregate;
  /** fetch data from the table: "Platform_Settings" using primary key columns */
  Platform_Settings_by_pk?: Maybe<Platform_Settings>;
  /** fetch data from the table in a streaming manner: "Platform_Settings" */
  Platform_Settings_stream: Array<Platform_Settings>;
  /** An array relationship */
  Products: Array<Products>;
  /** An aggregate relationship */
  Products_aggregate: Products_Aggregate;
  /** fetch data from the table: "Products" using primary key columns */
  Products_by_pk?: Maybe<Products>;
  /** fetch data from the table in a streaming manner: "Products" */
  Products_stream: Array<Products>;
  /** An array relationship */
  Ratings: Array<Ratings>;
  /** An aggregate relationship */
  Ratings_aggregate: Ratings_Aggregate;
  /** fetch data from the table: "Ratings" using primary key columns */
  Ratings_by_pk?: Maybe<Ratings>;
  /** fetch data from the table in a streaming manner: "Ratings" */
  Ratings_stream: Array<Ratings>;
  /** An array relationship */
  Reels: Array<Reels>;
  /** An aggregate relationship */
  Reels_aggregate: Reels_Aggregate;
  /** fetch data from the table: "Reels" using primary key columns */
  Reels_by_pk?: Maybe<Reels>;
  /** An array relationship */
  Reels_comments: Array<Reels_Comments>;
  /** An aggregate relationship */
  Reels_comments_aggregate: Reels_Comments_Aggregate;
  /** fetch data from the table: "Reels_comments" using primary key columns */
  Reels_comments_by_pk?: Maybe<Reels_Comments>;
  /** fetch data from the table in a streaming manner: "Reels_comments" */
  Reels_comments_stream: Array<Reels_Comments>;
  /** fetch data from the table in a streaming manner: "Reels" */
  Reels_stream: Array<Reels>;
  /** An array relationship */
  Refunds: Array<Refunds>;
  /** An aggregate relationship */
  Refunds_aggregate: Refunds_Aggregate;
  /** fetch data from the table: "Refunds" using primary key columns */
  Refunds_by_pk?: Maybe<Refunds>;
  /** fetch data from the table in a streaming manner: "Refunds" */
  Refunds_stream: Array<Refunds>;
  /** fetch data from the table: "Restaurants" */
  Restaurants: Array<Restaurants>;
  /** fetch aggregated fields from the table: "Restaurants" */
  Restaurants_aggregate: Restaurants_Aggregate;
  /** fetch data from the table: "Restaurants" using primary key columns */
  Restaurants_by_pk?: Maybe<Restaurants>;
  /** fetch data from the table in a streaming manner: "Restaurants" */
  Restaurants_stream: Array<Restaurants>;
  /** fetch data from the table: "Revenue" */
  Revenue: Array<Revenue>;
  /** fetch aggregated fields from the table: "Revenue" */
  Revenue_aggregate: Revenue_Aggregate;
  /** fetch data from the table: "Revenue" using primary key columns */
  Revenue_by_pk?: Maybe<Revenue>;
  /** fetch data from the table in a streaming manner: "Revenue" */
  Revenue_stream: Array<Revenue>;
  /** fetch data from the table: "Shopper_Availability" */
  Shopper_Availability: Array<Shopper_Availability>;
  /** fetch aggregated fields from the table: "Shopper_Availability" */
  Shopper_Availability_aggregate: Shopper_Availability_Aggregate;
  /** fetch data from the table: "Shopper_Availability" using primary key columns */
  Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** fetch data from the table in a streaming manner: "Shopper_Availability" */
  Shopper_Availability_stream: Array<Shopper_Availability>;
  /** An array relationship */
  Shops: Array<Shops>;
  /** An aggregate relationship */
  Shops_aggregate: Shops_Aggregate;
  /** fetch data from the table: "Shops" using primary key columns */
  Shops_by_pk?: Maybe<Shops>;
  /** fetch data from the table in a streaming manner: "Shops" */
  Shops_stream: Array<Shops>;
  /** fetch data from the table: "System_Logs" */
  System_Logs: Array<System_Logs>;
  /** fetch aggregated fields from the table: "System_Logs" */
  System_Logs_aggregate: System_Logs_Aggregate;
  /** fetch data from the table: "System_Logs" using primary key columns */
  System_Logs_by_pk?: Maybe<System_Logs>;
  /** fetch data from the table in a streaming manner: "System_Logs" */
  System_Logs_stream: Array<System_Logs>;
  /** fetch data from the table: "System_configuratioins" */
  System_configuratioins: Array<System_Configuratioins>;
  /** fetch aggregated fields from the table: "System_configuratioins" */
  System_configuratioins_aggregate: System_Configuratioins_Aggregate;
  /** fetch data from the table: "System_configuratioins" using primary key columns */
  System_configuratioins_by_pk?: Maybe<System_Configuratioins>;
  /** fetch data from the table in a streaming manner: "System_configuratioins" */
  System_configuratioins_stream: Array<System_Configuratioins>;
  /** fetch data from the table: "Users" */
  Users: Array<Users>;
  /** fetch aggregated fields from the table: "Users" */
  Users_aggregate: Users_Aggregate;
  /** fetch data from the table: "Users" using primary key columns */
  Users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "Users" */
  Users_stream: Array<Users>;
  /** An array relationship */
  Wallet_Transactions: Array<Wallet_Transactions>;
  /** An aggregate relationship */
  Wallet_Transactions_aggregate: Wallet_Transactions_Aggregate;
  /** fetch data from the table: "Wallet_Transactions" using primary key columns */
  Wallet_Transactions_by_pk?: Maybe<Wallet_Transactions>;
  /** fetch data from the table in a streaming manner: "Wallet_Transactions" */
  Wallet_Transactions_stream: Array<Wallet_Transactions>;
  /** An array relationship */
  Wallets: Array<Wallets>;
  /** An aggregate relationship */
  Wallets_aggregate: Wallets_Aggregate;
  /** fetch data from the table: "Wallets" using primary key columns */
  Wallets_by_pk?: Maybe<Wallets>;
  /** fetch data from the table in a streaming manner: "Wallets" */
  Wallets_stream: Array<Wallets>;
  /** An array relationship */
  paymentCards: Array<PaymentCards>;
  /** An aggregate relationship */
  paymentCards_aggregate: PaymentCards_Aggregate;
  /** fetch data from the table: "paymentCards" using primary key columns */
  paymentCards_by_pk?: Maybe<PaymentCards>;
  /** fetch data from the table in a streaming manner: "paymentCards" */
  paymentCards_stream: Array<PaymentCards>;
  /** fetch data from the table: "promotions" */
  promotions: Array<Promotions>;
  /** fetch aggregated fields from the table: "promotions" */
  promotions_aggregate: Promotions_Aggregate;
  /** fetch data from the table: "promotions" using primary key columns */
  promotions_by_pk?: Maybe<Promotions>;
  /** fetch data from the table in a streaming manner: "promotions" */
  promotions_stream: Array<Promotions>;
  /** fetch data from the table: "shoppers" */
  shoppers: Array<Shoppers>;
  /** fetch aggregated fields from the table: "shoppers" */
  shoppers_aggregate: Shoppers_Aggregate;
  /** fetch data from the table: "shoppers" using primary key columns */
  shoppers_by_pk?: Maybe<Shoppers>;
  /** fetch data from the table in a streaming manner: "shoppers" */
  shoppers_stream: Array<Shoppers>;
  /** An array relationship */
  tickets: Array<Tickets>;
  /** An aggregate relationship */
  tickets_aggregate: Tickets_Aggregate;
  /** fetch data from the table: "tickets" using primary key columns */
  tickets_by_pk?: Maybe<Tickets>;
  /** fetch data from the table in a streaming manner: "tickets" */
  tickets_stream: Array<Tickets>;
  /** fetch data from the table: "vehicles" */
  vehicles: Array<Vehicles>;
  /** fetch aggregated fields from the table: "vehicles" */
  vehicles_aggregate: Vehicles_Aggregate;
  /** fetch data from the table: "vehicles" using primary key columns */
  vehicles_by_pk?: Maybe<Vehicles>;
  /** fetch data from the table in a streaming manner: "vehicles" */
  vehicles_stream: Array<Vehicles>;
};


export type Subscription_RootAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


export type Subscription_RootAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


export type Subscription_RootAddresses_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAddresses_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Addresses_Stream_Cursor_Input>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};


export type Subscription_RootCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


export type Subscription_RootCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


export type Subscription_RootCart_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootCart_Items_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Cart_Items_Stream_Cursor_Input>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};


export type Subscription_RootCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


export type Subscription_RootCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


export type Subscription_RootCarts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootCarts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Carts_Stream_Cursor_Input>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};


export type Subscription_RootCategoriesArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};


export type Subscription_RootCategories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};


export type Subscription_RootCategories_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootCategories_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Categories_Stream_Cursor_Input>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};


export type Subscription_RootDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


export type Subscription_RootDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


export type Subscription_RootDelivery_Issues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootDelivery_Issues_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Delivery_Issues_Stream_Cursor_Input>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};


export type Subscription_RootInvoicesArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


export type Subscription_RootInvoices_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Invoices_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Invoices_Order_By>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


export type Subscription_RootInvoices_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootInvoices_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Invoices_Stream_Cursor_Input>>;
  where?: InputMaybe<Invoices_Bool_Exp>;
};


export type Subscription_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootNotifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootNotifications_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Notifications_Stream_Cursor_Input>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrder_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootOrder_Items_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Order_Items_Stream_Cursor_Input>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootOrders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootOrders_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Orders_Stream_Cursor_Input>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootPayment_MethodsArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


export type Subscription_RootPayment_Methods_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


export type Subscription_RootPayment_Methods_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPayment_Methods_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Payment_Methods_Stream_Cursor_Input>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};


export type Subscription_RootPlatform_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};


export type Subscription_RootPlatform_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};


export type Subscription_RootPlatform_Settings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPlatform_Settings_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Platform_Settings_Stream_Cursor_Input>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};


export type Subscription_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootProducts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Products_Stream_Cursor_Input>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootRatingsArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


export type Subscription_RootRatings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ratings_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Ratings_Order_By>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


export type Subscription_RootRatings_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootRatings_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Ratings_Stream_Cursor_Input>>;
  where?: InputMaybe<Ratings_Bool_Exp>;
};


export type Subscription_RootReelsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


export type Subscription_RootReels_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Order_By>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


export type Subscription_RootReels_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootReels_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


export type Subscription_RootReels_Comments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reels_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reels_Comments_Order_By>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


export type Subscription_RootReels_Comments_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootReels_Comments_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Reels_Comments_Stream_Cursor_Input>>;
  where?: InputMaybe<Reels_Comments_Bool_Exp>;
};


export type Subscription_RootReels_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Reels_Stream_Cursor_Input>>;
  where?: InputMaybe<Reels_Bool_Exp>;
};


export type Subscription_RootRefundsArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


export type Subscription_RootRefunds_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Refunds_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Refunds_Order_By>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


export type Subscription_RootRefunds_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootRefunds_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Refunds_Stream_Cursor_Input>>;
  where?: InputMaybe<Refunds_Bool_Exp>;
};


export type Subscription_RootRestaurantsArgs = {
  distinct_on?: InputMaybe<Array<Restaurants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Restaurants_Order_By>>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};


export type Subscription_RootRestaurants_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Restaurants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Restaurants_Order_By>>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};


export type Subscription_RootRestaurants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootRestaurants_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Restaurants_Stream_Cursor_Input>>;
  where?: InputMaybe<Restaurants_Bool_Exp>;
};


export type Subscription_RootRevenueArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


export type Subscription_RootRevenue_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Revenue_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Revenue_Order_By>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


export type Subscription_RootRevenue_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootRevenue_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Revenue_Stream_Cursor_Input>>;
  where?: InputMaybe<Revenue_Bool_Exp>;
};


export type Subscription_RootShopper_AvailabilityArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


export type Subscription_RootShopper_Availability_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


export type Subscription_RootShopper_Availability_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootShopper_Availability_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Shopper_Availability_Stream_Cursor_Input>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};


export type Subscription_RootShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


export type Subscription_RootShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


export type Subscription_RootShops_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootShops_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Shops_Stream_Cursor_Input>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};


export type Subscription_RootSystem_LogsArgs = {
  distinct_on?: InputMaybe<Array<System_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Logs_Order_By>>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};


export type Subscription_RootSystem_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Logs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Logs_Order_By>>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};


export type Subscription_RootSystem_Logs_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootSystem_Logs_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<System_Logs_Stream_Cursor_Input>>;
  where?: InputMaybe<System_Logs_Bool_Exp>;
};


export type Subscription_RootSystem_ConfiguratioinsArgs = {
  distinct_on?: InputMaybe<Array<System_Configuratioins_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Configuratioins_Order_By>>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};


export type Subscription_RootSystem_Configuratioins_AggregateArgs = {
  distinct_on?: InputMaybe<Array<System_Configuratioins_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<System_Configuratioins_Order_By>>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};


export type Subscription_RootSystem_Configuratioins_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootSystem_Configuratioins_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<System_Configuratioins_Stream_Cursor_Input>>;
  where?: InputMaybe<System_Configuratioins_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootWallet_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


export type Subscription_RootWallet_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Transactions_Order_By>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


export type Subscription_RootWallet_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootWallet_Transactions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Wallet_Transactions_Stream_Cursor_Input>>;
  where?: InputMaybe<Wallet_Transactions_Bool_Exp>;
};


export type Subscription_RootWalletsArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


export type Subscription_RootWallets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallets_Order_By>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


export type Subscription_RootWallets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootWallets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Wallets_Stream_Cursor_Input>>;
  where?: InputMaybe<Wallets_Bool_Exp>;
};


export type Subscription_RootPaymentCardsArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


export type Subscription_RootPaymentCards_AggregateArgs = {
  distinct_on?: InputMaybe<Array<PaymentCards_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<PaymentCards_Order_By>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


export type Subscription_RootPaymentCards_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPaymentCards_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<PaymentCards_Stream_Cursor_Input>>;
  where?: InputMaybe<PaymentCards_Bool_Exp>;
};


export type Subscription_RootPromotionsArgs = {
  distinct_on?: InputMaybe<Array<Promotions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Promotions_Order_By>>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};


export type Subscription_RootPromotions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Promotions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Promotions_Order_By>>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};


export type Subscription_RootPromotions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPromotions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Promotions_Stream_Cursor_Input>>;
  where?: InputMaybe<Promotions_Bool_Exp>;
};


export type Subscription_RootShoppersArgs = {
  distinct_on?: InputMaybe<Array<Shoppers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shoppers_Order_By>>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};


export type Subscription_RootShoppers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shoppers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Shoppers_Order_By>>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};


export type Subscription_RootShoppers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootShoppers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Shoppers_Stream_Cursor_Input>>;
  where?: InputMaybe<Shoppers_Bool_Exp>;
};


export type Subscription_RootTicketsArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


export type Subscription_RootTickets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tickets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tickets_Order_By>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


export type Subscription_RootTickets_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTickets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Tickets_Stream_Cursor_Input>>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};


export type Subscription_RootVehiclesArgs = {
  distinct_on?: InputMaybe<Array<Vehicles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Vehicles_Order_By>>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};


export type Subscription_RootVehicles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Vehicles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Vehicles_Order_By>>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};


export type Subscription_RootVehicles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVehicles_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Vehicles_Stream_Cursor_Input>>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};

/** for shopper and other clients */
export type Tickets = {
  /** An object relationship */
  User?: Maybe<Users>;
  created_on: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  other_user_id?: Maybe<Scalars['uuid']['output']>;
  priority: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  ticket_num: Scalars['Int']['output'];
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregated selection of "tickets" */
export type Tickets_Aggregate = {
  aggregate?: Maybe<Tickets_Aggregate_Fields>;
  nodes: Array<Tickets>;
};

export type Tickets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Tickets_Aggregate_Bool_Exp_Count>;
};

export type Tickets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Tickets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Tickets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "tickets" */
export type Tickets_Aggregate_Fields = {
  avg?: Maybe<Tickets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Tickets_Max_Fields>;
  min?: Maybe<Tickets_Min_Fields>;
  stddev?: Maybe<Tickets_Stddev_Fields>;
  stddev_pop?: Maybe<Tickets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tickets_Stddev_Samp_Fields>;
  sum?: Maybe<Tickets_Sum_Fields>;
  var_pop?: Maybe<Tickets_Var_Pop_Fields>;
  var_samp?: Maybe<Tickets_Var_Samp_Fields>;
  variance?: Maybe<Tickets_Variance_Fields>;
};


/** aggregate fields of "tickets" */
export type Tickets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tickets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "tickets" */
export type Tickets_Aggregate_Order_By = {
  avg?: InputMaybe<Tickets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Tickets_Max_Order_By>;
  min?: InputMaybe<Tickets_Min_Order_By>;
  stddev?: InputMaybe<Tickets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Tickets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Tickets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Tickets_Sum_Order_By>;
  var_pop?: InputMaybe<Tickets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Tickets_Var_Samp_Order_By>;
  variance?: InputMaybe<Tickets_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "tickets" */
export type Tickets_Arr_Rel_Insert_Input = {
  data: Array<Tickets_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Tickets_On_Conflict>;
};

/** aggregate avg on columns */
export type Tickets_Avg_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "tickets" */
export type Tickets_Avg_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "tickets". All fields are combined with a logical 'AND'. */
export type Tickets_Bool_Exp = {
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Tickets_Bool_Exp>>;
  _not?: InputMaybe<Tickets_Bool_Exp>;
  _or?: InputMaybe<Array<Tickets_Bool_Exp>>;
  created_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  other_user_id?: InputMaybe<Uuid_Comparison_Exp>;
  priority?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  subject?: InputMaybe<String_Comparison_Exp>;
  ticket_num?: InputMaybe<Int_Comparison_Exp>;
  update_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "tickets" */
export type Tickets_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'tickets_pkey'
  /** unique or primary key constraint on columns "ticket_num" */
  | 'tickets_ticket_num_key';

/** input type for incrementing numeric columns in table "tickets" */
export type Tickets_Inc_Input = {
  ticket_num?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "tickets" */
export type Tickets_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  other_user_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  ticket_num?: InputMaybe<Scalars['Int']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Tickets_Max_Fields = {
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  other_user_id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  ticket_num?: Maybe<Scalars['Int']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "tickets" */
export type Tickets_Max_Order_By = {
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  other_user_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subject?: InputMaybe<Order_By>;
  ticket_num?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Tickets_Min_Fields = {
  created_on?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  other_user_id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  ticket_num?: Maybe<Scalars['Int']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "tickets" */
export type Tickets_Min_Order_By = {
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  other_user_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subject?: InputMaybe<Order_By>;
  ticket_num?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "tickets" */
export type Tickets_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Tickets>;
};

/** on_conflict condition type for table "tickets" */
export type Tickets_On_Conflict = {
  constraint: Tickets_Constraint;
  update_columns?: Array<Tickets_Update_Column>;
  where?: InputMaybe<Tickets_Bool_Exp>;
};

/** Ordering options when selecting data from "tickets". */
export type Tickets_Order_By = {
  User?: InputMaybe<Users_Order_By>;
  created_on?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  other_user_id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subject?: InputMaybe<Order_By>;
  ticket_num?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: tickets */
export type Tickets_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "tickets" */
export type Tickets_Select_Column =
  /** column name */
  | 'created_on'
  /** column name */
  | 'id'
  /** column name */
  | 'other_user_id'
  /** column name */
  | 'priority'
  /** column name */
  | 'status'
  /** column name */
  | 'subject'
  /** column name */
  | 'ticket_num'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

/** input type for updating data in table "tickets" */
export type Tickets_Set_Input = {
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  other_user_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  ticket_num?: InputMaybe<Scalars['Int']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Tickets_Stddev_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "tickets" */
export type Tickets_Stddev_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Tickets_Stddev_Pop_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "tickets" */
export type Tickets_Stddev_Pop_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Tickets_Stddev_Samp_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "tickets" */
export type Tickets_Stddev_Samp_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "tickets" */
export type Tickets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tickets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tickets_Stream_Cursor_Value_Input = {
  created_on?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  other_user_id?: InputMaybe<Scalars['uuid']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  ticket_num?: InputMaybe<Scalars['Int']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Tickets_Sum_Fields = {
  ticket_num?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "tickets" */
export type Tickets_Sum_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** update columns of table "tickets" */
export type Tickets_Update_Column =
  /** column name */
  | 'created_on'
  /** column name */
  | 'id'
  /** column name */
  | 'other_user_id'
  /** column name */
  | 'priority'
  /** column name */
  | 'status'
  /** column name */
  | 'subject'
  /** column name */
  | 'ticket_num'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

export type Tickets_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tickets_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tickets_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tickets_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tickets_Var_Pop_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "tickets" */
export type Tickets_Var_Pop_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Tickets_Var_Samp_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "tickets" */
export type Tickets_Var_Samp_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Tickets_Variance_Fields = {
  ticket_num?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "tickets" */
export type Tickets_Variance_Order_By = {
  ticket_num?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Boolean expression to compare columns of type "timetz". All fields are combined with logical 'AND'. */
export type Timetz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timetz']['input']>;
  _gt?: InputMaybe<Scalars['timetz']['input']>;
  _gte?: InputMaybe<Scalars['timetz']['input']>;
  _in?: InputMaybe<Array<Scalars['timetz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timetz']['input']>;
  _lte?: InputMaybe<Scalars['timetz']['input']>;
  _neq?: InputMaybe<Scalars['timetz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timetz']['input']>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

/** columns and relationships of "vehicles" */
export type Vehicles = {
  /** An object relationship */
  User: Users;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  model: Scalars['String']['output'];
  photo: Scalars['String']['output'];
  plate_number: Scalars['String']['output'];
  type: Scalars['String']['output'];
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "vehicles" */
export type Vehicles_Aggregate = {
  aggregate?: Maybe<Vehicles_Aggregate_Fields>;
  nodes: Array<Vehicles>;
};

/** aggregate fields of "vehicles" */
export type Vehicles_Aggregate_Fields = {
  count: Scalars['Int']['output'];
  max?: Maybe<Vehicles_Max_Fields>;
  min?: Maybe<Vehicles_Min_Fields>;
};


/** aggregate fields of "vehicles" */
export type Vehicles_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Vehicles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "vehicles". All fields are combined with a logical 'AND'. */
export type Vehicles_Bool_Exp = {
  User?: InputMaybe<Users_Bool_Exp>;
  _and?: InputMaybe<Array<Vehicles_Bool_Exp>>;
  _not?: InputMaybe<Vehicles_Bool_Exp>;
  _or?: InputMaybe<Array<Vehicles_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  model?: InputMaybe<String_Comparison_Exp>;
  photo?: InputMaybe<String_Comparison_Exp>;
  plate_number?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  update_on?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "vehicles" */
export type Vehicles_Constraint =
  /** unique or primary key constraint on columns "id" */
  | 'vehicles_pkey'
  /** unique or primary key constraint on columns "plate_number" */
  | 'vehicles_plate_number_key'
  /** unique or primary key constraint on columns "user_id" */
  | 'vehicles_user_id_key';

/** input type for inserting data into table "vehicles" */
export type Vehicles_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['String']['input']>;
  plate_number?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Vehicles_Max_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  plate_number?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Vehicles_Min_Fields = {
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  plate_number?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  update_on?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "vehicles" */
export type Vehicles_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Vehicles>;
};

/** input type for inserting object relation for remote table "vehicles" */
export type Vehicles_Obj_Rel_Insert_Input = {
  data: Vehicles_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Vehicles_On_Conflict>;
};

/** on_conflict condition type for table "vehicles" */
export type Vehicles_On_Conflict = {
  constraint: Vehicles_Constraint;
  update_columns?: Array<Vehicles_Update_Column>;
  where?: InputMaybe<Vehicles_Bool_Exp>;
};

/** Ordering options when selecting data from "vehicles". */
export type Vehicles_Order_By = {
  User?: InputMaybe<Users_Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  model?: InputMaybe<Order_By>;
  photo?: InputMaybe<Order_By>;
  plate_number?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  update_on?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: vehicles */
export type Vehicles_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "vehicles" */
export type Vehicles_Select_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'model'
  /** column name */
  | 'photo'
  /** column name */
  | 'plate_number'
  /** column name */
  | 'type'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

/** input type for updating data in table "vehicles" */
export type Vehicles_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['String']['input']>;
  plate_number?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "vehicles" */
export type Vehicles_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Vehicles_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Vehicles_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['String']['input']>;
  plate_number?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  update_on?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "vehicles" */
export type Vehicles_Update_Column =
  /** column name */
  | 'created_at'
  /** column name */
  | 'id'
  /** column name */
  | 'model'
  /** column name */
  | 'photo'
  /** column name */
  | 'plate_number'
  /** column name */
  | 'type'
  /** column name */
  | 'update_on'
  /** column name */
  | 'user_id';

export type Vehicles_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Vehicles_Set_Input>;
  /** filter the rows which have to be updated */
  where: Vehicles_Bool_Exp;
};

export type GetAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAddressesQuery = { Addresses: Array<{ id: string, user_id: string, street: string, city: string, postal_code?: string | null, latitude: string, longitude: string, is_default: boolean, created_at: string, updated_at?: string | null }> };

export type GetCartItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartItemsQuery = { Cart_Items: Array<{ id: string, cart_id: string, product_id: string, quantity: number, price: string, created_at: string, updated_at?: string | null, Cart: { created_at: string, id: string, is_active: boolean, shop_id: string, total: string, updated_at?: string | null, user_id: string }, Product: { category: string, created_at: string, description: string, id: string, image?: string | null, is_active: boolean, measurement_unit: string, name: string, price: string, quantity: number, shop_id: string, updated_at?: string | null } }> };

export type GetCartsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartsQuery = { Carts: Array<{ id: string, user_id: string, total: string, created_at: string, updated_at?: string | null, is_active: boolean, shop_id: string, User: { created_at: string, email: string, gender: string, id: string, is_active: boolean, name: string, password_hash: string, phone: string, profile_picture?: string | null, role: string, updated_at?: string | null } }> };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { Categories: Array<{ id: string, name: string, description: string, image: string, created_at: string, is_active: boolean, Shops: Array<{ updated_at?: string | null, operating_hours: any, name: string, longitude: string, latitude: string, is_active: boolean, image: string, id: string, description: string, created_at: string, category_id: string, address: string }> }> };

export type GetDeliveryIssuesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDeliveryIssuesQuery = { Delivery_Issues: Array<{ id: string, order_id: string, shopper_id: string, issue_type: string, description: string, status: string, created_at: string, updated_at?: string | null, Order: { combined_order_id?: string | null, created_at: string, delivery_address_id: string, delivery_notes?: string | null, delivery_photo_url?: string | null, delivery_time?: string | null, id: string, shopper_id?: string | null, status: string, total: string, updated_at?: string | null, user_id: string }, User: { created_at: string, email: string, gender: string, id: string, is_active: boolean, name: string, password_hash: string, phone: string, profile_picture?: string | null, role: string, updated_at?: string | null } }> };

export type GetInvoiceDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInvoiceDetailsQuery = { Invoices: Array<{ created_at: string, customer_id: string, delivery_fee: string, discount: string, id: string, invoice_items: any, invoice_number: string, order_id: string, service_fee: string, status: string, subtotal: string, tax: string, total_amount: string }> };

export type AddInvoiceDetailsMutationVariables = Exact<{
  customer_id?: InputMaybe<Scalars['uuid']['input']>;
  delivery_fee?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  invoice_items?: InputMaybe<Scalars['jsonb']['input']>;
  invoice_number?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  service_fee?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  total_amount?: InputMaybe<Scalars['String']['input']>;
}>;


export type AddInvoiceDetailsMutation = { insert_Invoices?: { affected_rows: number } | null };

export type GetNotificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNotificationsQuery = { Notifications: Array<{ id: string, user_id: string, type: string, message: string, is_read: boolean, created_at: string, User: { created_at: string, email: string, gender: string, id: string, is_active: boolean, name: string, password_hash: string, phone: string, profile_picture?: string | null, role: string, updated_at?: string | null } }> };

export type GetOrderItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrderItemsQuery = { Order_Items: Array<{ id: string, order_id: string, product_id: string, quantity: number, price: string, created_at: string, Product: { category: string, created_at: string, description: string, id: string, image?: string | null, is_active: boolean, measurement_unit: string, name: string, price: string, quantity: number, shop_id: string, updated_at?: string | null }, Order: { user_id: string, updated_at?: string | null, total: string, shopper_id?: string | null, status: string, id: string, delivery_time?: string | null, delivery_photo_url?: string | null, delivery_notes?: string | null, delivery_address_id: string, created_at: string, combined_order_id?: string | null } }> };

export type GetOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrdersQuery = { Orders: Array<{ id: string, user_id: string, shopper_id?: string | null, total: string, status: string, delivery_address_id: string, delivery_photo_url?: string | null, delivery_notes?: string | null, created_at: string, updated_at?: string | null, delivery_time?: string | null, combined_order_id?: string | null, delivery_fee: string, service_fee: string, discount?: string | null, voucher_code?: string | null, OrderID: number, shop_id: string, Address: { city: string, created_at: string, id: string, is_default: boolean, latitude: string, longitude: string, postal_code?: string | null, street: string, updated_at?: string | null, user_id: string }, Delivery_Issues: Array<{ created_at: string, description: string, id: string, issue_type: string, order_id: string, shopper_id: string, status: string, updated_at?: string | null }>, Order_Items: Array<{ created_at: string, id: string, order_id: string, price: string, product_id: string, quantity: number }> }> };

export type GetPlatformSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPlatformSettingsQuery = { Platform_Settings: Array<{ id: string, key: string, value: any, created_at: string, updated_at: string }> };

export type GetProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProductsQuery = { Products: Array<{ id: string, name: string, description: string, shop_id: string, price: string, quantity: number, measurement_unit: string, final_price?: string | null, image?: string | null, category: string, created_at: string, updated_at?: string | null, is_active: boolean, Shop: { address: string, category_id: string, created_at: string, description: string, id: string, image: string, is_active: boolean, latitude: string, longitude: string, name: string, operating_hours: any, updated_at?: string | null }, Order_Items: Array<{ quantity: number, product_id: string, price: string, order_id: string, id: string, created_at: string }>, Cart_Items: Array<{ updated_at?: string | null, quantity: number, product_id: string, price: string, id: string, created_at: string, cart_id: string }> }> };

export type GetAllReelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllReelsQuery = { Reels: Array<{ category: string, created_on: string, description: string, id: string, isLiked: boolean, likes: string, restaurant_id: string, title: string, type: string, user_id: string, video_url: string, User: { email: string, gender: string, id: string, is_active: boolean, name: string, created_at: string, role: string, phone: string, profile_picture?: string | null }, Restaurant: { created_at: string, email: string, id: string, lat: string, location: string, long: string, name: string, phone: string, profile: string, verified: boolean }, Reels_comments: Array<{ user_id: string, text: string, reel_id: string, likes: string, isLiked: boolean, id: string, created_on: string, User: { gender: string, email: string, name: string, phone: string, role: string } }> }> };

export type AddReelsMutationVariables = Exact<{
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  likes?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['uuid']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type AddReelsMutation = { insert_Reels?: { affected_rows: number } | null };

export type GetShopperAvailabilityQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShopperAvailabilityQuery = { Shopper_Availability: Array<{ id: string, user_id: string, day_of_week: number, start_time: any, end_time: any, is_available: boolean, created_at: string, updated_at?: string | null }> };

export type GetShopsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShopsQuery = { Shops: Array<{ id: string, name: string, description: string, category_id: string, image: string, address: string, latitude: string, longitude: string, operating_hours: any, created_at: string, updated_at?: string | null, is_active: boolean }> };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { Users: Array<{ id: string, name: string, email: string, phone: string, role: string, password_hash: string, created_at: string, updated_at?: string | null, profile_picture?: string | null, is_active: boolean }> };

export type AddCartMutationVariables = Exact<{
  total?: InputMaybe<Scalars['String']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type AddCartMutation = { insert_Carts?: { affected_rows: number } | null };

export type AddItemsToCartMutationVariables = Exact<{
  total?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  shop_id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type AddItemsToCartMutation = { insert_Carts?: { affected_rows: number } | null };

export type GetPaymentMethodQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPaymentMethodQuery = { Payment_Methods: Array<{ validity?: string | null, user_id: string, update_on?: string | null, number: string, names: string, method: string, is_default: boolean, id: string, create_at: string, CCV?: string | null }> };

export type GetRevenueQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRevenueQuery = { Revenue: Array<{ amount: string, created_at: string, id: string, order_id: string, type: string, Order: { OrderID: number, combined_order_id?: string | null, created_at: string, delivery_address_id: string, delivery_fee: string, delivery_notes?: string | null, delivery_photo_url?: string | null, delivery_time?: string | null, discount?: string | null, found: boolean, total: string, updated_at?: string | null, status: string, shopper_id?: string | null, shop_id: string, service_fee: string, id: string, user_id: string, voucher_code?: string | null } }> };

export type GetShopperInformationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShopperInformationQuery = { shoppers: Array<{ Employment_id: number, address: string, background_check_completed: boolean, created_at: string, driving_license?: string | null, full_name: string, id: string, national_id: string, onboarding_step: string, phone_number: string, profile_photo: string, status: string, transport_mode: string, updated_at?: string | null, user_id: string, active: boolean }> };

export type GetShopperRatingQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShopperRatingQuery = { Ratings: Array<{ created_at: string, customer_id: string, delivery_experience?: string | null, id: string, order_id: string, packaging_quality?: string | null, professionalism?: string | null, rating: number, review: string, reviewed_at?: string | null, shopper_id: string, updated_at?: string | null }> };

export type GetSystemConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemConfigurationQuery = { System_configuratioins: Array<{ baseDeliveryFee: string, currency: string, discounts: boolean, id: string, serviceFee: string, shoppingTime: string, unitsSurcharge: string, extraUnits: string, cappedDistanceFee: string }> };

export type GetRatingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRatingsQuery = { Ratings: Array<{ created_at: string, customer_id: string, delivery_experience?: string | null, id: string, order_id: string, packaging_quality?: string | null, professionalism?: string | null, rating: number, review: string, reviewed_at?: string | null, shopper_id: string, updated_at?: string | null, Order: { OrderID: number, combined_order_id?: string | null, id: string, found: boolean, discount?: string | null, delivery_time?: string | null, delivery_photo_url?: string | null, delivery_notes?: string | null, delivery_fee: string, delivery_address_id: string, created_at: string, updated_at?: string | null, total: string, status: string, shop_id: string, shopper_id?: string | null, service_fee: string, voucher_code?: string | null, user_id: string } }> };

export type CheckOrderRatingQueryVariables = Exact<{
  orderId: Scalars['uuid']['input'];
}>;


export type CheckOrderRatingQuery = { Ratings: Array<{ id: string }> };

export type GetAllREfundsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllREfundsQuery = { Refunds: Array<{ created_at: string, generated_by: string, id: string, order_id: string, paid: boolean, reason: string, amount: string, status: string, update_on?: string | null, user_id: string }> };

export type RegisterShopperMutationVariables = Exact<{
  full_name: Scalars['String']['input'];
  address: Scalars['String']['input'];
  phone_number: Scalars['String']['input'];
  national_id: Scalars['String']['input'];
  driving_license?: InputMaybe<Scalars['String']['input']>;
  transport_mode: Scalars['String']['input'];
  profile_photo?: InputMaybe<Scalars['String']['input']>;
  user_id: Scalars['uuid']['input'];
}>;


export type RegisterShopperMutation = { insert_shoppers_one?: { id: string, status: string, active: boolean, onboarding_step: string } | null };

export type GetSystemLogsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSystemLogsQuery = { System_Logs: Array<{ time: string, type: string, message?: string | null, id: string, details?: string | null, create_at: string, component: string }> };

export type InsertSystemLogMutationVariables = Exact<{
  type: Scalars['String']['input'];
  message: Scalars['String']['input'];
  component: Scalars['String']['input'];
  details: Scalars['String']['input'];
  time: Scalars['String']['input'];
}>;


export type InsertSystemLogMutation = { insert_System_Logs_one?: { id: string, type: string, message?: string | null, component: string, details?: string | null, time: string } | null };

export type ClearSystemLogsMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearSystemLogsMutation = { delete_System_Logs?: { affected_rows: number } | null };

export type GetAllWallettTtransactionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWallettTtransactionsQuery = { Wallet_Transactions: Array<{ wallet_id: string, type: string, status: string, related_order_id?: string | null, id: string, created_at: string, amount: string, Wallet: { shopper_id: string, reserved_balance: string, last_updated: string, id: string, available_balance: string }, Order?: { OrderID: number, updated_at?: string | null, user_id: string, voucher_code?: string | null, total: string, status: string, shopper_id?: string | null, shop_id: string, service_fee: string, id: string, found: boolean, discount?: string | null, delivery_time?: string | null, delivery_photo_url?: string | null, delivery_notes?: string | null, delivery_fee: string, delivery_address_id: string, created_at: string, combined_order_id?: string | null } | null }> };

export type CreateWalletTransactionMutationVariables = Exact<{
  amount: Scalars['String']['input'];
  type: Scalars['String']['input'];
  status: Scalars['String']['input'];
  wallet_id: Scalars['uuid']['input'];
  related_order_id?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type CreateWalletTransactionMutation = { insert_Wallet_Transactions_one?: { id: string, amount: string, type: string, status: string, created_at: string, wallet_id: string, related_order_id?: string | null } | null };

export type CreateMultipleWalletTransactionsMutationVariables = Exact<{
  transactions: Array<Wallet_Transactions_Insert_Input> | Wallet_Transactions_Insert_Input;
}>;


export type CreateMultipleWalletTransactionsMutation = { insert_Wallet_Transactions?: { affected_rows: number, returning: Array<{ id: string, amount: string, type: string, status: string, created_at: string, wallet_id: string, related_order_id?: string | null }> } | null };

export type GetAllwalletsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllwalletsQuery = { Wallets: Array<{ shopper_id: string, reserved_balance: string, last_updated: string, id: string, available_balance: string, User: { created_at: string, email: string, gender: string, id: string, is_active: boolean, name: string, password_hash: string, phone: string, profile_picture?: string | null, role: string, updated_at?: string | null }, Wallet_Transactions: Array<{ amount: string, created_at: string, id: string, related_order_id?: string | null, status: string, type: string, wallet_id: string }> }> };

export type GetShopperWalletQueryVariables = Exact<{
  shopper_id: Scalars['uuid']['input'];
}>;


export type GetShopperWalletQuery = { Wallets: Array<{ id: string, shopper_id: string, available_balance: string, reserved_balance: string, last_updated: string }> };

export type CreateWalletMutationVariables = Exact<{
  shopper_id: Scalars['uuid']['input'];
}>;


export type CreateWalletMutation = { insert_Wallets_one?: { id: string, shopper_id: string, available_balance: string, reserved_balance: string, last_updated: string } | null };

export type UpdateWalletBalancesMutationVariables = Exact<{
  wallet_id: Scalars['uuid']['input'];
  available_balance: Scalars['String']['input'];
  reserved_balance: Scalars['String']['input'];
}>;


export type UpdateWalletBalancesMutation = { update_Wallets_by_pk?: { id: string, available_balance: string, reserved_balance: string, last_updated: string } | null };


export const GetAddressesDocument = gql`
    query GetAddresses {
  Addresses {
    id
    user_id
    street
    city
    postal_code
    latitude
    longitude
    is_default
    created_at
    updated_at
  }
}
    `;
export const GetCartItemsDocument = gql`
    query GetCartItems {
  Cart_Items {
    id
    cart_id
    product_id
    quantity
    price
    created_at
    updated_at
    Cart {
      created_at
      id
      is_active
      shop_id
      total
      updated_at
      user_id
    }
    Product {
      category
      created_at
      description
      id
      image
      is_active
      measurement_unit
      name
      price
      quantity
      shop_id
      updated_at
    }
  }
}
    `;
export const GetCartsDocument = gql`
    query GetCarts {
  Carts {
    id
    user_id
    total
    created_at
    updated_at
    is_active
    shop_id
    User {
      created_at
      email
      gender
      id
      is_active
      name
      password_hash
      phone
      profile_picture
      role
      updated_at
    }
  }
}
    `;
export const GetCategoriesDocument = gql`
    query GetCategories {
  Categories {
    id
    name
    description
    image
    created_at
    is_active
    Shops {
      updated_at
      operating_hours
      name
      longitude
      latitude
      is_active
      image
      id
      description
      created_at
      category_id
      address
    }
  }
}
    `;
export const GetDeliveryIssuesDocument = gql`
    query GetDeliveryIssues {
  Delivery_Issues {
    id
    order_id
    shopper_id
    issue_type
    description
    status
    created_at
    updated_at
    Order {
      combined_order_id
      created_at
      delivery_address_id
      delivery_notes
      delivery_photo_url
      delivery_time
      id
      shopper_id
      status
      total
      updated_at
      user_id
    }
    User {
      created_at
      email
      gender
      id
      is_active
      name
      password_hash
      phone
      profile_picture
      role
      updated_at
    }
  }
}
    `;
export const GetInvoiceDetailsDocument = gql`
    query GetInvoiceDetails {
  Invoices {
    created_at
    customer_id
    delivery_fee
    discount
    id
    invoice_items
    invoice_number
    order_id
    service_fee
    status
    subtotal
    tax
    total_amount
  }
}
    `;
export const AddInvoiceDetailsDocument = gql`
    mutation addInvoiceDetails($customer_id: uuid = "", $delivery_fee: String = "", $discount: String = "", $invoice_items: jsonb = "", $invoice_number: String = "", $order_id: uuid = "", $service_fee: String = "", $status: String = "", $subtotal: String = "", $tax: String = "", $total_amount: String = "") {
  insert_Invoices(
    objects: {customer_id: $customer_id, delivery_fee: $delivery_fee, discount: $discount, invoice_items: $invoice_items, invoice_number: $invoice_number, order_id: $order_id, service_fee: $service_fee, status: $status, subtotal: $subtotal, tax: $tax, total_amount: $total_amount}
  ) {
    affected_rows
  }
}
    `;
export const GetNotificationsDocument = gql`
    query GetNotifications {
  Notifications {
    id
    user_id
    type
    message
    is_read
    created_at
    User {
      created_at
      email
      gender
      id
      is_active
      name
      password_hash
      phone
      profile_picture
      role
      updated_at
    }
  }
}
    `;
export const GetOrderItemsDocument = gql`
    query GetOrderItems {
  Order_Items {
    id
    order_id
    product_id
    quantity
    price
    created_at
    Product {
      category
      created_at
      description
      id
      image
      is_active
      measurement_unit
      name
      price
      quantity
      shop_id
      updated_at
    }
    Order {
      user_id
      updated_at
      total
      shopper_id
      status
      id
      delivery_time
      delivery_photo_url
      delivery_notes
      delivery_address_id
      created_at
      combined_order_id
    }
  }
}
    `;
export const GetOrdersDocument = gql`
    query GetOrders {
  Orders {
    id
    user_id
    shopper_id
    total
    status
    delivery_address_id
    delivery_photo_url
    delivery_notes
    created_at
    updated_at
    delivery_time
    combined_order_id
    Address {
      city
      created_at
      id
      is_default
      latitude
      longitude
      postal_code
      street
      updated_at
      user_id
    }
    Delivery_Issues {
      created_at
      description
      id
      issue_type
      order_id
      shopper_id
      status
      updated_at
    }
    Order_Items {
      created_at
      id
      order_id
      price
      product_id
      quantity
    }
    delivery_fee
    service_fee
    discount
    voucher_code
    OrderID
    shop_id
  }
}
    `;
export const GetPlatformSettingsDocument = gql`
    query GetPlatformSettings {
  Platform_Settings {
    id
    key
    value
    created_at
    updated_at
  }
}
    `;
export const GetProductsDocument = gql`
    query GetProducts {
  Products {
    id
    name
    description
    shop_id
    price
    quantity
    measurement_unit
    final_price
    image
    category
    created_at
    updated_at
    is_active
    Shop {
      address
      category_id
      created_at
      description
      id
      image
      is_active
      latitude
      longitude
      name
      operating_hours
      updated_at
    }
    Order_Items {
      quantity
      product_id
      price
      order_id
      id
      created_at
    }
    Cart_Items {
      updated_at
      quantity
      product_id
      price
      id
      created_at
      cart_id
    }
  }
}
    `;
export const GetAllReelsDocument = gql`
    query GetAllReels {
  Reels {
    category
    created_on
    description
    id
    isLiked
    likes
    restaurant_id
    title
    type
    user_id
    video_url
    User {
      email
      gender
      id
      is_active
      name
      created_at
      role
      phone
      profile_picture
    }
    Restaurant {
      created_at
      email
      id
      lat
      location
      long
      name
      phone
      profile
      verified
    }
    Reels_comments {
      user_id
      text
      reel_id
      likes
      isLiked
      id
      created_on
      User {
        gender
        email
        name
        phone
        role
      }
    }
  }
}
    `;
export const AddReelsDocument = gql`
    mutation AddReels($category: String = "", $description: String = "", $likes: String = "", $restaurant_id: uuid = "", $title: String = "", $type: String = "", $video_url: String = "", $user_id: uuid = "") {
  insert_Reels(
    objects: {category: $category, description: $description, isLiked: false, likes: $likes, restaurant_id: $restaurant_id, title: $title, type: $type, video_url: $video_url, user_id: $user_id}
  ) {
    affected_rows
  }
}
    `;
export const GetShopperAvailabilityDocument = gql`
    query GetShopperAvailability {
  Shopper_Availability {
    id
    user_id
    day_of_week
    start_time
    end_time
    is_available
    created_at
    updated_at
  }
}
    `;
export const GetShopsDocument = gql`
    query GetShops {
  Shops {
    id
    name
    description
    category_id
    image
    address
    latitude
    longitude
    operating_hours
    created_at
    updated_at
    is_active
  }
}
    `;
export const GetUsersDocument = gql`
    query GetUsers {
  Users {
    id
    name
    email
    phone
    role
    password_hash
    created_at
    updated_at
    profile_picture
    is_active
  }
}
    `;
export const AddCartDocument = gql`
    mutation AddCart($total: String = "", $shop_id: uuid = "", $user_id: uuid = "") {
  insert_Carts(
    objects: {total: $total, is_active: true, shop_id: $shop_id, user_id: $user_id}
  ) {
    affected_rows
  }
}
    `;
export const AddItemsToCartDocument = gql`
    mutation AddItemsToCart($total: String = "", $is_active: Boolean = true, $shop_id: uuid = "", $user_id: uuid = "") {
  insert_Carts(
    objects: {total: $total, is_active: $is_active, shop_id: $shop_id, user_id: $user_id}
  ) {
    affected_rows
  }
}
    `;
export const GetPaymentMethodDocument = gql`
    query getPaymentMethod {
  Payment_Methods {
    validity
    user_id
    update_on
    number
    names
    method
    is_default
    id
    create_at
    CCV
  }
}
    `;
export const GetRevenueDocument = gql`
    query getRevenue {
  Revenue {
    amount
    created_at
    id
    order_id
    type
    Order {
      OrderID
      combined_order_id
      created_at
      delivery_address_id
      delivery_fee
      delivery_notes
      delivery_photo_url
      delivery_time
      discount
      found
      total
      updated_at
      status
      shopper_id
      shop_id
      service_fee
      id
      user_id
      voucher_code
    }
  }
}
    `;
export const GetShopperInformationDocument = gql`
    query getShopperInformation {
  shoppers {
    Employment_id
    address
    background_check_completed
    created_at
    driving_license
    full_name
    id
    national_id
    onboarding_step
    phone_number
    profile_photo
    status
    transport_mode
    updated_at
    user_id
    active
  }
}
    `;
export const GetShopperRatingDocument = gql`
    query getShopperRating {
  Ratings {
    created_at
    customer_id
    delivery_experience
    id
    order_id
    packaging_quality
    professionalism
    rating
    review
    reviewed_at
    shopper_id
    updated_at
  }
}
    `;
export const GetSystemConfigurationDocument = gql`
    query getSystemConfiguration {
  System_configuratioins {
    baseDeliveryFee
    currency
    discounts
    id
    serviceFee
    shoppingTime
    unitsSurcharge
    extraUnits
    cappedDistanceFee
  }
}
    `;
export const GetRatingsDocument = gql`
    query getRatings {
  Ratings {
    created_at
    customer_id
    delivery_experience
    id
    order_id
    packaging_quality
    professionalism
    rating
    review
    reviewed_at
    shopper_id
    updated_at
    Order {
      OrderID
      combined_order_id
      id
      found
      discount
      delivery_time
      delivery_photo_url
      delivery_notes
      delivery_fee
      delivery_address_id
      created_at
      updated_at
      total
      status
      shop_id
      shopper_id
      service_fee
      voucher_code
      user_id
    }
  }
}
    `;
export const CheckOrderRatingDocument = gql`
    query CheckOrderRating($orderId: uuid!) {
  Ratings(where: {order_id: {_eq: $orderId}}) {
    id
  }
}
    `;
export const GetAllREfundsDocument = gql`
    query getAllREfunds {
  Refunds {
    created_at
    generated_by
    id
    order_id
    paid
    reason
    amount
    status
    update_on
    user_id
  }
}
    `;
export const RegisterShopperDocument = gql`
    mutation RegisterShopper($full_name: String!, $address: String!, $phone_number: String!, $national_id: String!, $driving_license: String, $transport_mode: String!, $profile_photo: String, $user_id: uuid!) {
  insert_shoppers_one(
    object: {full_name: $full_name, address: $address, phone_number: $phone_number, national_id: $national_id, driving_license: $driving_license, transport_mode: $transport_mode, profile_photo: $profile_photo, status: "pending", active: false, background_check_completed: false, onboarding_step: "application_submitted", user_id: $user_id}
  ) {
    id
    status
    active
    onboarding_step
  }
}
    `;
export const GetSystemLogsDocument = gql`
    query getSystemLogs {
  System_Logs {
    time
    type
    message
    id
    details
    create_at
    component
  }
}
    `;
export const InsertSystemLogDocument = gql`
    mutation insertSystemLog($type: String!, $message: String!, $component: String!, $details: String!, $time: String!) {
  insert_System_Logs_one(
    object: {type: $type, message: $message, component: $component, details: $details, time: $time}
  ) {
    id
    type
    message
    component
    details
    time
  }
}
    `;
export const ClearSystemLogsDocument = gql`
    mutation clearSystemLogs {
  delete_System_Logs(where: {}) {
    affected_rows
  }
}
    `;
export const GetAllWallettTtransactionsDocument = gql`
    query getAllWallettTtransactions {
  Wallet_Transactions {
    wallet_id
    type
    status
    related_order_id
    id
    created_at
    amount
    Wallet {
      shopper_id
      reserved_balance
      last_updated
      id
      available_balance
    }
    Order {
      OrderID
      updated_at
      user_id
      voucher_code
      total
      status
      shopper_id
      shop_id
      service_fee
      id
      found
      discount
      delivery_time
      delivery_photo_url
      delivery_notes
      delivery_fee
      delivery_address_id
      created_at
      combined_order_id
    }
  }
}
    `;
export const CreateWalletTransactionDocument = gql`
    mutation createWalletTransaction($amount: String!, $type: String!, $status: String!, $wallet_id: uuid!, $related_order_id: uuid) {
  insert_Wallet_Transactions_one(
    object: {amount: $amount, type: $type, status: $status, wallet_id: $wallet_id, related_order_id: $related_order_id}
  ) {
    id
    amount
    type
    status
    created_at
    wallet_id
    related_order_id
  }
}
    `;
export const CreateMultipleWalletTransactionsDocument = gql`
    mutation createMultipleWalletTransactions($transactions: [Wallet_Transactions_insert_input!]!) {
  insert_Wallet_Transactions(objects: $transactions) {
    returning {
      id
      amount
      type
      status
      created_at
      wallet_id
      related_order_id
    }
    affected_rows
  }
}
    `;
export const GetAllwalletsDocument = gql`
    query getAllwallets {
  Wallets {
    shopper_id
    reserved_balance
    last_updated
    id
    available_balance
    User {
      created_at
      email
      gender
      id
      is_active
      name
      password_hash
      phone
      profile_picture
      role
      updated_at
    }
    Wallet_Transactions {
      amount
      created_at
      id
      related_order_id
      status
      type
      wallet_id
    }
  }
}
    `;
export const GetShopperWalletDocument = gql`
    query getShopperWallet($shopper_id: uuid!) {
  Wallets(where: {shopper_id: {_eq: $shopper_id}}) {
    id
    shopper_id
    available_balance
    reserved_balance
    last_updated
  }
}
    `;
export const CreateWalletDocument = gql`
    mutation createWallet($shopper_id: uuid!) {
  insert_Wallets_one(
    object: {shopper_id: $shopper_id, available_balance: "0", reserved_balance: "0"}
  ) {
    id
    shopper_id
    available_balance
    reserved_balance
    last_updated
  }
}
    `;
export const UpdateWalletBalancesDocument = gql`
    mutation updateWalletBalances($wallet_id: uuid!, $available_balance: String!, $reserved_balance: String!) {
  update_Wallets_by_pk(
    pk_columns: {id: $wallet_id}
    _set: {available_balance: $available_balance, reserved_balance: $reserved_balance, last_updated: "now()"}
  ) {
    id
    available_balance
    reserved_balance
    last_updated
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetAddresses(variables?: GetAddressesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressesQuery>(GetAddressesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetAddresses', 'query', variables);
    },
    GetCartItems(variables?: GetCartItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCartItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCartItemsQuery>(GetCartItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCartItems', 'query', variables);
    },
    GetCarts(variables?: GetCartsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCartsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCartsQuery>(GetCartsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCarts', 'query', variables);
    },
    GetCategories(variables?: GetCategoriesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCategoriesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCategoriesQuery>(GetCategoriesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCategories', 'query', variables);
    },
    GetDeliveryIssues(variables?: GetDeliveryIssuesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDeliveryIssuesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDeliveryIssuesQuery>(GetDeliveryIssuesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDeliveryIssues', 'query', variables);
    },
    GetInvoiceDetails(variables?: GetInvoiceDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetInvoiceDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetInvoiceDetailsQuery>(GetInvoiceDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetInvoiceDetails', 'query', variables);
    },
    addInvoiceDetails(variables?: AddInvoiceDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddInvoiceDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddInvoiceDetailsMutation>(AddInvoiceDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addInvoiceDetails', 'mutation', variables);
    },
    GetNotifications(variables?: GetNotificationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetNotificationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNotificationsQuery>(GetNotificationsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetNotifications', 'query', variables);
    },
    GetOrderItems(variables?: GetOrderItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetOrderItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOrderItemsQuery>(GetOrderItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetOrderItems', 'query', variables);
    },
    GetOrders(variables?: GetOrdersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetOrdersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOrdersQuery>(GetOrdersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetOrders', 'query', variables);
    },
    GetPlatformSettings(variables?: GetPlatformSettingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPlatformSettingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPlatformSettingsQuery>(GetPlatformSettingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPlatformSettings', 'query', variables);
    },
    GetProducts(variables?: GetProductsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetProductsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProductsQuery>(GetProductsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetProducts', 'query', variables);
    },
    GetAllReels(variables?: GetAllReelsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllReelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllReelsQuery>(GetAllReelsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetAllReels', 'query', variables);
    },
    AddReels(variables?: AddReelsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddReelsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReelsMutation>(AddReelsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddReels', 'mutation', variables);
    },
    GetShopperAvailability(variables?: GetShopperAvailabilityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetShopperAvailabilityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShopperAvailabilityQuery>(GetShopperAvailabilityDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetShopperAvailability', 'query', variables);
    },
    GetShops(variables?: GetShopsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetShopsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShopsQuery>(GetShopsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetShops', 'query', variables);
    },
    GetUsers(variables?: GetUsersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetUsersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUsersQuery>(GetUsersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetUsers', 'query', variables);
    },
    AddCart(variables?: AddCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCartMutation>(AddCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddCart', 'mutation', variables);
    },
    AddItemsToCart(variables?: AddItemsToCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddItemsToCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddItemsToCartMutation>(AddItemsToCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddItemsToCart', 'mutation', variables);
    },
    getPaymentMethod(variables?: GetPaymentMethodQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPaymentMethodQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPaymentMethodQuery>(GetPaymentMethodDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getPaymentMethod', 'query', variables);
    },
    getRevenue(variables?: GetRevenueQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRevenueQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRevenueQuery>(GetRevenueDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getRevenue', 'query', variables);
    },
    getShopperInformation(variables?: GetShopperInformationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetShopperInformationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShopperInformationQuery>(GetShopperInformationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getShopperInformation', 'query', variables);
    },
    getShopperRating(variables?: GetShopperRatingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetShopperRatingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShopperRatingQuery>(GetShopperRatingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getShopperRating', 'query', variables);
    },
    getSystemConfiguration(variables?: GetSystemConfigurationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSystemConfigurationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSystemConfigurationQuery>(GetSystemConfigurationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSystemConfiguration', 'query', variables);
    },
    getRatings(variables?: GetRatingsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRatingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRatingsQuery>(GetRatingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getRatings', 'query', variables);
    },
    CheckOrderRating(variables: CheckOrderRatingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CheckOrderRatingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CheckOrderRatingQuery>(CheckOrderRatingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CheckOrderRating', 'query', variables);
    },
    getAllREfunds(variables?: GetAllREfundsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllREfundsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllREfundsQuery>(GetAllREfundsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllREfunds', 'query', variables);
    },
    RegisterShopper(variables: RegisterShopperMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterShopperMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterShopperMutation>(RegisterShopperDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterShopper', 'mutation', variables);
    },
    getSystemLogs(variables?: GetSystemLogsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSystemLogsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSystemLogsQuery>(GetSystemLogsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getSystemLogs', 'query', variables);
    },
    insertSystemLog(variables: InsertSystemLogMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<InsertSystemLogMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InsertSystemLogMutation>(InsertSystemLogDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'insertSystemLog', 'mutation', variables);
    },
    clearSystemLogs(variables?: ClearSystemLogsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ClearSystemLogsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ClearSystemLogsMutation>(ClearSystemLogsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'clearSystemLogs', 'mutation', variables);
    },
    getAllWallettTtransactions(variables?: GetAllWallettTtransactionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllWallettTtransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllWallettTtransactionsQuery>(GetAllWallettTtransactionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllWallettTtransactions', 'query', variables);
    },
    createWalletTransaction(variables: CreateWalletTransactionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateWalletTransactionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWalletTransactionMutation>(CreateWalletTransactionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createWalletTransaction', 'mutation', variables);
    },
    createMultipleWalletTransactions(variables: CreateMultipleWalletTransactionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateMultipleWalletTransactionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateMultipleWalletTransactionsMutation>(CreateMultipleWalletTransactionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createMultipleWalletTransactions', 'mutation', variables);
    },
    getAllwallets(variables?: GetAllwalletsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllwalletsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllwalletsQuery>(GetAllwalletsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllwallets', 'query', variables);
    },
    getShopperWallet(variables: GetShopperWalletQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetShopperWalletQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetShopperWalletQuery>(GetShopperWalletDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getShopperWallet', 'query', variables);
    },
    createWallet(variables: CreateWalletMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateWalletMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWalletMutation>(CreateWalletDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createWallet', 'mutation', variables);
    },
    updateWalletBalances(variables: UpdateWalletBalancesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWalletBalancesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWalletBalancesMutation>(UpdateWalletBalancesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateWalletBalances', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;