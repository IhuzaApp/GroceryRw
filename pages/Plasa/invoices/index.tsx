import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { getSession } from "next-auth/react";
import {
  Panel,
  Table,
  Pagination,
  Loader,
  InputGroup,
  Input,
  Stack,
  Button,
} from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import SearchIcon from "@rsuite/icons/Search";
import { GET_USER_INVOICES } from "../../api/queries/invoices";

interface InvoiceItem {
  invoice_number: string;
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  order: {
    OrderID: string;
    shop: {
      name: string;
    };
  };
}

interface InvoicesPageProps {
  initialInvoices: {
    invoices: InvoiceItem[];
    totalCount: number;
  } | null;
  error: string | null;
}

export default function InvoicesPage({
  initialInvoices,
  error,
}: InvoicesPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(
    initialInvoices?.invoices || []
  );
  const [totalCount, setTotalCount] = useState<number>(
    initialInvoices?.totalCount || 0
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter invoices based on search term
  useEffect(() => {
    if (!initialInvoices?.invoices) return;

    const filtered = initialInvoices.invoices.filter(
      (invoice) =>
        invoice.invoice_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.order.OrderID.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        invoice.order.shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setInvoices(filtered);
    setTotalCount(filtered.length);
  }, [searchTerm, initialInvoices]);

  if (loading) {
    return (
      <ShopperLayout>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Loader size="lg" content="Loading invoices..." />
        </div>
      </ShopperLayout>
    );
  }

  if (error) {
    return (
      <ShopperLayout>
        <div className="p-4">
          <Panel bordered header="Error" shaded>
            <p className="text-red-600">{error}</p>
          </Panel>
        </div>
      </ShopperLayout>
    );
  }

  const handleViewInvoice = (id: string) => {
    router.push(`/Plasa/invoices/${id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Calculate pagination
  const paginatedInvoices = invoices.slice((page - 1) * limit, page * limit);

  return (
    <ShopperLayout>
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="mb-6 text-2xl font-bold">My Invoices</h1>

        <Panel bordered className="mb-6">
          <Stack spacing={10} justifyContent="space-between">
            <InputGroup inside style={{ width: 300 }}>
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <InputGroup.Addon>
                <SearchIcon />
              </InputGroup.Addon>
            </InputGroup>
          </Stack>
        </Panel>

        {paginatedInvoices.length === 0 ? (
          <Panel
            bordered
            header="No Invoices Found"
            shaded
            className="py-8 text-center"
          >
            <p className="mb-4">You don&#39;t have any invoices yet.</p>
          </Panel>
        ) : (
          <>
            <Table
              autoHeight
              data={paginatedInvoices}
              bordered
              cellBordered
              hover
              rowHeight={60}
            >
              <Table.Column width={150}>
                <Table.HeaderCell>Invoice Number</Table.HeaderCell>
                <Table.Cell dataKey="invoice_number" />
              </Table.Column>

              <Table.Column width={150}>
                <Table.HeaderCell>Order ID</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) => rowData.order.OrderID}
                </Table.Cell>
              </Table.Column>

              <Table.Column width={150} flexGrow={1}>
                <Table.HeaderCell>Shop</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) => rowData.order.shop.name}
                </Table.Cell>
              </Table.Column>

              <Table.Column width={120}>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) =>
                    new Date(rowData.created_at).toLocaleDateString()
                  }
                </Table.Cell>
              </Table.Column>

              <Table.Column width={120}>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) =>
                    formatCurrency(rowData.total_amount)
                  }
                </Table.Cell>
              </Table.Column>

              <Table.Column width={100}>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) => (
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        rowData.status.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {rowData.status}
                    </span>
                  )}
                </Table.Cell>
              </Table.Column>

              <Table.Column width={120} fixed="right">
                <Table.HeaderCell>Actions</Table.HeaderCell>
                <Table.Cell>
                  {(rowData: InvoiceItem) => (
                    <Button
                      appearance="link"
                      onClick={() => handleViewInvoice(rowData.id)}
                    >
                      View Details
                    </Button>
                  )}
                </Table.Cell>
              </Table.Column>
            </Table>

            <div className="mt-4 flex justify-center">
              <Pagination
                prev
                next
                first
                last
                ellipsis
                boundaryLinks
                maxButtons={5}
                size="md"
                layout={["total", "-", "limit", "|", "pager", "skip"]}
                total={totalCount}
                limitOptions={[10, 20, 30]}
                limit={limit}
                activePage={page}
                onChangePage={setPage}
              />
            </div>
          </>
        )}
      </div>
    </ShopperLayout>
  );
}

export const getServerSideProps: GetServerSideProps<InvoicesPageProps> = async (
  context
) => {
  const session = await getSession(context);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  try {
    const data = await hasuraClient.request<{
      Invoices: InvoiceItem[];
      Invoices_aggregate: { aggregate: { count: number } };
    }>(GET_USER_INVOICES, { user_id: session.user.id });

    return {
      props: {
        initialInvoices: {
          invoices: data.Invoices,
          totalCount: data.Invoices_aggregate.aggregate.count,
        },
        error: null,
      },
    };
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return {
      props: {
        initialInvoices: null,
        error: err instanceof Error ? err.message : "Failed to load invoices",
      },
    };
  }
};
