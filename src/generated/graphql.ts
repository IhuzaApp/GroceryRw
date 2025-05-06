import { GraphQLClient, RequestOptions } from "graphql-request";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  json: { input: any; output: any };
  timestamptz: { input: string; output: string };
  timetz: { input: any; output: any };
  uuid: { input: string; output: string };
};

/** Addresses */
export type Addresses = {
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** An object relationship */
  User: Users;
  city: Scalars["String"]["output"];
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  is_default: Scalars["Boolean"]["output"];
  latitude: Scalars["String"]["output"];
  longitude: Scalars["String"]["output"];
  postal_code?: Maybe<Scalars["String"]["output"]>;
  street: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id: Scalars["uuid"]["output"];
};

/** Addresses */
export type AddressesOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** Addresses */
export type AddressesOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Addresses_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Addresses_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Addresses_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Addresses" */
export type Addresses_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Addresses_Max_Fields>;
  min?: Maybe<Addresses_Min_Fields>;
};

/** aggregate fields of "Addresses" */
export type Addresses_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Addresses_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  "Addresses_pkey";

/** input type for inserting data into table "Addresses" */
export type Addresses_Insert_Input = {
  Orders?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  postal_code?: InputMaybe<Scalars["String"]["input"]>;
  street?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Addresses_Max_Fields = {
  city?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  latitude?: Maybe<Scalars["String"]["output"]>;
  longitude?: Maybe<Scalars["String"]["output"]>;
  postal_code?: Maybe<Scalars["String"]["output"]>;
  street?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  city?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  latitude?: Maybe<Scalars["String"]["output"]>;
  longitude?: Maybe<Scalars["String"]["output"]>;
  postal_code?: Maybe<Scalars["String"]["output"]>;
  street?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Addresses" */
export type Addresses_Select_Column =
  /** column name */
  | "city"
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_default"
  /** column name */
  | "latitude"
  /** column name */
  | "longitude"
  /** column name */
  | "postal_code"
  /** column name */
  | "street"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

/** select "Addresses_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Addresses" */
export type Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_default";

/** select "Addresses_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Addresses" */
export type Addresses_Select_Column_Addresses_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_default";

/** input type for updating data in table "Addresses" */
export type Addresses_Set_Input = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  postal_code?: InputMaybe<Scalars["String"]["input"]>;
  street?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
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
  city?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  postal_code?: InputMaybe<Scalars["String"]["input"]>;
  street?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Addresses" */
export type Addresses_Update_Column =
  /** column name */
  | "city"
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_default"
  /** column name */
  | "latitude"
  /** column name */
  | "longitude"
  /** column name */
  | "postal_code"
  /** column name */
  | "street"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

export type Addresses_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Addresses_Set_Input>;
  /** filter the rows which have to be updated */
  where: Addresses_Bool_Exp;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

/** Cart Items */
export type Cart_Items = {
  /** An object relationship */
  Cart: Carts;
  /** An object relationship */
  Product: Products;
  cart_id: Scalars["uuid"]["output"];
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  price: Scalars["String"]["output"];
  product_id: Scalars["uuid"]["output"];
  quantity: Scalars["Int"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Cart_Items_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Cart_Items" */
export type Cart_Items_Aggregate_Fields = {
  avg?: Maybe<Cart_Items_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  "Cart_Items_pkey";

/** input type for incrementing numeric columns in table "Cart_Items" */
export type Cart_Items_Inc_Input = {
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Cart_Items" */
export type Cart_Items_Insert_Input = {
  Cart?: InputMaybe<Carts_Obj_Rel_Insert_Input>;
  Product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  cart_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Cart_Items_Max_Fields = {
  cart_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  product_id?: Maybe<Scalars["uuid"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
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
  cart_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  product_id?: Maybe<Scalars["uuid"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Cart_Items" */
export type Cart_Items_Select_Column =
  /** column name */
  | "cart_id"
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "price"
  /** column name */
  | "product_id"
  /** column name */
  | "quantity"
  /** column name */
  | "updated_at";

/** input type for updating data in table "Cart_Items" */
export type Cart_Items_Set_Input = {
  cart_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Cart_Items_Stddev_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Cart_Items" */
export type Cart_Items_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Cart_Items_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Cart_Items" */
export type Cart_Items_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Cart_Items_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  cart_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Cart_Items_Sum_Fields = {
  quantity?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Cart_Items" */
export type Cart_Items_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** update columns of table "Cart_Items" */
export type Cart_Items_Update_Column =
  /** column name */
  | "cart_id"
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "price"
  /** column name */
  | "product_id"
  /** column name */
  | "quantity"
  /** column name */
  | "updated_at";

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
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Cart_Items" */
export type Cart_Items_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Cart_Items_Var_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Cart_Items" */
export type Cart_Items_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Cart_Items_Variance_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  is_active: Scalars["Boolean"]["output"];
  shop_id: Scalars["uuid"]["output"];
  total: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id: Scalars["uuid"]["output"];
};

/** Carts */
export type CartsCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

/** Carts */
export type CartsCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Carts_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Carts_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Carts_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Carts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Carts" */
export type Carts_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Carts_Max_Fields>;
  min?: Maybe<Carts_Min_Fields>;
};

/** aggregate fields of "Carts" */
export type Carts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Carts_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  "Carts_pkey";

/** input type for inserting data into table "Carts" */
export type Carts_Insert_Input = {
  Cart_Items?: InputMaybe<Cart_Items_Arr_Rel_Insert_Input>;
  Shop?: InputMaybe<Shops_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Carts_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  total?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  total?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Carts" */
export type Carts_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_active"
  /** column name */
  | "shop_id"
  /** column name */
  | "total"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

/** select "Carts_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Carts" */
export type Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_active";

/** select "Carts_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Carts" */
export type Carts_Select_Column_Carts_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_active";

/** input type for updating data in table "Carts" */
export type Carts_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Carts" */
export type Carts_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_active"
  /** column name */
  | "shop_id"
  /** column name */
  | "total"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

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
  created_at: Scalars["timestamptz"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["uuid"]["output"];
  image: Scalars["String"]["output"];
  is_active: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
};

/** columns and relationships of "Categories" */
export type CategoriesShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

/** columns and relationships of "Categories" */
export type CategoriesShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
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
  count: Scalars["Int"]["output"];
  max?: Maybe<Categories_Max_Fields>;
  min?: Maybe<Categories_Min_Fields>;
};

/** aggregate fields of "Categories" */
export type Categories_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Categories_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  "Categories_pkey";

/** input type for inserting data into table "Categories" */
export type Categories_Insert_Input = {
  Shops?: InputMaybe<Shops_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Categories_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Categories_Min_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Categories" */
export type Categories_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Categories" */
export type Categories_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "name";

/** input type for updating data in table "Categories" */
export type Categories_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Categories" */
export type Categories_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "name";

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
  created_at: Scalars["timestamptz"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["uuid"]["output"];
  issue_type: Scalars["String"]["output"];
  order_id: Scalars["uuid"]["output"];
  shopper_id: Scalars["uuid"]["output"];
  status: Scalars["String"]["output"];
  updated_at: Scalars["timestamptz"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Delivery_Issues_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Delivery_Issues" */
export type Delivery_Issues_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Delivery_Issues_Max_Fields>;
  min?: Maybe<Delivery_Issues_Min_Fields>;
};

/** aggregate fields of "Delivery_Issues" */
export type Delivery_Issues_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  shopper_id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "Delivery_Issues" */
export type Delivery_Issues_Constraint =
  /** unique or primary key constraint on columns "id" */
  "Delivery_Issues_pkey";

/** input type for inserting data into table "Delivery_Issues" */
export type Delivery_Issues_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  issue_type?: InputMaybe<Scalars["String"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
};

/** aggregate max on columns */
export type Delivery_Issues_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  issue_type?: Maybe<Scalars["String"]["output"]>;
  order_id?: Maybe<Scalars["uuid"]["output"]>;
  shopper_id?: Maybe<Scalars["uuid"]["output"]>;
  status?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** order by max() on columns of table "Delivery_Issues" */
export type Delivery_Issues_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  issue_type?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Delivery_Issues_Min_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  issue_type?: Maybe<Scalars["String"]["output"]>;
  order_id?: Maybe<Scalars["uuid"]["output"]>;
  shopper_id?: Maybe<Scalars["uuid"]["output"]>;
  status?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** order by min() on columns of table "Delivery_Issues" */
export type Delivery_Issues_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  issue_type?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Delivery_Issues" */
export type Delivery_Issues_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  shopper_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Delivery_Issues */
export type Delivery_Issues_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Delivery_Issues" */
export type Delivery_Issues_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "issue_type"
  /** column name */
  | "order_id"
  /** column name */
  | "shopper_id"
  /** column name */
  | "status"
  /** column name */
  | "updated_at";

/** input type for updating data in table "Delivery_Issues" */
export type Delivery_Issues_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  issue_type?: InputMaybe<Scalars["String"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  issue_type?: InputMaybe<Scalars["String"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
};

/** update columns of table "Delivery_Issues" */
export type Delivery_Issues_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "issue_type"
  /** column name */
  | "order_id"
  /** column name */
  | "shopper_id"
  /** column name */
  | "status"
  /** column name */
  | "updated_at";

export type Delivery_Issues_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Delivery_Issues_Set_Input>;
  /** filter the rows which have to be updated */
  where: Delivery_Issues_Bool_Exp;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Int"]["input"]>;
  _gt?: InputMaybe<Scalars["Int"]["input"]>;
  _gte?: InputMaybe<Scalars["Int"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Int"]["input"]>;
  _lte?: InputMaybe<Scalars["Int"]["input"]>;
  _neq?: InputMaybe<Scalars["Int"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Int"]["input"]>>;
};

/** Notifications */
export type Notifications = {
  /** An object relationship */
  User: Users;
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  is_read: Scalars["Boolean"]["output"];
  message: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  user_id: Scalars["uuid"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Notifications_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Notifications_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Notifications" */
export type Notifications_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Notifications_Max_Fields>;
  min?: Maybe<Notifications_Min_Fields>;
};

/** aggregate fields of "Notifications" */
export type Notifications_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  "Notifications_pkey";

/** input type for inserting data into table "Notifications" */
export type Notifications_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_read?: InputMaybe<Scalars["Boolean"]["input"]>;
  message?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Notifications_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Notifications" */
export type Notifications_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_read"
  /** column name */
  | "message"
  /** column name */
  | "type"
  /** column name */
  | "user_id";

/** select "Notifications_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Notifications" */
export type Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_read";

/** select "Notifications_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Notifications" */
export type Notifications_Select_Column_Notifications_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_read";

/** input type for updating data in table "Notifications" */
export type Notifications_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_read?: InputMaybe<Scalars["Boolean"]["input"]>;
  message?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_read?: InputMaybe<Scalars["Boolean"]["input"]>;
  message?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** update columns of table "Notifications" */
export type Notifications_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "is_read"
  /** column name */
  | "message"
  /** column name */
  | "type"
  /** column name */
  | "user_id";

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
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  order_id: Scalars["uuid"]["output"];
  price: Scalars["String"]["output"];
  product_id: Scalars["uuid"]["output"];
  quantity: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Order_Items_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Order_Items" */
export type Order_Items_Aggregate_Fields = {
  avg?: Maybe<Order_Items_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  "Order_Items_pkey";

/** input type for incrementing numeric columns in table "Order_Items" */
export type Order_Items_Inc_Input = {
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Order_Items" */
export type Order_Items_Insert_Input = {
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  Product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate max on columns */
export type Order_Items_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  order_id?: Maybe<Scalars["uuid"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  product_id?: Maybe<Scalars["uuid"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  order_id?: Maybe<Scalars["uuid"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  product_id?: Maybe<Scalars["uuid"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Order_Items" */
export type Order_Items_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "order_id"
  /** column name */
  | "price"
  /** column name */
  | "product_id"
  /** column name */
  | "quantity";

/** input type for updating data in table "Order_Items" */
export type Order_Items_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate stddev on columns */
export type Order_Items_Stddev_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Order_Items" */
export type Order_Items_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Order_Items_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Order_Items" */
export type Order_Items_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Order_Items_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  product_id?: InputMaybe<Scalars["uuid"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate sum on columns */
export type Order_Items_Sum_Fields = {
  quantity?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Order_Items" */
export type Order_Items_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** update columns of table "Order_Items" */
export type Order_Items_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "order_id"
  /** column name */
  | "price"
  /** column name */
  | "product_id"
  /** column name */
  | "quantity";

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
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Order_Items" */
export type Order_Items_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Order_Items_Var_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Order_Items" */
export type Order_Items_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Order_Items_Variance_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
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
  OrderID: Scalars["Int"]["output"];
  /** An array relationship */
  Order_Items: Array<Order_Items>;
  /** An aggregate relationship */
  Order_Items_aggregate: Order_Items_Aggregate;
  /** An object relationship */
  User?: Maybe<Users>;
  combined_order_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at: Scalars["timestamptz"]["output"];
  delivery_address_id: Scalars["uuid"]["output"];
  delivery_fee: Scalars["String"]["output"];
  delivery_notes?: Maybe<Scalars["String"]["output"]>;
  delivery_photo_url?: Maybe<Scalars["String"]["output"]>;
  delivery_time?: Maybe<Scalars["timestamptz"]["output"]>;
  discount?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["uuid"]["output"];
  service_fee: Scalars["String"]["output"];
  shop_id: Scalars["uuid"]["output"];
  shopper_id?: Maybe<Scalars["uuid"]["output"]>;
  status: Scalars["String"]["output"];
  total: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
  /** An object relationship */
  userByUserId: Users;
  user_id: Scalars["uuid"]["output"];
  voucher_code?: Maybe<Scalars["String"]["output"]>;
};

/** columns and relationships of "Orders" */
export type OrdersDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

/** columns and relationships of "Orders" */
export type OrdersDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

/** columns and relationships of "Orders" */
export type OrdersOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** columns and relationships of "Orders" */
export type OrdersOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** aggregated selection of "Orders" */
export type Orders_Aggregate = {
  aggregate?: Maybe<Orders_Aggregate_Fields>;
  nodes: Array<Orders>;
};

export type Orders_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orders_Aggregate_Bool_Exp_Count>;
};

export type Orders_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orders_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Orders_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Orders" */
export type Orders_Aggregate_Fields = {
  avg?: Maybe<Orders_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  OrderID?: Maybe<Scalars["Float"]["output"]>;
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
  OrderID?: InputMaybe<Int_Comparison_Exp>;
  Order_Items?: InputMaybe<Order_Items_Bool_Exp>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  User?: InputMaybe<Users_Bool_Exp>;
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
  | "Orders_id_key"
  /** unique or primary key constraint on columns "user_id" */
  | "Orders_pkey";

/** input type for incrementing numeric columns in table "Orders" */
export type Orders_Inc_Input = {
  OrderID?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Orders" */
export type Orders_Insert_Input = {
  Address?: InputMaybe<Addresses_Obj_Rel_Insert_Input>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Arr_Rel_Insert_Input>;
  OrderID?: InputMaybe<Scalars["Int"]["input"]>;
  Order_Items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  combined_order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  delivery_address_id?: InputMaybe<Scalars["uuid"]["input"]>;
  delivery_fee?: InputMaybe<Scalars["String"]["input"]>;
  delivery_notes?: InputMaybe<Scalars["String"]["input"]>;
  delivery_photo_url?: InputMaybe<Scalars["String"]["input"]>;
  delivery_time?: InputMaybe<Scalars["timestamptz"]["input"]>;
  discount?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  service_fee?: InputMaybe<Scalars["String"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  userByUserId?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  voucher_code?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Orders_Max_Fields = {
  OrderID?: Maybe<Scalars["Int"]["output"]>;
  combined_order_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  delivery_address_id?: Maybe<Scalars["uuid"]["output"]>;
  delivery_fee?: Maybe<Scalars["String"]["output"]>;
  delivery_notes?: Maybe<Scalars["String"]["output"]>;
  delivery_photo_url?: Maybe<Scalars["String"]["output"]>;
  delivery_time?: Maybe<Scalars["timestamptz"]["output"]>;
  discount?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  service_fee?: Maybe<Scalars["String"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  shopper_id?: Maybe<Scalars["uuid"]["output"]>;
  status?: Maybe<Scalars["String"]["output"]>;
  total?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  voucher_code?: Maybe<Scalars["String"]["output"]>;
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
  OrderID?: Maybe<Scalars["Int"]["output"]>;
  combined_order_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  delivery_address_id?: Maybe<Scalars["uuid"]["output"]>;
  delivery_fee?: Maybe<Scalars["String"]["output"]>;
  delivery_notes?: Maybe<Scalars["String"]["output"]>;
  delivery_photo_url?: Maybe<Scalars["String"]["output"]>;
  delivery_time?: Maybe<Scalars["timestamptz"]["output"]>;
  discount?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  service_fee?: Maybe<Scalars["String"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  shopper_id?: Maybe<Scalars["uuid"]["output"]>;
  status?: Maybe<Scalars["String"]["output"]>;
  total?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  voucher_code?: Maybe<Scalars["String"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  OrderID?: InputMaybe<Order_By>;
  Order_Items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  User?: InputMaybe<Users_Order_By>;
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
  userByUserId?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  voucher_code?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Orders */
export type Orders_Pk_Columns_Input = {
  user_id: Scalars["uuid"]["input"];
};

/** select columns of table "Orders" */
export type Orders_Select_Column =
  /** column name */
  | "OrderID"
  /** column name */
  | "combined_order_id"
  /** column name */
  | "created_at"
  /** column name */
  | "delivery_address_id"
  /** column name */
  | "delivery_fee"
  /** column name */
  | "delivery_notes"
  /** column name */
  | "delivery_photo_url"
  /** column name */
  | "delivery_time"
  /** column name */
  | "discount"
  /** column name */
  | "id"
  /** column name */
  | "service_fee"
  /** column name */
  | "shop_id"
  /** column name */
  | "shopper_id"
  /** column name */
  | "status"
  /** column name */
  | "total"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id"
  /** column name */
  | "voucher_code";

/** input type for updating data in table "Orders" */
export type Orders_Set_Input = {
  OrderID?: InputMaybe<Scalars["Int"]["input"]>;
  combined_order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  delivery_address_id?: InputMaybe<Scalars["uuid"]["input"]>;
  delivery_fee?: InputMaybe<Scalars["String"]["input"]>;
  delivery_notes?: InputMaybe<Scalars["String"]["input"]>;
  delivery_photo_url?: InputMaybe<Scalars["String"]["input"]>;
  delivery_time?: InputMaybe<Scalars["timestamptz"]["input"]>;
  discount?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  service_fee?: InputMaybe<Scalars["String"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  voucher_code?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Orders_Stddev_Fields = {
  OrderID?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Orders" */
export type Orders_Stddev_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Orders_Stddev_Pop_Fields = {
  OrderID?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Orders" */
export type Orders_Stddev_Pop_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Orders_Stddev_Samp_Fields = {
  OrderID?: Maybe<Scalars["Float"]["output"]>;
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
  OrderID?: InputMaybe<Scalars["Int"]["input"]>;
  combined_order_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  delivery_address_id?: InputMaybe<Scalars["uuid"]["input"]>;
  delivery_fee?: InputMaybe<Scalars["String"]["input"]>;
  delivery_notes?: InputMaybe<Scalars["String"]["input"]>;
  delivery_photo_url?: InputMaybe<Scalars["String"]["input"]>;
  delivery_time?: InputMaybe<Scalars["timestamptz"]["input"]>;
  discount?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  service_fee?: InputMaybe<Scalars["String"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  shopper_id?: InputMaybe<Scalars["uuid"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  total?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  voucher_code?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Orders_Sum_Fields = {
  OrderID?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Orders" */
export type Orders_Sum_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** update columns of table "Orders" */
export type Orders_Update_Column =
  /** column name */
  | "OrderID"
  /** column name */
  | "combined_order_id"
  /** column name */
  | "created_at"
  /** column name */
  | "delivery_address_id"
  /** column name */
  | "delivery_fee"
  /** column name */
  | "delivery_notes"
  /** column name */
  | "delivery_photo_url"
  /** column name */
  | "delivery_time"
  /** column name */
  | "discount"
  /** column name */
  | "id"
  /** column name */
  | "service_fee"
  /** column name */
  | "shop_id"
  /** column name */
  | "shopper_id"
  /** column name */
  | "status"
  /** column name */
  | "total"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id"
  /** column name */
  | "voucher_code";

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
  OrderID?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Orders" */
export type Orders_Var_Pop_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Orders_Var_Samp_Fields = {
  OrderID?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Orders" */
export type Orders_Var_Samp_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Orders_Variance_Fields = {
  OrderID?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Orders" */
export type Orders_Variance_Order_By = {
  OrderID?: InputMaybe<Order_By>;
};

/** columns and relationships of "Payment_Methods" */
export type Payment_Methods = {
  CCV?: Maybe<Scalars["String"]["output"]>;
  create_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  is_default: Scalars["Boolean"]["output"];
  method: Scalars["String"]["output"];
  names: Scalars["String"]["output"];
  number: Scalars["String"]["output"];
  update_on?: Maybe<Scalars["String"]["output"]>;
  user_id: Scalars["uuid"]["output"];
  validity?: Maybe<Scalars["String"]["output"]>;
};

/** aggregated selection of "Payment_Methods" */
export type Payment_Methods_Aggregate = {
  aggregate?: Maybe<Payment_Methods_Aggregate_Fields>;
  nodes: Array<Payment_Methods>;
};

/** aggregate fields of "Payment_Methods" */
export type Payment_Methods_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Payment_Methods_Max_Fields>;
  min?: Maybe<Payment_Methods_Min_Fields>;
};

/** aggregate fields of "Payment_Methods" */
export type Payment_Methods_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Payment_Methods". All fields are combined with a logical 'AND'. */
export type Payment_Methods_Bool_Exp = {
  CCV?: InputMaybe<String_Comparison_Exp>;
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
  "Payment_Methods_pkey";

/** input type for inserting data into table "Payment_Methods" */
export type Payment_Methods_Insert_Input = {
  CCV?: InputMaybe<Scalars["String"]["input"]>;
  create_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  method?: InputMaybe<Scalars["String"]["input"]>;
  names?: InputMaybe<Scalars["String"]["input"]>;
  number?: InputMaybe<Scalars["String"]["input"]>;
  update_on?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  validity?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Payment_Methods_Max_Fields = {
  CCV?: Maybe<Scalars["String"]["output"]>;
  create_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  method?: Maybe<Scalars["String"]["output"]>;
  names?: Maybe<Scalars["String"]["output"]>;
  number?: Maybe<Scalars["String"]["output"]>;
  update_on?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  validity?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Payment_Methods_Min_Fields = {
  CCV?: Maybe<Scalars["String"]["output"]>;
  create_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  method?: Maybe<Scalars["String"]["output"]>;
  names?: Maybe<Scalars["String"]["output"]>;
  number?: Maybe<Scalars["String"]["output"]>;
  update_on?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  validity?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Payment_Methods" */
export type Payment_Methods_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Payment_Methods" */
export type Payment_Methods_Select_Column =
  /** column name */
  | "CCV"
  /** column name */
  | "create_at"
  /** column name */
  | "id"
  /** column name */
  | "is_default"
  /** column name */
  | "method"
  /** column name */
  | "names"
  /** column name */
  | "number"
  /** column name */
  | "update_on"
  /** column name */
  | "user_id"
  /** column name */
  | "validity";

/** input type for updating data in table "Payment_Methods" */
export type Payment_Methods_Set_Input = {
  CCV?: InputMaybe<Scalars["String"]["input"]>;
  create_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  method?: InputMaybe<Scalars["String"]["input"]>;
  names?: InputMaybe<Scalars["String"]["input"]>;
  number?: InputMaybe<Scalars["String"]["input"]>;
  update_on?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  validity?: InputMaybe<Scalars["String"]["input"]>;
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
  CCV?: InputMaybe<Scalars["String"]["input"]>;
  create_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_default?: InputMaybe<Scalars["Boolean"]["input"]>;
  method?: InputMaybe<Scalars["String"]["input"]>;
  names?: InputMaybe<Scalars["String"]["input"]>;
  number?: InputMaybe<Scalars["String"]["input"]>;
  update_on?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  validity?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Payment_Methods" */
export type Payment_Methods_Update_Column =
  /** column name */
  | "CCV"
  /** column name */
  | "create_at"
  /** column name */
  | "id"
  /** column name */
  | "is_default"
  /** column name */
  | "method"
  /** column name */
  | "names"
  /** column name */
  | "number"
  /** column name */
  | "update_on"
  /** column name */
  | "user_id"
  /** column name */
  | "validity";

export type Payment_Methods_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Payment_Methods_Set_Input>;
  /** filter the rows which have to be updated */
  where: Payment_Methods_Bool_Exp;
};

/** Platform Settings */
export type Platform_Settings = {
  created_at: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  key: Scalars["String"]["output"];
  updated_at: Scalars["timestamptz"]["output"];
  value: Scalars["json"]["output"];
};

/** Platform Settings */
export type Platform_SettingsValueArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregated selection of "Platform_Settings" */
export type Platform_Settings_Aggregate = {
  aggregate?: Maybe<Platform_Settings_Aggregate_Fields>;
  nodes: Array<Platform_Settings>;
};

/** aggregate fields of "Platform_Settings" */
export type Platform_Settings_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Platform_Settings_Max_Fields>;
  min?: Maybe<Platform_Settings_Min_Fields>;
};

/** aggregate fields of "Platform_Settings" */
export type Platform_Settings_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  | "Platform_Settings_key_key"
  /** unique or primary key constraint on columns "id" */
  | "Platform_Settings_pkey";

/** input type for inserting data into table "Platform_Settings" */
export type Platform_Settings_Insert_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  value?: InputMaybe<Scalars["json"]["input"]>;
};

/** aggregate max on columns */
export type Platform_Settings_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  key?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** aggregate min on columns */
export type Platform_Settings_Min_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  key?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
};

/** response of any mutation on the table "Platform_Settings" */
export type Platform_Settings_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Platform_Settings" */
export type Platform_Settings_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "key"
  /** column name */
  | "updated_at"
  /** column name */
  | "value";

/** input type for updating data in table "Platform_Settings" */
export type Platform_Settings_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  value?: InputMaybe<Scalars["json"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  value?: InputMaybe<Scalars["json"]["input"]>;
};

/** update columns of table "Platform_Settings" */
export type Platform_Settings_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "id"
  /** column name */
  | "key"
  /** column name */
  | "updated_at"
  /** column name */
  | "value";

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
  category: Scalars["String"]["output"];
  created_at: Scalars["timestamptz"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["uuid"]["output"];
  image: Scalars["String"]["output"];
  is_active: Scalars["Boolean"]["output"];
  measurement_unit: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  price: Scalars["String"]["output"];
  quantity: Scalars["Int"]["output"];
  shop_id: Scalars["uuid"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** Products */
export type ProductsCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

/** Products */
export type ProductsCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

/** Products */
export type ProductsOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** Products */
export type ProductsOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Products_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Products_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Products_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Products_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Products" */
export type Products_Aggregate_Fields = {
  avg?: Maybe<Products_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by avg() on columns of table "Products" */
export type Products_Avg_Order_By = {
  quantity?: InputMaybe<Order_By>;
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
  category?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  measurement_unit?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<String_Comparison_Exp>;
  quantity?: InputMaybe<Int_Comparison_Exp>;
  shop_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Products" */
export type Products_Constraint =
  /** unique or primary key constraint on columns "id" */
  "Products_pkey";

/** input type for incrementing numeric columns in table "Products" */
export type Products_Inc_Input = {
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Products" */
export type Products_Insert_Input = {
  Cart_Items?: InputMaybe<Cart_Items_Arr_Rel_Insert_Input>;
  Order_Items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  Shop?: InputMaybe<Shops_Obj_Rel_Insert_Input>;
  category?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  measurement_unit?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Products_Max_Fields = {
  category?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  measurement_unit?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "Products" */
export type Products_Max_Order_By = {
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Products_Min_Fields = {
  category?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  measurement_unit?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  price?: Maybe<Scalars["String"]["output"]>;
  quantity?: Maybe<Scalars["Int"]["output"]>;
  shop_id?: Maybe<Scalars["uuid"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "Products" */
export type Products_Min_Order_By = {
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Products" */
export type Products_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  measurement_unit?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  shop_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Products */
export type Products_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Products" */
export type Products_Select_Column =
  /** column name */
  | "category"
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "measurement_unit"
  /** column name */
  | "name"
  /** column name */
  | "price"
  /** column name */
  | "quantity"
  /** column name */
  | "shop_id"
  /** column name */
  | "updated_at";

/** select "Products_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Products" */
export type Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_active";

/** select "Products_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Products" */
export type Products_Select_Column_Products_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_active";

/** input type for updating data in table "Products" */
export type Products_Set_Input = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  measurement_unit?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate stddev on columns */
export type Products_Stddev_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Products" */
export type Products_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Products_Stddev_Pop_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Products" */
export type Products_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Products_Stddev_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_samp() on columns of table "Products" */
export type Products_Stddev_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
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
  category?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  measurement_unit?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["String"]["input"]>;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate sum on columns */
export type Products_Sum_Fields = {
  quantity?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Products" */
export type Products_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** update columns of table "Products" */
export type Products_Update_Column =
  /** column name */
  | "category"
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "measurement_unit"
  /** column name */
  | "name"
  /** column name */
  | "price"
  /** column name */
  | "quantity"
  /** column name */
  | "shop_id"
  /** column name */
  | "updated_at";

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
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Products" */
export type Products_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Products_Var_Samp_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Products" */
export type Products_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Products_Variance_Fields = {
  quantity?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "Products" */
export type Products_Variance_Order_By = {
  quantity?: InputMaybe<Order_By>;
};

/** columns and relationships of "Shopper_Availability" */
export type Shopper_Availability = {
  /** An object relationship */
  User: Users;
  created_at: Scalars["timestamptz"]["output"];
  day_of_week: Scalars["Int"]["output"];
  end_time: Scalars["timetz"]["output"];
  id: Scalars["uuid"]["output"];
  is_available: Scalars["Boolean"]["output"];
  start_time: Scalars["timetz"]["output"];
  updated_at: Scalars["String"]["output"];
  user_id: Scalars["uuid"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shopper_Availability_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shopper_Availability_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shopper_Availability_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Shopper_Availability" */
export type Shopper_Availability_Aggregate_Fields = {
  avg?: Maybe<Shopper_Availability_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
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
  "Shopper_Availability_pkey";

/** input type for incrementing numeric columns in table "Shopper_Availability" */
export type Shopper_Availability_Inc_Input = {
  day_of_week?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "Shopper_Availability" */
export type Shopper_Availability_Insert_Input = {
  User?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  day_of_week?: InputMaybe<Scalars["Int"]["input"]>;
  end_time?: InputMaybe<Scalars["timetz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_available?: InputMaybe<Scalars["Boolean"]["input"]>;
  start_time?: InputMaybe<Scalars["timetz"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Shopper_Availability_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  day_of_week?: Maybe<Scalars["Int"]["output"]>;
  end_time?: Maybe<Scalars["timetz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  start_time?: Maybe<Scalars["timetz"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  day_of_week?: Maybe<Scalars["Int"]["output"]>;
  end_time?: Maybe<Scalars["timetz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  start_time?: Maybe<Scalars["timetz"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
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
  affected_rows: Scalars["Int"]["output"];
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
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "day_of_week"
  /** column name */
  | "end_time"
  /** column name */
  | "id"
  /** column name */
  | "is_available"
  /** column name */
  | "start_time"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

/** select "Shopper_Availability_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_available";

/** select "Shopper_Availability_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Shopper_Availability" */
export type Shopper_Availability_Select_Column_Shopper_Availability_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_available";

/** input type for updating data in table "Shopper_Availability" */
export type Shopper_Availability_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  day_of_week?: InputMaybe<Scalars["Int"]["input"]>;
  end_time?: InputMaybe<Scalars["timetz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_available?: InputMaybe<Scalars["Boolean"]["input"]>;
  start_time?: InputMaybe<Scalars["timetz"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate stddev on columns */
export type Shopper_Availability_Stddev_Fields = {
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Stddev_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Shopper_Availability_Stddev_Pop_Fields = {
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Stddev_Pop_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Shopper_Availability_Stddev_Samp_Fields = {
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  day_of_week?: InputMaybe<Scalars["Int"]["input"]>;
  end_time?: InputMaybe<Scalars["timetz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_available?: InputMaybe<Scalars["Boolean"]["input"]>;
  start_time?: InputMaybe<Scalars["timetz"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate sum on columns */
export type Shopper_Availability_Sum_Fields = {
  day_of_week?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Sum_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** update columns of table "Shopper_Availability" */
export type Shopper_Availability_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "day_of_week"
  /** column name */
  | "end_time"
  /** column name */
  | "id"
  /** column name */
  | "is_available"
  /** column name */
  | "start_time"
  /** column name */
  | "updated_at"
  /** column name */
  | "user_id";

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
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Var_Pop_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Shopper_Availability_Var_Samp_Fields = {
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "Shopper_Availability" */
export type Shopper_Availability_Var_Samp_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Shopper_Availability_Variance_Fields = {
  day_of_week?: Maybe<Scalars["Float"]["output"]>;
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
  Products: Array<Products>;
  /** An aggregate relationship */
  Products_aggregate: Products_Aggregate;
  address: Scalars["String"]["output"];
  category_id: Scalars["uuid"]["output"];
  created_at: Scalars["timestamptz"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["uuid"]["output"];
  image: Scalars["String"]["output"];
  is_active: Scalars["Boolean"]["output"];
  latitude: Scalars["String"]["output"];
  longitude: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  operating_hours: Scalars["json"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** Shops */
export type ShopsCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

/** Shops */
export type ShopsCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

/** Shops */
export type ShopsProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

/** Shops */
export type ShopsProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

/** Shops */
export type ShopsOperating_HoursArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shops_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Shops_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Shops_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Shops_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "Shops" */
export type Shops_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Shops_Max_Fields>;
  min?: Maybe<Shops_Min_Fields>;
};

/** aggregate fields of "Shops" */
export type Shops_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Shops_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  longitude?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  operating_hours?: InputMaybe<Json_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Shops" */
export type Shops_Constraint =
  /** unique or primary key constraint on columns "name" */
  | "Shops_name_key"
  /** unique or primary key constraint on columns "id" */
  | "Shops_pkey";

/** input type for inserting data into table "Shops" */
export type Shops_Insert_Input = {
  Carts?: InputMaybe<Carts_Arr_Rel_Insert_Input>;
  Category?: InputMaybe<Categories_Obj_Rel_Insert_Input>;
  Products?: InputMaybe<Products_Arr_Rel_Insert_Input>;
  address?: InputMaybe<Scalars["String"]["input"]>;
  category_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  operating_hours?: InputMaybe<Scalars["json"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Shops_Max_Fields = {
  address?: Maybe<Scalars["String"]["output"]>;
  category_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  latitude?: Maybe<Scalars["String"]["output"]>;
  longitude?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
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
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Shops_Min_Fields = {
  address?: Maybe<Scalars["String"]["output"]>;
  category_id?: Maybe<Scalars["uuid"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  latitude?: Maybe<Scalars["String"]["output"]>;
  longitude?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
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
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "Shops" */
export type Shops_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  Products_aggregate?: InputMaybe<Products_Aggregate_Order_By>;
  address?: InputMaybe<Order_By>;
  category_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  operating_hours?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Shops */
export type Shops_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Shops" */
export type Shops_Select_Column =
  /** column name */
  | "address"
  /** column name */
  | "category_id"
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "latitude"
  /** column name */
  | "longitude"
  /** column name */
  | "name"
  /** column name */
  | "operating_hours"
  /** column name */
  | "updated_at";

/** select "Shops_aggregate_bool_exp_bool_and_arguments_columns" columns of table "Shops" */
export type Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_And_Arguments_Columns =
  /** column name */
  "is_active";

/** select "Shops_aggregate_bool_exp_bool_or_arguments_columns" columns of table "Shops" */
export type Shops_Select_Column_Shops_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns =
  /** column name */
  "is_active";

/** input type for updating data in table "Shops" */
export type Shops_Set_Input = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  category_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  operating_hours?: InputMaybe<Scalars["json"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
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
  address?: InputMaybe<Scalars["String"]["input"]>;
  category_id?: InputMaybe<Scalars["uuid"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  latitude?: InputMaybe<Scalars["String"]["input"]>;
  longitude?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  operating_hours?: InputMaybe<Scalars["json"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Shops" */
export type Shops_Update_Column =
  /** column name */
  | "address"
  /** column name */
  | "category_id"
  /** column name */
  | "created_at"
  /** column name */
  | "description"
  /** column name */
  | "id"
  /** column name */
  | "image"
  /** column name */
  | "is_active"
  /** column name */
  | "latitude"
  /** column name */
  | "longitude"
  /** column name */
  | "name"
  /** column name */
  | "operating_hours"
  /** column name */
  | "updated_at";

export type Shops_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Shops_Set_Input>;
  /** filter the rows which have to be updated */
  where: Shops_Bool_Exp;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["String"]["input"]>;
  _gt?: InputMaybe<Scalars["String"]["input"]>;
  _gte?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["String"]["input"]>;
  _in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["String"]["input"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["String"]["input"]>;
  _lt?: InputMaybe<Scalars["String"]["input"]>;
  _lte?: InputMaybe<Scalars["String"]["input"]>;
  _neq?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["String"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["String"]["input"]>;
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
  Notifications: Array<Notifications>;
  /** An aggregate relationship */
  Notifications_aggregate: Notifications_Aggregate;
  /** An object relationship */
  Order?: Maybe<Orders>;
  /** An array relationship */
  Orders: Array<Orders>;
  /** An aggregate relationship */
  Orders_aggregate: Orders_Aggregate;
  /** An array relationship */
  Shopper_Availabilities: Array<Shopper_Availability>;
  /** An aggregate relationship */
  Shopper_Availabilities_aggregate: Shopper_Availability_Aggregate;
  created_at: Scalars["timestamptz"]["output"];
  email: Scalars["String"]["output"];
  gender: Scalars["String"]["output"];
  id: Scalars["uuid"]["output"];
  is_active: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  password_hash: Scalars["String"]["output"];
  phone: Scalars["String"]["output"];
  profile_picture?: Maybe<Scalars["String"]["output"]>;
  role: Scalars["String"]["output"];
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** Users */
export type UsersAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

/** Users */
export type UsersAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

/** Users */
export type UsersCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

/** Users */
export type UsersCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

/** Users */
export type UsersDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

/** Users */
export type UsersDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

/** Users */
export type UsersNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

/** Users */
export type UsersNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

/** Users */
export type UsersOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** Users */
export type UsersOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** Users */
export type UsersShopper_AvailabilitiesArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

/** Users */
export type UsersShopper_Availabilities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

/** aggregated selection of "Users" */
export type Users_Aggregate = {
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "Users" */
export type Users_Aggregate_Fields = {
  count: Scalars["Int"]["output"];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
};

/** aggregate fields of "Users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Boolean expression to filter rows from the table "Users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  Addresses?: InputMaybe<Addresses_Bool_Exp>;
  Addresses_aggregate?: InputMaybe<Addresses_Aggregate_Bool_Exp>;
  Carts?: InputMaybe<Carts_Bool_Exp>;
  Carts_aggregate?: InputMaybe<Carts_Aggregate_Bool_Exp>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Bool_Exp>;
  Delivery_Issues_aggregate?: InputMaybe<Delivery_Issues_Aggregate_Bool_Exp>;
  Notifications?: InputMaybe<Notifications_Bool_Exp>;
  Notifications_aggregate?: InputMaybe<Notifications_Aggregate_Bool_Exp>;
  Order?: InputMaybe<Orders_Bool_Exp>;
  Orders?: InputMaybe<Orders_Bool_Exp>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Bool_Exp>;
  Shopper_Availabilities?: InputMaybe<Shopper_Availability_Bool_Exp>;
  Shopper_Availabilities_aggregate?: InputMaybe<Shopper_Availability_Aggregate_Bool_Exp>;
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  gender?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  password_hash?: InputMaybe<String_Comparison_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  profile_picture?: InputMaybe<String_Comparison_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "Users" */
export type Users_Constraint =
  /** unique or primary key constraint on columns "email" */
  | "Users_email_key"
  /** unique or primary key constraint on columns "phone" */
  | "Users_phone_key"
  /** unique or primary key constraint on columns "id" */
  | "Users_pkey";

/** input type for inserting data into table "Users" */
export type Users_Insert_Input = {
  Addresses?: InputMaybe<Addresses_Arr_Rel_Insert_Input>;
  Carts?: InputMaybe<Carts_Arr_Rel_Insert_Input>;
  Delivery_Issues?: InputMaybe<Delivery_Issues_Arr_Rel_Insert_Input>;
  Notifications?: InputMaybe<Notifications_Arr_Rel_Insert_Input>;
  Order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  Orders?: InputMaybe<Orders_Arr_Rel_Insert_Input>;
  Shopper_Availabilities?: InputMaybe<Shopper_Availability_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  gender?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  password_hash?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  profile_picture?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  gender?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  password_hash?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  profile_picture?: Maybe<Scalars["String"]["output"]>;
  role?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  gender?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  password_hash?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  profile_picture?: Maybe<Scalars["String"]["output"]>;
  role?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "Users" */
export type Users_Mutation_Response = {
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  Notifications_aggregate?: InputMaybe<Notifications_Aggregate_Order_By>;
  Order?: InputMaybe<Orders_Order_By>;
  Orders_aggregate?: InputMaybe<Orders_Aggregate_Order_By>;
  Shopper_Availabilities_aggregate?: InputMaybe<Shopper_Availability_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  password_hash?: InputMaybe<Order_By>;
  phone?: InputMaybe<Order_By>;
  profile_picture?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: Users */
export type Users_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** select columns of table "Users" */
export type Users_Select_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "email"
  /** column name */
  | "gender"
  /** column name */
  | "id"
  /** column name */
  | "is_active"
  /** column name */
  | "name"
  /** column name */
  | "password_hash"
  /** column name */
  | "phone"
  /** column name */
  | "profile_picture"
  /** column name */
  | "role"
  /** column name */
  | "updated_at";

/** input type for updating data in table "Users" */
export type Users_Set_Input = {
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  gender?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  password_hash?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  profile_picture?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
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
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  gender?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  password_hash?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  profile_picture?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  updated_at?: InputMaybe<Scalars["String"]["input"]>;
};

/** update columns of table "Users" */
export type Users_Update_Column =
  /** column name */
  | "created_at"
  /** column name */
  | "email"
  /** column name */
  | "gender"
  /** column name */
  | "id"
  /** column name */
  | "is_active"
  /** column name */
  | "name"
  /** column name */
  | "password_hash"
  /** column name */
  | "phone"
  /** column name */
  | "profile_picture"
  /** column name */
  | "role"
  /** column name */
  | "updated_at";

export type Users_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** ordering argument of a cursor */
export type Cursor_Ordering =
  /** ascending ordering of the cursor */
  | "ASC"
  /** descending ordering of the cursor */
  | "DESC";

/** Boolean expression to compare columns of type "json". All fields are combined with logical 'AND'. */
export type Json_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["json"]["input"]>;
  _gt?: InputMaybe<Scalars["json"]["input"]>;
  _gte?: InputMaybe<Scalars["json"]["input"]>;
  _in?: InputMaybe<Array<Scalars["json"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["json"]["input"]>;
  _lte?: InputMaybe<Scalars["json"]["input"]>;
  _neq?: InputMaybe<Scalars["json"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["json"]["input"]>>;
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
  /** delete data from the table: "Shopper_Availability" */
  delete_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** delete single row from the table: "Shopper_Availability" */
  delete_Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** delete data from the table: "Shops" */
  delete_Shops?: Maybe<Shops_Mutation_Response>;
  /** delete single row from the table: "Shops" */
  delete_Shops_by_pk?: Maybe<Shops>;
  /** delete data from the table: "Users" */
  delete_Users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "Users" */
  delete_Users_by_pk?: Maybe<Users>;
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
  /** insert data into the table: "Shopper_Availability" */
  insert_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** insert a single row into the table: "Shopper_Availability" */
  insert_Shopper_Availability_one?: Maybe<Shopper_Availability>;
  /** insert data into the table: "Shops" */
  insert_Shops?: Maybe<Shops_Mutation_Response>;
  /** insert a single row into the table: "Shops" */
  insert_Shops_one?: Maybe<Shops>;
  /** insert data into the table: "Users" */
  insert_Users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "Users" */
  insert_Users_one?: Maybe<Users>;
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
  update_Delivery_Issues_many?: Maybe<
    Array<Maybe<Delivery_Issues_Mutation_Response>>
  >;
  /** update data of the table: "Notifications" */
  update_Notifications?: Maybe<Notifications_Mutation_Response>;
  /** update single row of the table: "Notifications" */
  update_Notifications_by_pk?: Maybe<Notifications>;
  /** update multiples rows of table: "Notifications" */
  update_Notifications_many?: Maybe<
    Array<Maybe<Notifications_Mutation_Response>>
  >;
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
  update_Payment_Methods_many?: Maybe<
    Array<Maybe<Payment_Methods_Mutation_Response>>
  >;
  /** update data of the table: "Platform_Settings" */
  update_Platform_Settings?: Maybe<Platform_Settings_Mutation_Response>;
  /** update single row of the table: "Platform_Settings" */
  update_Platform_Settings_by_pk?: Maybe<Platform_Settings>;
  /** update multiples rows of table: "Platform_Settings" */
  update_Platform_Settings_many?: Maybe<
    Array<Maybe<Platform_Settings_Mutation_Response>>
  >;
  /** update data of the table: "Products" */
  update_Products?: Maybe<Products_Mutation_Response>;
  /** update single row of the table: "Products" */
  update_Products_by_pk?: Maybe<Products>;
  /** update multiples rows of table: "Products" */
  update_Products_many?: Maybe<Array<Maybe<Products_Mutation_Response>>>;
  /** update data of the table: "Shopper_Availability" */
  update_Shopper_Availability?: Maybe<Shopper_Availability_Mutation_Response>;
  /** update single row of the table: "Shopper_Availability" */
  update_Shopper_Availability_by_pk?: Maybe<Shopper_Availability>;
  /** update multiples rows of table: "Shopper_Availability" */
  update_Shopper_Availability_many?: Maybe<
    Array<Maybe<Shopper_Availability_Mutation_Response>>
  >;
  /** update data of the table: "Shops" */
  update_Shops?: Maybe<Shops_Mutation_Response>;
  /** update single row of the table: "Shops" */
  update_Shops_by_pk?: Maybe<Shops>;
  /** update multiples rows of table: "Shops" */
  update_Shops_many?: Maybe<Array<Maybe<Shops_Mutation_Response>>>;
  /** update data of the table: "Users" */
  update_Users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "Users" */
  update_Users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "Users" */
  update_Users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
};

/** mutation root */
export type Mutation_RootDelete_AddressesArgs = {
  where: Addresses_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Addresses_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Cart_ItemsArgs = {
  where: Cart_Items_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Cart_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_CartsArgs = {
  where: Carts_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Carts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_CategoriesArgs = {
  where: Categories_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Categories_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Delivery_IssuesArgs = {
  where: Delivery_Issues_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Delivery_Issues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_NotificationsArgs = {
  where: Notifications_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Notifications_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Order_ItemsArgs = {
  where: Order_Items_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Order_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_OrdersArgs = {
  where: Orders_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Orders_By_PkArgs = {
  user_id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Payment_MethodsArgs = {
  where: Payment_Methods_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Payment_Methods_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Platform_SettingsArgs = {
  where: Platform_Settings_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Platform_Settings_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_ProductsArgs = {
  where: Products_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Products_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Shopper_AvailabilityArgs = {
  where: Shopper_Availability_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Shopper_Availability_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_ShopsArgs = {
  where: Shops_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Shops_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars["uuid"]["input"];
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

/** column ordering options */
export type Order_By =
  /** in ascending order, nulls last */
  | "asc"
  /** in ascending order, nulls first */
  | "asc_nulls_first"
  /** in ascending order, nulls last */
  | "asc_nulls_last"
  /** in descending order, nulls first */
  | "desc"
  /** in descending order, nulls first */
  | "desc_nulls_first"
  /** in descending order, nulls last */
  | "desc_nulls_last";

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
  /** fetch data from the table: "Payment_Methods" */
  Payment_Methods: Array<Payment_Methods>;
  /** fetch aggregated fields from the table: "Payment_Methods" */
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
  /** fetch data from the table: "Users" */
  Users: Array<Users>;
  /** fetch aggregated fields from the table: "Users" */
  Users_aggregate: Users_Aggregate;
  /** fetch data from the table: "Users" using primary key columns */
  Users_by_pk?: Maybe<Users>;
};

export type Query_RootAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

export type Query_RootAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

export type Query_RootAddresses_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

export type Query_RootCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

export type Query_RootCart_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

export type Query_RootCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

export type Query_RootCarts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootCategoriesArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

export type Query_RootCategories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

export type Query_RootCategories_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

export type Query_RootDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

export type Query_RootDelivery_Issues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Query_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Query_RootNotifications_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

export type Query_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

export type Query_RootOrder_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

export type Query_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

export type Query_RootOrders_By_PkArgs = {
  user_id: Scalars["uuid"]["input"];
};

export type Query_RootPayment_MethodsArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

export type Query_RootPayment_Methods_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

export type Query_RootPayment_Methods_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootPlatform_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

export type Query_RootPlatform_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

export type Query_RootPlatform_Settings_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

export type Query_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

export type Query_RootProducts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootShopper_AvailabilityArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

export type Query_RootShopper_Availability_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

export type Query_RootShopper_Availability_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

export type Query_RootShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

export type Query_RootShops_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Query_RootUsers_By_PkArgs = {
  id: Scalars["uuid"]["input"];
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
  /** fetch data from the table: "Payment_Methods" */
  Payment_Methods: Array<Payment_Methods>;
  /** fetch aggregated fields from the table: "Payment_Methods" */
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
  /** fetch data from the table: "Users" */
  Users: Array<Users>;
  /** fetch aggregated fields from the table: "Users" */
  Users_aggregate: Users_Aggregate;
  /** fetch data from the table: "Users" using primary key columns */
  Users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "Users" */
  Users_stream: Array<Users>;
};

export type Subscription_RootAddressesArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

export type Subscription_RootAddresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Addresses_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Addresses_Order_By>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

export type Subscription_RootAddresses_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootAddresses_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Addresses_Stream_Cursor_Input>>;
  where?: InputMaybe<Addresses_Bool_Exp>;
};

export type Subscription_RootCart_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

export type Subscription_RootCart_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Cart_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Cart_Items_Order_By>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

export type Subscription_RootCart_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootCart_Items_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Cart_Items_Stream_Cursor_Input>>;
  where?: InputMaybe<Cart_Items_Bool_Exp>;
};

export type Subscription_RootCartsArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

export type Subscription_RootCarts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Carts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Carts_Order_By>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

export type Subscription_RootCarts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootCarts_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Carts_Stream_Cursor_Input>>;
  where?: InputMaybe<Carts_Bool_Exp>;
};

export type Subscription_RootCategoriesArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

export type Subscription_RootCategories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Categories_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Categories_Order_By>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

export type Subscription_RootCategories_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootCategories_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Categories_Stream_Cursor_Input>>;
  where?: InputMaybe<Categories_Bool_Exp>;
};

export type Subscription_RootDelivery_IssuesArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

export type Subscription_RootDelivery_Issues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Delivery_Issues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Delivery_Issues_Order_By>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

export type Subscription_RootDelivery_Issues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootDelivery_Issues_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Delivery_Issues_Stream_Cursor_Input>>;
  where?: InputMaybe<Delivery_Issues_Bool_Exp>;
};

export type Subscription_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Subscription_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Subscription_RootNotifications_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootNotifications_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Notifications_Stream_Cursor_Input>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Subscription_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

export type Subscription_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

export type Subscription_RootOrder_Items_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootOrder_Items_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Order_Items_Stream_Cursor_Input>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

export type Subscription_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

export type Subscription_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

export type Subscription_RootOrders_By_PkArgs = {
  user_id: Scalars["uuid"]["input"];
};

export type Subscription_RootOrders_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Orders_Stream_Cursor_Input>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

export type Subscription_RootPayment_MethodsArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

export type Subscription_RootPayment_Methods_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Payment_Methods_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Payment_Methods_Order_By>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

export type Subscription_RootPayment_Methods_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootPayment_Methods_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Payment_Methods_Stream_Cursor_Input>>;
  where?: InputMaybe<Payment_Methods_Bool_Exp>;
};

export type Subscription_RootPlatform_SettingsArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

export type Subscription_RootPlatform_Settings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Platform_Settings_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Platform_Settings_Order_By>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

export type Subscription_RootPlatform_Settings_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootPlatform_Settings_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Platform_Settings_Stream_Cursor_Input>>;
  where?: InputMaybe<Platform_Settings_Bool_Exp>;
};

export type Subscription_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

export type Subscription_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

export type Subscription_RootProducts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootProducts_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Products_Stream_Cursor_Input>>;
  where?: InputMaybe<Products_Bool_Exp>;
};

export type Subscription_RootShopper_AvailabilityArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

export type Subscription_RootShopper_Availability_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shopper_Availability_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shopper_Availability_Order_By>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

export type Subscription_RootShopper_Availability_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootShopper_Availability_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Shopper_Availability_Stream_Cursor_Input>>;
  where?: InputMaybe<Shopper_Availability_Bool_Exp>;
};

export type Subscription_RootShopsArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

export type Subscription_RootShops_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Shops_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Shops_Order_By>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

export type Subscription_RootShops_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootShops_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Shops_Stream_Cursor_Input>>;
  where?: InputMaybe<Shops_Bool_Exp>;
};

export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _in?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _lte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _neq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
};

/** Boolean expression to compare columns of type "timetz". All fields are combined with logical 'AND'. */
export type Timetz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["timetz"]["input"]>;
  _gt?: InputMaybe<Scalars["timetz"]["input"]>;
  _gte?: InputMaybe<Scalars["timetz"]["input"]>;
  _in?: InputMaybe<Array<Scalars["timetz"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["timetz"]["input"]>;
  _lte?: InputMaybe<Scalars["timetz"]["input"]>;
  _neq?: InputMaybe<Scalars["timetz"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["timetz"]["input"]>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["uuid"]["input"]>;
  _gt?: InputMaybe<Scalars["uuid"]["input"]>;
  _gte?: InputMaybe<Scalars["uuid"]["input"]>;
  _in?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["uuid"]["input"]>;
  _lte?: InputMaybe<Scalars["uuid"]["input"]>;
  _neq?: InputMaybe<Scalars["uuid"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
};

export type GetAddressesQueryVariables = Exact<{ [key: string]: never }>;

export type GetAddressesQuery = {
  Addresses: Array<{
    id: string;
    user_id: string;
    street: string;
    city: string;
    postal_code?: string | null;
    latitude: string;
    longitude: string;
    is_default: boolean;
    created_at: string;
    updated_at?: string | null;
  }>;
};

export type GetCartItemsQueryVariables = Exact<{ [key: string]: never }>;

export type GetCartItemsQuery = {
  Cart_Items: Array<{
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    price: string;
    created_at: string;
    updated_at?: string | null;
    Cart: {
      created_at: string;
      id: string;
      is_active: boolean;
      shop_id: string;
      total: string;
      updated_at?: string | null;
      user_id: string;
    };
    Product: {
      category: string;
      created_at: string;
      description: string;
      id: string;
      image: string;
      is_active: boolean;
      measurement_unit: string;
      name: string;
      price: string;
      quantity: number;
      shop_id: string;
      updated_at?: string | null;
    };
  }>;
};

export type GetCartsQueryVariables = Exact<{ [key: string]: never }>;

export type GetCartsQuery = {
  Carts: Array<{
    id: string;
    user_id: string;
    total: string;
    created_at: string;
    updated_at?: string | null;
    is_active: boolean;
    shop_id: string;
    User: {
      created_at: string;
      email: string;
      gender: string;
      id: string;
      is_active: boolean;
      name: string;
      password_hash: string;
      phone: string;
      profile_picture?: string | null;
      role: string;
      updated_at?: string | null;
    };
  }>;
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCategoriesQuery = {
  Categories: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    created_at: string;
    is_active: boolean;
    Shops: Array<{
      updated_at?: string | null;
      operating_hours: any;
      name: string;
      longitude: string;
      latitude: string;
      is_active: boolean;
      image: string;
      id: string;
      description: string;
      created_at: string;
      category_id: string;
      address: string;
    }>;
  }>;
};

export type GetDeliveryIssuesQueryVariables = Exact<{ [key: string]: never }>;

export type GetDeliveryIssuesQuery = {
  Delivery_Issues: Array<{
    id: string;
    order_id: string;
    shopper_id: string;
    issue_type: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    Order: {
      combined_order_id?: string | null;
      created_at: string;
      delivery_address_id: string;
      delivery_notes?: string | null;
      delivery_photo_url?: string | null;
      delivery_time?: string | null;
      id: string;
      shopper_id?: string | null;
      status: string;
      total: string;
      updated_at?: string | null;
      user_id: string;
    };
    User: {
      created_at: string;
      email: string;
      gender: string;
      id: string;
      is_active: boolean;
      name: string;
      password_hash: string;
      phone: string;
      profile_picture?: string | null;
      role: string;
      updated_at?: string | null;
    };
  }>;
};

export type GetNotificationsQueryVariables = Exact<{ [key: string]: never }>;

export type GetNotificationsQuery = {
  Notifications: Array<{
    id: string;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
    User: {
      created_at: string;
      email: string;
      gender: string;
      id: string;
      is_active: boolean;
      name: string;
      password_hash: string;
      phone: string;
      profile_picture?: string | null;
      role: string;
      updated_at?: string | null;
    };
  }>;
};

export type GetOrderItemsQueryVariables = Exact<{ [key: string]: never }>;

export type GetOrderItemsQuery = {
  Order_Items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: string;
    created_at: string;
    Product: {
      category: string;
      created_at: string;
      description: string;
      id: string;
      image: string;
      is_active: boolean;
      measurement_unit: string;
      name: string;
      price: string;
      quantity: number;
      shop_id: string;
      updated_at?: string | null;
    };
    Order: {
      user_id: string;
      updated_at?: string | null;
      total: string;
      shopper_id?: string | null;
      status: string;
      id: string;
      delivery_time?: string | null;
      delivery_photo_url?: string | null;
      delivery_notes?: string | null;
      delivery_address_id: string;
      created_at: string;
      combined_order_id?: string | null;
    };
  }>;
};

export type GetOrdersQueryVariables = Exact<{ [key: string]: never }>;

export type GetOrdersQuery = {
  Orders: Array<{
    id: string;
    user_id: string;
    shopper_id?: string | null;
    total: string;
    status: string;
    delivery_address_id: string;
    delivery_photo_url?: string | null;
    delivery_notes?: string | null;
    created_at: string;
    updated_at?: string | null;
    delivery_time?: string | null;
    combined_order_id?: string | null;
    delivery_fee: string;
    service_fee: string;
    discount?: string | null;
    voucher_code?: string | null;
    OrderID: number;
    shop_id: string;
    Address: {
      city: string;
      created_at: string;
      id: string;
      is_default: boolean;
      latitude: string;
      longitude: string;
      postal_code?: string | null;
      street: string;
      updated_at?: string | null;
      user_id: string;
    };
    Delivery_Issues: Array<{
      created_at: string;
      description: string;
      id: string;
      issue_type: string;
      order_id: string;
      shopper_id: string;
      status: string;
      updated_at: string;
    }>;
    Order_Items: Array<{
      created_at: string;
      id: string;
      order_id: string;
      price: string;
      product_id: string;
      quantity: number;
    }>;
  }>;
};

export type GetPlatformSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type GetPlatformSettingsQuery = {
  Platform_Settings: Array<{
    id: string;
    key: string;
    value: any;
    created_at: string;
    updated_at: string;
  }>;
};

export type GetProductsQueryVariables = Exact<{ [key: string]: never }>;

export type GetProductsQuery = {
  Products: Array<{
    id: string;
    name: string;
    description: string;
    shop_id: string;
    price: string;
    quantity: number;
    measurement_unit: string;
    image: string;
    category: string;
    created_at: string;
    updated_at?: string | null;
    is_active: boolean;
    Shop: {
      address: string;
      category_id: string;
      created_at: string;
      description: string;
      id: string;
      image: string;
      is_active: boolean;
      latitude: string;
      longitude: string;
      name: string;
      operating_hours: any;
      updated_at?: string | null;
    };
    Order_Items: Array<{
      quantity: number;
      product_id: string;
      price: string;
      order_id: string;
      id: string;
      created_at: string;
    }>;
    Cart_Items: Array<{
      updated_at?: string | null;
      quantity: number;
      product_id: string;
      price: string;
      id: string;
      created_at: string;
      cart_id: string;
    }>;
  }>;
};

export type GetShopperAvailabilityQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetShopperAvailabilityQuery = {
  Shopper_Availability: Array<{
    id: string;
    user_id: string;
    day_of_week: number;
    start_time: any;
    end_time: any;
    is_available: boolean;
    created_at: string;
    updated_at: string;
  }>;
};

export type GetShopsQueryVariables = Exact<{ [key: string]: never }>;

export type GetShopsQuery = {
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    category_id: string;
    image: string;
    address: string;
    latitude: string;
    longitude: string;
    operating_hours: any;
    created_at: string;
    updated_at?: string | null;
    is_active: boolean;
  }>;
};

export type GetUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
  Users: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    password_hash: string;
    created_at: string;
    updated_at?: string | null;
    profile_picture?: string | null;
    is_active: boolean;
  }>;
};

export type AddCartMutationVariables = Exact<{
  total?: InputMaybe<Scalars["String"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
}>;

export type AddCartMutation = {
  insert_Carts?: { affected_rows: number } | null;
};

export type AddItemsToCartMutationVariables = Exact<{
  total?: InputMaybe<Scalars["String"]["input"]>;
  is_active?: InputMaybe<Scalars["Boolean"]["input"]>;
  shop_id?: InputMaybe<Scalars["uuid"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
}>;

export type AddItemsToCartMutation = {
  insert_Carts?: { affected_rows: number } | null;
};

export type GetPaymentMethodQueryVariables = Exact<{ [key: string]: never }>;

export type GetPaymentMethodQuery = {
  Payment_Methods: Array<{
    validity?: string | null;
    user_id: string;
    update_on?: string | null;
    number: string;
    names: string;
    method: string;
    is_default: boolean;
    id: string;
    create_at: string;
    CCV?: string | null;
  }>;
};

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
  mutation AddCart(
    $total: String = ""
    $shop_id: uuid = ""
    $user_id: uuid = ""
  ) {
    insert_Carts(
      objects: {
        total: $total
        is_active: true
        shop_id: $shop_id
        user_id: $user_id
      }
    ) {
      affected_rows
    }
  }
`;
export const AddItemsToCartDocument = gql`
  mutation AddItemsToCart(
    $total: String = ""
    $is_active: Boolean = true
    $shop_id: uuid = ""
    $user_id: uuid = ""
  ) {
    insert_Carts(
      objects: {
        total: $total
        is_active: $is_active
        shop_id: $shop_id
        user_id: $user_id
      }
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

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    GetAddresses(
      variables?: GetAddressesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetAddressesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetAddressesQuery>(GetAddressesDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetAddresses",
        "query",
        variables
      );
    },
    GetCartItems(
      variables?: GetCartItemsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetCartItemsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetCartItemsQuery>(GetCartItemsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetCartItems",
        "query",
        variables
      );
    },
    GetCarts(
      variables?: GetCartsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetCartsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetCartsQuery>(GetCartsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetCarts",
        "query",
        variables
      );
    },
    GetCategories(
      variables?: GetCategoriesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetCategoriesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetCategoriesQuery>(GetCategoriesDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetCategories",
        "query",
        variables
      );
    },
    GetDeliveryIssues(
      variables?: GetDeliveryIssuesQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetDeliveryIssuesQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDeliveryIssuesQuery>(
            GetDeliveryIssuesDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "GetDeliveryIssues",
        "query",
        variables
      );
    },
    GetNotifications(
      variables?: GetNotificationsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetNotificationsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetNotificationsQuery>(
            GetNotificationsDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "GetNotifications",
        "query",
        variables
      );
    },
    GetOrderItems(
      variables?: GetOrderItemsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetOrderItemsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetOrderItemsQuery>(GetOrderItemsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetOrderItems",
        "query",
        variables
      );
    },
    GetOrders(
      variables?: GetOrdersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetOrdersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetOrdersQuery>(GetOrdersDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetOrders",
        "query",
        variables
      );
    },
    GetPlatformSettings(
      variables?: GetPlatformSettingsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetPlatformSettingsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetPlatformSettingsQuery>(
            GetPlatformSettingsDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "GetPlatformSettings",
        "query",
        variables
      );
    },
    GetProducts(
      variables?: GetProductsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetProductsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetProductsQuery>(GetProductsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetProducts",
        "query",
        variables
      );
    },
    GetShopperAvailability(
      variables?: GetShopperAvailabilityQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetShopperAvailabilityQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetShopperAvailabilityQuery>(
            GetShopperAvailabilityDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "GetShopperAvailability",
        "query",
        variables
      );
    },
    GetShops(
      variables?: GetShopsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetShopsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetShopsQuery>(GetShopsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetShops",
        "query",
        variables
      );
    },
    GetUsers(
      variables?: GetUsersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetUsersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetUsersQuery>(GetUsersDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetUsers",
        "query",
        variables
      );
    },
    AddCart(
      variables?: AddCartMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<AddCartMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AddCartMutation>(AddCartDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "AddCart",
        "mutation",
        variables
      );
    },
    AddItemsToCart(
      variables?: AddItemsToCartMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<AddItemsToCartMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<AddItemsToCartMutation>(
            AddItemsToCartDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "AddItemsToCart",
        "mutation",
        variables
      );
    },
    getPaymentMethod(
      variables?: GetPaymentMethodQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GetPaymentMethodQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetPaymentMethodQuery>(
            GetPaymentMethodDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "getPaymentMethod",
        "query",
        variables
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
