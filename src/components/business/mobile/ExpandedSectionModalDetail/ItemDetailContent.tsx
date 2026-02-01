"use client";

import { Building } from "lucide-react";
import { formatCurrencySync } from "../../../../utils/formatCurrency";
import {
  QuoteDetailContent,
  OrderDetailContent,
  StoreDetailContent,
  ContractDetailContent,
  ServiceDetailContent,
} from "./index";

interface ItemDetailContentProps {
  sectionId: string;
  selectedItem: any;
  isEditing: boolean;
  title: string;
  onBackToList: () => void;
  onEdit: () => void;
  onSave: () => void;
  submittedQuotes?: Record<string, any>;
  isOpeningQuoteForm?: boolean;
  onShareQuote?: (item: any) => void;
  onMessageCustomer?: (customerId: string) => void;
  quoteActiveTab?: string;
  setQuoteActiveTab?: (tab: string) => void;
  loadingOrderDetails?: boolean;
  orderDetails?: any;
  storeProducts?: any[];
  loadingProducts?: boolean;
  onEditProduct?: (product: any) => void;
  onDeleteProduct?: (product: any) => void;
  onViewContract?: (contractId: string) => void;
}

export function ItemDetailContent({
  sectionId,
  selectedItem,
  isEditing,
  title,
  onBackToList,
  onEdit,
  onSave,
  submittedQuotes = {},
  isOpeningQuoteForm = false,
  onShareQuote,
  onMessageCustomer,
  quoteActiveTab = "overview",
  setQuoteActiveTab = () => {},
  loadingOrderDetails = false,
  orderDetails = null,
  storeProducts = [],
  loadingProducts = false,
  onEditProduct = () => {},
  onDeleteProduct = async () => {},
  onViewContract,
}: ItemDetailContentProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-24">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              defaultValue={selectedItem.title || selectedItem.name || ""}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              defaultValue={
                selectedItem.description || selectedItem.Description || ""
              }
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBackToList}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sectionId === "rfqs" && (
            <>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {selectedItem.title || `RFQ #${selectedItem.id?.slice(0, 8)}`}
                </h4>
                <span
                  className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${
                    selectedItem.open
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                  }`}
                >
                  {selectedItem.open ? "Open" : "Closed"}
                </span>
              </div>
              {selectedItem.description && (
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedItem.description}
                  </p>
                </div>
              )}
              {selectedItem.category && (
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedItem.category}
                  </p>
                </div>
              )}
              {selectedItem.location && (
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Location
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedItem.location}
                  </p>
                </div>
              )}
            </>
          )}

          {sectionId === "rfq-opportunities" && (
            <>
              <div className="mb-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                    {selectedItem.title ||
                      `RFQ #${selectedItem.id?.slice(0, 8)}`}
                  </h4>
                  <span
                    className={`ml-2 rounded-md px-3 py-1 text-xs font-semibold ${
                      selectedItem.open
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                    style={{ color: "#ffffff" }}
                  >
                    {selectedItem.open ? "Open" : "Closed"}
                  </span>
                </div>
                {selectedItem.business_account?.business_name && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Building className="h-4 w-4" />
                    <span>{selectedItem.business_account.business_name}</span>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              <div className="mb-4 grid grid-cols-2 gap-3">
                {selectedItem.category && (
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                    <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </h5>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.category}
                    </p>
                  </div>
                )}
                {selectedItem.location && (
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                    <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Location
                    </h5>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.location}
                    </p>
                  </div>
                )}
              </div>

              {(selectedItem.min_budget || selectedItem.max_budget) && (
                <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Budget
                  </h5>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {selectedItem.min_budget && selectedItem.max_budget
                      ? `${formatCurrencySync(
                          parseFloat(selectedItem.min_budget)
                        )} - ${formatCurrencySync(
                          parseFloat(selectedItem.max_budget)
                        )}`
                      : selectedItem.min_budget
                      ? `${formatCurrencySync(
                          parseFloat(selectedItem.min_budget)
                        )}+`
                      : selectedItem.max_budget
                      ? `Up to ${formatCurrencySync(
                          parseFloat(selectedItem.max_budget)
                        )}`
                      : "Not specified"}
                  </p>
                </div>
              )}

              {selectedItem.response_date && (
                <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                    Response Deadline
                  </h5>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedItem.response_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => onShareQuote?.(selectedItem)}
                  disabled={isOpeningQuoteForm}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
                    submittedQuotes[selectedItem.id]
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-green-500 hover:bg-green-600"
                  } ${
                    isOpeningQuoteForm ? "cursor-not-allowed opacity-75" : ""
                  }`}
                  style={{ color: "#ffffff" }}
                >
                  {isOpeningQuoteForm ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Opening...</span>
                    </>
                  ) : submittedQuotes[selectedItem.id] ? (
                    "View Quote"
                  ) : (
                    "Submit Quote"
                  )}
                </button>
                {onMessageCustomer && (
                  <button
                    onClick={() => {
                      const customerId =
                        selectedItem.business_account?.id || selectedItem.id;
                      onMessageCustomer(customerId);
                    }}
                    className="w-full rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                    style={{ color: "#ffffff" }}
                  >
                    Message Customer
                  </button>
                )}
              </div>
            </>
          )}

          {sectionId === "quotes" && (
            <QuoteDetailContent
              selectedItem={selectedItem}
              quoteActiveTab={quoteActiveTab}
              setQuoteActiveTab={setQuoteActiveTab}
            />
          )}

          {sectionId === "orders" && (
            <OrderDetailContent
              loadingOrderDetails={loadingOrderDetails}
              orderDetails={orderDetails}
            />
          )}

          {sectionId === "services" && (
            <ServiceDetailContent selectedItem={selectedItem} />
          )}

          {sectionId === "stores" && (
            <StoreDetailContent
              selectedItem={selectedItem}
              storeProducts={storeProducts}
              loadingProducts={loadingProducts}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
            />
          )}

          {sectionId === "contracts" && (
            <ContractDetailContent
              selectedItem={selectedItem}
              onViewContract={onViewContract}
            />
          )}
        </div>
      )}
    </div>
  );
}
